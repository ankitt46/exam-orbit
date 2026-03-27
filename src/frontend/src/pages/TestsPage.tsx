import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  LayoutGrid,
  MinusCircle,
  RotateCcw,
  Trophy,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ExamType, TestType } from "../backend";
import type { Question, Test } from "../backend";
import {
  useAllQuestions,
  useAllTests,
  useSubmitTest,
} from "../hooks/useQueries";

type Screen = "list" | "taking" | "results";

function TestCard({ test, onStart }: { test: Test; onStart: () => void }) {
  return (
    <Card
      className="card-hover border-border shadow-card cursor-pointer"
      onClick={onStart}
      data-ocid="test.card"
    >
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" className="text-xs capitalize">
            {test.examType}
          </Badge>
          <Badge
            className={`text-xs capitalize ${test.testType === TestType.full ? "bg-primary text-white" : "bg-brand-teal text-white"}`}
          >
            {test.testType === TestType.full ? "Full Length" : "Chapter-wise"}
          </Badge>
        </div>
        <h3 className="font-display font-semibold text-base mb-2 leading-snug">
          {test.title}
        </h3>
        {test.subject && (
          <p className="text-xs text-muted-foreground capitalize mb-3">
            {test.subject}
            {test.chapter ? ` • ${test.chapter}` : ""}
          </p>
        )}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> {test.durationMinutes.toString()} min
          </span>
          <span>{test.questionIds.length} questions</span>
        </div>
        <Button
          size="sm"
          className="w-full bg-primary text-white"
          data-ocid="test.start.button"
        >
          Start Test
        </Button>
      </CardContent>
    </Card>
  );
}

