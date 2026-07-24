"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, FormLabel, FormError } from "@/components/ui/form";
import { validateInvitationTokenAction, acceptInvitationAction } from "@/features/auth/actions/invitation-actions";
import { ClientInvitation } from "@/types/invitation";
import { useToast } from "@/hooks/use-toast";
import { KeyRound, CheckCircle2, ArrowRight, Lock, AlertTriangle } from "lucide-react";

function AcceptInvitationContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { toast, error: toastError } = useToast();

  const [invitation, setInvitation] = useState<ClientInvitation | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    async function checkToken() {
      if (!token) {
        setValidationError("Missing invitation token. Please check your invitation email link.");
        setIsValidating(false);
        return;
      }

      try {
        const result = await validateInvitationTokenAction(token);
        if (result.valid && result.invitation) {
          setInvitation(result.invitation);
        } else {
          setValidationError(result.error || "Invalid or expired invitation link.");
        }
      } catch (err) {
        setValidationError("Token validation error.");
      } finally {
        setIsValidating(false);
      }
    }
    checkToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await acceptInvitationAction({
        token,
        password,
        confirmPassword,
      });

      if (!result.success) {
        setErrorMessage(result.error || "Failed to set account password.");
        toastError("Setup Failed", result.error);
        return;
      }

      setIsSuccess(true);
      toast.success("Account Activated!", {
        description: "Your password has been set. You can now log in to the Client Portal.",
      });
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidating) {
    return (
      <Card variant="glass" className="p-8 text-center max-w-md mx-auto">
        <div className="flex flex-col items-center justify-center space-y-3">
          <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <span className="text-xs text-muted-foreground">Validating Invitation Token...</span>
        </div>
      </Card>
    );
  }

  if (validationError) {
    return (
      <Card variant="glass" className="p-4 text-center max-w-md mx-auto space-y-4">
        <CardHeader className="space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl">Invalid Invitation</CardTitle>
          <CardDescription>{validationError}</CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center rounded-xl border border-input bg-background px-4 py-2 text-xs font-semibold hover:bg-accent transition-colors"
          >
            Return to Sign In
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (isSuccess) {
    return (
      <Card variant="glass" className="p-4 text-center max-w-md mx-auto space-y-4">
        <CardHeader className="space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl">Account Successfully Activated!</CardTitle>
          <CardDescription>
            Welcome to {invitation?.companyName || "NexusOS"}. Your private client portal password is configured.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 px-4 py-2 text-xs font-semibold transition-all"
          >
            Proceed to Client Sign In <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Link>
        </CardContent>
      </Card>
    );
  }

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  return (
    <Card variant="glass" className="p-2 max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
            <KeyRound className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-lg">Accept Invitation</CardTitle>
            <CardDescription className="text-xs">
              Welcome, <strong className="text-foreground">{invitation?.clientName}</strong> ({invitation?.companyName})
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 text-xs">
          {errorMessage && <FormError>{errorMessage}</FormError>}

          <FormField>
            <FormLabel htmlFor="email">Your Account Email</FormLabel>
            <Input id="email" value={invitation?.email || ""} disabled className="bg-muted/40 font-medium" />
          </FormField>

          <FormField>
            <FormLabel htmlFor="password">Set Secure Password *</FormLabel>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9"
                required
              />
            </div>
          </FormField>

          <FormField>
            <FormLabel htmlFor="confirmPassword">Confirm Password *</FormLabel>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-9"
                required
              />
            </div>
          </FormField>

          {/* Password Criteria Checklist */}
          <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1.5 text-[11px]">
            <span className="font-semibold text-foreground block">Password Requirements:</span>
            <div className="grid grid-cols-2 gap-1 text-muted-foreground">
              <span className={hasMinLength ? "text-emerald-500 font-semibold" : ""}>&bull; Min 8 characters</span>
              <span className={hasUppercase ? "text-emerald-500 font-semibold" : ""}>&bull; 1 Uppercase letter</span>
              <span className={hasNumber ? "text-emerald-500 font-semibold" : ""}>&bull; 1 Number</span>
              <span className={hasSpecial ? "text-emerald-500 font-semibold" : ""}>&bull; 1 Special character</span>
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" variant="glow" className="w-full text-xs" isLoading={isSubmitting}>
            Activate Account & Set Password
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense
      fallback={
        <Card variant="glass" className="p-8 text-center max-w-md mx-auto">
          <div className="flex flex-col items-center justify-center space-y-3">
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <span className="text-xs text-muted-foreground">Loading invitation...</span>
          </div>
        </Card>
      }
    >
      <AcceptInvitationContent />
    </Suspense>
  );
}
