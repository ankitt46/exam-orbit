import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Atom,
  BookOpen,
  Calculator,
  ChevronDown,
  ChevronUp,
  FileText,
  FlaskConical,
  Leaf,
  Sigma,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { ContentType, Subject } from "../backend";
import type { StudyMaterial } from "../backend";
import { useStudyMaterials } from "../hooks/useQueries";

const SUBJECT_ICONS: Record<Subject, React.ElementType> = {
  [Subject.physics]: Atom,
  [Subject.chemistry]: FlaskConical,
  [Subject.maths]: Calculator,
  [Subject.biology]: Leaf,
};

const SUBJECT_COLORS: Record<Subject, string> = {
  [Subject.physics]: "subject-physics",
  [Subject.chemistry]: "subject-chemistry",
  [Subject.maths]: "subject-maths",
  [Subject.biology]: "subject-biology",
};

function MaterialCard({ material }: { material: StudyMaterial }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = SUBJECT_ICONS[material.subject];
  const colorClass = SUBJECT_COLORS[material.subject];
  const isFormula = material.contentType === ContentType.formula;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl overflow-hidden shadow-card"
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs capitalize">
                {material.subject}
              </Badge>
              <Badge
                className={`text-xs ${isFormula ? "bg-brand-orange text-white" : "bg-primary text-white"}`}
              >
                {isFormula ? (
                  <>
                    <Sigma className="w-3 h-3 mr-1" />
                    Formula
                  </>
                ) : (
                  <>
                    <FileText className="w-3 h-3 mr-1" />
                    Notes
                  </>
                )}
              </Badge>
            </div>
            <h3 className="font-display font-semibold text-sm mb-0.5">
              {material.title}
            </h3>
            <p className="text-xs text-muted-foreground">{material.chapter}</p>
          </div>
          <button
            type="button"
            className="shrink-0 p-1.5 hover:bg-secondary rounded-md transition-colors"
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? "Collapse" : "Expand"}
            data-ocid="study.material.toggle"
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-5 pb-5"
          data-ocid="study.material.panel"
        >
          <div className="border-t border-border pt-4">
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
              {material.content}
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function StudyMaterialPage() {
  const [selectedSubject, setSelectedSubject] = useState<Subject | "all">(
    "all",
  );
  const [selectedType, setSelectedType] = useState<ContentType | "all">("all");
  const { data: materials, isLoading } = useStudyMaterials();

  const filtered = (materials ?? []).filter((m) => {
    if (selectedSubject !== "all" && m.subject !== selectedSubject)
      return false;
    if (selectedType !== "all" && m.contentType !== selectedType) return false;
    return true;
  });

  const groupedByChapter = filtered.reduce(
    (acc, m) => {
      const key = `${m.subject}::${m.chapter}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(m);
      return acc;
    },
    {} as Record<string, StudyMaterial[]>,
  );

  return (
    <div className="container mx-auto px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-4xl font-bold mb-2">Study Material</h1>
        <p className="text-muted-foreground mb-8">
          Chapter-wise notes and formula sheets for JEE & NEET
        </p>
      </motion.div>

      {/* Subject filter */}
      <Tabs
        value={selectedSubject}
        onValueChange={(v) => setSelectedSubject(v as Subject | "all")}
        className="mb-4"
        data-ocid="study.subject.tab"
      >
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="all" data-ocid="study.subject.all.tab">
            All Subjects
          </TabsTrigger>
          {Object.values(Subject).map((s) => (
            <TabsTrigger
              key={s}
              value={s}
              className="capitalize"
              data-ocid={`study.subject.${s}.tab`}
            >
              {s}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Type filter */}
      <div className="flex gap-2 mb-8" data-ocid="study.type.panel">
        {(["all", ContentType.notes, ContentType.formula] as const).map(
          (type) => (
            <button
              type="button"
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border capitalize ${
                selectedType === type
                  ? "bg-primary text-white border-primary"
                  : "border-border hover:border-primary/50"
              }`}
              data-ocid={`study.type.${type}.toggle`}
            >
              {type === "all"
                ? "All Types"
                : type === ContentType.formula
                  ? "Formula Sheets"
                  : "Notes"}
            </button>
          ),
        )}
      </div>

      {isLoading ? (
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          data-ocid="study.loading_state"
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="text-center py-20 text-muted-foreground"
          data-ocid="study.empty_state"
        >
          <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">No study materials found</p>
          <p className="text-sm">
            Adjust filters or check back once data loads.
          </p>
        </div>
      ) : (
        <div className="space-y-8" data-ocid="study.list">
          {Object.entries(groupedByChapter).map(([key, mats], gi) => {
            const [subject, chapter] = key.split("::");
            return (
              <div key={key} data-ocid={`study.item.${gi + 1}`}>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="font-display font-bold text-lg capitalize">
                    {chapter}
                  </h2>
                  <Badge variant="outline" className="text-xs capitalize">
                    {subject}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mats.map((m) => (
                    <MaterialCard key={m.id.toString()} material={m} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
