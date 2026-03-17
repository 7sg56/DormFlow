import { Metadata } from "next";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
    title: "Sign Up - DormFlow",
    description: "Create an account for DormFlow Hostel Management System",
};

export default function SignupPage() {
    return (
        <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0 bg-background">
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
                <div className="absolute inset-0 bg-zinc-900" />
                <div className="relative z-20 flex items-center gap-2 text-lg font-medium tracking-tight">
                    <Building2 className="h-6 w-6" />
                    DormFlow HMS
                </div>
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-lg">
                            &ldquo;Join DormFlow to experience modern, streamlined hostel administration. From room allocations to mess management, everything is just a click away.&rdquo;
                        </p>
                    </blockquote>
                </div>
            </div>
            <div className="p-4 lg:p-8 h-full flex items-center relative">
                <Link
                    href="/login"
                    className="absolute right-4 top-4 md:right-8 md:top-8 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                    Login
                </Link>
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <div className="flex justify-center mb-4 lg:hidden">
                            <div className="flex items-center gap-2 font-semibold">
                                <Building2 className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Create an account
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Enter your details below to create your account
                        </p>
                    </div>
                    <SignupForm />
                </div>
            </div>
        </div>
    );
}
