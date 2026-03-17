"use client";

import { useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { signupAction } from "@/app/signup/actions";
import Link from "next/link";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button className="w-full mt-4" type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {pending ? "Creating account..." : "Sign up"}
        </Button>
    );
}

export function SignupForm() {
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    async function handleSubmit(formData: FormData) {
        setError(null);

        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        startTransition(async () => {
            const result = await signupAction(formData);
            if (result?.error) {
                setError(result.error);
            }
            // If no error, redirect was called by server action
        });
    }

    return (
        <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Email address
                </label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="student@dormflow.edu"
                    required
                    disabled={isPending}
                />
            </div>
            <input
                type="hidden"
                name="role"
                value="student"
            />
            <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Password
                </label>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    disabled={isPending}
                    minLength={8}
                />
            </div>
            <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Confirm Password
                </label>
                <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    disabled={isPending}
                    minLength={8}
                />
            </div>

            {error && (
                <div className="text-sm text-red-500 font-medium">
                    {error}
                </div>
            )}

            <SubmitButton />

            <div className="mt-4 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">
                    Log in
                </Link>
            </div>
        </form>
    );
}
