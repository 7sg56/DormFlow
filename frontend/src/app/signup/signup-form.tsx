"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { signupAction } from "@/app/signup/actions";
import Link from "next/link";

export function SignupForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        setError(null);

        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        try {
            const result = await signupAction(formData);
            if (result?.error) {
                setError(result.error);
            }
        } catch {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
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
                    disabled={isLoading}
                />
            </div>
            <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Role
                </label>
                <select
                    name="role"
                    id="role"
                    defaultValue="student"
                    disabled={isLoading}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <option value="student">Student</option>
                    <option value="warden">Warden</option>
                    <option value="admin">Administrator</option>
                </select>
            </div>
            <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Password
                </label>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    disabled={isLoading}
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
                    disabled={isLoading}
                    minLength={8}
                />
            </div>

            {error && (
                <div className="text-sm text-red-500 font-medium">
                    {error}
                </div>
            )}

            <Button className="w-full mt-4" type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign up
            </Button>

            <div className="mt-4 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">
                    Log in
                </Link>
            </div>
        </form>
    );
}
