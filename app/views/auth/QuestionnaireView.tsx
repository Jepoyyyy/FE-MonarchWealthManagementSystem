import { Shield, Check, ChevronRight } from "lucide-react";
import type { AppUser, RiskProfile } from "~/types";
import { QUESTIONNAIRE } from "~/config/questionnaire";
import { Btn } from '~/shared/components/Button';
import { useQuestionnaire } from "~/hooks/useQuestionnaire";

interface QuestionnaireViewProps {
  user: AppUser;
  onComplete: (profile: RiskProfile, score: number, answers: { questionnaireAnswer: string; score: number }[]) => void;
}

export function QuestionnaireView({ user, onComplete }: QuestionnaireViewProps) {
  const {
    step,
    selected,
    setSelected,
    q,
    total,
    next,
  } = useQuestionnaire(onComplete);

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-6"
      style={{ background: "linear-gradient(135deg, #0d2137 0%, #1a3a5c 100%)" }}
    >
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Shield size={20} className="text-accent" />
            <span
              className="text-white font-semibold"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Risk Profile Assessment
            </span>
          </div>
          <p className="text-blue-200 text-sm">
            Welcome, {user.name}. Answer {total} questions to personalize your experience.
          </p>
        </div>

        <div className="flex gap-2 mb-6">
          {QUESTIONNAIRE.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${
                i <= step ? "bg-accent" : "bg-white/20"
              }`}
              style={i <= step ? { background: "var(--accent)" } : {}}
            />
          ))}
        </div>

        <div className="bg-card rounded-2xl shadow-2xl p-8 border border-border">
          <div className="mb-2">
            <span className="text-xs font-medium text-muted-foreground">
              Question {step + 1} of {total}
            </span>
          </div>
          <h3
            className="text-xl font-semibold mb-6 text-foreground"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {q.question}
          </h3>

          <div className="flex flex-col gap-3 mb-8">
            {q.options.map((opt, i) => (
              <Btn
                variant="unstyled"
                key={i}
                onClick={() => setSelected(opt.score)}
                className={`w-full text-left px-4 py-4 rounded-xl border-2 transition-all text-sm leading-relaxed ${
                  selected === opt.score
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30 hover:bg-muted/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                      selected === opt.score ? "border-primary bg-primary" : "border-border"
                    }`}
                  >
                    {selected === opt.score && <Check size={12} className="text-white" />}
                  </div>
                  <span className="text-foreground">{opt.label}</span>
                </div>
              </Btn>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {step + 1}/{total} completed
            </span>
            <Btn onClick={next} disabled={selected === null} size="md">
              {step === total - 1 ? "See My Profile" : "Next Question"} <ChevronRight size={16} />
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
