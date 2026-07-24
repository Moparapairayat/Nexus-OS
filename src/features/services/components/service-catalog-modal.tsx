"use client";

import React, { useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, FormLabel } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { createServiceCategoryAction, createServiceTemplateAction } from "../actions/service-actions";
import { ServiceCategory, ServiceTemplate } from "@/types/service";
import { Plus, Package, Layers } from "lucide-react";

interface ServiceCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ServiceCategory[];
  templates: ServiceTemplate[];
  onSuccess: () => void;
}

export function ServiceCatalogModal({
  isOpen,
  onClose,
  categories: initialCategories,
  templates: initialTemplates,
  onSuccess,
}: ServiceCatalogModalProps) {
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<"catalog" | "new_cat" | "new_tmpl">("catalog");
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [tmplName, setTmplName] = useState("");
  const [tmplPrice, setTmplPrice] = useState(49);
  const [tmplCatId, setTmplCatId] = useState(initialCategories[0]?.id || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await createServiceCategoryAction({ name: catName, description: catDesc });
      if (result.success) {
        toast.success("Category Created", { description: `${catName} added to dynamic categories.` });
        setCatName("");
        setCatDesc("");
        setActiveView("catalog");
        onSuccess();
      }
    } catch (err: any) {
      toast.error("Error", { description: "Failed to create category." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await createServiceTemplateAction({
        categoryId: tmplCatId,
        name: tmplName,
        description: "Standard service template",
        defaultPrice: Number(tmplPrice),
        currency: "USD",
        billingCycle: "monthly",
        renewable: true,
        autoRenewal: true,
        visibility: "public",
        status: "active",
        tags: ["Template"],
      });
      if (result.success) {
        toast.success("Template Created", { description: `${tmplName} added to service catalog.` });
        setTmplName("");
        setActiveView("catalog");
        onSuccess();
      }
    } catch (err: any) {
      toast.error("Error", { description: "Failed to create template." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Service Catalog & Dynamic Categories"
      description="Manage reusable service templates and dynamic asset categories."
    >
      <div className="space-y-4 pt-2 pb-6">
        <div className="flex items-center gap-2 border-b border-border/60 pb-2">
          <Button
            variant={activeView === "catalog" ? "glow" : "ghost"}
            size="sm"
            onClick={() => setActiveView("catalog")}
            className="text-xs"
          >
            Catalog Templates
          </Button>
          <Button
            variant={activeView === "new_cat" ? "glow" : "ghost"}
            size="sm"
            onClick={() => setActiveView("new_cat")}
            className="text-xs"
          >
            <Plus className="mr-1 h-3.5 w-3.5" /> New Category
          </Button>
          <Button
            variant={activeView === "new_tmpl" ? "glow" : "ghost"}
            size="sm"
            onClick={() => setActiveView("new_tmpl")}
            className="text-xs"
          >
            <Plus className="mr-1 h-3.5 w-3.5" /> New Template
          </Button>
        </div>

        {activeView === "catalog" && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Categories ({initialCategories.length})</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {initialCategories.map((c) => (
                <div key={c.id} className="p-2.5 rounded-xl border border-border/60 bg-muted/40 text-xs">
                  <span className="font-semibold text-foreground">{c.name}</span>
                  <p className="text-[11px] text-muted-foreground truncate">{c.description}</p>
                </div>
              ))}
            </div>

            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground pt-3">Catalog Templates ({initialTemplates.length})</h4>
            <div className="space-y-2">
              {initialTemplates.map((t) => (
                <Card key={t.id} variant="glass" className="p-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-foreground">{t.name}</span>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span>{t.categoryName}</span>
                      <span>&bull;</span>
                      <span className="font-mono font-bold text-foreground">${t.defaultPrice} / {t.billingCycle}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[9px]">
                    {t.status}
                  </Badge>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeView === "new_cat" && (
          <form onSubmit={handleCreateCategory} className="space-y-3">
            <FormField>
              <FormLabel>Category Name *</FormLabel>
              <Input value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="e.g. AI APIs & Tokens" required />
            </FormField>
            <FormField>
              <FormLabel>Description *</FormLabel>
              <Input value={catDesc} onChange={(e) => setCatDesc(e.target.value)} placeholder="e.g. OpenAI, Claude & Gemini API Keys" required />
            </FormField>
            <Button type="submit" variant="glow" size="sm" isLoading={isLoading} className="w-full">
              Save New Category
            </Button>
          </form>
        )}

        {activeView === "new_tmpl" && (
          <form onSubmit={handleCreateTemplate} className="space-y-3">
            <FormField>
              <FormLabel>Template Title *</FormLabel>
              <Input value={tmplName} onChange={(e) => setTmplName(e.target.value)} placeholder="e.g. Enterprise SSL Certificate" required />
            </FormField>
            <FormField>
              <FormLabel>Default Price ($) *</FormLabel>
              <Input type="number" value={tmplPrice} onChange={(e) => setTmplPrice(Number(e.target.value))} required />
            </FormField>
            <Button type="submit" variant="glow" size="sm" isLoading={isLoading} className="w-full">
              Save Catalog Template
            </Button>
          </form>
        )}
      </div>
    </Sheet>
  );
}
