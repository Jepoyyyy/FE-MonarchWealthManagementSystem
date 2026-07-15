import { useState } from "react";
import type { RiskProfile } from "~/types";
import { QUESTIONNAIRE } from "~/data";
import { scoreToProfile } from "~/utils";

export function useQuestionnaire(onComplete: (profile: RiskProfile, score: number, allAnswers: { questionnaireAnswer: string; score: number }[]) => void) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<{ questionnaireAnswer: string; score: number }[]>([]);
  const [selected, setSelected] = useState<number | null>(null);

  const q = QUESTIONNAIRE[step];
  const total = QUESTIONNAIRE.length;

  const next = () => {
    if (selected === null) return;
    const selectedOption = q.options.find(opt => opt.score === selected);
    if (!selectedOption) return;

    const newAnswers = [...answers, { questionnaireAnswer: selectedOption.label, score: selectedOption.score }];
    if (step < total - 1) {
      setAnswers(newAnswers);
      setSelected(null);
      setStep((s) => s + 1);
    } else {
      const score = newAnswers.reduce((a, b) => a + b.score, 0);
      onComplete(scoreToProfile(score), score, newAnswers);
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
