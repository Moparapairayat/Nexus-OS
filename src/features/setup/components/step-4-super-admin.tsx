"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FormField, FormLabel, FormError } from "@/components/ui/form";
import { SuperAdminInput } from "@/types/setup";
import { User, Mail, Lock, ShieldCheck, ArrowRight, ArrowLeft } from "lucide-react";

interface Step4SuperAdminProps {
  data: SuperAdminInput;
  onUpdate: (data: SuperAdminInput) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function Step4SuperAdmin({ data, onUpdate, onNext, onPrev }: Step4SuperAdminProps) {
  const [formData, setFormData] = useState<SuperAdminInput>(data);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (field: keyof SuperAdminInput, value: string) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onUpdate(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (formData.password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }

    onNext();
  };

  const hasMinLength = formData.password.length >= 8;
  const hasUppercase = /[A-Z]/.test(formData.password);
  const hasNumber = /[0-9]/.test(formData.password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(formData.password);

  return (
    <Card variant="glass" className="p-6 space-y-5">
      <CardHeader className="p-0 space-y-1">
        <CardTitle className="text-xl">Create Super Administrator Account</CardTitle>
        <CardDescription className="text-xs">
          Create the primary root administrator account for full system access and client management.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && <FormError>{errorMessage}</FormError>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField>
            <FormLabel htmlFor="fullName">Full Name *</FormLabel>
            <Input
              id="fullName"
              placeholder="e.g. Sarah Connor"
              icon={<User className="h-4 w-4" />}
              value={formData.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              required
            />
          </FormField>

          <FormField>
            <FormLabel htmlFor="adminEmail">Administrator Email *</FormLabel>
            <Input
              id="adminEmail"
              type="email"
              placeholder="admin@company.com"
              icon={<Mail className="h-4 w-4" />}
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField>
            <FormLabel htmlFor="password">Administrator Password *</FormLabel>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
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
                value={formData.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                className="pl-9"
                required
              />
            </div>
          </FormField>
        </div>

        {/* Password Requirements Checklist */}
        <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1 text-[11px]">
          <span className="font-semibold text-foreground block">Password Requirements:</span>
          <div className="grid grid-cols-2 gap-1 text-muted-foreground">
            <span className={hasMinLength ? "text-emerald-500 font-semibold" : ""}>&bull; Min 8 characters</span>
            <span className={hasUppercase ? "text-emerald-500 font-semibold" : ""}>&bull; 1 Uppercase letter</span>
            <span className={hasNumber ? "text-emerald-500 font-semibold" : ""}>&bull; 1 Number</span>
            <span className={hasSpecial ? "text-emerald-500 font-semibold" : ""}>&bull; 1 Special character</span>
          </div>
        </div>

        <div className="pt-4 border-t border-border/60 flex items-center justify-between">
          <Button type="button" variant="outline" size="sm" onClick={onPrev} className="text-xs">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back
          </Button>

          <Button type="submit" variant="glow" size="sm" className="text-xs px-6">
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
}
