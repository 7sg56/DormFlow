"use client";

import { useFormStatus } from "react-dom";
import { useFormState } from "react-dom";
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
    const [state, formAction] = useFormState(signupAction, null);

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
                    placeholder="student@dormflow.edu"
                    required
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
                    minLength={8}
                />
            </div>

            {state?.error && (
                <div className="text-sm text-red-500 font-medium">
                    {state.error}
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
