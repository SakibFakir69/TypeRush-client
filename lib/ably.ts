"use client";

import Ably from "ably";

/**
 * One Ably connection per browser tab.
 *
 * Auth goes through our own API (`GET /backend/api/v1/ably/token`), which mints
 * a token for the signed-in user — no key ever ships to the client. Ably calls
 * this again whenever the token needs renewing.
 */
let client: Ably.Realtime | null = null;

export function getAblyClient(): Ably.Realtime {
  if (typeof window === "undefined") {
    throw new Error("Ably is only available in the browser");
  }
  if (client) return client;

  client = new Ably.Realtime({
    authCallback: (params, callback) => {
      void (async () => {
        try {
          const res = await fetch(
            `/backend/api/v1/ably/token?${new URLSearchParams(
              params as unknown as Record<string, string>
            ).toString()}`,
            { credentials: "include", cache: "no-store" }
          );
          if (!res.ok) {
            throw new Error(`Ably token request failed (${res.status})`);
          }
          callback(null, await res.json());
        } catch (error) {
          callback(error instanceof Error ? error.message : String(error), null);
        }
      })();
    },
  });

  return client;
}

/** For tests or an explicit logout — the next call reconnects. */
export function closeAblyClient() {
  client?.close();
  client = null;
}

/**
 * A dedicated connection for one match, authorised by
 * `GET /backend/api/v1/ably/token/:matchId`. The lobby token may have been
 * issued before the match existed, so it cannot carry this channel's rights.
 */
export function createMatchClient(matchId: string): Ably.Realtime {
  return new Ably.Realtime({
    authCallback: (params, callback) => {
      void (async () => {
        try {
          const res = await fetch(
            `/backend/api/v1/ably/token/${matchId}?${new URLSearchParams(
              params as unknown as Record<string, string>
            ).toString()}`,
            { credentials: "include", cache: "no-store" }
          );
          if (!res.ok) {
            throw new Error(`Match token request failed (${res.status})`);
          }
          callback(null, await res.json());
        } catch (error) {
          callback(error instanceof Error ? error.message : String(error), null);
        }
      })();
    },
  });
}
