"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormField, FormLabel, FormError } from "@/components/ui/form";
import { Lock, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { changePasswordAction } from "../actions/change-password-action";

export function ChangePasswordForm() {
  const { toast, error: toastError } = useToast();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | undefined>(undefined);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors(undefined);
    setIsLoading(true);

    try {
      const result = await changePasswordAction({
        currentPassword,
        newPassword,
        confirmNewPassword,
      });

      if (!result.success) {
        const errorMsg = result.error || "Failed to update password.";
        setErrorMessage(errorMsg);
        setFieldErrors(result.fieldErrors);
        toastError("Change Password Failed", errorMsg);
        return;
      }

      toast.success("Password Updated", {
        description: "Your account password has been changed successfully.",
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err: any) {
      const msg = err?.message || "An unexpected error occurred.";
      setErrorMessage(msg);
      toastError("Error", msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card variant="glass" className="max-w-md w-full">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <CardTitle className="text-lg">Change Password</CardTitle>
        </div>
        <CardDescription>
          Update your account password to maintain security.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {errorMessage && <FormError>{errorMessage}</FormError>}

          <FormField>
            <FormLabel htmlFor="currentPassword">Current Password</FormLabel>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="currentPassword"
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="pl-9"
                error={!!fieldErrors?.currentPassword}
                required
              />
            </div>
            {fieldErrors?.currentPassword && <FormError>{fieldErrors.currentPassword[0]}</FormError>}
          </FormField>

          <FormField>
            <FormLabel htmlFor="newPassword">New Password</FormLabel>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="newPassword"
                type="password"
                placeholder="Min. 8 chars (1 uppercase, 1 number)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pl-9"
                error={!!fieldErrors?.newPassword}
                required
              />
            </div>
            {fieldErrors?.newPassword && <FormError>{fieldErrors.newPassword[0]}</FormError>}
          </FormField>

          <FormField>
            <FormLabel htmlFor="confirmNewPassword">Confirm New Password</FormLabel>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmNewPassword"
                type="password"
                placeholder="Re-enter new password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="pl-9"
                error={!!fieldErrors?.confirmNewPassword}
                required
              />
            </div>
            {fieldErrors?.confirmNewPassword && <FormError>{fieldErrors.confirmNewPassword[0]}</FormError>}
          </FormField>
        </CardContent>

        <CardFooter className="pt-2">
          <Button type="submit" variant="glow" className="w-full" isLoading={isLoading}>
            Change Password
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
