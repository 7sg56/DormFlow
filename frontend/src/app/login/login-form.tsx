"use client";

import { useFormStatus } from "react-dom";
import { useFormState } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { loginAction } from "@/app/login/actions";
import Link from "next/link";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button className="w-full mt-4" type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {pending ? "Signing in..." : "Sign in"}
        </Button>
    );
}

export function LoginForm() {
    const [state, formAction] = useFormState(loginAction, null);

    return (
        <form action={formAction} className="space-y-4">
            <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Email address
                </label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="admin@dormflow.edu"
                    required
                />
            </div>
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Password
                    </label>
                </div>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                />
            </div>

            {state?.error && (
                <div className="text-sm text-red-500 font-medium">
                    {state.error}
                </div>
            )}

            <SubmitButton />

            <div className="mt-4 text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-primary hover:underline font-medium">
                    Sign up
                </Link>
            </div>
        </form>
    );
}
