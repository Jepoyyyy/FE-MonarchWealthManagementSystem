import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { QuestionnaireView, ProfileResultView } from "~/features/auth";
import { useAuthStore } from "~/features/auth/auth.store";
import { ProfilerApi } from "~/features/profiler";
import { Toaster, toast } from "sonner";
import type { RiskProfile } from "~/types";

export default function QuestionnairePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<{ profile: RiskProfile; score: number } | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleComplete = async (
    profile: RiskProfile,
    score: number,
    answers: { questionnaireAnswer: string; score: number }[]
  ) => {
    if (!user) return;

    try {
      await ProfilerApi.submitAnswers({ answers });
      
      // Update local store state
      useAuthStore.getState().updateUserRiskProfile(profile);
      
      toast.success(`Risk profile updated to ${profile.replace("_", " ")}`);
      setResult({ profile, score });
      setShowResult(true);
    } catch (error: any) {
      console.error("Failed to update risk profile:", error);
      toast.error(error?.message || "Failed to update risk profile");
    }
  };

  if (!user) {
    return null;
  }

  if (showResult && result) {
    return (
      <div className="w-full min-h-screen">
        <ProfileResultView
          profile={result.profile}
          score={result.score}
          onContinue={() => {
            navigate("/", { replace: true });
          }}
        />
        <Toaster richColors position="top-right" duration={3000} />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen">
      <QuestionnaireView user={user} onComplete={handleComplete} />
      <Toaster richColors position="top-right" duration={3000} />
    </div>
  );
}
