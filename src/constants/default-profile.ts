import { StudentProfile, PlatformSettings } from "@/types";

export const DEFAULT_STUDENT_PROFILE: StudentProfile = {
  fullName: "Farhan Ahmed",
  country: "Bangladesh",
  previousUniversity: "University of Dhaka",
  previousDegree: "BSc in Computer Science and Engineering",
  graduationYear: "2024",
  academicResults: "CGPA 3.65 / 4.00 (First Class)",
  currentProfession: "Junior Software Engineer",
  workExperienceYears: "1.5",
  intendedUniversity: "University of Hertfordshire",
  intendedProgramme: "MSc Artificial Intelligence with Advanced Research",
  courseModules: [
    "Machine Learning and Neural Networks",
    "Applied Data Science and Big Data Analytics",
    "Artificial Intelligence Systems Engineering",
    "Advanced Research Methods and Master's Project"
  ],
  careerGoals: "Aim to work as a Senior AI Solutions Architect at leading technology organizations such as Grameenphone or British American Tobacco in Bangladesh within 3 years of completing this degree.",
  fundingSource: "parents",
  sponsorName: "Rafiq Ahmed (Father - Managing Director at Ahmed Textile Mills)",
  tuitionFeeAmount: "£16,500",
  livingExpensesAmount: "£9,207 (£1,023/month for 9 months under UKVI outer London requirements)",
  accommodationPlan: "University on-campus halls of residence (College Lane Campus, Single En-suite room with bills included)",
  updatedAt: new Date().toISOString()
};

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  rubricWeights: {
    quality: 40,
    fluency: 35,
    attention: 25
  },
  ttsEnabled: true,
  ttsVoice: "",
  ttsRate: 1.0,
  cameraEnabled: true,
  micEnabled: true,
  theme: "dark",
  speechRecognitionLanguage: "en-GB",
  saveLocalRecordings: false
};

