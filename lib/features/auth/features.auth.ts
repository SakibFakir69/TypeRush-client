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

type VerifyOtpResponse = {
  resetToken: string;
};

type ForgotPasswordRequest = {
  email: string;
};

type ResetPasswordRequest = {
  resetToken: string;
  newPassword: string;
};

type MessageResponse = {
  message: string;
};

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
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

    verifyOtp: builder.mutation<VerifyOtpResponse, VerifyOtpRequest>({
      query: (body) => ({
        url: "/api/v1/auth/verify",
        method: "POST",
        body,
      }),
    }),

    forgotPassword: builder.mutation<MessageResponse, ForgotPasswordRequest>({
      query: (body) => ({
        url: "/api/v1/auth/forgot-password",
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
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useVerifyOtpMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;