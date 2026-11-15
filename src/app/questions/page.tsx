"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Plus,
  RotateCcw,
  Star,
  Clock,
  Play,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  BookOpen,
  HelpCircle,
  Award,
} from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";
import { PreCASQuestion, QuestionCategory, QuestionDifficulty } from "@/types";
import { CATEGORY_LABELS } from "@/constants/default-questions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

export default function QuestionsPage() {
  const router = useRouter();
  const {
    questions,
    searchQuery,
    selectedCategory,
    selectedDifficulty,
    showFavoritesOnly,
    setSearchQuery,
    setSelectedCategory,
    setSelectedDifficulty,
    setShowFavoritesOnly,
    toggleFavoriteQuestion,
    addCustomQuestion,
    updateQuestion,
    deleteCustomQuestion,
    resetQuestions,
    startInterview,
  } = useAppStore();

  const [selectedQuestion, setSelectedQuestion] = useState<PreCASQuestion | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<PreCASQuestion | null>(null);

  // Form state for add/edit question
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState<QuestionCategory>("personal-background");
  const [formDifficulty, setFormDifficulty] = useState<QuestionDifficulty>("medium");
  const [formExpected, setFormExpected] = useState("");
  const [formKeyPoints, setFormKeyPoints] = useState("");
  const [formMistakes, setFormMistakes] = useState("");
  const [formDuration, setFormDuration] = useState(90);
  const [formKeywords, setFormKeywords] = useState("");

  const categories = [
    { id: "all", label: "All Categories" },
    ...Object.entries(CATEGORY_LABELS).map(([id, info]) => ({ id, label: info.label })),
  ];

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchSearch =
        searchQuery === "" ||
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory = selectedCategory === "all" || q.category === selectedCategory;
      const matchDifficulty = selectedDifficulty === "all" || q.difficulty === selectedDifficulty;
      const matchFavorites = !showFavoritesOnly || q.isFavorite;

      return matchSearch && matchCategory && matchDifficulty && matchFavorites;
    });
  }, [questions, searchQuery, selectedCategory, selectedDifficulty, showFavoritesOnly]);

  const handleOpenAddModal = () => {
    setFormTitle("");
    setFormCategory("personal-background");
    setFormDifficulty("medium");
    setFormExpected("");
    setFormKeyPoints("");
    setFormMistakes("");
    setFormDuration(90);
    setFormKeywords("");
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (q: PreCASQuestion) => {
    setEditingQuestion(q);
    setFormTitle(q.title);
    setFormCategory(q.category);
    setFormDifficulty(q.difficulty);
    setFormExpected(q.expectedWhat);
    setFormKeyPoints(q.keyPoints.join("\n"));
    setFormMistakes(q.commonMistakes.join("\n"));
    setFormDuration(q.recommendedDurationSec);
    setFormKeywords(q.keywords.join(", "));
    setIsEditModalOpen(true);
  };

  const handleSaveAdd = () => {
    if (!formTitle.trim()) return;

    addCustomQuestion({
      title: formTitle.trim(),
      category: formCategory,
      difficulty: formDifficulty,
      expectedWhat: formExpected.trim() || "Clear, honest explanation.",
      keyPoints: formKeyPoints.split("\n").filter((p) => p.trim().length > 0),
      commonMistakes: formMistakes.split("\n").filter((m) => m.trim().length > 0),
      recommendedDurationSec: Number(formDuration) || 90,
      suggestedStructure: [
        { stage: "Stage 1", guidance: "State your main point directly." },
        { stage: "Stage 2", guidance: "Provide concrete evidence and examples." },
        { stage: "Stage 3", guidance: "Summarize and conclude." },
      ],
      keywords: formKeywords.split(",").map((k) => k.trim()).filter((k) => k.length > 0),
    });

    setIsAddModalOpen(false);
  };

  const handleSaveEdit = () => {
    if (!editingQuestion || !formTitle.trim()) return;

    updateQuestion(editingQuestion.id, {
      title: formTitle.trim(),
      category: formCategory,
      difficulty: formDifficulty,
      expectedWhat: formExpected.trim(),
      keyPoints: formKeyPoints.split("\n").filter((p) => p.trim().length > 0),
      commonMistakes: formMistakes.split("\n").filter((m) => m.trim().length > 0),
      recommendedDurationSec: Number(formDuration) || 90,
      keywords: formKeywords.split(",").map((k) => k.trim()).filter((k) => k.length > 0),
    });

    setIsEditModalOpen(false);
    if (selectedQuestion?.id === editingQuestion.id) {
      setSelectedQuestion({
        ...selectedQuestion,
        title: formTitle.trim(),
        category: formCategory,
        difficulty: formDifficulty,
        expectedWhat: formExpected.trim(),
        keyPoints: formKeyPoints.split("\n").filter((p) => p.trim().length > 0),
        commonMistakes: formMistakes.split("\n").filter((m) => m.trim().length > 0),
        recommendedDurationSec: Number(formDuration) || 90,
      });
    }
  };

  const handlePracticeQuestion = (questionId: string) => {
    startInterview("custom", [questionId]);
    router.push("/interview");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Pre-CAS Question Bank
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            20 structured UK university Pre-CAS interview questions with expected answers, rubrics, and key points.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={resetQuestions} title="Reset to official 20 questions">
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Reset Defaults
          </Button>
          <Button size="sm" onClick={handleOpenAddModal} className="bg-brand-600 hover:bg-brand-700 text-white">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Add Custom Question
          </Button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search questions by keywords (e.g. tuition, modules, accommodation, career)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            {/* Favorites Toggle */}
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border flex items-center gap-1.5 transition-colors ${
                showFavoritesOnly
                  ? "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400"
                  : "bg-slate-50 dark:bg-navy-800 border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-400"
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${showFavoritesOnly ? "fill-amber-400 text-amber-400" : ""}`} />
              <span>Favorites</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
            <span>Showing {filteredQuestions.length} of {questions.length} questions</span>
            <span>UKVI & University Pre-CAS Practice List</span>
          </div>
        </CardContent>
      </Card>

      {/* Questions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredQuestions.map((q) => {
          const categoryMeta = CATEGORY_LABELS[q.category] || { label: q.category };
          const isPracticed = (q.timesPracticed || 0) > 0;

          return (
            <Card
              key={q.id}
              className="hover:border-brand-500/50 dark:hover:border-brand-500/50 transition-all flex flex-col justify-between group"
            >
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 text-xs font-bold flex items-center justify-center shrink-0">
                      #{q.number}
                    </span>
                    <Badge
                      variant={
                        q.difficulty === "easy"
                          ? "success"
                          : q.difficulty === "medium"
                          ? "warning"
                          : "danger"
                      }
                    >
                      {q.difficulty}
                    </Badge>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      {categoryMeta.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleFavoriteQuestion(q.id)}
                      className="p-1 rounded-md text-slate-400 hover:text-amber-400 transition-colors"
                      title="Favorite"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          q.isFavorite ? "fill-amber-400 text-amber-400" : ""
                        }`}
                      />
                    </button>
                    {q.isCustom && (
                      <button
                        onClick={() => deleteCustomQuestion(q.id)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-500 transition-colors"
                        title="Delete custom question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-brand-500 transition-colors">
                    {q.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                    {q.expectedWhat}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-navy-800">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>~{q.recommendedDurationSec}s</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2
                      className={`w-3 h-3 ${isPracticed ? "text-emerald-500" : "text-slate-300 dark:text-slate-600"}`}
                    />
                    <span>{isPracticed ? `Practiced ${q.timesPracticed}x` : "Not attempted"}</span>
                  </span>
                </div>
              </CardContent>

              <div className="px-5 pb-4 pt-0 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedQuestion(q)}
                  className="flex-1 text-xs"
                >
                  View Details & Guide
                </Button>
                <Button
                  size="sm"
                  onClick={() => handlePracticeQuestion(q.id)}
                  className="bg-brand-600 hover:bg-brand-700 text-white text-xs px-3"
                  title="Practice this question"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOpenEditModal(q)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  title="Edit question details"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Question Details Modal */}
      {selectedQuestion && (
        <Modal
          isOpen={!!selectedQuestion}
          onClose={() => setSelectedQuestion(null)}
          title={`Question #${selectedQuestion.number}: ${selectedQuestion.title}`}
          description={CATEGORY_LABELS[selectedQuestion.category]?.label || selectedQuestion.category}
          maxWidth="2xl"
        >
          <div className="space-y-5">
            {/* What Interviewer Expects */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-brand-500" />
                What the Interviewer Expects
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-navy-800/80 p-3.5 rounded-xl border border-slate-200/80 dark:border-navy-700/60 leading-relaxed">
                {selectedQuestion.expectedWhat}
              </p>
            </div>

            {/* Key Points to Include */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Key Points to Include in Your Answer
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                {selectedQuestion.keyPoints.map((kp, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-emerald-50/40 dark:bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{kp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Common Mistakes */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                Common Mistakes to Avoid
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                {selectedQuestion.commonMistakes.map((cm, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-rose-50/40 dark:bg-rose-950/20 p-2.5 rounded-lg border border-rose-100 dark:border-rose-900/30">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>{cm}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Suggested Answer Structure */}
            {selectedQuestion.suggestedStructure && (
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-purple-500" />
                  Suggested 3-Stage Answer Structure
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {selectedQuestion.suggestedStructure.map((stg, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-800/40">
                      <p className="text-[11px] font-bold text-purple-700 dark:text-purple-300 uppercase">
                        {stg.stage}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        {stg.guidance}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Recommended Duration: ~{selectedQuestion.recommendedDurationSec} seconds
              </span>
              <Button
                onClick={() => {
                  setSelectedQuestion(null);
                  handlePracticeQuestion(selectedQuestion.id);
                }}
                className="bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs"
              >
                <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
                Practice Now in Interview Room
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Custom Question Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Custom Pre-CAS Question"
        description="Add a personalized university question to your practice bank"
        maxWidth="xl"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Question Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Why did you choose this campus over London?"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as QuestionCategory)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
              >
                {Object.entries(CATEGORY_LABELS).map(([key, info]) => (
                  <option key={key} value={key}>
                    {info.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Difficulty
              </label>
              <select
                value={formDifficulty}
                onChange={(e) => setFormDifficulty(e.target.value as QuestionDifficulty)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              What the Interviewer Expects
            </label>
            <textarea
              rows={2}
              placeholder="Summary of what makes a good response..."
              value={formExpected}
              onChange={(e) => setFormExpected(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Key Points to Mention (one per line)
            </label>
            <textarea
              rows={2}
              placeholder="Points to include..."
              value={formKeyPoints}
              onChange={(e) => setFormKeyPoints(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Keywords (comma-separated for rule-based scoring)
            </label>
            <input
              type="text"
              placeholder="e.g. campus, ranking, transport, library, facilities"
              value={formKeywords}
              onChange={(e) => setFormKeywords(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-navy-800">
            <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveAdd} className="bg-brand-600 hover:bg-brand-700 text-white">
              Save Question
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Question Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Pre-CAS Question"
        maxWidth="xl"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Question Title
            </label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as QuestionCategory)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
              >
                {Object.entries(CATEGORY_LABELS).map(([key, info]) => (
                  <option key={key} value={key}>
                    {info.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Difficulty
              </label>
              <select
                value={formDifficulty}
                onChange={(e) => setFormDifficulty(e.target.value as QuestionDifficulty)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              What the Interviewer Expects
            </label>
            <textarea
              rows={3}
              value={formExpected}
              onChange={(e) => setFormExpected(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Key Points (one per line)
            </label>
            <textarea
              rows={3}
              value={formKeyPoints}
              onChange={(e) => setFormKeyPoints(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Keywords (comma-separated)
            </label>
            <input
              type="text"
              value={formKeywords}
              onChange={(e) => setFormKeywords(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-navy-800">
            <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveEdit} className="bg-brand-600 hover:bg-brand-700 text-white">
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

