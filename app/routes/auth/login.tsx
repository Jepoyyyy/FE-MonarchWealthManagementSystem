import { useNavigate, redirect } from "react-router";
import { LoginView } from "~/features/auth";
import { useAuthStore } from "~/features/auth/auth.store";
import { Toaster } from "sonner";
import type { Route } from "./+types/login";
import type { AppUser } from "~/types";

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const user = useAuthStore.getState().user;
  if (user) {
    if (user.role === "admin") {
      throw redirect("/admin");
    }
    throw redirect(user.questionnaireCompleted ? "/" : "/questionnaire");
  }
  return null;
}
clientLoader.hydrate = true as const;

export default function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = (user: AppUser) => {
    if (user.role === "admin") {
      navigate("/admin", { replace: true });
    } else if (user.questionnaireCompleted) {
      navigate("/", { replace: true });
    } else {
      navigate("/questionnaire", { replace: true });
    }
  };

  return (
    <div className="w-full min-h-screen">
      <LoginView 
        onLogin={handleLogin} 
        onNavigate={() => navigate("/register")} 
      />
    </div>
  );
}
