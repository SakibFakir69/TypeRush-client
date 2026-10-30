import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

export type SessionUser = {
  id?: string;
  name?: string;
  fullName?: string;
  email?: string;
  avatarUrl?: string | null;
  emailVerified?: boolean;
} & Record<string, unknown>;

console.log(process.env.NEXT_PUBLIC_BACKEND_URL, "BACKEND URL");

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL,
  credentials: "include",
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const refreshResult = await rawBaseQuery(
      { url: "/api/v1/auth/refresh", method: "POST" },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      result = await rawBaseQuery(args, api, extraOptions);
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",

  baseQuery: baseQueryWithReauth,

  tagTypes: ["Session", "Paragraph", "Result", "User"],

  endpoints: () => ({}),
});