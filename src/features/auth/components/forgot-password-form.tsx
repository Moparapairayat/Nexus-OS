"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormField, FormLabel, FormError } from "@/components/ui/form";
import { Mail, ArrowLeft, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { forgotPasswordAction } from "../actions/forgot-password-action";

export function ForgotPasswordForm() {
  const { toast, error: toastError } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const result = await forgotPasswordAction({ email });
      if (!result.success) {
        setErrorMessage(result.error || "Failed to send reset email.");
        toastError("Error", result.error);
        return;
      }

      setIsSubmitted(true);
      toast.success("Recovery Instructions Dispatched", {
        description: `Check your inbox at ${email}`,
      });
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to process request.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card variant="glass" className="p-2">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl">Reset Your Password</CardTitle>
        <CardDescription>
          Enter your registered email address to receive recovery instructions.
        </CardDescription>
      </CardHeader>
      {!isSubmitted ? (
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
                  required
                />
              </div>
            </FormField>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" variant="glow" className="w-full" isLoading={isLoading}>
              <span>Send Recovery Instructions</span>
              <Send className="ml-2 h-4 w-4" />
            </Button>
            <Link
              href="/login"
              className="inline-flex items-center justify-center text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-1 h-3.5 w-3.5" />
              Back to login
            </Link>
          </CardFooter>
        </form>
      ) : (
        <CardContent className="space-y-4 pt-2 text-center">
          <p className="text-sm text-muted-foreground">
            Instructions sent to <strong>{email}</strong>. Please check your inbox and follow the link to reset your password.
          </p>
          <Link href="/login">
            <Button variant="outline" className="w-full mt-2">
              Back to Sign In
            </Button>
          </Link>
        </CardContent>
      )}
    </Card>
  );
}
