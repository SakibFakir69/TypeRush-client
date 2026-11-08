"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { InboundMessage } from "ably";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  Loader2,
  LogOut,
  RotateCcw,
  Swords,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/primitives";
import { useAuth } from "@/lib/auth";
import { createMatchClient } from "@/lib/ably";
import { useTypingTest } from "@/hooks/useTypingTest";
import { getApiError } from "@/helper/error-helper";
import {
  useForfeitMatchMutation,
  useGetMatchQuery,
  useSubmitMatchResultMutation,
  type BattleMatch,
} from "@/lib/features/battle/features.battle";
import { cn } from "@/lib/cn";

const RACE_SECONDS = 180;
const PROGRESS_INTERVAL_MS = 400;

function RaceText({ target, typed }: { target: string; typed: string }) {
  return (
    <p className="font-mono text-[15px] leading-8 tracking-wide">
      {target.split("").map((ch, i) => {
        let cls = "text-faint";
        if (i < typed.length) {
          cls = typed[i] === ch ? "text-ink" : "rounded bg-rose-500/20 text-rose-400";
        }
        if (i === typed.length) cls += " border-l-2 border-accent pl-px typing-caret";
        return (
          <span key={i} className={cls}>
            {ch}
          </span>
        );
      })}
    </p>
  );
}

function PlayerBar({
  label,
  name,
  avatarUrl,
  wpm,
  progress,
  finished,
  isYou,
}: {
  label: string;
  name: string;
  avatarUrl: string | null;
  wpm: number;
  progress: number;
  finished: boolean;
  isYou: boolean;
}) {
  return (
    <div className="rounded-xl border border-line bg-inset p-3">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full border border-line bg-chip text-xs font-black">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            name.slice(0, 1).toUpperCase()
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-bold">
            {name}{" "}
            <span className="text-[10px] font-semibold text-faint">{label}</span>
          </p>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-chip">
            <div
              className={cn(
                "h-full rounded-full transition-[width] duration-200",
                isYou ? "bg-accent" : "bg-violet-500"
              )}
              style={{ width: `${Math.min(100, Math.round(progress * 100))}%` }}
            />
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-extrabold tabular-nums">{wpm}</p>
          <p className="text-[10px] text-faint">WPM</p>
        </div>
        {finished && (
          <CheckCircle2 size={16} className="text-emerald-500" aria-label="Finished" />
        )}
      </div>
    </div>
  );
}

