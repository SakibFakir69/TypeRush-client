"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { InboundMessage } from "ably";
import {
  Check,
  Clock,
  Copy,
  Link2,
  Loader2,
  Share2,
  Swords,
  Timer,
  UserPlus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/primitives";
import { useAuth } from "@/lib/auth";
import { createInviteClient } from "@/lib/ably";
import { getApiError } from "@/helper/error-helper";
import { useGetParagraphsQuery } from "@/lib/features/practice/features.practice";
import {
  useAcceptInviteMutation,
  useCancelInviteMutation,
  useCreateInviteMutation,
  useDeclineInviteMutation,
  useGetInviteStatusQuery,
} from "@/lib/features/battle/features.battle";
import { cn } from "@/lib/cn";

const DURATIONS = [30, 60, 120] as const;
const STATUS_POLL_MS = 3000;

type ActiveInvite = {
  code: string;
  /** Epoch ms when the code stops working. */
  expiresAt: number;
};

function formatClock(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function CopyButton({
  value,
  label,
  icon,
  onCopied,
}: {
  value: string;
  label: string;
  icon: "code" | "link";
  onCopied: () => void;
}) {
  const Icon = icon === "code" ? Copy : Link2;
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard
          .writeText(value)
          .then(onCopied)
          .catch(() => toast.error("Could not copy — select the text instead."));
      }}
      className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-[11px] font-bold text-muted transition hover:bg-chip hover:text-ink"
    >
      <Icon size={12} aria-hidden />
      {label}
    </button>
  );
}

