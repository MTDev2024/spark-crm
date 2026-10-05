import { Zap } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";

/** Page de connexion : en dehors du groupe (app), donc sans menu. */
export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2 text-lg font-semibold">
          <Zap className="size-5 text-primary" aria-hidden />
          Spark CRM
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
