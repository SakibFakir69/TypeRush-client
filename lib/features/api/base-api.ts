
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type SessionUser = {
  id?: string;
  name?: string;
  fullName?: string;
  email?: string;
  avatarUrl?: string | null;
} & Record<string, unknown>;

export const baseApi = createApi({
  reducerPath: "api",

  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_BACKEND_URL,
    credentials: "include",
  }),

  tagTypes: ["Session", "Paragraph", "Result","User"],

  endpoints: () => ({}),
});
