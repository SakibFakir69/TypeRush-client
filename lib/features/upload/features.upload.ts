import { baseApi } from "../api/base-api";

export type UploadResponse = {
  url: string;
  publicId: string;
};
const uploadApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadImage: builder.mutation<UploadResponse, FormData>({
      query: (formData) => ({
        url: "/api/v1/uploads",   // ← fixed
        method: "POST",
        body: formData,
      }),
    }),
  }),
});

export const { useUploadImageMutation } = uploadApi;