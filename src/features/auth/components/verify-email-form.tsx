"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, FormLabel, FormError } from "@/components/ui/form";
import { MailCheck, RefreshCw, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { resendVerificationAction } from "../actions/resend-verification-action";

export function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";
  const { toast, error: toastError } = useToast();

  const [email, setEmail] = useState(initialEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setResendMessage(null);
    setIsLoading(true);

    try {
      const result = await resendVerificationAction({ email });

      if (!result.success) {
        const msg = result.error || "Failed to resend email.";
        setErrorMessage(msg);
        toastError("Resend Failed", msg);
        return;
      }

      const msg = result.data?.message || "Verification email dispatched.";
      setResendMessage(msg);
      toast.success("Verification Email Sent", { description: msg });
    } catch (err: any) {
      const msg = err?.message || "Failed to resend verification.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card variant="glass" className="p-2 text-center">
      <CardHeader className="space-y-2">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500 shadow-inner">
          <MailCheck className="h-7 w-7" />
        </div>
        <CardTitle className="text-xl">Check Your Email</CardTitle>
        <CardDescription className="text-sm">
          We have sent a verification link to your registered email address. Please click the link to activate your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        {resendMessage && (
          <div className="p-3 text-xs rounded-xl bg-emerald-500/10 text-emerald-500 font-medium">
            {resendMessage}
          </div>
        )}

        {errorMessage && <FormError>{errorMessage}</FormError>}

        <form onSubmit={handleResend} className="space-y-3 text-left">
          <FormField>
            <FormLabel htmlFor="resend-email" className="text-xs">Didn&apos;t receive the email?</FormLabel>
            <Input
              id="resend-email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </FormField>

          <Button type="submit" variant="outline" className="w-full" isLoading={isLoading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Resend Verification Link
          </Button>
        </form>

        <div className="pt-2 border-t border-border/50">
          <Link
            href="/login"
            className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Return to Sign In
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
