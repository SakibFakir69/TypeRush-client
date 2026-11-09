"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { InboundMessage } from "ably";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Radio,
  ShieldCheck,
  Swords,
  Timer,
  Trophy,
  Users,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/primitives";
import { useAuth } from "@/lib/auth";
import { getAblyClient } from "@/lib/ably";
import { getApiError } from "@/helper/error-helper";
import {
  useCancelQueueMutation,
  useGetQueueStatusQuery,
  useJoinQueueMutation,
  type MatchFoundPayload,
} from "@/lib/features/battle/features.battle";

function formatWait(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function BattlesPage() {
  const router = useRouter();
  const { user } = useAuth();
  // `searchIntent` is set only by clicks; `queue.status` covers refresh/restore,
  // so neither needs a state write from inside an effect.
  const [searchIntent, setSearchIntent] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [onlineCount, setOnlineCount] = useState<number | null>(null);
  const searchStartRef = useRef<number | null>(null);

  const [joinQueue, { isLoading: joining }] = useJoinQueueMutation();
  const [cancelQueue, { isLoading: cancelling }] = useCancelQueueMutation();

  const { data: queue, refetch: refetchQueue } = useGetQueueStatusQuery(undefined, {
    skip: !user,
  });

  const searching = Boolean(user) && (searchIntent || queue?.status === "waiting");

  const rating =
    typeof user?.rating === "number" ? (user.rating as number) : null;
  const userId = typeof user?.id === "string" ? user.id : null;

  const goToMatch = useCallback(
    (matchId: string) => {
      searchStartRef.current = null;
      toast.success("Opponent found — good luck!");
      router.push(`/battles/${matchId}`);
    },
    [router]
  );

  // A match can also be discovered by polling when realtime is unavailable.
  useEffect(() => {
    if (queue?.status !== "matched" || !queue.matchId) return;
    goToMatch(queue.matchId);
  }, [queue?.status, queue?.matchId, goToMatch]);

  // Poll the queue while searching; realtime is the fast path.
  useEffect(() => {
    if (!searching) return;
    const id = window.setInterval(() => {
      void refetchQueue();
    }, 2500);
    return () => window.clearInterval(id);
  }, [searching, refetchQueue]);

  // Wait timer — the interval keeps the clock, not the effect body.
  useEffect(() => {
    if (!searching) return;
    if (searchStartRef.current === null) searchStartRef.current = Date.now();
    const id = window.setInterval(() => {
      const start = searchStartRef.current ?? Date.now();
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => window.clearInterval(id);
  }, [searching]);

  // Realtime: `match_found` lands on this user's own channel.
  useEffect(() => {
    if (!searching || !userId) return;

    let active = true;
    const client = getAblyClient();
    const userChannel = client.channels.get(`matchmaking:user:${userId}`);
    const lobby = client.channels.get("matchmaking:lobby");

    const onMatchFound = (msg: InboundMessage) => {
      if (!active) return;
      const payload = msg.data as MatchFoundPayload;
      if (payload?.matchId) goToMatch(payload.matchId);
    };

    void userChannel.subscribe("match_found", onMatchFound);
    void lobby.presence.subscribe(() => {
      void lobby.presence.get().then((members) => {
        if (active) setOnlineCount(members.length);
      });
    });
    void lobby.presence.enter().catch(() => undefined);
    void lobby.presence
      .get()
      .then((members) => {
        if (active) setOnlineCount(members.length);
      })
      .catch(() => undefined);

    return () => {
      active = false;
      void userChannel.unsubscribe("match_found", onMatchFound);
      void lobby.presence.leave().catch(() => undefined);
    };
  }, [searching, userId, goToMatch]);

  const startSearch = async () => {
    try {
      await joinQueue().unwrap();
      searchStartRef.current = Date.now();
      setElapsed(0);
      setSearchIntent(true);
      toast.message("Looking for an opponent…");
    } catch (error) {
      toast.error(getApiError(error));
    }
  };

  const stopSearch = async () => {
    searchStartRef.current = null;
    setElapsed(0);
    setSearchIntent(false);
    try {
      await cancelQueue().unwrap();
      toast.message("Search cancelled.");
    } catch (error) {
      toast.error(getApiError(error));
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">
          Live · global queue
        </p>
        <h1 className="mt-1.5 text-2xl font-black tracking-tight sm:text-3xl">
          Battle
        </h1>
        <p className="mt-1 text-sm text-muted">
          Race a typist anywhere in the world on the same paragraph. Faster run
          wins; accuracy breaks a tie.
        </p>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="grid gap-0 sm:grid-cols-[1fr_auto_1fr]">
          <div className="flex flex-col items-center gap-2 p-6 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full border border-accent/30 bg-accent/10 text-xl font-black text-accent">
              {(user?.name ?? "You").toString().slice(0, 1).toUpperCase()}
            </span>
            <p className="text-sm font-bold">You</p>
            <p className="text-[11px] text-muted">
              {rating !== null ? `Rating ${rating}` : "Unrated"}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-2 px-6 pb-6 sm:py-6">
            <span className="grid h-10 w-10 place-items-center rounded-full border border-line bg-inset text-muted">
              <Swords size={18} aria-hidden />
            </span>
            {searching ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-[11px] font-bold text-accent">
                <Loader2 size={12} className="animate-spin" aria-hidden />
                {formatWait(elapsed)}
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-faint">VS</span>
            )}
          </div>

          <div className="flex flex-col items-center gap-2 border-t border-line p-6 text-center sm:border-l sm:border-t-0">
            <span className="grid h-16 w-16 place-items-center rounded-full border border-dashed border-line bg-inset text-muted">
              <Users size={22} aria-hidden />
            </span>
            <p className="text-sm font-bold">Opponent</p>
            <p className="text-[11px] text-muted">
              {onlineCount !== null && onlineCount > 0
                ? `${onlineCount} in the lobby`
                : "Matched by rating"}
            </p>
          </div>
        </div>

        <div className="border-t border-line p-5">
          {!user ? (
            <p className="text-center text-sm text-muted">
              <Link href="/login" className="font-bold text-accent hover:underline">
                Log in
              </Link>{" "}
              to join the global queue.
            </p>
          ) : queue?.status === "matched" && queue.matchId ? (
            <div className="text-center">
              <p className="text-sm font-bold">You are already in a match.</p>
              <Link
                href={`/battles/${queue.matchId}`}
                className="mt-2 inline-block rounded-lg bg-mint px-4 py-2 text-sm font-bold text-black transition hover:brightness-110"
              >
                Return to match
              </Link>
            </div>
          ) : searching ? (
            <div className="flex flex-col items-center gap-3">
              <p className="flex items-center gap-2 text-sm font-bold text-accent">
                <Radio size={15} className="animate-pulse" aria-hidden />
                Searching for an opponent…
              </p>
              <p className="max-w-sm text-center text-xs leading-5 text-muted">
                The rating range widens the longer you wait, so you can be
                matched with a stronger or weaker typist. Same paragraph for
                both players.
              </p>
              <button
                type="button"
                onClick={stopSearch}
                disabled={cancelling}
                className="inline-flex items-center gap-1.5 rounded-lg border border-line px-4 py-2 text-sm font-bold text-ink transition hover:bg-chip disabled:opacity-50"
              >
                <X size={14} aria-hidden />
                {cancelling ? "Cancelling…" : "Cancel search"}
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={startSearch}
                disabled={joining}
                className="inline-flex items-center gap-2 rounded-lg bg-mint px-6 py-2.5 text-sm font-extrabold text-black transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
              >
                {joining ? (
                  <Loader2 size={15} className="animate-spin" aria-hidden />
                ) : (
                  <Zap size={15} aria-hidden />
                )}
                {joining ? "Joining…" : "Find a match"}
              </button>
              <p className="text-[11px] text-faint">
                Free · no entry fee · results update your rating
              </p>
            </div>
          )}
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            Icon: Timer,
            title: "Same start",
            desc: "A 3-second countdown begins once both players are ready.",
          },
          {
            Icon: Trophy,
            title: "Elo rating",
            desc: "Win to climb, lose a little, draw to stay put.",
          },
          {
            Icon: ShieldCheck,
            title: "Fair run",
            desc: "Both players type the identical paragraph.",
          },
        ].map(({ Icon, title, desc }) => (
          <Card key={title} className="p-4">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent/10 text-accent">
              <Icon size={15} aria-hidden />
            </span>
            <p className="mt-2 text-[13px] font-bold">{title}</p>
            <p className="mt-0.5 text-[11px] leading-4 text-muted">{desc}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
