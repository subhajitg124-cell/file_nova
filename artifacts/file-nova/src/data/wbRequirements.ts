export interface DocumentSpec {
  name: string;
  format: "PDF" | "JPG" | "PNG" | "JPEG";
  maxSizeKB: number;
  minSizeKB?: number;
  dimensions?: {
    width: number;
    height: number;
    unit: "px" | "cm";
  };
  description: string;
  mandatory: boolean;
}

export interface SchemeRequirement {
  id: string;
  name: string;
  bengaliName?: string;
  category: "scholarship" | "examination" | "admission" | "scheme";
  department: string;
  officialWebsite: string;
  eligibility: string[];
  documents: DocumentSpec[];
  notes?: string;
  portalLink?: string;
  toolId?: string; // Optional direct mapping to tools
}

export const WB_REQUIREMENTS: SchemeRequirement[] = [
  // --- SCHOLARSHIPS ---
  {
    id: "svmcm",
    name: "SVMCM / Sikshashree (Swami Vivekananda Scholarship)",
    bengaliName: "স্বামী বিবেকানন্দ মেরিট-কাম-মিন্স স্কলারশিপ",
    category: "scholarship",
    department: "Higher Education Department, Govt. of West Bengal",
    officialWebsite: "https://svmcm.wbhed.gov.in",
    portalLink: "https://svmcm.wbhed.gov.in",
    toolId: "scholarship-zip",
    eligibility: [
      "Domiciled in West Bengal",
      "Studying in regular courses of Class 11, 12, UG, PG, or Doctoral",
      "Scored 60% or above in last qualifying public exam",
      "Family income less than ₹2.5 Lakhs per annum"
    ],
    documents: [
      {
        name: "Passport Photo",
        format: "JPG",
        maxSizeKB: 50,
        minSizeKB: 10,
        dimensions: { width: 200, height: 230, unit: "px" },
        description: "Recent color photo with a white or light background",
        mandatory: true
      },
      {
        name: "Student Signature",
        format: "JPG",
        maxSizeKB: 30,
        minSizeKB: 5,
        dimensions: { width: 140, height: 60, unit: "px" },
        description: "Signature on white paper using black or blue ink",
        mandatory: true
      },
      {
        name: "Marksheet of Last Board/University Exam",
        format: "PDF",
        maxSizeKB: 400,
        description: "Both sides of the marksheet of the qualifying exam",
        mandatory: true
      },
      {
        name: "Admission Receipt",
        format: "PDF",
        maxSizeKB: 400,
        description: "Official course admission fee receipt for current year",
        mandatory: true
      },
      {
        name: "Income Certificate (Format-A)",
        format: "PDF",
        maxSizeKB: 400,
        description: "Income certificate issued by BDO / SDO / Joint BDO / Municipality Commissioner",
        mandatory: true
      },
      {
        name: "Bank Passbook First Page",
        format: "PDF",
        maxSizeKB: 400,
        description: "Showing Account Number, Beneficiary Name, and IFSC code clearly",
        mandatory: true
      },
      {
        name: "Aadhaar Card / Domicile Certificate",
        format: "PDF",
        maxSizeKB: 400,
        description: "Copy of student's Aadhaar Card or Domicile proof",
        mandatory: true
      }
    ],
    notes: "Scanning resolution should be 150 DPI for all PDF certificates. Blurred files will cause application rejection."
  },
  {
    id: "aikyashree",
    name: "Aikyashree minority Scholarship",
    bengaliName: "ঐক্যশ্রী সংখ্যালঘু স্কলারশিপ",
    category: "scholarship",
    department: "West Bengal Minority Development & Finance Corporation (WBMDFC)",
    officialWebsite: "https://wbmdfcscholarship.org",
    portalLink: "https://wbmdfcscholarship.org",
    eligibility: [
      "Domiciled in West Bengal",
      "Belonging to a Minority community (Buddhist, Christian, Jain, Muslim, Parsee, Sikh)",
      "Scored 50% or above in previous final examination",
      "Family income less than ₹2.0 Lakhs per annum"
    ],
    documents: [
      {
        name: "Student Photo",
        format: "JPG",
        maxSizeKB: 50,
        dimensions: { width: 200, height: 230, unit: "px" },
        description: "Color photo with clear face coverage",
        mandatory: true
      },
      {
        name: "Income Certificate",
        format: "PDF",
        maxSizeKB: 200,
        description: "Self-declared or Gram Panchayat/Municipal income certificate",
        mandatory: true
      },
      {
        name: "Bank Passbook First Page",
        format: "PDF",
        maxSizeKB: 200,
        description: "Showing account details (must be student's active single account)",
        mandatory: true
      },
      {
        name: "Previous Year Marksheet",
        format: "PDF",
        maxSizeKB: 300,
        description: "Marksheet of last passed exam",
        mandatory: true
      },
      {
        name: "Current Year Fee Receipt",
        format: "PDF",
        maxSizeKB: 200,
        description: "Institutional admission fee details",
        mandatory: true
      }
    ],
    notes: "Verify the bank account is active and linked to the Aadhaar card to avoid DBT payment failures."
  },
  {
    id: "oasis",
    name: "OASIS Scholarship (SC/ST/OBC)",
    bengaliName: "ওয়েসিস স্কলারশিপ (SC/ST/OBC)",
    category: "scholarship",
    department: "Backward Classes Welfare Department, West Bengal",
    officialWebsite: "http://oasis.gov.in",
    portalLink: "http://oasis.gov.in",
    eligibility: [
      "Domiciled in West Bengal",
      "Belonging to SC, ST, or OBC category",
      "Family income less than ₹2.5 Lakhs (SC/ST) or ₹1.0 Lakh (OBC) per annum",
      "Studying at post-matriculation level"
    ],
    documents: [
      {
        name: "Student Photo",
        format: "JPG",
        maxSizeKB: 100,
        dimensions: { width: 150, height: 200, unit: "px" },
        description: "Colored passport size photograph",
        mandatory: true
      },
      {
        name: "Caste Certificate",
        format: "PDF",
        maxSizeKB: 250,
        description: "Caste certificate issued by Sub-Divisional Officer (SDO) or DWO",
        mandatory: true
      },
      {
        name: "Income Certificate",
        format: "PDF",
        maxSizeKB: 200,
        description: "Certificate issued by competent authority (BDO/Municipal)",
        mandatory: true
      },
      {
        name: "Bank Passbook Copy",
        format: "PDF",
        maxSizeKB: 250,
        description: "First page showing student's bank details",
        mandatory: true
      },
      {
        name: "Marksheet of Qualifying Exam",
        format: "PDF",
        maxSizeKB: 300,
        description: "Previous exam marksheet",
        mandatory: true
      }
    ],
    notes: "Caste certificate must be digitally signed and verified online on the WB Caste Certificate portal before applying."
  },
  {
    id: "kanyashree",
    name: "Kanyashree Prakalpa (K1 & K2)",
    bengaliName: "কন্যাশ্রী প্রকল্প",
    category: "scheme",
    department: "Women Development & Social Welfare Department, West Bengal",
    officialWebsite: "https://www.wbkanyashree.gov.in",
    portalLink: "https://www.wbkanyashree.gov.in",
    eligibility: [
      "Female student residing in West Bengal",
      "Age: 13-18 years for K1 (annual scholarship), 18-19 years for K2 (one-time grant)",
      "Enrolled in Class 8 or above, or equivalent technical/vocational course",
      "Unmarried"
    ],
    documents: [
      {
        name: "Applicant Photo",
        format: "JPG",
        maxSizeKB: 50,
        dimensions: { width: 150, height: 180, unit: "px" },
        description: "Recent color photo of the female applicant",
        mandatory: true
      },
      {
        name: "Age Proof (Birth Certificate)",
        format: "PDF",
        maxSizeKB: 300,
        description: "Digital Birth Certificate or Madhyamik Admit Card",
        mandatory: true
      },
      {
        name: "Unmarried Declaration Form",
        format: "PDF",
        maxSizeKB: 200,
        description: "Self-declaration of unmarried status signed by parents/guardian",
        mandatory: true
      },
      {
        name: "Institution Bonafide Certificate",
        format: "PDF",
        maxSizeKB: 200,
        description: "Signed certificate from Head of the School/College",
        mandatory: true
      },
      {
        name: "Bank Account Passbook",
        format: "PDF",
        maxSizeKB: 300,
        description: "Joint account or single savings account in student's name",
        mandatory: true
      }
    ]
  },
  {
    id: "lakshmir-bhandar",
    name: "Lakshmir Bhandar Yojna",
    bengaliName: "লক্ষ্মীর ভান্ডার প্রকল্প",
    category: "scheme",
    department: "Women & Child Development, West Bengal",
    officialWebsite: "https://socialsecurity.wb.gov.in",
    portalLink: "https://socialsecurity.wb.gov.in",
    eligibility: [
      "Female head of family aged between 25 and 60 years",
      "Resident of West Bengal",
      "Should not be a permanent government employee"
    ],
    documents: [
      {
        name: "Swasthya Sathi Card",
        format: "PDF",
        maxSizeKB: 400,
        description: "Copy of the Swasthya Sathi Card showing applicant name",
        mandatory: true
      },
      {
        name: "Aadhaar Card",
        format: "PDF",
        maxSizeKB: 300,
        description: "Aadhaar card copy (linked with bank account)",
        mandatory: true
      },
      {
        name: "Caste Certificate",
        format: "PDF",
        maxSizeKB: 300,
        description: "SC/ST Caste certificate to receive enhanced financial aid (₹1200 instead of ₹1000)",
        mandatory: false
      },
      {
        name: "Single Savings Bank Account Passbook",
        format: "PDF",
        maxSizeKB: 400,
        description: "DBT-enabled bank account details",
        mandatory: true
      },
      {
        name: "Passport Size Photograph",
        format: "JPG",
        maxSizeKB: 50,
        dimensions: { width: 150, height: 180, unit: "px" },
        description: "Recent colored passport photo of the female applicant",
        mandatory: true
      }
    ],
    notes: "Swasthya Sathi card is mandatory unless an exemption is declared at Duare Sarkar camps."
  },

  // --- ENTRANCE EXAMS ---
  {
    id: "wbjee",
    name: "WBJEE (WB Joint Entrance Exam)",
    bengaliName: "পশ্চিমবঙ্গ জয়েন্ট এন্ট্রান্স পরীক্ষা",
    category: "examination",
    department: "West Bengal Joint Entrance Examinations Board (WBJEEB)",
    officialWebsite: "https://wbjeeb.nic.in",
    portalLink: "https://wbjeeb.nic.in",
    eligibility: [
      "Indian Citizen",
      "Passed or appearing in Class 12 (Higher Secondary) with Physics, Mathematics, and Chemistry/Biology",
      "Minimum 17 years of age on Dec 31st of exam year"
    ],
    documents: [
      {
        name: "Candidate Photograph",
        format: "JPG",
        maxSizeKB: 200,
        minSizeKB: 10,
        dimensions: { width: 200, height: 260, unit: "px" },
        description: "Recent color photo against light background",
        mandatory: true
      },
      {
        name: "Candidate Signature",
        format: "JPG",
        maxSizeKB: 30,
        minSizeKB: 3,
        dimensions: { width: 200, height: 60, unit: "px" },
        description: "Signature on white paper using blue or black ink",
        mandatory: true
      },
      {
        name: "Domicile Certificate (A1 or B)",
        format: "PDF",
        maxSizeKB: 300,
        description: "Domicile certificate verified by competent authority",
        mandatory: true
      },
      {
        name: "Category Certificate",
        format: "PDF",
        maxSizeKB: 300,
        description: "SC/ST/OBC-A/OBC-B certificate if claiming reservations",
        mandatory: false
      }
    ]
  },
  {
    id: "jee-main",
    name: "JEE Main (Engineering Entrance)",
    bengaliName: "জেইই মেনস এন্ট্রান্স",
    category: "examination",
    department: "National Testing Agency (NTA), Govt. of India",
    officialWebsite: "https://jeemain.nta.ac.in",
    portalLink: "https://jeemain.nta.ac.in",
    eligibility: [
      "Passed Class 12 or equivalent in previous 2 years or currently appearing",
      "Must have studied Physics, Mathematics along with Chemistry/Biotechnology"
    ],
    documents: [
      {
        name: "Passport Photo",
        format: "JPG",
        maxSizeKB: 200,
        minSizeKB: 10,
        dimensions: { width: 350, height: 450, unit: "px" },
        description: "80% face coverage with white background, ears visible",
        mandatory: true
      },
      {
        name: "Candidate Signature",
        format: "JPG",
        maxSizeKB: 30,
        minSizeKB: 4,
        dimensions: { width: 350, height: 150, unit: "px" },
        description: "Running hand signature on white paper",
        mandatory: true
      },
      {
        name: "Category Certificate",
        format: "PDF",
        maxSizeKB: 300,
        description: "SC/ST/OBC-NCL/EWS certificate conforming to Central List format",
        mandatory: false
      },
      {
        name: "PwD Certificate",
        format: "PDF",
        maxSizeKB: 300,
        description: "Disability certificate if claiming PwD reservation",
        mandatory: false
      }
    ]
  },
  {
    id: "neet",
    name: "NEET UG (Medical Entrance)",
    bengaliName: "নিট ইউজি মেডিকেল এন্ট্রান্স",
    category: "examination",
    department: "National Testing Agency (NTA), Govt. of India",
    officialWebsite: "https://neet.nta.nic.in",
    portalLink: "https://neet.nta.nic.in",
    eligibility: [
      "Passed Class 12 with Physics, Chemistry, Biology/Biotechnology, and English",
      "Minimum age 17 years at the time of admission"
    ],
    documents: [
      {
        name: "Passport Photograph",
        format: "JPG",
        maxSizeKB: 200,
        minSizeKB: 10,
        description: "Recent photo showing 80% face against white background",
        mandatory: true
      },
      {
        name: "Postcard Size Photo (4x6 inch)",
        format: "JPG",
        maxSizeKB: 200,
        minSizeKB: 10,
        description: "Recent color photo in postcard size format",
        mandatory: true
      },
      {
        name: "Signature",
        format: "JPG",
        maxSizeKB: 30,
        minSizeKB: 4,
        description: "Black ink signature on white paper",
        mandatory: true
      },
      {
        name: "Left & Right Fingers & Thumb Impression",
        format: "JPG",
        maxSizeKB: 200,
        minSizeKB: 10,
        description: "Impressions of all fingers and thumbs of both hands",
        mandatory: true
      },
      {
        name: "Class 10 Passing Certificate",
        format: "PDF",
        maxSizeKB: 300,
        description: "Board certificate as date of birth proof",
        mandatory: true
      }
    ]
  },
  {
    id: "jexpo",
    name: "JEXPO (Polytechnic Admission)",
    bengaliName: "জেক্সপো পলিটেকনিক এন্ট্রান্স",
    category: "admission",
    department: "WBSCTE (State Council of Technical & Vocational Education)",
    officialWebsite: "https://webscte.co.in",
    portalLink: "https://webscte.co.in",
    eligibility: [
      "Indian Citizen",
      "Passed Madhyamik (Class 10) or equivalent with physical science and math",
      "No upper age limit"
    ],
    documents: [
      {
        name: "Candidate Photo",
        format: "JPG",
        maxSizeKB: 100,
        dimensions: { width: 150, height: 200, unit: "px" },
        description: "Passport color photo",
        mandatory: true
      },
      {
        name: "Signature",
        format: "JPG",
        maxSizeKB: 30,
        dimensions: { width: 150, height: 50, unit: "px" },
        description: "Signature scan",
        mandatory: true
      },
      {
        name: "Madhyamik Admit Card",
        format: "PDF",
        maxSizeKB: 300,
        description: "Class 10 Admit Card for age verification",
        mandatory: true
      },
      {
        name: "Madhyamik Marksheet",
        format: "PDF",
        maxSizeKB: 300,
        description: "Marksheet of secondary education",
        mandatory: true
      }
    ]
  },

  // --- GOVERNMENT SCHEMES ---
  {
    id: "yuva-sathi",
    name: "Yuva Sathi / Yuvashree Yojna",
    bengaliName: "যুবশ্রী / যুবসাথী প্রকল্প",
    category: "scheme",
    department: "Labour Department, West Bengal",
    officialWebsite: "https://employmentbankwb.gov.in",
    portalLink: "https://employmentbankwb.gov.in",
    eligibility: [
      "Unemployed youth residing in West Bengal",
      "Age: 18-45 years",
      "Minimum educational qualification: passed Class 8",
      "Enrolled in the Employment Bank of West Bengal"
    ],
    documents: [
      {
        name: "Employment Bank Registration Card",
        format: "PDF",
        maxSizeKB: 300,
        description: "Yuvashree enrollment index card copy",
        mandatory: true
      },
      {
        name: "Educational Qualification Marksheet",
        format: "PDF",
        maxSizeKB: 300,
        description: "Marksheet of highest education (Secondary / HS / Graduation)",
        mandatory: true
      },
      {
        name: "Income Certificate (Gram Panchayat/Municipal)",
        format: "PDF",
        maxSizeKB: 250,
        description: "Official family income certificate",
        mandatory: true
      },
      {
        name: "Aadhaar Card",
        format: "PDF",
        maxSizeKB: 300,
        description: "Student / youth identity card copy",
        mandatory: true
      },
      {
        name: "Bank Passbook details",
        format: "PDF",
        maxSizeKB: 300,
        description: "Savings account details for monthly allowance (₹1500)",
        mandatory: true
      }
    ],
    notes: "Requires mandatory self-declaration (Annexure-III) submission every 6 months to maintain unemployment allowance benefits."
  },
  {
    id: "swasthya-sathi",
    name: "Swasthya Sathi Card Yojna",
    bengaliName: "স্বাস্থ্য সাথী কার্ড",
    category: "scheme",
    department: "Health & Family Welfare Department, West Bengal",
    officialWebsite: "https://swasthyasathi.gov.in",
    portalLink: "https://swasthyasathi.gov.in",
    eligibility: [
      "Any family residing in West Bengal",
      "Should not be covered under any government funded health insurance scheme",
      "Card issued in the name of the female head of family"
    ],
    documents: [
      {
        name: "Aadhaar Cards of All Family Members",
        format: "PDF",
        maxSizeKB: 500,
        description: "Merged PDF containing Aadhaar cards of all members listed in Form A/B",
        mandatory: true
      },
      {
        name: "Ration Card (NFSA/RKSY)",
        format: "PDF",
        maxSizeKB: 300,
        description: "Digital Ration Card copies of family members",
        mandatory: true
      },
      {
        name: "Family Head Photo",
        format: "JPG",
        maxSizeKB: 100,
        description: "Recent color photo of the female head of the family",
        mandatory: true
      }
    ]
  },

  // --- GOVERNMENT EXAMS ---
  {
    id: "wbcs",
    name: "WBCS (West Bengal Civil Service)",
    bengaliName: "ডব্লিউবিসিএস সিভিল সার্ভিস এক্সাম",
    category: "examination",
    department: "Public Service Commission, West Bengal (WBPSC)",
    officialWebsite: "https://psc.wb.gov.in",
    portalLink: "https://psc.wb.gov.in",
    eligibility: [
      "Indian Citizen",
      "A degree from a recognized University",
      "Age: 21-36 years (with caste relaxations)",
      "Ability to read, write and speak in Bengali (not applicable to candidates whose mother tongue is Nepali)"
    ],
    documents: [
      {
        name: "Passport Size Photograph",
        format: "JPG",
        maxSizeKB: 100,
        minSizeKB: 20,
        dimensions: { width: 350, height: 450, unit: "px" },
        description: "Recent studio photograph on clear background",
        mandatory: true
      },
      {
        name: "Candidate Signature",
        format: "JPG",
        maxSizeKB: 20,
        minSizeKB: 10,
        dimensions: { width: 200, height: 60, unit: "px" },
        description: "Signature inside box on white paper scanned clearly",
        mandatory: true
      },
      {
        name: "Graduation Certificate/Degree",
        format: "PDF",
        maxSizeKB: 400,
        description: "Undergraduate degree or marksheet to verify educational qualification",
        mandatory: true
      },
      {
        name: "Age Proof Certificate",
        format: "PDF",
        maxSizeKB: 300,
        description: "Class 10 Admit Card or Birth Certificate",
        mandatory: true
      }
    ]
  }
];
