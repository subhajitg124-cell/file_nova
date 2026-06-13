export type ToneKey =
  | "formal"
  | "simple"
  | "exam-revision"
  | "viva-presentation"
  | "persuasive"
  | "storytelling";

export interface ToneOption {
  id: ToneKey;
  label: string;
  description: string;
  icon: string; // emoji
  bestFor: string;
}

export const PPT_TONES: ToneOption[] = [
  {
    id: "simple",
    label: "Simple & Clear",
    description: "Short sentences, easy vocabulary",
    icon: "📘",
    bestFor: "School projects, Class 6-10",
  },
  {
    id: "formal",
    label: "Formal Academic",
    description: "Precise, exam-appropriate language",
    icon: "🎓",
    bestFor: "Board exams, thesis, reports",
  },
  {
    id: "exam-revision",
    label: "Exam Revision",
    description: "Bullet-heavy, key facts & formulas",
    icon: "📝",
    bestFor: "Last-minute revision decks",
  },
  {
    id: "viva-presentation",
    label: "Viva / Defense",
    description: "Confident, builds to a conclusion",
    icon: "🗣️",
    bestFor: "College viva, project defense",
  },
  {
    id: "persuasive",
    label: "Persuasive Pitch",
    description: "Ends with a strong call-to-action",
    icon: "🚀",
    bestFor: "Startup pitches, proposals",
  },
  {
    id: "storytelling",
    label: "Storytelling",
    description: "Narrative arc — problem to resolution",
    icon: "📖",
    bestFor: "General audience, seminars",
  },
];
