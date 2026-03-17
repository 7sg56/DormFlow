import { LoginForm } from "@/app/login/login-form";
import { Building2 } from "lucide-react";

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <div className="w-full max-w-[400px] rounded-2xl border border-border bg-card p-8 shadow-sm">
                <div className="mb-8 flex flex-col items-center justify-center space-y-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Building2 className="h-6 w-6" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Enter your credentials to access your dashboard
                        </p>
                    </div>
                </div>

                <LoginForm />
            </div>
        </div>
    );
}
