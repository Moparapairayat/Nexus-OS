"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormField, FormLabel, FormError } from "@/components/ui/form";
import { Lock, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { resetPasswordAction } from "../actions/reset-password-action";

export function ResetPasswordForm() {
  const router = useRouter();
  const { toast, error: toastError } = useToast();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | undefined>(undefined);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors(undefined);
    setIsLoading(true);

    try {
      const result = await resetPasswordAction({ password, confirmPassword });
      if (!result.success) {
        setErrorMessage(result.error || "Password reset failed.");
        setFieldErrors(result.fieldErrors);
        toastError("Error", result.error);
        return;
      }

      toast.success("Password Updated!", {
        description: "Your password has been updated. Redirecting to login...",
      });

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to update password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card variant="glass" className="p-2">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl">Set New Password</CardTitle>
        <CardDescription>
          Enter your new password below to secure your account.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {errorMessage && <FormError>{errorMessage}</FormError>}

          <FormField>
            <FormLabel htmlFor="password">New Password</FormLabel>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9"
                error={!!fieldErrors?.password}
                required
              />
            </div>
            {fieldErrors?.password && <FormError>{fieldErrors.password[0]}</FormError>}
          </FormField>

          <FormField>
            <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-9"
                error={!!fieldErrors?.confirmPassword}
                required
              />
            </div>
            {fieldErrors?.confirmPassword && <FormError>{fieldErrors.confirmPassword[0]}</FormError>}
          </FormField>
        </CardContent>

        <CardFooter>
          <Button type="submit" variant="glow" className="w-full" isLoading={isLoading}>
            <span>Update Password</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
