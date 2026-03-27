import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookmarkIcon,
  CheckCircle2,
  ChevronDown,
  Filter,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { ExamType, Subject } from "../backend";
import type { Question } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddBookmark,
  useAllQuestions,
  useBookmarks,
  useRemoveBookmark,
} from "../hooks/useQueries";

const YEARS = [2025, 2024, 2023, 2022, 2021, 2020];
const JEE_SUBJECTS = [Subject.physics, Subject.chemistry, Subject.maths];
const NEET_SUBJECTS = [Subject.physics, Subject.chemistry, Subject.biology];

function QuestionCard({
  question,
  bookmarked,
  onBookmark,
}: {
  question: Question;
  bookmarked: boolean;
  onBookmark: () => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const correct = Number(question.correctAnswer);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-5 shadow-card"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className="text-xs capitalize">
            {question.examType}
          </Badge>
          <Badge variant="outline" className="text-xs capitalize">
            {question.subject}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {question.year.toString()}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {question.chapter}
          </Badge>
        </div>
        <button
          type="button"
          onClick={onBookmark}
          className="shrink-0 p-1.5 rounded-md hover:bg-secondary transition-colors"
          aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
          data-ocid="pyq.bookmark.toggle"
        >
          <BookmarkIcon
            className={`w-4 h-4 ${bookmarked ? "fill-brand-orange text-brand-orange" : "text-muted-foreground"}`}
          />
        </button>
      </div>

      <p className="text-sm font-medium leading-relaxed mb-4">
        {question.questionText}
      </p>

      <div className="space-y-2 mb-4">
        {question.options.map((opt, i) => {
          let cls =
            "w-full text-left p-3 rounded-lg border text-sm transition-all ";
          if (revealed) {
            if (i === correct)
              cls +=
                "border-green-500 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 font-medium";
            else if (i === selected && i !== correct)
              cls += "border-destructive bg-destructive/10 text-destructive";
            else cls += "border-border bg-secondary/40 text-muted-foreground";
          } else if (selected === i) {
            cls += "border-primary bg-primary/10 text-primary";
          } else {
            cls +=
              "border-border hover:border-primary/40 hover:bg-secondary/50";
          }
          return (
            <button
              type="button"
              key={opt}
              className={cls}
              onClick={() => !revealed && setSelected(i)}
              data-ocid={`pyq.option.${i + 1}`}
            >
              {revealed && i === correct && (
                <CheckCircle2 className="w-4 h-4 inline mr-1.5 text-green-500" />
              )}
              {revealed && i === selected && i !== correct && (
                <XCircle className="w-4 h-4 inline mr-1.5 text-destructive" />
              )}
              <span className="font-semibold">
                {String.fromCharCode(65 + i)}.
              </span>{" "}
              {opt}
            </button>
          );
        })}
      </div>

      {!revealed ? (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setRevealed(true)}
          className="text-primary border-primary/30"
          data-ocid="pyq.show_answer.button"
        >
          <ChevronDown className="w-4 h-4 mr-1" /> Show Answer &amp; Solution
        </Button>
      ) : (
        <div
          className="mt-2 p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800"
          data-ocid="pyq.solution.panel"
        >
          <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">
            Correct Answer: Option {String.fromCharCode(65 + correct)}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {question.solution}
          </p>
        </div>
      )}
    </motion.div>
  );
}

