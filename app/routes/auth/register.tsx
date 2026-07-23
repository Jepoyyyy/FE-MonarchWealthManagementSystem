import { useNavigate, redirect } from "react-router";
import { RegisterView } from "~/features/auth";
import { useAuthStore } from "~/features/auth/auth.store";
import { Toaster } from "sonner";
import type { Route } from "./+types/register";
import type { AppUser } from "~/types";

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const user = useAuthStore.getState().user;
  if (user) {
    throw redirect(user.questionnaireCompleted ? "/" : "/questionnaire");
  }
  return null;
}
clientLoader.hydrate = true as const;

export default function RegisterPage() {
  const navigate = useNavigate();

  const handleRegister = (user: AppUser) => {
    navigate("/questionnaire", { replace: true });
  };

  return (
    <div className="w-full min-h-screen">
      <RegisterView 
        onRegister={handleRegister} 
        onNavigate={() => navigate("/login")} 
      />
    </div>
  );
}
