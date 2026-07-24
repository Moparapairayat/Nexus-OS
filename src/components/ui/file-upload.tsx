"use client";

import React, { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { UploadCloud, File, X, CheckCircle2 } from "lucide-react";
import { Button } from "./button";

export interface FileUploadProps {
  accept?: string;
  maxSizeMB?: number;
  onFileSelect?: (file: File | null) => void;
  className?: string;
}

export function FileUpload({
  accept = "image/*,application/pdf",
  maxSizeMB = 5,
  onFileSelect,
  className,
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File size exceeds limit of ${maxSizeMB}MB`);
        setSelectedFile(null);
        onFileSelect?.(null);
        return;
      }
      setError(null);
      setSelectedFile(file);
      onFileSelect?.(file);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onFileSelect?.(null);
  };

  return (
    <div className={cn("w-full space-y-2", className)}>
      <input
        type="file"
        ref={fileInputRef}
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      {!selectedFile ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/80 bg-background/40 hover:bg-muted/40 p-6 text-center transition-all cursor-pointer group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform mb-2">
            <UploadCloud className="h-5 w-5" />
          </div>
          <p className="text-xs font-semibold text-foreground">Click or drag file to upload</p>
          <p className="text-[11px] text-muted-foreground mt-1">SVG, PNG, JPG, or PDF up to {maxSizeMB}MB</p>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-muted/40 text-xs">
          <div className="flex items-center gap-2.5 truncate">
            <File className="h-4 w-4 text-primary shrink-0" />
            <div className="truncate">
              <p className="font-semibold text-foreground truncate">{selectedFile.name}</p>
              <p className="text-[10px] text-muted-foreground font-mono">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-1" />
            <Button type="button" variant="ghost" size="sm" onClick={handleRemove} className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive">
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