export default function PYQsPage() {
  const [examType, setExamType] = useState<ExamType>(ExamType.jee);
  const [selectedSubject, setSelectedSubject] = useState<Subject | "all">(
    "all",
  );
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");

  const { data: questions, isLoading } = useAllQuestions();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  const { data: bookmarks } = useBookmarks(isAuthenticated);
  const addBookmark = useAddBookmark();
  const removeBookmark = useRemoveBookmark();

  const bookmarkedIds = new Set(
    bookmarks?.map((b) => b.questionId.toString()) ?? [],
  );

  const subjects = examType === ExamType.jee ? JEE_SUBJECTS : NEET_SUBJECTS;

  const filtered = (questions ?? []).filter((q) => {
    if (q.examType !== examType) return false;
    if (selectedSubject !== "all" && q.subject !== selectedSubject)
      return false;
    if (selectedYear !== "all" && Number(q.year) !== selectedYear) return false;
    return true;
  });

  const handleBookmark = (question: Question) => {
    if (!isAuthenticated) {
      toast.error("Please log in to bookmark questions");
      return;
    }
    const existing = bookmarks?.find((b) => b.questionId === question.id);
    if (existing) {
      removeBookmark.mutate(existing.id, {
        onSuccess: () => toast.success("Bookmark removed"),
      });
    } else {
      addBookmark.mutate(question.id, {
        onSuccess: () => toast.success("Question bookmarked!"),
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-4xl font-bold mb-2">
          Previous Year Questions
        </h1>
        <p className="text-muted-foreground mb-8">
          Practice with authentic questions from past JEE Main & NEET exams
        </p>
      </motion.div>

      {/* Exam Type Tabs */}
      <Tabs
        value={examType}
        onValueChange={(v) => {
          setExamType(v as ExamType);
          setSelectedSubject("all");
        }}
        className="mb-6"
        data-ocid="pyq.exam_type.tab"
      >
        <TabsList>
          <TabsTrigger value={ExamType.jee} data-ocid="pyq.jee.tab">
            JEE Main
          </TabsTrigger>
          <TabsTrigger value={ExamType.neet} data-ocid="pyq.neet.tab">
            NEET
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8" data-ocid="pyq.filters.panel">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Subject:</span>
        </div>
        <button
          type="button"
          onClick={() => setSelectedSubject("all")}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
            selectedSubject === "all"
              ? "bg-primary text-white border-primary"
              : "border-border hover:border-primary/50"
          }`}
          data-ocid="pyq.subject.all.toggle"
        >
          All
        </button>
        {subjects.map((s) => (
          <button
            type="button"
            key={s}
            onClick={() => setSelectedSubject(s)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border capitalize ${
              selectedSubject === s
                ? "bg-primary text-white border-primary"
                : "border-border hover:border-primary/50"
            }`}
            data-ocid={`pyq.subject.${s}.toggle`}
          >
            {s}
          </button>
        ))}

        <div className="flex items-center gap-2 ml-4">
          <span className="text-sm font-medium">Year:</span>
        </div>
        <button
          type="button"
          onClick={() => setSelectedYear("all")}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
            selectedYear === "all"
              ? "bg-primary text-white border-primary"
              : "border-border hover:border-primary/50"
          }`}
          data-ocid="pyq.year.all.toggle"
        >
          All Years
        </button>
        {YEARS.map((y) => (
          <button
            type="button"
            key={y}
            onClick={() => setSelectedYear(y)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              selectedYear === y
                ? "bg-primary text-white border-primary"
                : "border-border hover:border-primary/50"
            }`}
            data-ocid={`pyq.year.${y}.toggle`}
          >
            {y}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground mb-4">
        {isLoading
          ? "Loading questions..."
          : `${filtered.length} questions found`}
      </p>

      {/* Questions Grid */}
      {isLoading ? (
        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-5"
          data-ocid="pyq.loading_state"
        >
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="text-center py-20 text-muted-foreground"
          data-ocid="pyq.empty_state"
        >
          <BookmarkIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium mb-2">No questions found</p>
          <p className="text-sm">
            Try adjusting your filters or check back after data loads.
          </p>
        </div>
      ) : (
        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-5"
          data-ocid="pyq.list"
        >
          {filtered.map((q, i) => (
            <div key={q.id.toString()} data-ocid={`pyq.item.${i + 1}`}>
              <QuestionCard
                question={q}
                bookmarked={bookmarkedIds.has(q.id.toString())}
                onBookmark={() => handleBookmark(q)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
