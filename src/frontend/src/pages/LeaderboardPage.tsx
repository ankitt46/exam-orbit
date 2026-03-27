import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Medal, Star, Trophy } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { ExamType } from "../backend";
import { useLeaderboard } from "../hooks/useQueries";

export default function LeaderboardPage() {
  const [examType, setExamType] = useState<ExamType>(ExamType.jee);
  const { data: leaderboard, isLoading } = useLeaderboard();

  const filtered = (leaderboard ?? []).filter((e) => e.examType === examType);

  const getRankDisplay = (rank: number) => {
    if (rank === 0) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 1) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-amber-600" />;
    return (
      <span className="text-sm font-bold text-muted-foreground w-5 text-center">
        {rank + 1}
      </span>
    );
  };

  const getRankBg = (rank: number) => {
    if (rank === 0)
      return "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800";
    if (rank === 1)
      return "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700";
    if (rank === 2)
      return "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800";
    return "bg-card border-border";
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-10">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
          <h1 className="font-display text-4xl font-bold mb-2">Leaderboard</h1>
          <p className="text-muted-foreground">
            Top performers competing for exam glory
          </p>
        </div>
      </motion.div>

      <Tabs
        value={examType}
        onValueChange={(v) => setExamType(v as ExamType)}
        className="mb-8"
        data-ocid="leaderboard.exam_type.tab"
      >
        <TabsList className="w-full">
          <TabsTrigger
            value={ExamType.jee}
            className="flex-1"
            data-ocid="leaderboard.jee.tab"
          >
            JEE Main
          </TabsTrigger>
          <TabsTrigger
            value={ExamType.neet}
            className="flex-1"
            data-ocid="leaderboard.neet.tab"
          >
            NEET
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-3" data-ocid="leaderboard.loading_state">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="text-center py-20 text-muted-foreground"
          data-ocid="leaderboard.empty_state"
        >
          <Star className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">No entries yet</p>
          <p className="text-sm">
            Complete mock tests to appear on the leaderboard!
          </p>
        </div>
      ) : (
        <div className="space-y-3" data-ocid="leaderboard.list">
          {filtered.map((entry, i) => (
            <motion.div
              key={entry.id.toString()}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-4 p-4 rounded-xl border shadow-xs ${getRankBg(
                i,
              )}`}
              data-ocid={`leaderboard.item.${i + 1}`}
            >
              <div className="w-8 flex items-center justify-center shrink-0">
                {getRankDisplay(i)}
              </div>
              <Avatar className="w-10 h-10 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                  {entry.userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">
                  {entry.userName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {entry.testsCompleted.toString()} tests completed
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-display font-bold text-lg text-primary">
                  {entry.totalScore.toString()}
                </p>
                <p className="text-xs text-muted-foreground">points</p>
              </div>
              {i < 3 && (
                <Badge
                  className={`shrink-0 text-xs ${
                    i === 0
                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      : i === 1
                        ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                        : "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                  }`}
                >
                  {["🥇 Gold", "🥈 Silver", "🥉 Bronze"][i]}
                </Badge>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
