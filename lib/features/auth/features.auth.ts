import { baseApi } from "../api/base-api";

import type { SessionUser } from "../api/base-api";

type LoginRequest = {
  email: string;
  password: string;
};

type LoginResponse = {
  data: { user: SessionUser };
  accessToken: string;
  refreshToken: string;
};

type RefreshRequest = {
  refreshToken: string;
};

type RefreshResponse = {
  accessToken: string;
};

type VerifyOtpRequest = {
  email: string;
  otp: string;
};

type ForgotPasswordRequest = {
  email: string;
};

type ResetPasswordRequest = {
  resetToken: string;
  password: string;
};

type MessageResponse = {
  message: string;
};

/** The server wraps payloads in `data` — sometimes. Accept both shapes. */
function readSession(body: unknown): SessionUser | null {
  if (!body || typeof body !== "object") return null;
  const d = body as Record<string, unknown>;
  const u = d.user && typeof d.user === "object" ? d.user : d;
  return u as SessionUser;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSession: builder.query<SessionUser | null, void>({
      query: () => ({
        url: "/api/v1/users",
        method: "GET",
      }),
      transformResponse: (res: unknown) => readSession(res),
      providesTags: ["Session"],
    }),

    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: "/api/v1/auth/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Session"],
    }),

    logout: builder.mutation<MessageResponse, void>({
      query: () => ({
        url: "/api/v1/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["Session"],
    }),

    refreshToken: builder.mutation<RefreshResponse, RefreshRequest>({
      query: (body) => ({
        url: "/api/v1/auth/refresh",
        method: "POST",
        body,
      }),
    }),

    verifyOtp: builder.mutation<{ resetToken?: string }, VerifyOtpRequest>({
      query: (body) => ({
        url: "/api/v1/auth/verify",
        method: "POST",
        body,
      }),
      transformResponse: (res: unknown) => {
        if (res && typeof res === "object" && "data" in res) {
          const d = (res as { data: unknown }).data;
          if (d && typeof d === "object") return d as { resetToken?: string };
        }
        return {};
      },
    }),

    forgotPassword: builder.mutation<MessageResponse, ForgotPasswordRequest>({
      query: (body) => ({
        url: "/api/v1/auth/forgot-password",
        method: "POST",
        body,
      }),
    }),

    // Signup email verification. NOTE: requires server support —
    // POST /api/v1/auth/send-signup-otp { email } and
    // POST /api/v1/auth/verify-signup { email, otp } → 200 { verified: true }.
    sendSignupOtp: builder.mutation<MessageResponse, { email: string }>({
      query: (body) => ({
        url: "/api/v1/auth/send-signup-otp",
        method: "POST",
        body,
      }),
    }),

    verifySignup: builder.mutation<{ verified?: boolean }, { email: string; otp: string }>({
      query: (body) => ({
        url: "/api/v1/auth/verify-signup",
        method: "POST",
        body,
      }),
      transformResponse: (res: unknown) => {
        if (res && typeof res === "object" && "data" in res) {
          const d = (res as { data: unknown }).data;
          if (d && typeof d === "object") return d as { verified?: boolean };
        }
        return {};
      },
    }),

    resetPassword: builder.mutation<MessageResponse, ResetPasswordRequest>({
      query: (body) => ({
        url: "/api/v1/auth/reset-password",
        method: "POST",
        body,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSessionQuery,
  useLazyGetSessionQuery,
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useVerifyOtpMutation,
  useForgotPasswordMutation,
  useSendSignupOtpMutation,
  useVerifySignupMutation,
  useResetPasswordMutation,
} = authApi;