export function BattleRoom({ matchId }: { matchId: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const userId = typeof user?.id === "string" ? user.id : null;

  const { data, isLoading, error } = useGetMatchQuery(matchId, {
    pollingInterval: 2000,
  });
  const [submitResult] = useSubmitMatchResultMutation();
  const [forfeit] = useForfeitMatchMutation();

  const [liveMatch, setLiveMatch] = useState<BattleMatch | null>(null);
  const [opponent, setOpponent] = useState<{ progress: number; wpm: number } | null>(
    null
  );
  const [opponentFinished, setOpponentFinished] = useState(false);
  // Start time can arrive three ways: realtime push, server state, or a local
  // fallback if `match_started` never lands. Only the push needs state.
  const [pushedStart, setPushedStart] = useState<number | null>(null);
  const [fallbackStart, setFallbackStart] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [submitting, setSubmitting] = useState(false);

  const match = liveMatch ?? data ?? null;
  const target = match?.paragraph ?? "";
  const settled =
    (match?.status === "COMPLETED" || match?.status === "ABANDONED") ?? false;

  const channelRef = useRef<ReturnType<ReturnType<typeof createMatchClient>["channels"]["get"]> | null>(
    null
  );
  const inputRef = useRef<HTMLInputElement | null>(null);
  const submittedRef = useRef(false);
  const lastProgressRef = useRef(0);

  const {
    typed,
    timeLeft,
    started,
    finished,
    errors,
    accuracy,
    wpm,
    onChange,
  } = useTypingTest(target, RACE_SECONDS);

  const me = match?.participants.find((p) => p.userId === userId);
  const other = match?.participants.find((p) => p.userId !== userId);

  // Server clock for the starting gun, if it has already been set.
  const serverStartMs = match?.startedAt ? new Date(match.startedAt).getTime() : null;
  const serverStart =
    serverStartMs !== null && Number.isFinite(serverStartMs) ? serverStartMs : null;

  const startsAt = pushedStart ?? serverStart ?? fallbackStart;
  const ready = startsAt !== null && now >= startsAt;
  const countdown = startsAt === null ? null : Math.max(0, Math.ceil((startsAt - now) / 1000));

  // Countdown clock — stops itself once the gate opens.
  useEffect(() => {
    if (startsAt === null || Date.now() >= startsAt) return;
    const id = window.setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= startsAt) window.clearInterval(id);
    }, 250);
    return () => window.clearInterval(id);
  }, [startsAt]);

  // Focus the hidden input as soon as typing is allowed.
  useEffect(() => {
    if (ready && !finished) inputRef.current?.focus();
  }, [ready, finished]);

  // Neither the server nor realtime supplied a start: open the gate locally so
  // a dropped `match_started` can never freeze the race.
  useEffect(() => {
    if (match?.status !== "ACTIVE") return;
    if (pushedStart !== null || serverStart !== null) return;
    const id = window.setTimeout(() => setFallbackStart(Date.now()), 6000);
    return () => window.clearTimeout(id);
  }, [match?.status, pushedStart, serverStart]);

  // Realtime channel: acknowledge, then follow progress and the finish.
  useEffect(() => {
    if (!userId) return;
    const client = createMatchClient(matchId);
    const channel = client.channels.get(`match:${matchId}`);
    channelRef.current = channel;

    const onStarted = (msg: InboundMessage) => {
      const payload = msg.data as { startsAt?: string };
      if (!payload?.startsAt) return;
      const ms = new Date(payload.startsAt).getTime();
      if (Number.isFinite(ms)) setPushedStart(ms);
    };

    const onProgress = (msg: InboundMessage) => {
      const payload = msg.data as {
        userId?: string;
        progress?: number;
        wpm?: number;
      };
      if (!payload?.userId || payload.userId === userId) return;
      setOpponent({
        progress: typeof payload.progress === "number" ? payload.progress : 0,
        wpm: typeof payload.wpm === "number" ? payload.wpm : 0,
      });
    };

    const onOpponentFinished = (msg: InboundMessage) => {
      const payload = msg.data as { userId?: string };
      if (payload?.userId && payload.userId !== userId) setOpponentFinished(true);
    };

    const onFinished = (msg: InboundMessage) => {
      setLiveMatch(msg.data as BattleMatch);
    };

    const onVoided = () => {
      setOpponentFinished(false);
      toast.error("That match was cancelled. Back to the queue.");
      router.push("/battles");
    };

    void channel.subscribe("match_started", onStarted);
    void channel.subscribe("progress", onProgress);
    void channel.subscribe("opponent_finished", onOpponentFinished);
    void channel.subscribe("match_finished", onFinished);
    void channel.subscribe("match_voided", onVoided);

    void client.connection.once("connected", () => {
      void channel.publish("ack", { userId }).catch(() => undefined);
      void channel.presence.enter({ userId }).catch(() => undefined);
    });

    return () => {
      void channel.unsubscribe();
      void channel.presence.leave().catch(() => undefined);
      client.close();
      channelRef.current = null;
    };
  }, [matchId, userId, router]);

  // Share your own progress so the opponent sees a live bar.
  useEffect(() => {
    if (!ready || settled || finished || !userId || !target) return;
    const channel = channelRef.current;
    if (!channel) return;
    const at = Date.now();
    if (at - lastProgressRef.current < PROGRESS_INTERVAL_MS) return;
    lastProgressRef.current = at;
    void channel
      .publish("progress", {
        userId,
        progress: typed.length / target.length,
        wpm,
      })
      .catch(() => undefined);
  }, [typed, ready, settled, finished, userId, target, wpm]);

  // One submission per race; the server settles as soon as both are in.
  useEffect(() => {
    if (!finished || !ready || settled || submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    submitResult({ id: matchId, wpm, accuracy, errors })
      .unwrap()
      .then((res) => {
        setLiveMatch(res.match);
        if (!res.finished) toast.message("Run submitted — waiting for your opponent.");
      })
      .catch((err) => {
        submittedRef.current = false;
        toast.error(getApiError(err));
      })
      .finally(() => setSubmitting(false));
  }, [finished, ready, settled, matchId, wpm, accuracy, errors, submitResult]);

  const leave = useCallback(async () => {
    try {
      await forfeit(matchId).unwrap();
    } catch {
      // Already settled — nothing to release.
    }
    router.push("/battles");
  }, [forfeit, matchId, router]);

  const youProgress = target ? typed.length / target.length : 0;
  const ratingDelta = useMemo(() => {
    if (!me || me.ratingAfter === null) return null;
    return me.ratingAfter - me.ratingBefore;
  }, [me]);

  if (isLoading && !match) {
    return (
      <div aria-hidden className="h-72 animate-pulse rounded-2xl border border-line bg-card" />
    );
  }

  if (error && !match) {
    return (
      <Card className="p-10 text-center">
        <p className="text-base font-extrabold">This battle is unavailable</p>
        <p className="mt-1 text-sm text-muted">{getApiError(error)}</p>
        <Link
          href="/battles"
          className="mt-4 inline-block rounded-lg bg-mint px-4 py-2 text-sm font-bold text-black transition hover:brightness-110"
        >
          Back to battles
        </Link>
      </Card>
    );
  }

  if (!match) return null;

  if (match.status === "ABANDONED") {
    return (
      <Card className="p-10 text-center">
        <p className="text-base font-extrabold">Match cancelled</p>
        <p className="mt-1 text-sm text-muted">
          Your opponent left before the race finished. No rating change.
        </p>
        <Link
          href="/battles"
          className="mt-4 inline-block rounded-lg bg-mint px-4 py-2 text-sm font-bold text-black transition hover:brightness-110"
        >
          Find another match
        </Link>
      </Card>
    );
  }

  const completed = match.status === "COMPLETED";
  const won = completed && match.winnerId === userId;
  const draw = completed && match.winnerId === null;

  return (
    <div className="mx-auto max-w-3xl space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/battles"
          className="text-[13px] text-muted transition hover:text-accent"
        >
          ← Battles
        </Link>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-[11px] font-bold text-muted">
          <Swords size={12} aria-hidden />
          Match {matchId.slice(0, 8)}
        </span>
        <span
          className={cn(
            "ml-auto inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-xs font-extrabold tabular-nums",
            started && !finished && timeLeft <= 15
              ? "border-rose-500/50 text-rose-500"
              : "border-line text-ink"
          )}
        >
          <Clock size={12} aria-hidden />
          {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
        </span>
        {!completed && (
          <button
            type="button"
            onClick={leave}
            className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-[11px] font-bold text-muted transition hover:border-rose-500/40 hover:text-rose-500"
          >
            <LogOut size={12} aria-hidden />
            Leave
          </button>
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <PlayerBar
          label="(you)"
          name={me?.name ?? "You"}
          avatarUrl={me?.avatarUrl ?? null}
          wpm={started ? wpm : 0}
          progress={youProgress}
          finished={finished || Boolean(me?.finished)}
          isYou
        />
        <PlayerBar
          label="(opponent)"
          name={other?.name ?? "Waiting…"}
          avatarUrl={other?.avatarUrl ?? null}
          wpm={opponent?.wpm ?? other?.wpm ?? 0}
          progress={opponent?.progress ?? (other?.finished ? 1 : 0)}
          finished={opponentFinished || Boolean(other?.finished)}
          isYou={false}
        />
      </div>

      <div className="relative rounded-2xl border border-line bg-card p-4">
        <div className="relative max-h-72 min-h-[148px] cursor-text overflow-y-auto rounded-xl border border-line bg-inset p-5">
          {target ? (
            <RaceText target={target} typed={typed} />
          ) : (
            <p className="text-center text-sm text-muted">Loading paragraph…</p>
          )}
          {!ready && (
            <div className="absolute inset-0 grid place-items-center rounded-xl bg-black/70 backdrop-blur-sm">
              <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted">
                  {startsAt === null ? "Waiting for opponent" : "Get ready"}
                </p>
                <p className="mt-1 text-4xl font-black tabular-nums text-accent">
                  {countdown && countdown > 0 ? countdown : "GO"}
                </p>
                <p className="mt-1 text-[11px] text-muted">
                  Typing starts automatically
                </p>
              </div>
            </div>
          )}
          <input
            ref={inputRef}
            value={typed}
            onChange={(e) => ready && onChange(e.target.value)}
            disabled={!ready || finished}
            aria-label="Battle typing input"
            className="absolute inset-0 cursor-text opacity-0"
          />
        </div>

        <div className="mt-3 grid grid-cols-3 divide-x divide-line rounded-xl border border-line bg-inset">
          {[
            { label: "WPM", value: started ? String(wpm) : "–", cls: "text-accent" },
            {
              label: "ACCURACY",
              value: started ? `${accuracy}%` : "–",
              cls: "text-amber-500",
            },
            { label: "ERRORS", value: started ? String(errors) : "–", cls: "text-rose-500" },
          ].map((stat) => (
            <div key={stat.label} className="p-3 text-center">
              <p className="text-[10px] font-semibold tracking-[0.14em] text-muted">
                {stat.label}
              </p>
              <p className={cn("text-xl font-extrabold tabular-nums", stat.cls)}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {finished && !completed && (
          <div className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-line bg-inset p-3 text-sm font-bold text-muted">
            {submitting ? (
              <>
                <Loader2 size={14} className="animate-spin" aria-hidden />
                Submitting your run…
              </>
            ) : (
              <>
                <Loader2 size={14} className="animate-spin" aria-hidden />
                Waiting for your opponent…
              </>
            )}
          </div>
        )}
      </div>

      {completed && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-sm p-6 text-center">
            <span
              className={cn(
                "mx-auto grid h-14 w-14 place-items-center rounded-full",
                won
                  ? "bg-emerald-500/15 text-emerald-500"
                  : draw
                    ? "bg-amber-500/15 text-amber-500"
                    : "bg-rose-500/15 text-rose-500"
              )}
            >
              <Trophy size={26} aria-hidden />
            </span>
            <h2 className="mt-3 text-xl font-black">
              {won ? "You win!" : draw ? "Draw" : "You lost"}
            </h2>
            <p className="mt-1 text-xs text-muted">
              {me?.wpm ?? 0} WPM · {me?.accuracy ?? 0}% accuracy
              {ratingDelta !== null && (
                <>
                  {" "}
                  · rating {ratingDelta >= 0 ? "+" : ""}
                  {ratingDelta}
                </>
              )}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2 text-left">
              {match.participants.map((p) => (
                <div key={p.userId} className="rounded-lg border border-line bg-inset p-2.5">
                  <p className="truncate text-[11px] font-bold">
                    {p.userId === userId ? "You" : p.name}
                  </p>
                  <p className="text-sm font-extrabold tabular-nums">{p.wpm ?? "–"} WPM</p>
                  <p className="text-[10px] text-faint">{p.result ?? "—"}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => router.push("/battles")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-mint px-4 py-2 text-sm font-bold text-black transition hover:brightness-110"
              >
                <RotateCcw size={14} aria-hidden />
                Play again
              </button>
              <Link
                href="/home"
                className="rounded-lg border border-line px-4 py-2 text-sm font-bold text-ink transition hover:bg-chip"
              >
                Home
              </Link>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
