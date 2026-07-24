"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Phone, ChevronDown, Check, Search } from "lucide-react";

export interface CountryDialCode {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

export const COUNTRY_DIAL_CODES: CountryDialCode[] = [
  { code: "BD", name: "Bangladesh", dialCode: "+880", flag: "🇧🇩" },
  { code: "US", name: "United States", dialCode: "+1", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", dialCode: "+44", flag: "🇬🇧" },
  { code: "AE", name: "United Arab Emirates", dialCode: "+971", flag: "🇦🇪" },
  { code: "SA", name: "Saudi Arabia", dialCode: "+966", flag: "🇸🇦" },
  { code: "QA", name: "Qatar", dialCode: "+974", flag: "🇶🇦" },
  { code: "KW", name: "Kuwait", dialCode: "+965", flag: "🇰🇼" },
  { code: "OM", name: "Oman", dialCode: "+968", flag: "🇴🇲" },
  { code: "BH", name: "Bahrain", dialCode: "+973", flag: "🇧🇭" },
  { code: "SG", name: "Singapore", dialCode: "+65", flag: "🇸🇬" },
  { code: "MY", name: "Malaysia", dialCode: "+60", flag: "🇲🇾" },
  { code: "IN", name: "India", dialCode: "+91", flag: "🇮🇳" },
  { code: "PK", name: "Pakistan", dialCode: "+92", flag: "🇵🇰" },
  { code: "CA", name: "Canada", dialCode: "+1", flag: "🇨🇦" },
  { code: "AU", name: "Australia", dialCode: "+61", flag: "🇦🇺" },
  { code: "DE", name: "Germany", dialCode: "+49", flag: "🇩🇪" },
  { code: "FR", name: "France", dialCode: "+33", flag: "🇫🇷" },
  { code: "IT", name: "Italy", dialCode: "+39", flag: "🇮🇹" },
  { code: "ES", name: "Spain", dialCode: "+34", flag: "🇪🇸" },
  { code: "JP", name: "Japan", dialCode: "+81", flag: "🇯🇵" },
];

export interface PhoneInputProps {
  id?: string;
  value?: string;
  onChange: (fullPhoneNumber: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  defaultCountryCode?: string;
}

export function PhoneInput({
  id,
  value = "",
  onChange,
  placeholder = "1700-000000",
  disabled = false,
  className,
  defaultCountryCode = "BD",
}: PhoneInputProps) {
  // Parse initial value to check if dial code exists
  const initialCountry =
    COUNTRY_DIAL_CODES.find((c) => value.startsWith(c.dialCode)) ||
    COUNTRY_DIAL_CODES.find((c) => c.code === defaultCountryCode) ||
    COUNTRY_DIAL_CODES[0];

  const [selectedCountry, setSelectedCountry] = useState<CountryDialCode>(initialCountry);
  const [phoneNumber, setPhoneNumber] = useState<string>(() => {
    if (value.startsWith(selectedCountry.dialCode)) {
      return value.replace(selectedCountry.dialCode, "").trim();
    }
    return value;
  });

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value && value.startsWith(selectedCountry.dialCode)) {
      setPhoneNumber(value.replace(selectedCountry.dialCode, "").trim());
    }
  }, [value, selectedCountry.dialCode]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectCountry = (country: CountryDialCode) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchQuery("");
    const fullNumber = phoneNumber ? `${country.dialCode} ${phoneNumber}` : "";
    onChange(fullNumber);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawNum = e.target.value;
    setPhoneNumber(rawNum);
    const fullNumber = rawNum ? `${selectedCountry.dialCode} ${rawNum}` : "";
    onChange(fullNumber);
  };

  const filteredCountries = COUNTRY_DIAL_CODES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.dialCode.includes(searchQuery) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={cn("relative flex items-center rounded-xl border border-input bg-card text-foreground shadow-sm focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all", className)} ref={dropdownRef}>
      {/* Country Select Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative flex items-center border-r border-border/80 bg-muted/40 hover:bg-muted/70 dark:bg-zinc-900/60 dark:hover:bg-zinc-800/80 rounded-l-xl px-3 py-2 cursor-pointer shrink-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="text-base mr-1.5 leading-none">{selectedCountry.flag}</span>
        <span className="text-xs font-mono font-bold text-foreground mr-1.5">{selectedCountry.dialCode}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {/* Styled Dark Mode Dropdown Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-64 max-h-60 overflow-y-auto bg-card text-card-foreground dark:bg-[#0f172a] dark:text-slate-100 border border-border/80 dark:border-slate-800 shadow-2xl rounded-xl z-50 p-1.5 space-y-1 backdrop-blur-md">
          {/* Quick Search */}
          <div className="relative mb-1 px-1 pt-1">
            <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search country..."
              className="w-full bg-muted/50 dark:bg-slate-900 border border-border/60 dark:border-slate-800 rounded-lg pl-8 pr-2 py-1 text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              autoFocus
            />
          </div>

          {/* List of Countries */}
          <div className="space-y-0.5 max-h-44 overflow-y-auto pr-0.5">
            {filteredCountries.length === 0 ? (
              <div className="p-2 text-center text-xs text-muted-foreground">No countries found</div>
            ) : (
              filteredCountries.map((c) => {
                const isSelected = c.code === selectedCountry.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleSelectCountry(c)}
                    className={cn(
                      "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left",
                      isSelected
                        ? "bg-primary/20 text-primary dark:text-primary-foreground font-semibold"
                        : "hover:bg-muted/80 dark:hover:bg-slate-800/80 text-foreground dark:text-slate-200"
                    )}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span className="text-base leading-none">{c.flag}</span>
                      <span className="truncate">{c.name}</span>
                    </span>
                    <span className="flex items-center gap-1.5 shrink-0 ml-2 font-mono text-[11px] text-muted-foreground">
                      {c.dialCode}
                      {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Phone Icon & Input Field */}
      <div className="relative flex-1 flex items-center">
        <Phone className="absolute left-3 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <input
          id={id}
          type="tel"
          value={phoneNumber}
          onChange={handleNumberChange}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full bg-transparent py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50 font-mono"
        />
      </div>
    </div>
  );
}
