import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Atom,
  BookOpen,
  Calculator,
  CheckCircle,
  ChevronRight,
  Clock,
  FlaskConical,
  Leaf,
  Star,
  Trophy,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { ExamType, Subject } from "../backend";
import {
  useAllTests,
  useDailyQuestion,
  useLeaderboard,
} from "../hooks/useQueries";

const QUOTES = [
  {
    text: "Dream Big, Work Hard, Stay Focused.",
    author: "JEE Topper, IIT Bombay",
  },
  {
    text: "Success is not the destination, it's the journey of learning.",
    author: "NEET Topper, AIIMS Delhi",
  },
  {
    text: "Every expert was once a beginner. Keep going!",
    author: "JEE Advanced Rank 1",
  },
  {
    text: "Consistent effort beats occasional brilliance.",
    author: "NEET Topper 2024",
  },
  {
    text: "Your hard work today is your success story tomorrow.",
    author: "IIT Alumni",
  },
];

const SUBJECTS = [
  {
    name: "Physics",
    icon: Atom,
    description: "Mechanics, Optics, Electricity, Modern Physics",
    color: "subject-physics",
    count: 450,
  },
  {
    name: "Chemistry",
    icon: FlaskConical,
    description: "Organic, Inorganic, Physical Chemistry",
    color: "subject-chemistry",
    count: 380,
  },
  {
    name: "Mathematics",
    icon: Calculator,
    description: "Calculus, Algebra, Coordinate Geometry",
    color: "subject-maths",
    count: 520,
  },
  {
    name: "Biology",
    icon: Leaf,
    description: "Botany, Zoology, Genetics, Ecology",
    color: "subject-biology",
    count: 410,
  },
];

