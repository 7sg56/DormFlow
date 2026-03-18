import { LoginForm } from "@/app/login/login-form";
import { Building2 } from "lucide-react";

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <div className="w-full max-w-[400px] space-y-4">
                <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
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

                {/* Role Info Helper */}
                <div className="rounded-xl border border-border bg-card p-4 text-sm">
                    <p className="font-medium mb-2 text-muted-foreground">Sign in as:</p>
                    <div className="space-y-1.5 text-muted-foreground">
                        <div className="flex justify-between">
                            <span className="font-medium text-foreground">Admin</span>
                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">admin@dormflow.edu</code>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium text-foreground">Warden</span>
                            <span className="text-xs italic">Created by admin</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium text-foreground">Technician</span>
                            <span className="text-xs italic">Created by admin</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium text-foreground">Student</span>
                            <span className="text-xs italic">Self-register via Sign up</span>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 border-t border-border pt-2">
                        Default password: <code className="bg-muted px-1 py-0.5 rounded">admin123</code>
                    </p>
                </div>
            </div>
        </div>
    );
}
