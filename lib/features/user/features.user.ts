


import { baseApi } from "../api/base-api";

import type { SessionUser } from "../api/base-api";

type CreateUserRequest = {
  name: string;
  fullName: string;
  email: string;
  country: string;
  password: string;
  age?: number | null;
  avatarUrl?: string | null;
  bio?: string | null;
};

type UpdateUserRequest = {
  name?: string;
  fullName?: string;
  country?: string;
  bio?: string;
  avatarUrl?: string | null;
};

type UserResponse = {
  data: SessionUser;
};

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<UserResponse, void>({
        
      query: () => ({
        url: "/api/v1/users",
        method: "GET",
      }),
      providesTags: ["Session"],
    }),

    createUser: builder.mutation<UserResponse, CreateUserRequest>({
      query: (body) => ({
        url: "/api/v1/users",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Session"],
    }),

    updateUser: builder.mutation<UserResponse, UpdateUserRequest>({
      query: (body) => ({
        url: "/api/v1/users",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Session"],
    }),

    deleteUser: builder.mutation<void, void>({
      query: () => ({
        url: "/api/v1/users",
        method: "DELETE",
      }),
      invalidatesTags: ["Session"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMeQuery,
  useLazyGetMeQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApi;