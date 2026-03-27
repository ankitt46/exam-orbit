import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Bookmark,
  LeaderboardEntry,
  Question,
  StudyMaterial,
  Test,
} from "../backend";
import { useActor } from "./useActor";

export function useAllQuestions() {
  const { actor, isFetching } = useActor();
  return useQuery<Question[]>({
    queryKey: ["questions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllQuestions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllTests() {
  const { actor, isFetching } = useActor();
  return useQuery<Test[]>({
    queryKey: ["tests"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTest(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Test | null>({
    queryKey: ["test", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getTest(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useLeaderboard() {
  const { actor, isFetching } = useActor();
  return useQuery<LeaderboardEntry[]>({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLeaderboard();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useStudyMaterials() {
  const { actor, isFetching } = useActor();
  return useQuery<StudyMaterial[]>({
    queryKey: ["study-materials"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllStudyMaterials();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDailyQuestion() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["daily-question"],
    queryFn: async () => {
      if (!actor) return null;
      const daily = await actor.getTodayDailyQuestion();
      if (!daily) return null;
      const question = await actor.getQuestion(daily.questionId);
      return { daily, question };
    },
    enabled: !!actor && !isFetching,
  });
}

export function useBookmarks(isAuthenticated: boolean) {
  const { actor, isFetching } = useActor();
  return useQuery<Bookmark[]>({
    queryKey: ["bookmarks"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBookmarks();
    },
    enabled: !!actor && !isFetching && isAuthenticated,
  });
}

export function useAddBookmark() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (questionId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.addBookmark(questionId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookmarks"] }),
  });
}

export function useRemoveBookmark() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (bookmarkId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.removeBookmark(bookmarkId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookmarks"] }),
  });
}

export function useSubmitTest() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      testId,
      answers,
    }: { testId: bigint; answers: bigint[] }) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitTest(testId, answers);
    },
  });
}

export function useSeedData() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["seed"],
    queryFn: async () => {
      if (!actor) return null;
      const questions = await actor.getAllQuestions();
      if (questions.length === 0) {
        await actor.seedData();
      }
      return true;
    },
    enabled: !!actor && !isFetching,
    staleTime: Number.POSITIVE_INFINITY,
  });
}
