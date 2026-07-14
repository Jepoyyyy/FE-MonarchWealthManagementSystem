import { useState } from "react";
import type { RiskProfile } from "~/types";
import { QUESTIONNAIRE } from "~/data";
import { scoreToProfile } from "~/utils";

export function useQuestionnaire(onComplete: (profile: RiskProfile, score: number) => void) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);

  const q = QUESTIONNAIRE[step];
  const total = QUESTIONNAIRE.length;

  const next = () => {
    if (selected === null) return;
    const newAnswers = [...answers, selected];
    if (step < total - 1) {
      setAnswers(newAnswers);
      setSelected(null);
      setStep((s) => s + 1);
    } else {
      const score = newAnswers.reduce((a, b) => a + b, 0);
      onComplete(scoreToProfile(score), score);
    }
  };

  return {
    step,
    selected,
    setSelected,
    q,
    total,
    next,
  };
}
