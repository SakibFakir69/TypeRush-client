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

/** The server wraps payloads in `data` — sometimes. Accept every shape. */
function readSession(body: unknown): SessionUser | null {
  if (!body || typeof body !== "object") return null;
  const d = body as Record<string, unknown>;
  const u =
    d.data && typeof d.data === "object"
      ? d.data
      : d.user && typeof d.user === "object"
        ? d.user
        : null;
  if (!u) return null;
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

    // Email verification for fresh registrations. Server marks
    // emailVerified on success; client sends the code right after signup.
    resendVerifyOtp: builder.mutation<MessageResponse, { email: string }>({
      query: (body) => ({
        url: "/api/v1/auth/resend-verify-otp",
        method: "POST",
        body,
      }),
    }),

    verifyEmail: builder.mutation<MessageResponse, { email: string; otp: string }>({
      query: (body) => ({
        url: "/api/v1/auth/verify-email",
        method: "POST",
        body,
      }),
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
  useResendVerifyOtpMutation,
  useVerifyEmailMutation,
  useResetPasswordMutation,
} = authApi;