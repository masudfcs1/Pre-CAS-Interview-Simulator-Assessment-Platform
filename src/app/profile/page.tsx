"use client";

import React, { useState } from "react";
import {
  UserCircle,
  GraduationCap,
  Briefcase,
  Coins,
  Home,
  CheckCircle2,
  Save,
  Plus,
  Trash2,
  Sparkles,
} from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";
import { StudentProfile } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function ProfilePage() {
  const { profile, updateProfile } = useAppStore();
  const [formData, setFormData] = useState<StudentProfile>(profile);
  const [moduleInput, setModuleInput] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleChange = (field: keyof StudentProfile, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddModule = () => {
    if (!moduleInput.trim()) return;
    const updated = [...formData.courseModules, moduleInput.trim()];
    handleChange("courseModules", updated);
    setModuleInput("");
  };

  const handleRemoveModule = (index: number) => {
    const updated = formData.courseModules.filter((_, i) => i !== index);
    handleChange("courseModules", updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Student Profile & Personalization
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Personalize your UK university Pre-CAS interview rubric checks and consistency assessments.
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-4 h-4" /> Profile Updated
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Personal Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserCircle className="w-4 h-4 text-brand-500" />
              <CardTitle className="text-sm">Personal & Geographic Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Legal Name (as per Passport)
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Country of Origin / Citizenship
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleChange("country", e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Previous Academic Background */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-500" />
              <CardTitle className="text-sm">Previous Academic Background</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Previous Awarding University
                </label>
                <input
                  type="text"
                  value={formData.previousUniversity}
                  onChange={(e) => handleChange("previousUniversity", e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Previous Degree & Subject
                </label>
                <input
                  type="text"
                  value={formData.previousDegree}
                  onChange={(e) => handleChange("previousDegree", e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Graduation Year
                </label>
                <input
                  type="text"
                  value={formData.graduationYear}
                  onChange={(e) => handleChange("graduationYear", e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Academic Results / CGPA
                </label>
                <input
                  type="text"
                  value={formData.academicResults}
                  onChange={(e) => handleChange("academicResults", e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Target UK University & Modules */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-500" />
              <CardTitle className="text-sm">Target UK University & Course Modules</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target UK University
                </label>
                <input
                  type="text"
                  value={formData.intendedUniversity}
                  onChange={(e) => handleChange("intendedUniversity", e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Master's Programme Title
                </label>
                <input
                  type="text"
                  value={formData.intendedProgramme}
                  onChange={(e) => handleChange("intendedProgramme", e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Modules List */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Key Course Modules (Interviewers specifically ask for 3-4 specific module names)
              </label>
              <div className="space-y-2 mb-2">
                {formData.courseModules.map((mod, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-700 text-xs"
                  >
                    <span>{mod}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveModule(idx)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Machine Learning and Neural Networks"
                  value={moduleInput}
                  onChange={(e) => setModuleInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                />
                <Button type="button" size="sm" onClick={handleAddModule} className="text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Module
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial & Sponsorship Readiness */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-500" />
              <CardTitle className="text-sm">Financial & Sponsorship Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Funding Source
                </label>
                <select
                  value={formData.fundingSource}
                  onChange={(e) => handleChange("fundingSource", e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                >
                  <option value="parents">Parents / Legal Guardians</option>
                  <option value="self">Self-Funded</option>
                  <option value="sponsor">Official Corporate / Government Sponsor</option>
                  <option value="bank_loan">Approved Education Bank Loan</option>
                  <option value="scholarship">University Scholarship</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sponsor Details (Name, Relationship, Occupation)
                </label>
                <input
                  type="text"
                  value={formData.sponsorName}
                  onChange={(e) => handleChange("sponsorName", e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Total Tuition Fee Amount
                </label>
                <input
                  type="text"
                  value={formData.tuitionFeeAmount}
                  onChange={(e) => handleChange("tuitionFeeAmount", e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Living Expenses / Maintenance Reserve
                </label>
                <input
                  type="text"
                  value={formData.livingExpensesAmount}
                  onChange={(e) => handleChange("livingExpensesAmount", e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Accommodation Plan & City Postcode
              </label>
              <input
                type="text"
                value={formData.accommodationPlan}
                onChange={(e) => handleChange("accommodationPlan", e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Save Button */}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="submit" size="lg" className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-6">
            <Save className="w-4 h-4 mr-1.5" />
            Save Profile Configuration
          </Button>
        </div>
      </form>
    </div>
  );
}
