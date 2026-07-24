"use client";

import React, { useState } from "react";
import { ClientFile } from "@/types/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileUpload } from "@/components/ui/file-upload";
import { FileText, Download, FolderOpen } from "lucide-react";

interface ClientFilesManagerProps {
  clientId: string;
  files: ClientFile[];
}

export function ClientFilesManager({ clientId, files: initialFiles }: ClientFilesManagerProps) {
  const [files, setFiles] = useState<ClientFile[]>(initialFiles);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelected = (file: File | null) => {
    if (!file) return;

    const newFile: ClientFile = {
      id: `file-${Date.now()}`,
      clientId,
      fileName: file.name,
      fileUrl: "#",
      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      fileType: file.type || "document",
      category: "contract",
      uploadedBy: "Admin System",
      uploadedAt: new Date().toISOString(),
    };

    setFiles((prev) => [newFile, ...prev]);
    setIsUploading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold tracking-tight">Client Document Repository</h3>
          <p className="text-xs text-muted-foreground">Store master service agreements, identity verification, and business docs.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setIsUploading(!isUploading)} className="text-xs">
          {isUploading ? "Cancel Upload" : "Upload Document"}
        </Button>
      </div>

      {isUploading && (
        <Card variant="glass" className="p-4 border-dashed border-primary/40">
          <FileUpload onFileSelect={handleFileSelected} accept=".pdf,.doc,.docx,.png,.jpg" />
        </Card>
      )}

      {files.length === 0 ? (
        <Card variant="glass" className="p-8 text-center">
          <FolderOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <h4 className="text-xs font-semibold text-foreground">No Uploaded Files</h4>
          <p className="text-xs text-muted-foreground mt-1">Upload contracts, business registry certificates, or identity verification docs.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {files.map((file) => (
            <Card key={file.id} variant="glass" className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 shrink-0">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="truncate text-xs">
                  <span className="font-semibold text-foreground truncate block">{file.fileName}</span>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                    <span>{file.fileSize}</span>
                    <span>&bull;</span>
                    <Badge variant="outline" className="text-[9px] px-1 py-0 uppercase">
                      {file.category}
                    </Badge>
                  </div>
                </div>
              </div>

              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg shrink-0">
                <Download className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
