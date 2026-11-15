import { PreCASQuestion } from "@/types";

export const DEFAULT_PRE_CAS_QUESTIONS: PreCASQuestion[] = [
  // 1. Personal background
  {
    id: "q-1",
    number: 1,
    title: "Tell me about yourself.",
    category: "personal-background",
    difficulty: "easy",
    expectedWhat: "A succinct professional and academic summary highlighting your qualifications, current trajectory, and motivation for pursuing postgraduate education in the UK.",
    keyPoints: [
      "Brief introduction with your full legal name and country of origin",
      "Overview of your latest degree, major, and graduation institution",
      "Current employment or academic projects relevant to the field",
      "Clear connection between your background and the decision to study in the UK"
    ],
    commonMistakes: [
      "Reciting family life story or unrelated childhood details",
      "Reading verbatim from a CV or personal statement",
      "Talking for more than 2 minutes without structure"
    ],
    recommendedDurationSec: 90,
    suggestedStructure: [
      { stage: "Present", guidance: "Briefly introduce yourself, your current role or recent academic status." },
      { stage: "Past", guidance: "Highlight your academic degree, key projects, and accomplishments." },
      { stage: "Future", guidance: "Explain how this postgraduate degree is the natural next step." }
    ],
    keywords: ["name", "degree", "graduated", "university", "background", "experience", "passion", "career", "master", "postgraduate"]
  },
  {
    id: "q-2",
    number: 2,
    title: "Can you explain your academic background?",
    category: "personal-background",
    difficulty: "easy",
    expectedWhat: "Demonstration of your academic milestones, grades, foundational subject matter, and readiness for UK Master's level study (FHEQ Level 7).",
    keyPoints: [
      "Name of Bachelor's degree, awarding university, and graduation year",
      "Overall grade/CGPA and how it fulfills the UK university entry requirement",
      "Specific undergraduate modules or final year dissertation related to the target course",
      "Any study gaps explained with constructive professional or academic development"
    ],
    commonMistakes: [
      "Forgetting your exact graduation year, CGPA, or degree title",
      "Leaving study gaps unexplained",
      "Listing courses without connecting them to your target programme"
    ],
    recommendedDurationSec: 90,
    suggestedStructure: [
      { stage: "Undergraduate Summary", guidance: "State your qualification, awarding institution, and final GPA/grade." },
      { stage: "Core Competencies", guidance: "Mention 2-3 key modules, projects, or thesis work you completed." },
      { stage: "Academic Readiness", guidance: "Highlight how this provides the academic foundation for UK Master's level study." }
    ],
    keywords: ["bachelor", "cgpa", "grade", "university", "modules", "thesis", "dissertation", "academic", "research", "qualification"]
  },
  {
    id: "q-3",
    number: 3,
    title: "Why did you choose this particular subject?",
    category: "personal-background",
    difficulty: "medium",
    expectedWhat: "Genuine intellectual curiosity and professional motivation for this specific discipline rather than a generic degree.",
    keyPoints: [
      "The triggering event or professional problem that sparked your subject interest",
      "Industry relevance and current demand for specialists in this discipline",
      "Limitations in your current knowledge that this subject addresses",
      "Specific subfields (e.g., machine learning, corporate finance, public health) that interest you"
    ],
    commonMistakes: [
      "Saying 'because it pays well' or 'because my parents suggested it'",
      "Vague descriptions with zero technical or discipline terminology",
      "Inability to explain what the subject actually entails"
    ],
    recommendedDurationSec: 75,
    suggestedStructure: [
      { stage: "Motivation Source", guidance: "Explain when and how you realized the importance of this subject." },
      { stage: "Knowledge Gap", guidance: "Explain what specialized tools, methodologies, or theories you need to master." },
      { stage: "Application", guidance: "Describe how this subject will solve industry challenges upon graduation." }
    ],
    keywords: ["subject", "discipline", "interest", "industry", "specialization", "knowledge", "skills", "demand", "practical", "advancement"]
  },

  // 2. Course and university
  {
    id: "q-4",
    number: 4,
    title: "Why have you chosen this university?",
    category: "course-and-university",
    difficulty: "medium",
    expectedWhat: "Evidence of in-depth university research, demonstrating institutional fit, facilities, ranking, location, and faculty.",
    keyPoints: [
      "Campus location, transport links, and campus environment (city vs campus-based)",
      "University ranking (e.g., Complete University Guide, Guardian, QS, Times Higher Education)",
      "Specialized facilities, labs, libraries, or industry links (e.g., Bloomberg terminals, engineering workshops)",
      "Teaching methodology, TEF rating (Teaching Excellence Framework), and graduate employability"
    ],
    commonMistakes: [
      "Saying 'it is a very famous university' with no specifics",
      "Mentioning tuition fees as the sole reason",
      "Confusing campus locations (e.g., saying London when the campus is in Coventry or Hatfield)"
    ],
    recommendedDurationSec: 90,
    suggestedStructure: [
      { stage: "Institutional Distinction", guidance: "Mention university ranking, TEF award, and academic reputation." },
      { stage: "Facilities & Faculty", guidance: "Name specific research centers, libraries, labs, or faculty credentials." },
      { stage: "Location & Student Support", guidance: "Discuss the campus environment, student union, and career development services." }
    ],
    keywords: ["ranking", "campus", "facilities", "tef", "employability", "faculty", "reputation", "location", "student support", "curriculum"]
  },
  {
    id: "q-5",
    number: 5,
    title: "Why did you choose this specific master's programme?",
    category: "course-and-university",
    difficulty: "medium",
    expectedWhat: "Granular awareness of the curriculum structure, accreditation (e.g., CMI, BCS, ACCA, IET), and syllabus uniqueness compared to alternatives.",
    keyPoints: [
      "Exact programme title and credential awarded (MSc, MA, MBA, LLM)",
      "Professional body accreditations (e.g., BCS, CIPD, CIPS, CMI, CIM)",
      "Course duration (1 year full-time / 18 months with placement)",
      "Practical teaching model (case studies, simulations, capstone consultancy projects)"
    ],
    commonMistakes: [
      "Misquoting the exact title of the course (e.g., calling an MSc an MBA)",
      "Not knowing the course length or start date",
      "Failing to mention any professional accreditation or practical component"
    ],
    recommendedDurationSec: 90,
    suggestedStructure: [
      { stage: "Course Alignment", guidance: "State exact course title and why this syllabus fits your career." },
      { stage: "Accreditation & Quality", guidance: "Mention professional accreditations and practical focus." },
      { stage: "Unique Edge", guidance: "Explain how this curriculum offers distinct modules not found in other programmes." }
    ],
    keywords: ["programme", "curriculum", "accreditation", "practical", "industry", "course structure", "credits", "project", "degree", "syllabus"]
  },
  {
    id: "q-6",
    number: 6,
    title: "What do you know about your course modules?",
    category: "course-and-university",
    difficulty: "hard",
    expectedWhat: "Intimate familiarity with course syllabus, naming at least 3-4 core modules, elective choices, credits, and dissertation/capstone project details.",
    keyPoints: [
      "Name 3 to 4 specific modules by their exact catalogue titles",
      "Total credit requirements (normally 180 credits for UK master's: 120 taught + 60 dissertation)",
      "Core modules vs elective options available in semester 1 and 2",
      "Final dissertation or major project focus and how you plan to approach it"
    ],
    commonMistakes: [
      "Failing to name even one specific module title",
      "Making up fictional course names",
      "Not knowing the final research project / dissertation weight (60 credits)"
    ],
    recommendedDurationSec: 105,
    suggestedStructure: [
      { stage: "Credit Overview", guidance: "Mention the total 180 credits breakdown (taught modules + dissertation)." },
      { stage: "Key Modules", guidance: "Name 3-4 specific modules and explain what each covers." },
      { stage: "Dissertation/Capstone", guidance: "Discuss your intended dissertation or practical project topic." }
    ],
    keywords: ["modules", "credits", "180 credits", "dissertation", "elective", "core", "syllabus", "research project", "semester", "assessment"]
  },
  {
    id: "q-7",
    number: 7,
    title: "How does your previous education relate to this programme?",
    category: "course-and-university",
    difficulty: "medium",
    expectedWhat: "Logical bridge between undergraduate studies and UK postgraduate studies, explaining academic progression and credit building.",
    keyPoints: [
      "Specific undergraduate coursework that provided foundational knowledge",
      "Transferable analytical, technical, or research skills developed",
      "Addressing any academic transition (e.g., Engineering to Management) with clear rationale",
      "How UK Level 7 builds upon Level 6 bachelor qualifications"
    ],
    commonMistakes: [
      "Claiming there is no relation between your degrees without justification",
      "Vague assertions without referencing specific shared subjects or skills",
      "Ignoring mathematical, quantitative, or research methodology overlap"
    ],
    recommendedDurationSec: 80,
    suggestedStructure: [
      { stage: "Foundational Link", guidance: "Identify 2-3 undergraduate courses that laid the groundwork." },
      { stage: "Skill Progression", guidance: "Explain how you will transition from basic theory to advanced strategic execution." },
      { stage: "Academic Cohesion", guidance: "Summarize how this master's completes your academic profile." }
    ],
    keywords: ["foundation", "bachelor", "skills", "undergraduate", "progression", "analytical", "research", "methodology", "transition", "continuity"]
  },

  // 3. UK study motivation
  {
    id: "q-8",
    number: 8,
    title: "Why do you want to study in the UK?",
    category: "uk-study-motivation",
    difficulty: "medium",
    expectedWhat: "Clear comparative reasoning for choosing the UK educational framework, global reputation, 1-year master's efficiency, and quality assurance.",
    keyPoints: [
      "1-year Master's degree saving both tuition fee costs and living expenses (fast ROI)",
      "Quality Assurance Agency (QAA) and high academic benchmarking of UK degrees",
      "Multicultural student community fostering global perspectives",
      "English language immersion and internationally recognized qualification"
    ],
    commonMistakes: [
      "Saying 'I want to settle in the UK' or mentioning permanent migration",
      "Talking solely about UK tourism, football, or sights",
      "Failing to mention academic quality or the 1-year duration advantage"
    ],
    recommendedDurationSec: 90,
    suggestedStructure: [
      { stage: "Academic Rigor", guidance: "Highlight QAA standards, world-renowned pedagogy, and global degree recognition." },
      { stage: "Time & Cost Efficiency", guidance: "Emphasize the intensive 1-year master's curriculum compared to 2-year programs elsewhere." },
      { stage: "International Exposure", guidance: "Mention the multicultural learning environment and global networking." }
    ],
    keywords: ["uk", "one year", "qaa", "quality", "reputation", "intensive", "cost-effective", "degree", "international", "immersion"]
  },
  {
    id: "q-9",
    number: 9,
    title: "Why not study this programme in Bangladesh?",
    category: "uk-study-motivation",
    difficulty: "hard",
    expectedWhat: "Respectful, objective comparison between home country educational offerings and the UK programme without unfairly disparaging domestic institutions.",
    keyPoints: [
      "Curriculum difference: UK offers cutting-edge industry-updated syllabi vs theoretical emphasis",
      "Lack of specific specialized modules or research facilities in home country",
      "Duration: UK master's is 1 intensive year vs 2 to 3 years locally",
      "Global benchmarking and recognition needed for multinational career goals"
    ],
    commonMistakes: [
      "Insulting home country institutions aggressively",
      "Saying 'local degrees are useless'",
      "Inability to name any universities in your home country that offer related degrees"
    ],
    recommendedDurationSec: 90,
    suggestedStructure: [
      { stage: "Curriculum Contrast", guidance: "Explain how UK programs combine theory with real-world case simulations." },
      { stage: "Specialization Gap", guidance: "Mention specific topics or tech stacks absent in local university offerings." },
      { stage: "Time Frame & Return", guidance: "Point out the 1-year completion allowing you to re-enter the home job market a year earlier." }
    ],
    keywords: ["home country", "bangladesh", "practical", "industry", "curriculum", "facilities", "specialization", "duration", "case study", "difference"]
  },
  {
    id: "q-10",
    number: 10,
    title: "Why did you choose the UK instead of other countries?",
    category: "uk-study-motivation",
    difficulty: "hard",
    expectedWhat: "Detailed comparative analysis against USA, Canada, Australia, or Germany evaluating duration, total expenditure, safety, and visa rules.",
    keyPoints: [
      "Comparison with USA/Canada: 1 year UK master's vs 2 years, cutting living costs and tuition in half",
      "Comparison with Australia: Lower overall expenditure and streamlined visa process",
      "Comparison with Germany: English-taught curriculum availability without language barriers",
      "Safe, regulated international student environment under UKVI guidelines"
    ],
    commonMistakes: [
      "Saying 'I did not look at any other country'",
      "Giving incorrect duration or fee estimates for other countries",
      "Focusing on immigration policies or work rights rather than educational merits"
    ],
    recommendedDurationSec: 90,
    suggestedStructure: [
      { stage: "Countries Evaluated", guidance: "Name 2 other countries you actively considered (e.g., USA, Australia, Canada)." },
      { stage: "Direct Comparison", guidance: "Compare course length (1 yr vs 2 yrs), total tuition/living costs, and admission timelines." },
      { stage: "Decisive Factor", guidance: "State why the UK represented the best academic and financial balance." }
    ],
    keywords: ["usa", "canada", "australia", "germany", "duration", "cost", "two years", "tuition", "comparison", "living expenses"]
  },
  {
    id: "q-11",
    number: 11,
    title: "Which other universities did you consider?",
    category: "uk-study-motivation",
    difficulty: "medium",
    expectedWhat: "Proof of thorough research by naming 2-3 specific competitor UK universities, their tuition fees, and why you chose your final institution.",
    keyPoints: [
      "Name 2 to 3 other UK universities you researched or applied to",
      "State their respective tuition fees, locations, and rankings",
      "Provide concrete reasons why your chosen university prevailed (module content, campus, fees, faculty)",
      "Demonstrate you are an informed consumer making a prudent educational investment"
    ],
    commonMistakes: [
      "Saying 'I only applied to this one university and didn't check any others'",
      "Naming universities that do not offer the course",
      "Not knowing the tuition fee difference or ranking differences"
    ],
    recommendedDurationSec: 85,
    suggestedStructure: [
      { stage: "Universities Researched", guidance: "Name 2 specific UK universities you evaluated (e.g., University of Hertfordshire, Coventry, Greenwich)." },
      { stage: "Fee & Module Comparison", guidance: "Mention their tuition fees and module offerings." },
      { stage: "Winning Rationale", guidance: "Explain the decisive factors that made your selected university your first choice." }
    ],
    keywords: ["universities", "considered", "fees", "ranking", "location", "curriculum", "comparison", "options", "decision", "choice"]
  },

  // 4. Academic and professional plans
  {
    id: "q-12",
    number: 12,
    title: "How will this programme support your career goals?",
    category: "academic-and-professional-plans",
    difficulty: "hard",
    expectedWhat: "Coherent career roadmap with target job titles, target companies in home country, expected salary increase, and specific skills gained.",
    keyPoints: [
      "Short-term post-graduation career goal (target job title within 6-12 months)",
      "Target multinational or national companies in your home country (e.g., Grameenphone, BAT, Beximco, standard banks)",
      "Long-term career vision (5-10 years senior managerial or consulting role)",
      "Direct link between course modules and required industry competencies"
    ],
    commonMistakes: [
      "Saying 'I want to find any job in London'",
      "Vague aspirations like 'I want to be successful'",
      "Inability to name target employer organizations in your home country"
    ],
    recommendedDurationSec: 90,
    suggestedStructure: [
      { stage: "Target Role & Employers", guidance: "State your target role (e.g., Senior Data Analyst) and 3 target employers in your home country." },
      { stage: "Competency Bridge", guidance: "Explain how specific modules supply the technical & management capabilities required." },
      { stage: "Long-term Projection", guidance: "Describe your 5-year career progression and projected leadership impact." }
    ],
    keywords: ["career", "target role", "employers", "home country", "skills", "salary", "promotion", "industry", "short term", "long term"]
  },
  {
    id: "q-13",
    number: 13,
    title: "What are your plans after completing your degree?",
    category: "academic-and-professional-plans",
    difficulty: "hard",
    expectedWhat: "Unequivocal declaration of intention to return to your home country, capitalizing on the UK qualification for career acceleration.",
    keyPoints: [
      "Commitment to return home upon degree completion / visa expiration",
      "Application of international qualification to domestic industry growth",
      "Family ties and social responsibilities in your home country",
      "Realistic timeline of re-entering the professional job market"
    ],
    commonMistakes: [
      "Expressing intent to remain permanently in the UK or apply for settlement",
      "Expressing confusion regarding post-study intentions",
      "Failing to mention ties to your home country"
    ],
    recommendedDurationSec: 75,
    suggestedStructure: [
      { stage: "Immediate Return", guidance: "State clearly that you will return to your home country following completion of your studies." },
      { stage: "Job Search Execution", guidance: "Detail your transition plan to interview with predetermined multinational firms." },
      { stage: "Economic Impact", guidance: "Explain how your UK knowledge will contribute to developing the sector locally." }
    ],
    keywords: ["return", "home country", "career", "employment", "family ties", "graduate", "contribution", "opportunity", "qualification", "repatriation"]
  },
  {
    id: "q-14",
    number: 14,
    title: "How is your professional experience relevant to this programme?",
    category: "academic-and-professional-plans",
    difficulty: "medium",
    expectedWhat: "Demonstration of practical workplace insights, challenges encountered, and how master's degree research resolves workplace bottlenecks.",
    keyPoints: [
      "Company name, your official job title, and tenure length",
      "Key duties and technical responsibilities handled daily",
      "Specific real-world challenges where advanced UK training was deemed necessary",
      "How your workplace experience will enrich classroom discussions"
    ],
    commonMistakes: [
      "Listing duties passively like reading a job spec",
      "Inconsistency with dates or roles stated in your CV / CAS application",
      "Claiming extensive experience when your CV shows you just graduated"
    ],
    recommendedDurationSec: 85,
    suggestedStructure: [
      { stage: "Role & Scope", guidance: "State your role, duration, and main responsibilities." },
      { stage: "Practical Challenges", guidance: "Describe a project or technical challenge where you felt the need for deeper training." },
      { stage: "Master's Value", guidance: "Explain how this curriculum directly addresses those professional limitations." }
    ],
    keywords: ["experience", "company", "responsibilities", "projects", "practical", "challenges", "industry", "skills", "relevance", "workplace"]
  },

  // 5. Financial readiness
  {
    id: "q-15",
    number: 15,
    title: "Who is sponsoring your education?",
    category: "financial-readiness",
    difficulty: "medium",
    expectedWhat: "Complete clarity on funding source (self, parents, legal guardian, official scholarship, approved loan) with verified occupation and income proof.",
    keyPoints: [
      "Sponsor's full identity and exact relationship to you (e.g., father, mother, self)",
      "Sponsor's occupation, business name, or professional position",
      "Annual household income and longevity in that profession",
      "Awareness of bank balance requirements and 28-day holding rule under UKVI"
    ],
    commonMistakes: [
      "Hesitating or giving vague answers about who pays",
      "Saying 'a distant uncle or friend' without official legal standing",
      "Not knowing sponsor's exact business name or income figures"
    ],
    recommendedDurationSec: 80,
    suggestedStructure: [
      { stage: "Sponsor Identity", guidance: "Name your sponsor and specify the exact legal relationship." },
      { stage: "Occupation & Means", guidance: "Detail their profession, business activities, and annual income." },
      { stage: "Financial Assurance", guidance: "Confirm that funds are fully liquid in an approved commercial bank account." }
    ],
    keywords: ["sponsor", "father", "mother", "parents", "income", "business", "bank", "funds", "savings", "affidavit", "relationship"]
  },
  {
    id: "q-16",
    number: 16,
    title: "How will you cover your tuition fees and living expenses?",
    category: "financial-readiness",
    difficulty: "hard",
    expectedWhat: "Exact monetary figures for course tuition, deposit paid, balance remaining, maintenance requirements, and proof of funds in bank.",
    keyPoints: [
      "Total tuition fee amount (e.g., £15,500)",
      "Deposit amount paid or required (e.g., £4,000 paid)",
      "Remaining tuition fee balance (e.g., £11,500)",
      "UKVI maintenance requirement: £1,023/month (outside London) or £1,347/month (inside London) for up to 9 months",
      "Total funds held in bank account meeting the 28-day consecutive holding rule"
    ],
    commonMistakes: [
      "Not knowing the exact tuition fee in British Pounds (£)",
      "Confusing inner London vs outer London maintenance rates",
      "Saying you plan to rely on a part-time job to pay your tuition fees"
    ],
    recommendedDurationSec: 95,
    suggestedStructure: [
      { stage: "Tuition Figures", guidance: "State total tuition, deposit paid, and outstanding balance." },
      { stage: "Maintenance Requirements", guidance: "State exact living cost allowance (£1,023/mo outer or £1,347/mo inner for 9 months)." },
      { stage: "Bank Holding Compliance", guidance: "Confirm total liquid funds available held for the 28-day statutory period." }
    ],
    keywords: ["tuition", "living expenses", "maintenance", "deposit", "balance", "bank account", "28 days", "pounds", "funds", "financial"]
  },
  {
    id: "q-17",
    number: 17,
    title: "What do you know about the cost of living in the UK?",
    category: "financial-readiness",
    difficulty: "medium",
    expectedWhat: "Realistic itemized breakdown of monthly student expenditures including rent, utilities, food, transport, and personal expenses.",
    keyPoints: [
      "Accommodation rent estimate (£400-£700/month outside London; £700-£1,100 inside London)",
      "Groceries and food costs (£150-£250/month)",
      "Utilities, internet, mobile phone plan (£50-£100/month)",
      "Local public transport / student travel pass (£40-£80/month)",
      "Realistic total monthly estimate aligning with UKVI allowances"
    ],
    commonMistakes: [
      "Underestimating rent drastically (e.g., claiming £100/month for an entire flat)",
      "Forgetting utility bills or internet expenses",
      "Unaware of student discount schemes (16-25 Railcard, TOTUM/UNiDAYS)"
    ],
    recommendedDurationSec: 85,
    suggestedStructure: [
      { stage: "Rent & Housing", guidance: "Quote realistic monthly room rent in your university city." },
      { stage: "Daily Living", guidance: "Breakdown groceries, utilities, phone, and local travel." },
      { stage: "Budget Summary", guidance: "State the combined monthly budget and how it fits your financial reserve." }
    ],
    keywords: ["cost of living", "rent", "groceries", "food", "transport", "utilities", "bills", "budget", "expenses", "monthly"]
  },

  // 6. Accommodation and student life
  {
    id: "q-18",
    number: 18,
    title: "Where will you stay while studying?",
    category: "accommodation-and-student-life",
    difficulty: "medium",
    expectedWhat: "Concrete housing strategy (university halls of residence vs private student housing), location proximity, travel time, and booking plan.",
    keyPoints: [
      "Type of accommodation (On-campus halls, private PBSA e.g., Unite Students, or shared private house)",
      "Specific area, postcode, or hall name researched",
      "Distance to campus and commute time (e.g., 15-minute walk or bus ride)",
      "Estimated weekly/monthly rent including bills"
    ],
    commonMistakes: [
      "Saying 'I will look for a hotel or figure it out when I arrive at the airport'",
      "Saying you will live in London when your university is in Manchester or Birmingham (commute impossible)",
      "Unaware of rent inclusion of heating/electricity/Wi-Fi"
    ],
    recommendedDurationSec: 80,
    suggestedStructure: [
      { stage: "Accommodation Choice", guidance: "State your selected option (university accommodation or verified student hall)." },
      { stage: "Location & Commute", guidance: "Explain travel distance and transit mode to campus lecture halls." },
      { stage: "Arrangements", guidance: "Mention current booking status or application process with university accommodation office." }
    ],
    keywords: ["accommodation", "stay", "halls", "campus", "rent", "commute", "bills", "location", "student housing", "living"]
  },
  {
    id: "q-19",
    number: 19,
    title: "How do you plan to manage your academic and personal responsibilities?",
    category: "accommodation-and-student-life",
    difficulty: "medium",
    expectedWhat: "Work-life balance strategy, understanding of UK independent study expectations (independent learning hours vs contact hours), and UKVI visa work limits.",
    keyPoints: [
      "Understanding contact hours (12-16 hrs/week) vs independent study (20-25 hrs/week)",
      "Time management techniques (calendar scheduling, study groups, library resources)",
      "Strict adherence to UK Student Visa work rules: maximum 20 hours per week during term time",
      "Clear prioritization: academic performance always takes priority over any part-time work"
    ],
    commonMistakes: [
      "Saying you will work full-time hours during term (violating UKVI visa conditions)",
      "Underestimating independent research and reading requirements",
      "Showing zero awareness of university academic support or pastoral care"
    ],
    recommendedDurationSec: 85,
    suggestedStructure: [
      { stage: "Study Commitment", guidance: "Acknowledge the heavy ratio of independent study required in UK Master's level." },
      { stage: "Time Management", guidance: "Detail your schedule management, study habits, and assignment planning." },
      { stage: "Visa Compliance", guidance: "Reiterate compliance with the 20-hour work restriction during term time." }
    ],
    keywords: ["time management", "independent study", "contact hours", "20 hours", "visa compliance", "balance", "assignments", "schedule", "priorities"]
  },

  // 7. Final assessment
  {
    id: "q-20",
    number: 20,
    title: "Why should the university consider you a suitable student?",
    category: "final-assessment",
    difficulty: "hard",
    expectedWhat: "Compelling closing pitch consolidating academic capability, dedication, cultural contribution to campus, and commitment to excellence.",
    keyPoints: [
      "Proven academic track record and disciplined work ethic",
      "Unique perspective and international cultural contribution to seminar discussions",
      "Active participation in campus clubs, student union, or research societies",
      "Commitment to be a proud alumnus and university ambassador in your home nation"
    ],
    commonMistakes: [
      "Arrogant tone or begging for admission",
      "Repeating generic cliches without personal evidence",
      "Ending abruptly without a strong positive conviction"
    ],
    recommendedDurationSec: 90,
    suggestedStructure: [
      { stage: "Academic Readiness", guidance: "Reaffirm your solid foundational knowledge and drive for high academic achievement." },
      { stage: "Campus Contribution", guidance: "State how you will actively participate in seminars and international student networks." },
      { stage: "Alumni Ambassadorship", guidance: "Commit to representing the institution with distinction throughout your career." }
    ],
    keywords: ["suitable", "candidate", "contribution", "work ethic", "commitment", "ambassador", "alumni", "values", "academic excellence", "dedication"]
  }
];

export const CATEGORY_LABELS: Record<string, { label: string; description: string; icon: string }> = {
  "personal-background": {
    label: "Personal Background",
    description: "Academic history, qualifications, and personal trajectory",
    icon: "User"
  },
  "course-and-university": {
    label: "Course & University",
    description: "Institutional fit, curriculum knowledge, and modules",
    icon: "GraduationCap"
  },
  "uk-study-motivation": {
    label: "UK Study Motivation",
    description: "Educational system, country comparisons, and benchmarking",
    icon: "Compass"
  },
  "academic-and-professional-plans": {
    label: "Academic & Professional Plans",
    description: "Career goals, employer targets, and repatriation plans",
    icon: "Briefcase"
  },
  "financial-readiness": {
    label: "Financial Readiness",
    description: "Sponsorship, maintenance funds, bank rules, and cost of living",
    icon: "Coins"
  },
  "accommodation-and-student-life": {
    label: "Accommodation & Student Life",
    description: "Housing plans, time management, and visa work restrictions",
    icon: "Home"
  },
  "final-assessment": {
    label: "Final Assessment",
    description: "Overall suitability, student value, and university ambassadorship",
    icon: "Award"
  }
};