function QuotesSection() {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setCurrent((c) => (c + 1) % QUOTES.length),
      4000,
    );
    return () => clearInterval(id);
  }, []);
  const q = QUOTES[current];
  return (
    <section className="py-16 quote-gradient">
      <div className="container mx-auto px-4 text-center">
        <Zap className="w-8 h-8 mx-auto mb-4 text-yellow-300" />
        <h2 className="font-display text-2xl font-bold text-white mb-8">
          Daily Motivation
        </h2>
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <blockquote className="text-2xl md:text-3xl font-display font-bold text-white mb-4">
            &ldquo;{q.text}&rdquo;
          </blockquote>
          <p className="text-white/70 text-sm">— {q.author}</p>
        </motion.div>
        <div className="flex justify-center gap-2 mt-8">
          {QUOTES.map((q, i) => (
            <button
              type="button"
              key={q.text}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === current ? "bg-white w-6" : "bg-white/40"}`}
              aria-label={`Quote ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function DailyChallenge() {
  const { data, isLoading } = useDailyQuestion();
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  if (isLoading) return <Skeleton className="h-48 rounded-2xl" />;
  if (!data)
    return (
      <div className="p-6 rounded-2xl border border-border bg-card text-center text-muted-foreground">
        <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">No daily challenge available today.</p>
      </div>
    );

  const { question } = data;
  const correct = Number(question.correctAnswer);

  return (
    <div
      className="p-6 rounded-2xl border border-border bg-card shadow-card"
      data-ocid="daily.card"
    >
      <div className="flex items-center gap-2 mb-3">
        <Badge className="bg-brand-orange text-white text-xs">
          Daily Challenge
        </Badge>
        <Badge variant="outline" className="text-xs capitalize">
          {question.subject}
        </Badge>
      </div>
      <p className="font-semibold text-sm mb-4 leading-relaxed">
        {question.questionText}
      </p>
      <div className="space-y-2">
        {question.options.map((opt, i) => {
          let cls =
            "w-full text-left p-3 rounded-lg border text-sm transition-all ";
          if (revealed) {
            if (i === correct)
              cls +=
                "border-green-500 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 font-medium";
            else if (i === selected)
              cls += "border-destructive bg-destructive/10 text-destructive";
            else cls += "border-border bg-secondary/50 text-muted-foreground";
          } else if (selected === i) {
            cls += "border-primary bg-primary/10 text-primary";
          } else {
            cls +=
              "border-border hover:border-primary/50 hover:bg-secondary/60";
          }
          return (
            <button
              type="button"
              key={opt}
              className={cls}
              onClick={() => !revealed && setSelected(i)}
              data-ocid={`daily.option.${i + 1}`}
            >
              <span className="font-semibold mr-2">
                {String.fromCharCode(65 + i)}.
              </span>
              {opt}
            </button>
          );
        })}
      </div>
      {!revealed ? (
        <Button
          size="sm"
          className="mt-4 bg-primary text-white"
          onClick={() => setRevealed(true)}
          disabled={selected === null}
          data-ocid="daily.reveal.button"
        >
          Reveal Answer
        </Button>
      ) : (
        <div
          className="mt-4 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-sm"
          data-ocid="daily.solution.panel"
        >
          <p className="font-semibold text-green-700 dark:text-green-400 mb-1">
            ✓ Explanation
          </p>
          <p className="text-muted-foreground">{question.solution}</p>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const { data: tests, isLoading: testsLoading } = useAllTests();
  const { data: leaderboard, isLoading: lbLoading } = useLeaderboard();

  const upcomingTests = tests?.slice(0, 2) ?? [];
  const topPerformers = leaderboard?.slice(0, 5) ?? [];

  return (
    <div>
      {/* Hero */}
      <section className="hero-gradient py-16 md:py-24 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-4 bg-white/20 text-white border-white/30 text-xs">
                🚀 JEE Main & NEET 2025 Preparation
              </Badge>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
                Ace Your JEE &amp; NEET Exam
              </h1>
              <p className="text-white/80 text-lg mb-8 leading-relaxed">
                Practice with 1500+ PYQs, take timed mock tests, and study
                chapter-wise notes — all in one place.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="bg-brand-orange hover:bg-brand-orange-dark text-white font-bold text-base shadow-lg"
                  asChild
                  data-ocid="hero.start.primary_button"
                >
                  <Link to="/pyqs">
                    Start Preparing Free <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/50 text-white hover:bg-white/10 bg-transparent"
                  asChild
                  data-ocid="hero.tests.secondary_button"
                >
                  <Link to="/tests">Take Mock Test</Link>
                </Button>
              </div>
              <div className="flex flex-wrap gap-6 mt-8 text-white/80 text-sm">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-300" /> 1500+ PYQs
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-300" /> 50+ Mock
                  Tests
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-300" />{" "}
                  Chapter-wise Notes
                </span>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:flex justify-center"
            >
              <img
                src="/assets/generated/hero-study.dim_600x500.png"
                alt="Student studying for JEE and NEET"
                className="w-full max-w-md rounded-2xl shadow-2xl object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quotes */}
      <QuotesSection />

      {/* Subject Cards */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl font-bold mb-2">
                Explore Subjects
              </h2>
              <p className="text-muted-foreground">
                Deep dive into any subject with targeted practice
              </p>
            </div>
            <Link
              to="/pyqs"
              className="hidden sm:flex items-center gap-1 text-sm text-primary font-medium hover:underline"
              data-ocid="subjects.view_all.link"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            data-ocid="subjects.list"
          >
            {SUBJECTS.map((subject, i) => {
              const Icon = subject.icon;
              return (
                <motion.div
                  key={subject.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  data-ocid={`subject.item.${i + 1}`}
                >
                  <Card className="card-hover cursor-pointer border-border shadow-card h-full">
                    <CardContent className="p-6">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${subject.color}`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="font-display font-semibold text-lg mb-1">
                        {subject.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                        {subject.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {subject.count}+ Questions
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-7 border-primary/30 text-primary"
                          asChild
                        >
                          <Link to="/pyqs">
                            Practice <ChevronRight className="ml-1 w-3 h-3" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Daily Practice + Upcoming Tests */}
      <section className="py-16 bg-brand-section dark:bg-brand-section-dark">
        <div className="container mx-auto px-4">
          <div className="mb-10">
            <h2 className="font-display text-3xl font-bold mb-2">
              Daily Practice Arena
            </h2>
            <p className="text-muted-foreground">
              Challenge yourself every day to stay sharp
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">
                Today&apos;s Challenge
              </h3>
              <DailyChallenge />
            </div>
            <div>
              <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">
                Upcoming Mock Tests
              </h3>
              <div className="space-y-3" data-ocid="upcoming_tests.list">
                {testsLoading ? (
                  <>
                    <Skeleton className="h-28 rounded-xl" />
                    <Skeleton className="h-28 rounded-xl" />
                  </>
                ) : upcomingTests.length === 0 ? (
                  <div
                    className="p-6 rounded-2xl border border-border bg-card text-center text-muted-foreground"
                    data-ocid="upcoming_tests.empty_state"
                  >
                    <p className="text-sm">
                      No tests available. Loading seed data...
                    </p>
                  </div>
                ) : (
                  upcomingTests.map((test, i) => (
                    <div
                      key={test.id.toString()}
                      className="p-5 rounded-xl border border-border bg-card shadow-card flex items-center justify-between gap-4"
                      data-ocid={`upcoming_tests.item.${i + 1}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant="outline"
                            className="text-xs capitalize"
                          >
                            {test.examType}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-xs capitalize"
                          >
                            {test.testType}
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-sm truncate">
                          {test.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {test.durationMinutes.toString()} min
                          </span>
                          <span>{test.questionIds.length} questions</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="bg-primary text-white shrink-0 text-xs"
                        asChild
                      >
                        <Link to="/tests">Start</Link>
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard Preview */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl font-bold mb-2">
                Top Performers
              </h2>
              <p className="text-muted-foreground">
                The brightest minds competing for the top spot
              </p>
            </div>
            <Link
              to="/leaderboard"
              className="hidden sm:flex items-center gap-1 text-sm text-primary font-medium hover:underline"
              data-ocid="leaderboard.view_all.link"
            >
              Full Leaderboard <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="max-w-2xl">
            {lbLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 rounded-xl" />
                ))}
              </div>
            ) : topPerformers.length === 0 ? (
              <div
                className="p-8 rounded-2xl border border-border text-center text-muted-foreground"
                data-ocid="leaderboard_preview.empty_state"
              >
                <Trophy className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>Be the first to appear on the leaderboard!</p>
              </div>
            ) : (
              <div className="space-y-3" data-ocid="leaderboard_preview.list">
                {topPerformers.map((entry, i) => (
                  <motion.div
                    key={entry.id.toString()}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border shadow-xs"
                    data-ocid={`leaderboard_preview.item.${i + 1}`}
                  >
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-sm shrink-0 ${
                        i === 0
                          ? "bg-yellow-100 text-yellow-700"
                          : i === 1
                            ? "bg-gray-100 text-gray-600"
                            : i === 2
                              ? "bg-orange-100 text-orange-600"
                              : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}
                    </span>
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      {entry.userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {entry.userName}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {entry.examType} • {entry.testsCompleted.toString()}{" "}
                        tests
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-primary text-sm">
                        {entry.totalScore.toString()}
                      </p>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 hero-gradient">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Star className="w-10 h-10 mx-auto mb-4 text-yellow-300" />
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of students already preparing smarter with Exam
              Orbit.
            </p>
            <Button
              size="lg"
              className="bg-brand-orange hover:bg-brand-orange-dark text-white font-bold shadow-lg"
              asChild
              data-ocid="cta.start.primary_button"
            >
              <Link to="/tests">
                Take Your First Mock Test{" "}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
