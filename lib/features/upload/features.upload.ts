import { baseApi, type SessionUser } from "../api/base-api";

export type UploadResponse = {
  url: string;
  publicId: string;
};

/** `POST /uploads/avatar` — the image plus the user row it was saved on. */
export type AvatarUploadResponse = UploadResponse & {
  user: SessionUser;
};

const uploadApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadImage: builder.mutation<UploadResponse, FormData>({
      query: (formData) => ({
        url: "/api/v1/uploads",
        method: "POST",
        body: formData,
      }),
    }),

    /**
     * Uploads the avatar and saves it on the profile in one request, so the
     * rail/navbar pick it up as soon as the "Session" tag is invalidated.
     */
    uploadAvatar: builder.mutation<AvatarUploadResponse, FormData>({
      query: (formData) => ({
        url: "/api/v1/uploads/avatar",
        method: "POST",
        body: formData,
      }),
      transformResponse: (res: unknown) => {
        const body =
          res && typeof res === "object" ? (res as Record<string, unknown>) : {};
        const data =
          body.data && typeof body.data === "object"
            ? (body.data as Record<string, unknown>)
            : body;
        const user =
          data.user && typeof data.user === "object"
            ? (data.user as SessionUser)
            : ({} as SessionUser);

        return {
          url: typeof data.url === "string" ? data.url : "",
          publicId: typeof data.publicId === "string" ? data.publicId : "",
          user,
        };
      },
      invalidatesTags: ["Session", "Result"],
    }),
  }),
});

export const { useUploadImageMutation, useUploadAvatarMutation } = uploadApi;