/** The inviter's side: pick a length, create a code, wait for a friend. */
function CreateInvite() {
  const router = useRouter();
  const { user } = useAuth();
  const userId = typeof user?.id === "string" ? user.id : null;

  const [duration, setDuration] = useState<number>(60);
  const [activeInvite, setActiveInvite] = useState<ActiveInvite | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [copied, setCopied] = useState<"code" | "link" | null>(null);
  const [codeInput, setCodeInput] = useState("");
  const navigatedRef = useRef(false);

  const { data: paragraphPage, isLoading: paragraphsLoading } =
    useGetParagraphsQuery({ limit: 1 });
  const newest = paragraphPage?.items?.[0] ?? null;

  const [createInvite, { isLoading: creating }] = useCreateInviteMutation();
  const [cancelInvite, { isLoading: cancelling }] = useCancelInviteMutation();

  const secondsLeft = activeInvite
    ? Math.max(0, Math.ceil((activeInvite.expiresAt - now) / 1000))
    : 0;
  const expired = Boolean(activeInvite) && secondsLeft <= 0;

  const { data: inviteState } = useGetInviteStatusQuery(
    activeInvite?.code ?? "",
    {
      skip: !activeInvite || expired,
      pollingInterval: STATUS_POLL_MS,
    }
  );

  // Keep the expiry clock moving while an invite is alive.
  useEffect(() => {
    if (!activeInvite) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [activeInvite]);

  const goToMatch = useCallback(
    (matchId: string) => {
      if (navigatedRef.current) return;
      navigatedRef.current = true;
      toast.success("Your friend joined — starting the match!");
      router.push(`/battles/${matchId}`);
    },
    [router]
  );

  // Polling fallback when the realtime event is missed.
  useEffect(() => {
    if (!inviteState || !activeInvite) return;
    if (inviteState.status === "MATCHED" && inviteState.matchId) {
      goToMatch(inviteState.matchId);
    }
  }, [inviteState, activeInvite, goToMatch]);

  // Realtime fast path on `private-match:{code}`.
  useEffect(() => {
    if (!activeInvite || !userId) return;

    const client = createInviteClient(activeInvite.code);
    const channel = client.channels.get(`private-match:${activeInvite.code}`);

    const onMatchFound = (msg: InboundMessage) => {
      const payload = msg.data as { matchId?: string } | null;
      if (payload?.matchId) goToMatch(payload.matchId);
    };
    const onDeclined = () => {
      toast.message("Your friend declined the invite.");
      setActiveInvite(null);
    };
    const onCancelled = () => {
      // The inviter is the only one who cancels, so `stopInvite` already
      // reported it — just drop the code here.
      setActiveInvite(null);
    };

    void channel.subscribe("match_found", onMatchFound);
    void channel.subscribe("invite_declined", onDeclined);
    void channel.subscribe("invite_cancelled", onCancelled);

    return () => {
      void channel.unsubscribe();
      client.close();
    };
  }, [activeInvite, userId, goToMatch]);

  const startInvite = async () => {
    if (!newest) {
      toast.error("No paragraph is available right now. Try again in a moment.");
      return;
    }
    try {
      const res = await createInvite({
        time: duration,
        paragraphId: newest.id,
      }).unwrap();
      navigatedRef.current = false;
      setNow(Date.now());
      setActiveInvite({
        code: res.code,
        expiresAt: Date.now() + res.expiresIn * 1000,
      });
      toast.success("Invite ready — send the code to your friend.");
    } catch (error) {
      toast.error(getApiError(error));
    }
  };

  const stopInvite = async () => {
    if (!activeInvite) return;
    try {
      await cancelInvite({ code: activeInvite.code }).unwrap();
      toast.message("Invite cancelled.");
    } catch (error) {
      toast.error(getApiError(error));
    }
    setActiveInvite(null);
  };

  const copy = (kind: "code" | "link") => {
    setCopied(kind);
    toast.success(kind === "code" ? "Code copied." : "Invite link copied.");
    window.setTimeout(() => setCopied(null), 1600);
  };

  const shareUrl =
    activeInvite && typeof window !== "undefined"
      ? `${window.location.origin}/battles/invite?code=${activeInvite.code}`
      : "";

  // Terminal states discovered by polling, rendered without extra state.
  const declined = inviteState?.status === "DECLINED";
  const statusCancelled = inviteState?.status === "CANCELLED";

  return (
    <div className="space-y-3">
      {activeInvite && !declined && !statusCancelled && !expired ? (
        <div className="space-y-4 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-accent/30 bg-accent/10 text-accent">
            <Share2 size={20} aria-hidden />
          </span>
          <div>
            <p className="text-sm font-extrabold">Invite code</p>
            <p className="mt-1 font-mono text-3xl font-black tracking-[0.35em] text-accent">
              {activeInvite.code}
            </p>
            <p className="mt-1 flex items-center justify-center gap-1.5 text-[11px] text-muted">
              <Clock size={11} aria-hidden />
              Expires in {formatClock(secondsLeft)} · {duration}s race
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <CopyButton
              value={activeInvite.code}
              label={copied === "code" ? "Copied" : "Copy code"}
              icon="code"
              onCopied={() => copy("code")}
            />
            <CopyButton
              value={shareUrl}
              label={copied === "link" ? "Copied" : "Invite link"}
              icon="link"
              onCopied={() => copy("link")}
            />
          </div>

          <p className="mx-auto flex max-w-sm items-center justify-center gap-2 rounded-lg border border-line bg-inset px-3 py-2 text-[11px] font-bold text-muted">
            <Loader2 size={12} className="animate-spin text-accent" aria-hidden />
            Waiting for your friend to accept…
          </p>

          <button
            type="button"
            onClick={stopInvite}
            disabled={cancelling}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line px-4 py-2 text-sm font-bold text-ink transition hover:bg-chip disabled:opacity-50"
          >
            <X size={14} aria-hidden />
            {cancelling ? "Cancelling…" : "Cancel invite"}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {declined || statusCancelled ? (
            <p className="flex items-center justify-center gap-1.5 rounded-lg border border-line bg-inset px-3 py-2 text-center text-xs font-bold text-muted">
              <X size={13} aria-hidden />
              {declined
                ? "Your friend declined this invite."
                : "This invite was cancelled."}
            </p>
          ) : expired ? (
            <p className="flex items-center justify-center gap-1.5 rounded-lg border border-line bg-inset px-3 py-2 text-center text-xs font-bold text-muted">
              <Clock size={13} aria-hidden />
              That code expired. Create a fresh one.
            </p>
          ) : null}

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-faint">
              Race length
            </p>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              {DURATIONS.map((seconds) => (
                <button
                  key={seconds}
                  type="button"
                  onClick={() => setDuration(seconds)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm font-extrabold transition",
                    duration === seconds
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-line text-muted hover:bg-chip hover:text-ink"
                  )}
                >
                  {seconds}s
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-line bg-inset p-3">
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-faint">
              <Timer size={12} aria-hidden />
              Paragraph
            </p>
            {paragraphsLoading ? (
              <p className="mt-1 text-xs text-muted">Loading the newest passage…</p>
            ) : newest ? (
              <p className="mt-1 line-clamp-3 text-xs leading-5 text-muted">
                {newest.content}
              </p>
            ) : (
              <p className="mt-1 text-xs text-muted">
                No passage is available right now.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={startInvite}
            disabled={creating || paragraphsLoading || !newest}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-mint px-6 py-2.5 text-sm font-extrabold text-black transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
          >
            {creating ? (
              <Loader2 size={15} className="animate-spin" aria-hidden />
            ) : (
              <UserPlus size={15} aria-hidden />
            )}
            {creating ? "Creating…" : "Create invite code"}
          </button>
          <p className="text-center text-[11px] text-faint">
            Your friend needs their own account. The code lasts 5 minutes.
          </p>
        </div>
      )}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          const code = codeInput.trim().toLowerCase();
          if (!code) return;
          router.push(`/battles/invite?code=${encodeURIComponent(code)}`);
        }}
        className="flex items-center gap-2 border-t border-line pt-3"
      >
        <input
          value={codeInput}
          onChange={(event) => setCodeInput(event.target.value)}
          placeholder="Have a code?"
          aria-label="Invite code"
          className="min-w-0 flex-1 rounded-lg border border-line bg-inset px-3 py-2 font-mono text-sm text-ink outline-none transition focus:border-accent"
        />
        <button
          type="submit"
          disabled={!codeInput.trim()}
          className="rounded-lg border border-line px-3 py-2 text-[11px] font-bold text-muted transition hover:bg-chip hover:text-ink disabled:opacity-50"
        >
          Join
        </button>
      </form>
    </div>
  );
}

/** The invitee's side: opened from the shared `?code=` link. */
function AcceptInvite({ code }: { code: string }) {
  const router = useRouter();
  const [acceptInvite, { isLoading: accepting }] = useAcceptInviteMutation();
  const [declineInvite, { isLoading: declining }] = useDeclineInviteMutation();

  const accept = async () => {
    try {
      const res = await acceptInvite({ code }).unwrap();
      toast.success("Invite accepted — starting the match!");
      router.push(`/battles/${res.matchId}`);
    } catch (error) {
      toast.error(getApiError(error));
    }
  };

  const decline = async () => {
    try {
      await declineInvite({ code }).unwrap();
      toast.message("Invite declined.");
    } catch (error) {
      toast.error(getApiError(error));
    }
    router.push("/battles");
  };

  return (
    <div className="space-y-4 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-accent/30 bg-accent/10 text-accent">
        <Swords size={20} aria-hidden />
      </span>
      <div>
        <p className="text-sm font-extrabold">You have a private battle invite</p>
        <p className="mt-1 font-mono text-2xl font-black tracking-[0.3em] text-accent">
          {code}
        </p>
        <p className="mt-1 text-[11px] leading-5 text-muted">
          Accepting starts the race immediately. The same passage and race length
          apply to both players, and the result counts for rating.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={accept}
          disabled={accepting}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-mint px-5 py-2.5 text-sm font-extrabold text-black transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
        >
          {accepting ? (
            <Loader2 size={15} className="animate-spin" aria-hidden />
          ) : (
            <Check size={15} aria-hidden />
          )}
          {accepting ? "Starting…" : "Accept & battle"}
        </button>
        <button
          type="button"
          onClick={decline}
          disabled={declining || accepting}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-line px-4 py-2 text-sm font-bold text-muted transition hover:bg-chip hover:text-ink disabled:opacity-50"
        >
          <X size={14} aria-hidden />
          {declining ? "Declining…" : "Decline"}
        </button>
      </div>

      <Link
        href="/battles"
        className="inline-block text-[11px] font-bold text-muted transition hover:text-accent"
      >
        Back to Battle
      </Link>
    </div>
  );
}

export function InvitePanel() {
  const params = useSearchParams();
  const code = (params.get("code") ?? "").trim().toLowerCase();

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div>
        <Link
          href="/battles"
          className="text-[13px] text-muted transition hover:text-accent"
        >
          ← Battle
        </Link>
        <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-accent">
          Private room
        </p>
        <h1 className="mt-1.5 text-2xl font-black tracking-tight sm:text-3xl">
          Play a friend
        </h1>
        <p className="mt-1 text-sm text-muted">
          Share a code, race the same passage, and settle the rating once you both
          finish.
        </p>
      </div>

      <Card className="p-5">
        {code ? <AcceptInvite code={code} /> : <CreateInvite />}
      </Card>
    </div>
  );
}
