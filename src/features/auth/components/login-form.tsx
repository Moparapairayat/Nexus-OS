"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormField, FormLabel, FormError } from "@/components/ui/form";
import { Lock, Mail, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { loginAction } from "../actions/login-action";

export function LoginForm() {
  const router = useRouter();
  const { toast, error: toastError } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | undefined>(undefined);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors(undefined);
    setIsLoading(true);

    try {
      const result = await loginAction({ email, password, rememberMe });

      if (!result.success || !result.data) {
        const errorMsg = result.error || "Authentication failed.";
        setErrorMessage(errorMsg);
        setFieldErrors(result.fieldErrors);
        toastError("Authentication Failed", errorMsg);
        return;
      }

      toast.success("Welcome back!", {
        description: "Sign in successful. Redirecting...",
      });

      const destination = result.data.redirectUrl || "/client";
      router.push(destination);
      router.refresh();
    } catch (err: any) {
      const msg = err?.message || "An unexpected sign-in error occurred.";
      setErrorMessage(msg);
      toastError("Error", msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card variant="glass" className="p-2">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl">Sign in to NexusOS</CardTitle>
        <CardDescription>
          Private Client Portal — Enter your authorized email and password to access your account.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {errorMessage && <FormError>{errorMessage}</FormError>}

          <FormField>
            <FormLabel htmlFor="email">Email Address</FormLabel>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
                error={!!fieldErrors?.email}
                required
              />
            </div>
            {fieldErrors?.email && <FormError>{fieldErrors.email[0]}</FormError>}
          </FormField>

          <FormField>
            <div className="flex items-center justify-between">
              <FormLabel htmlFor="password">Password</FormLabel>
              <Link
                href="/forgot-password"
                className="text-xs text-primary hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9"
                error={!!fieldErrors?.password}
                required
              />
            </div>
            {fieldErrors?.password && <FormError>{fieldErrors.password[0]}</FormError>}
          </FormField>

          <div className="flex items-center space-x-2 pt-1">
            <input
              id="remember"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary cursor-pointer"
            />
            <label htmlFor="remember" className="text-xs text-muted-foreground cursor-pointer select-none">
              Remember my session
            </label>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" variant="glow" className="w-full" isLoading={isLoading}>
            <span>Sign In</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <div className="p-3 rounded-xl bg-muted/30 border border-border/40 text-center text-[11px] text-muted-foreground">
            <span className="font-semibold text-foreground block mb-0.5">Private Client Portal</span>
            Public registration is disabled. Client access is provisioned by Administrator invitation only.
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
