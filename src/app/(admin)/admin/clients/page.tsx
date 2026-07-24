"use client";

import React, { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ClientTable } from "@/features/clients/components/client-table";
import { ClientGrid } from "@/features/clients/components/client-grid";
import { ClientFilterSheet } from "@/features/clients/components/client-filters";
import { CreateClientModal } from "@/features/clients/components/create-client-modal";
import { getClientsAction, updateClientStatusAction } from "@/features/clients/actions/client-actions";
import { Client, ClientFilters, ClientStatus } from "@/types/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search, LayoutGrid, List, Filter, Plus, Download } from "lucide-react";

export default function ClientsPage() {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [filters, setFilters] = useState<ClientFilters>({
    search: "",
    status: "all",
  });

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const result = await getClientsAction(filters);
      if (result.success && result.data) {
        setClients(result.data.clients);
      }
    } catch (err: any) {
      toast.error("Error", { description: "Failed to load clients list." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [filters]);

  const handleStatusChange = async (id: string, newStatus: ClientStatus) => {
    try {
      const result = await updateClientStatusAction(id, newStatus);
      if (result.success) {
        toast.success("Status Updated", { description: `Client status changed to ${newStatus}.` });
        fetchClients();
      }
    } catch (err: any) {
      toast.error("Error", { description: "Failed to update client status." });
    }
  };

  const handleClientDeleted = (clientId: string) => {
    setClients((prev) => prev.filter((c) => c.id !== clientId));
  };

  const handleExportCSV = () => {
    const headers = ["Company Name", "Contact Name", "Email", "Phone", "Country", "Status", "Currency"];
    const rows = clients.map((c) => [c.companyName, c.name, c.email, c.phone || "", c.country, c.clientStatus, c.preferredCurrency]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `NexusOS_Clients_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Export Complete", { description: `${clients.length} client records exported to CSV.` });
  };

  return (
    <PageContainer maxWidth="xl">
      <PageHeader
        title="Client Directory & Organizations"
        description="Enterprise CRM repository for digital service clients, contacts, and account statuses."
      />

      {/* Directory Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card/40 p-3 rounded-2xl border border-border/80 glass-panel">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search clients by name, email, phone, company, or tags..."
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
            Add Client
          </Button>
        </div>
      </div>

      {/* Main Client Data View */}
      {viewMode === "table" ? (
        <ClientTable
          data={clients}
          isLoading={isLoading}
          onStatusChange={handleStatusChange}
          onClientDeleted={handleClientDeleted}
          onClientsDeleted={(ids) => setClients((prev) => prev.filter((c) => !ids.includes(c.id)))}
        />
      ) : (
        <ClientGrid
          data={clients}
          onStatusChange={handleStatusChange}
          onClientDeleted={handleClientDeleted}
        />
      )}

      {/* Filter Drawer Sheet */}
      <ClientFilterSheet
        isOpen={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        filters={filters}
        onApplyFilters={(newFilters) => setFilters(newFilters)}
        onResetFilters={() => setFilters({ search: "", status: "all" })}
      />

      {/* Create Client Drawer Sheet */}
      <CreateClientModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={fetchClients}
      />
    </PageContainer>
  );
}
