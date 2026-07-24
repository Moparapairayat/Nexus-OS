"use client";

import React, { useState, useMemo } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { extendServiceRenewalDateAction } from "../actions/service-actions";
import { Calendar, Clock, Sparkles } from "lucide-react";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate();
}

interface ExtendRenewalModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  serviceName: string;
  currentRenewalDate?: string;
  onSuccess?: () => void;
}

export function ExtendRenewalModal({
  isOpen,
  onClose,
  serviceId,
  serviceName,
  currentRenewalDate,
  onSuccess,
}: ExtendRenewalModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const baseDate = currentRenewalDate ? new Date(currentRenewalDate) : new Date();
  const defaultNextMonth = new Date(baseDate);
  defaultNextMonth.setMonth(defaultNextMonth.getMonth() + 1);

  const initialMonth = defaultNextMonth.getMonth();
  const initialYear = defaultNextMonth.getFullYear();

  const [selectedMonth, setSelectedMonth] = useState<number>(initialMonth);
  const [selectedYear, setSelectedYear] = useState<number>(initialYear);
  const [selectedDay, setSelectedDay] = useState<string>(String(defaultNextMonth.getDate()));
  const [notes, setNotes] = useState("");

  const daysInMonth = useMemo(() => getDaysInMonth(selectedMonth, selectedYear), [selectedMonth, selectedYear]);

  const dayOptions = useMemo(() => {
    const days: { value: string; label: string }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ value: String(d), label: String(d) });
    }
    return days;
  }, [daysInMonth]);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const options: { value: string; label: string }[] = [];
    for (let y = currentYear - 1; y <= currentYear + 10; y++) {
      options.push({ value: String(y), label: String(y) });
    }
    return options;
  }, []);

  const monthOptions = useMemo(
    () =>
      MONTH_NAMES.map((name, idx) => ({
        value: String(idx),
        label: name,
      })),
    []
  );

  const targetDate = useMemo(() => {
    const m = selectedMonth;
    const y = selectedYear;
    const d = parseInt(selectedDay || "1", 10);
    if (!m && m !== 0) return "";
    const dt = new Date(y, m, d);
    return dt.toISOString().substring(0, 10);
  }, [selectedMonth, selectedYear, selectedDay]);

  const handleQuickAddDays = (days: number) => {
    const d = targetDate ? new Date(targetDate) : new Date();
    d.setDate(d.getDate() + days);
    const dt = new Date(d);
    setSelectedMonth(dt.getMonth());
    setSelectedYear(dt.getFullYear());
    setSelectedDay(String(dt.getDate()));
  };

  const handleQuickAddMonths = (months: number) => {
    const d = targetDate ? new Date(targetDate) : new Date();
    d.setMonth(d.getMonth() + months);
    const dt = new Date(d);
    setSelectedMonth(dt.getMonth());
    setSelectedYear(dt.getFullYear());
    setSelectedDay(String(dt.getDate()));
  };

  const handleMonthChange = (val: string) => {
    setSelectedMonth(parseInt(val, 10));
    const maxDay = getDaysInMonth(parseInt(val, 10), selectedYear);
    if (parseInt(selectedDay, 10) > maxDay) {
      setSelectedDay(String(maxDay));
    }
  };

  const handleYearChange = (val: string) => {
    setSelectedYear(parseInt(val, 10));
    const maxDay = getDaysInMonth(selectedMonth, parseInt(val, 10));
    if (parseInt(selectedDay, 10) > maxDay) {
      setSelectedDay(String(maxDay));
    }
  };

  const handleDayChange = (val: string) => {
    setSelectedDay(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDate) {
      toast.error("Invalid Date", { description: "Please select a valid extension date." });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await extendServiceRenewalDateAction(serviceId, targetDate, notes);
      if (result.success) {
        toast.success("Renewal Date Extended", {
          description: `Renewal date for ${serviceName} extended to ${targetDate}.`,
        });
        onSuccess?.();
        onClose();
      } else {
        toast.error("Extension Failed", {
          description: result.error || "Could not extend renewal date.",
        });
      }
    } catch (err: any) {
      toast.error("Error", { description: err?.message || "Failed to update date." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Extend Service Renewal Date"
      description={`Grant renewal extension or manual SLA renewal for ${serviceName}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {/* Current Date Badge */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/20 text-xs">
          <span className="text-muted-foreground">Current Renewal Date:</span>
          <span className="font-bold text-foreground flex items-center gap-1.5 font-mono">
            <Clock className="h-3.5 w-3.5 text-amber-500" />
            {currentRenewalDate
              ? new Date(currentRenewalDate).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "Not Set"}
          </span>
        </div>

        {/* Quick Date Selectors */}
        <div>
          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
            Quick Extension Presets
          </label>
          <div className="grid grid-cols-4 gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => handleQuickAddDays(30)} className="text-xs h-8">
              +30 Days
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => handleQuickAddMonths(3)} className="text-xs h-8">
              +3 Months
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => handleQuickAddMonths(6)} className="text-xs h-8">
              +6 Months
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => handleQuickAddMonths(12)} className="text-xs h-8 text-purple-400 border-purple-500/30">
              +1 Year
            </Button>
          </div>
        </div>

        {/* Select-based Date Picker */}
        <div>
          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
            New Expiry / Renewal Date *
          </label>
          <div className="grid grid-cols-3 gap-2">
            <Select
              value={String(selectedMonth)}
              onChange={(e) => handleMonthChange(e.target.value)}
              options={monthOptions}
            />
            <Select
              value={selectedDay}
              onChange={(e) => handleDayChange(e.target.value)}
              options={dayOptions}
            />
            <Select
              value={selectedYear}
              onChange={(e) => handleYearChange(e.target.value)}
              options={yearOptions}
            />
          </div>
          {targetDate && (
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              Selected: <span className="font-mono font-bold text-foreground">{targetDate}</span>
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
            Internal Extension Reason / Notes (Optional)
          </label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Granted SLA courtesy 30-day extension"
            className="text-xs"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} className="text-xs">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="glow"
            size="sm"
            disabled={isSubmitting}
            className="text-xs bg-purple-600 hover:bg-purple-700 text-white gap-1.5 font-semibold"
          >
            {isSubmitting ? (
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            Confirm Extension
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
