
import { baseApi } from "../api/base-api";


export type Topic = {
  id: string;
  name: string;
  description?: string;
};

export type Paragraph = {
  id: string;
  topicId: string;
  title: string;
  content: string;
  wordCount: number;
};

export type SubmitResultRequest = {
  paragraphId: string;
  wpm: number;
  accuracy: number;
  timeTakenMs: number;
};

export type Result = {
  id: string;
  userId: string;
  paragraphId: string;
  wpm: number;
  accuracy: number;
  timeTakenMs: number;
  createdAt: string;
};

export type LeaderboardEntry = {
  userId: string;
  userName: string;
  wpm: number;
  accuracy: number;
  rank: number;
};

export type CreateParagraphRequest = {
  topicId: string;
  title: string;
  content: string;
};

export const practiceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTopics: builder.query<Topic[], void>({
      query: () => ({
        url: "/api/v1/practices/topics",
        method: "GET",
      }),
      providesTags: ["Paragraph"],
    }),

    getParagraph: builder.query<Paragraph, string>({
      query: (id) => ({
        url: `/api/v1/practices/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Paragraph", id }],
    }),

    addPracticeContent: builder.mutation<Paragraph, CreateParagraphRequest>({
      query: (body) => ({
        url: "/api/v1/practices/submit",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Paragraph"],
    }),

    submitPracticeResult: builder.mutation<Result, SubmitResultRequest>({
      query: (body) => ({
        url: "/api/v1/practices/results",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Result"],
    }),

    getLeaderboard: builder.query<LeaderboardEntry[], void>({
      query: () => ({
        url: "/api/v1/practices/results",
        method: "GET",
      }),
      providesTags: ["Result"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetTopicsQuery,
  useGetParagraphQuery,
  useAddPracticeContentMutation,
  useSubmitPracticeResultMutation,
  useGetLeaderboardQuery,
} = practiceApi;