function TestInterface({
  test,
  questions,
  onSubmit,
  onCancel,
}: {
  test: Test;
  questions: Question[];
  onSubmit: (answers: bigint[]) => void;
  onCancel: () => void;
}) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(questions.length).fill(null),
  );
  const [timeLeft, setTimeLeft] = useState(Number(test.durationMinutes) * 60);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft]);

  const handleSubmit = useCallback(() => {
    const bigintAnswers = answers.map((a) => BigInt(a !== null ? a : -1));
    onSubmit(bigintAnswers);
  }, [answers, onSubmit]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timerColor =
    timeLeft < 300
      ? "text-destructive"
      : timeLeft < 600
        ? "text-yellow-500"
        : "text-foreground";

  const q = questions[current];
  if (!q) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-16 z-30 bg-card border-b border-border px-4 py-3 flex items-center justify-between shadow-xs">
        <div>
          <h2 className="font-display font-bold text-base">{test.title}</h2>
          <p className="text-xs text-muted-foreground">
            {current + 1} / {questions.length}
          </p>
        </div>
        <div
          className={`font-mono font-bold text-xl flex items-center gap-2 ${timerColor}`}
          data-ocid="test.timer"
        >
          <Clock className="w-5 h-5" />
          {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            data-ocid="test.cancel.button"
          >
            Quit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleSubmit}
            data-ocid="test.submit.button"
          >
            Submit
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question navigator */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <div className="sticky top-32 bg-card border border-border rounded-xl p-4">
            <p className="text-xs font-semibold text-muted-foreground mb-3">
              QUESTION NAVIGATOR
            </p>
            <div
              className="grid grid-cols-5 gap-1.5"
              data-ocid="test.navigator.panel"
            >
              {questions.map((q2, i) => (
                <button
                  type="button"
                  key={q2.id.toString()}
                  onClick={() => setCurrent(i)}
                  className={`h-8 w-full rounded text-xs font-semibold transition-colors ${
                    i === current
                      ? "bg-primary text-white"
                      : answers[i] !== null
                        ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400"
                        : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  }`}
                  data-ocid={`test.nav.item.${i + 1}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <div className="mt-3 space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-green-100 dark:bg-green-900/40 inline-block" />{" "}
                Answered ({answers.filter((a) => a !== null).length})
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-secondary inline-block" />{" "}
                Not Answered ({answers.filter((a) => a === null).length})
              </div>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="lg:col-span-3 order-1 lg:order-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline" className="text-xs capitalize">
                    {q.subject}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Q{current + 1}
                  </Badge>
                </div>
                <p className="font-medium leading-relaxed mb-6">
                  {q.questionText}
                </p>
                <div className="space-y-3">
                  {q.options.map((opt, i) => (
                    <button
                      type="button"
                      key={opt}
                      className={`w-full text-left p-4 rounded-xl border text-sm transition-all font-medium ${
                        answers[current] === i
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/40 hover:bg-secondary/50"
                      }`}
                      onClick={() =>
                        setAnswers((prev) => {
                          const n = [...prev];
                          n[current] = i;
                          return n;
                        })
                      }
                      data-ocid={`test.option.${i + 1}`}
                    >
                      <span className="inline-flex w-6 h-6 rounded-full border border-current items-center justify-center text-xs mr-3">
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              disabled={current === 0}
              data-ocid="test.prev.button"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </Button>
            {current < questions.length - 1 ? (
              <Button
                onClick={() => setCurrent((c) => c + 1)}
                data-ocid="test.next.button"
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                className="bg-brand-orange hover:bg-brand-orange-dark text-white"
                onClick={handleSubmit}
                data-ocid="test.finish.button"
              >
                Finish & Submit
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultsScreen({
  test,
  questions,
  answers,
  score,
  onRetry,
  onBack,
}: {
  test: Test;
  questions: Question[];
  answers: bigint[];
  score: bigint;
  onRetry: () => void;
  onBack: () => void;
}) {
  const total = questions.length;
  const correct = questions.filter(
    (q, i) => answers[i] === q.correctAnswer,
  ).length;
  const wrong = questions.filter(
    (q, i) => answers[i] !== BigInt(-1) && answers[i] !== q.correctAnswer,
  ).length;
  const unattempted = questions.filter(
    (_, i) => answers[i] === BigInt(-1),
  ).length;
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <div
      className="container mx-auto px-4 py-10 max-w-3xl"
      data-ocid="test.results.panel"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-10">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          <h2 className="font-display text-3xl font-bold mb-2">
            {pct >= 60 ? "Great Performance!" : "Keep Practicing!"}
          </h2>
          <p className="text-muted-foreground">{test.title}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Score",
              value: score.toString(),
              icon: Trophy,
              color: "text-primary",
            },
            {
              label: "Correct",
              value: correct,
              icon: CheckCircle,
              color: "text-green-600",
            },
            {
              label: "Wrong",
              value: wrong,
              icon: XCircle,
              color: "text-destructive",
            },
            {
              label: "Skipped",
              value: unattempted,
              icon: MinusCircle,
              color: "text-muted-foreground",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-card border border-border rounded-xl p-4 text-center"
            >
              <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
              <p className="text-2xl font-display font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-xl p-5 mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Accuracy</span>
            <span className="font-bold text-primary">{pct}%</span>
          </div>
          <Progress value={pct} className="h-3" />
        </div>

        <div className="space-y-4 mb-8">
          <h3 className="font-display font-semibold text-lg">
            Question Review
          </h3>
          {questions.map((q, i) => {
            const userAns = answers[i];
            const isCorrect = userAns === q.correctAnswer;
            const isSkipped = userAns === BigInt(-1);
            return (
              <div
                key={q.id.toString()}
                className={`p-4 rounded-xl border text-sm ${
                  isSkipped
                    ? "border-border bg-secondary/30"
                    : isCorrect
                      ? "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950/20"
                      : "border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/20"
                }`}
                data-ocid={`test.review.item.${i + 1}`}
              >
                <div className="flex items-start gap-3">
                  {isSkipped ? (
                    <MinusCircle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  ) : isCorrect ? (
                    <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium mb-1">
                      Q{i + 1}: {q.questionText}
                    </p>
                    {!isSkipped && !isCorrect && (
                      <p className="text-xs text-muted-foreground">
                        Correct: {q.options[Number(q.correctAnswer)]}
                      </p>
                    )}
                    {isCorrect && (
                      <p className="text-xs text-green-600">
                        {q.options[Number(q.correctAnswer)]}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1"
            data-ocid="test.back.button"
          >
            <LayoutGrid className="w-4 h-4 mr-2" /> Back to Tests
          </Button>
          <Button
            onClick={onRetry}
            className="flex-1 bg-primary text-white"
            data-ocid="test.retry.button"
          >
            <RotateCcw className="w-4 h-4 mr-2" /> Try Again
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default function TestsPage() {
  const [screen, setScreen] = useState<Screen>("list");
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [testAnswers, setTestAnswers] = useState<bigint[]>([]);
  const [testScore, setTestScore] = useState<bigint>(BigInt(0));
  const [activeTab, setActiveTab] = useState<"all" | "full" | "chapter">("all");

  const { data: tests, isLoading: testsLoading } = useAllTests();
  const { data: questions, isLoading: questionsLoading } = useAllQuestions();
  const submitTest = useSubmitTest();

  const getTestQuestions = (test: Test): Question[] => {
    if (!questions) return [];
    const idSet = new Set(test.questionIds.map((id) => id.toString()));
    return questions.filter((q) => idSet.has(q.id.toString()));
  };

  const filteredTests = (tests ?? []).filter((t) => {
    if (activeTab === "full") return t.testType === TestType.full;
    if (activeTab === "chapter") return t.testType === TestType.chapter;
    return true;
  });

  const fullTests = filteredTests.filter((t) => t.testType === TestType.full);
  const chapterTests = filteredTests.filter(
    (t) => t.testType === TestType.chapter,
  );

  const handleStartTest = (test: Test) => {
    const qs = getTestQuestions(test);
    if (qs.length === 0) {
      toast.error("No questions available for this test yet.");
      return;
    }
    setSelectedTest(test);
    setScreen("taking");
  };

  const handleSubmit = (answers: bigint[]) => {
    if (!selectedTest) return;
    setTestAnswers(answers);
    submitTest.mutate(
      { testId: selectedTest.id, answers },
      {
        onSuccess: (score) => {
          setTestScore(score);
          setScreen("results");
        },
        onError: () => {
          // Calculate locally on error
          const qs = getTestQuestions(selectedTest);
          const correct = qs.filter(
            (q, i) => answers[i] === q.correctAnswer,
          ).length;
          setTestScore(BigInt(correct * 4)); // +4 per correct
          setScreen("results");
        },
      },
    );
  };

  if (screen === "taking" && selectedTest) {
    return (
      <TestInterface
        test={selectedTest}
        questions={getTestQuestions(selectedTest)}
        onSubmit={handleSubmit}
        onCancel={() => setScreen("list")}
      />
    );
  }

  if (screen === "results" && selectedTest) {
    return (
      <ResultsScreen
        test={selectedTest}
        questions={getTestQuestions(selectedTest)}
        answers={testAnswers}
        score={testScore}
        onRetry={() => handleStartTest(selectedTest)}
        onBack={() => {
          setSelectedTest(null);
          setScreen("list");
        }}
      />
    );
  }

  const loading = testsLoading || questionsLoading;

  return (
    <div className="container mx-auto px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-4xl font-bold mb-2">Mock Tests</h1>
        <p className="text-muted-foreground mb-8">
          Simulate real exam conditions with timed practice tests
        </p>
      </motion.div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "all" | "full" | "chapter")}
        className="mb-8"
        data-ocid="tests.type.tab"
      >
        <TabsList>
          <TabsTrigger value="all" data-ocid="tests.all.tab">
            All Tests
          </TabsTrigger>
          <TabsTrigger value="full" data-ocid="tests.full.tab">
            Full Length
          </TabsTrigger>
          <TabsTrigger value="chapter" data-ocid="tests.chapter.tab">
            Chapter-wise
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          data-ocid="tests.loading_state"
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : filteredTests.length === 0 ? (
        <div
          className="text-center py-20 text-muted-foreground"
          data-ocid="tests.empty_state"
        >
          <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">No tests available yet</p>
          <p className="text-sm">Tests will appear after data loads.</p>
        </div>
      ) : (
        <>
          {(activeTab === "all" || activeTab === "full") &&
            fullTests.length > 0 && (
              <section className="mb-10">
                <h2 className="font-display text-2xl font-bold mb-5">
                  Full-Length Mock Tests
                </h2>
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                  data-ocid="tests.full.list"
                >
                  {fullTests.map((test, i) => (
                    <div
                      key={test.id.toString()}
                      data-ocid={`tests.full.item.${i + 1}`}
                    >
                      <TestCard
                        test={test}
                        onStart={() => handleStartTest(test)}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}
          {(activeTab === "all" || activeTab === "chapter") &&
            chapterTests.length > 0 && (
              <section>
                <h2 className="font-display text-2xl font-bold mb-5">
                  Chapter-wise Tests
                </h2>
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                  data-ocid="tests.chapter.list"
                >
                  {chapterTests.map((test, i) => (
                    <div
                      key={test.id.toString()}
                      data-ocid={`tests.chapter.item.${i + 1}`}
                    >
                      <TestCard
                        test={test}
                        onStart={() => handleStartTest(test)}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}
        </>
      )}
    </div>
  );
}
