"use client";

import React, { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveGrid } from "@/components/layout/responsive-grid";
import { StatCard } from "@/components/ui/stat-card";
import { InvoiceTable } from "@/features/billing/components/invoice-table";
import { InvoiceGrid } from "@/features/billing/components/invoice-grid";
import { InvoiceFilterSheet } from "@/features/billing/components/invoice-filters";
import { CreateInvoiceModal } from "@/features/billing/components/create-invoice-modal";
import { getInvoicesAction, updateInvoiceStatusAction } from "@/features/billing/actions/billing-actions";
import { getClientsAction } from "@/features/clients/actions/client-actions";
import { Invoice, InvoiceFilters, InvoiceStatus } from "@/types/billing";
import { Client } from "@/types/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search, LayoutGrid, List, Filter, Plus, Download, DollarSign, FileText, CheckCircle, Clock } from "lucide-react";

export default function InvoicesDirectoryPage() {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [filters, setFilters] = useState<InvoiceFilters>({
    search: "",
    status: "all",
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [invRes, cliRes] = await Promise.all([
        getInvoicesAction(filters),
        getClientsAction(),
      ]);

      if (invRes.success && invRes.data) setInvoices(invRes.data.invoices);
      if (cliRes.success && cliRes.data) setClients(cliRes.data.clients);
    } catch (err: any) {
      toast.error("Error", { description: "Failed to load invoices." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleStatusChange = async (id: string, newStatus: InvoiceStatus) => {
    try {
      const result = await updateInvoiceStatusAction(id, newStatus);
      if (result.success) {
        toast.success("Invoice Updated", { description: `Status updated to ${newStatus}.` });
        fetchData();
      }
    } catch (err) {
      toast.error("Error", { description: "Failed to update invoice status." });
    }
  };

  const handleExportCSV = () => {
    const headers = ["Invoice Number", "Company", "Client", "Issue Date", "Due Date", "Grand Total", "Balance Due", "Status"];
    const rows = invoices.map((inv) => [
      inv.invoiceNumber,
      inv.companyName,
      inv.clientName,
      inv.issueDate.slice(0, 10),
      inv.dueDate.slice(0, 10),
      inv.grandTotal,
      inv.balanceDue,
      inv.invoiceStatus,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `NexusOS_Invoices_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Export Complete", { description: `${invoices.length} invoices exported to CSV.` });
  };

  const totalInvoiced = invoices.reduce((acc, inv) => acc + inv.grandTotal, 0);
  const totalCollected = invoices.reduce((acc, inv) => acc + inv.paidAmount, 0);
  const totalOutstanding = invoices.reduce((acc, inv) => acc + inv.balanceDue, 0);
  const overdueCount = invoices.filter((inv) => inv.invoiceStatus === "overdue").length;

  return (
    <PageContainer maxWidth="xl">
      <PageHeader
        title="Financial Engine & Invoice Directory"
        description="Enterprise invoice generation, tax calculations, balance tracking, and PDF exports."
      />

      {/* Revenue KPI Summary */}
      <ResponsiveGrid cols={4}>
        <StatCard
          title="Total Invoiced"
          value={`$${totalInvoiced.toFixed(2)}`}
          subtitle="All generated invoices"
          icon={<FileText className="h-4 w-4" />}
        />
        <StatCard
          title="Collected Revenue"
          value={`$${totalCollected.toFixed(2)}`}
          trend="up"
          subtitle="Paid in full"
          icon={<CheckCircle className="h-4 w-4 text-emerald-500" />}
        />
        <StatCard
          title="Outstanding Balance"
          value={`$${totalOutstanding.toFixed(2)}`}
          trend="neutral"
          subtitle="Balance due"
          icon={<DollarSign className="h-4 w-4 text-blue-500" />}
        />
        <StatCard
          title="Overdue Invoices"
          value={overdueCount.toString()}
          trend="down"
          subtitle="Action required"
          icon={<Clock className="h-4 w-4 text-rose-500" />}
        />
      </ResponsiveGrid>

      {/* Directory Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card/40 p-3 rounded-2xl border border-border/80 glass-panel">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by invoice number (e.g. INV-2026-000001), client, or amount..."
              value={filters.search || ""}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterSheetOpen(true)}
            className="h-9 px-3 text-xs shrink-0"
          >
            <Filter className="mr-1.5 h-3.5 w-3.5" />
            Filters
            {filters.status && filters.status !== "all" && (
              <span className="ml-1.5 h-2 w-2 rounded-full bg-primary" />
            )}
          </Button>
        </div>

        <div className="flex items-center gap-2 justify-end shrink-0">
          {/* View Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-muted/60 border border-border/60">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "table" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "grid" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>

          <Button variant="outline" size="sm" onClick={handleExportCSV} className="h-9 text-xs">
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export
          </Button>

          <Button variant="glow" size="sm" onClick={() => setCreateModalOpen(true)} className="h-9 text-xs">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Generate Invoice
          </Button>
        </div>
      </div>

      {/* Main Data View */}
      {viewMode === "table" ? (
        <InvoiceTable data={invoices} isLoading={isLoading} onStatusChange={handleStatusChange} />
      ) : (
        <InvoiceGrid data={invoices} onStatusChange={handleStatusChange} />
      )}

      {/* Filter Sheet */}
      <InvoiceFilterSheet
        isOpen={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        filters={filters}
        onApplyFilters={(newFilters) => setFilters(newFilters)}
        onResetFilters={() => setFilters({ search: "", status: "all" })}
      />

      {/* Create Invoice Modal */}
      <CreateInvoiceModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        clients={clients}
        onSuccess={fetchData}
      />
    </PageContainer>
  );
}
