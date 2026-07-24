"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Phone, ChevronDown } from "lucide-react";

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
  { code: "AE", name: "UAE", dialCode: "+971", flag: "🇦🇪" },
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

  useEffect(() => {
    if (value && value.startsWith(selectedCountry.dialCode)) {
      setPhoneNumber(value.replace(selectedCountry.dialCode, "").trim());
    }
  }, [value, selectedCountry.dialCode]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const country = COUNTRY_DIAL_CODES.find((c) => c.code === e.target.value) || COUNTRY_DIAL_CODES[0];
    setSelectedCountry(country);
    const fullNumber = phoneNumber ? `${country.dialCode} ${phoneNumber}` : "";
    onChange(fullNumber);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawNum = e.target.value;
    setPhoneNumber(rawNum);
    const fullNumber = rawNum ? `${selectedCountry.dialCode} ${rawNum}` : "";
    onChange(fullNumber);
  };

  return (
    <div className={cn("relative flex items-center rounded-xl border border-input bg-background/50 shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:border-primary transition-all", className)}>
      {/* Country Select Dropdown */}
      <div className="relative flex items-center border-r border-border/80 bg-muted/30 hover:bg-muted/50 rounded-l-xl px-2.5 py-2 cursor-pointer shrink-0 transition-colors">
        <span className="text-base mr-1">{selectedCountry.flag}</span>
        <span className="text-xs font-mono font-bold text-foreground mr-1">{selectedCountry.dialCode}</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
        <select
          value={selectedCountry.code}
          onChange={handleCountryChange}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          title="Select Country Dial Code"
        >
          {COUNTRY_DIAL_CODES.map((c) => (
            <option key={c.code} value={c.code} className="bg-popover text-popover-foreground text-xs py-1">
              {c.flag} {c.name} ({c.dialCode})
            </option>
          ))}
        </select>
      </div>

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
