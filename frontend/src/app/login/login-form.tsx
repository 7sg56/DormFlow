"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { loginAction } from "@/app/login/actions";
import Link from "next/link";

export function LoginForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        setError(null);

        try {
            const result = await loginAction(formData);
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
                    placeholder="admin@dormflow.edu"
                    required
                    disabled={isLoading}
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
                    disabled={isLoading}
                />
            </div>

            {error && (
                <div className="text-sm text-red-500 font-medium">
                    {error}
                </div>
            )}

            <Button className="w-full mt-4" type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign in
            </Button>

            <div className="mt-4 text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-primary hover:underline font-medium">
                    Sign up
                </Link>
            </div>
        </form>
    );
}
