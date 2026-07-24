"use server";

import { revalidatePath } from "next/cache";
import { Client, ClientContact, ClientNote, ClientFilters, ClientStatus } from "@/types/client";
import { clientFormSchema, clientContactSchema, clientNoteSchema } from "../schemas/client-schema";
import { requireAdmin } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

// ── Helpers ────────────────────────────────────────────────────────────────

function getAdmin() {
  return createAdminClient() as any;
}

/** Maps a raw Supabase clients row to our Client type */
function mapRowToClient(row: any): Client {
  // client_status column holds our app-level status; status is DB service_status enum
  const clientStatus = (row.client_status || row.status || "active") as ClientStatus;
  return {
    id: row.id,
    name: row.full_name || row.company_name,
    companyName: row.company_name,
    companyLogo: row.company_logo_url || undefined,
    businessRegNo: row.business_reg_no || undefined,
    website: row.website || undefined,
    industry: row.industry || undefined,
    email: row.primary_email,
    phone: row.primary_phone || undefined,
    whatsapp: row.whatsapp || undefined,
    billingAddress: row.billing_address || row.address_line1 || undefined,
    country: row.country || "US",
    city: row.city || undefined,
    postalCode: row.postal_code || undefined,
    taxNumber: row.tax_number || undefined,
    preferredCurrency: row.currency || "USD",
    preferredLanguage: row.preferred_language || "en",
    timezone: row.timezone || "UTC",
    clientStatus,
    accountStatus: (clientStatus === "suspended" ? "suspended" : clientStatus === "pending" ? "pending" : "active") as any,
    notes: row.notes || undefined,
    tags: row.tags || [],
    assignedManagerId: row.assigned_manager_id || undefined,
    assignedManagerName: row.assigned_manager_name || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    contacts: (row.client_contacts || []).map((c: any) => ({
      id: c.id,
      clientId: c.client_id,
      name: [c.first_name, c.last_name].filter(Boolean).join(" "),
      role: c.job_title || "owner",
      email: c.email,
      phone: c.phone || undefined,
      isPrimary: c.is_primary,
      createdAt: c.created_at,
    } as ClientContact)),
    adminNotes: (row.client_notes || []).map((n: any) => ({
      id: n.id,
      clientId: n.client_id,
      content: n.content,
      isPinned: n.is_pinned,
      createdBy: n.created_by_name || "Admin",
      createdAt: n.created_at,
      updatedAt: n.updated_at,
    } as ClientNote)),
    files: [],
    activities: (row.client_activities || []).map((a: any) => ({
      id: a.id,
      clientId: a.client_id,
      type: a.type as any,
      title: a.title,
      description: a.description || "",
      performedBy: a.performed_by_name || "Admin",
      timestamp: a.created_at,
    })),
  };
}

/** Log an activity entry for a client */
async function logActivity(
  supabase: any,
  clientId: string,
  type: string,
  title: string,
  description: string,
  performedByName: string
) {
  await supabase.from("client_activities").insert({
    client_id: clientId,
    type,
    title,
    description,
    performed_by_name: performedByName,
  });
}

// ── READ ───────────────────────────────────────────────────────────────────

export async function getClientsAction(filters: ClientFilters = {}) {
  await requireAdmin();
  const supabase = getAdmin();

  let query = supabase
    .from("clients")
    .select(`
      *,
      client_contacts (id, client_id, first_name, last_name, email, phone, job_title, is_primary, created_at),
      client_activities (id, client_id, type, title, description, performed_by_name, created_at)
    `)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  // Status filter
  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  // Country filter
  if (filters.country) {
    query = query.ilike("country", filters.country);
  }

  // Currency filter
  if (filters.currency) {
    query = query.eq("currency", filters.currency);
  }

  const { data, error } = await query;

  if (error) {
    return { success: false, error: `Database error: ${error.message}` };
  }

  let result: Client[] = (data || []).map(mapRowToClient);

  // In-JS search (Supabase FTS needs extra setup)
  if (filters.search && filters.search.trim() !== "") {
    const q = filters.search.toLowerCase().trim();
    result = result.filter(
      (c: Client) =>
        c.name.toLowerCase().includes(q) ||
        c.companyName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q)) ||
        c.country.toLowerCase().includes(q) ||
        c.tags.some((t: string) => t.toLowerCase().includes(q))
    );
  }

  // Tag filter
  if (filters.tag) {
    result = result.filter((c: Client) => c.tags.includes(filters.tag!));
  }

  // Sorting
  const sortBy = filters.sortBy || "createdAt";
  const sortOrder = filters.sortOrder || "desc";
  result.sort((a: any, b: any) => {
    let valA: any = (a as any)[sortBy] ?? "";
    let valB: any = (b as any)[sortBy] ?? "";
    if (typeof valA === "string") valA = valA.toLowerCase();
    if (typeof valB === "string") valB = valB.toLowerCase();
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination
  const page = filters.page || 1;
  const limit = filters.limit || 50;
  const total = result.length;
  const totalPages = Math.ceil(total / limit);
  const paginatedData = result.slice((page - 1) * limit, (page - 1) * limit + limit);

  return {
    success: true,
    data: { clients: paginatedData, total, page, totalPages },
  };
}

export async function getClientByIdAction(id: string) {
  await requireAdmin();
  const supabase = getAdmin();

  const { data, error } = await supabase
    .from("clients")
    .select(`
      *,
      client_contacts (id, client_id, first_name, last_name, email, phone, job_title, is_primary, created_at),
      client_notes (id, client_id, content, is_pinned, created_by_name, created_at, updated_at),
      client_activities (id, client_id, type, title, description, performed_by_name, created_at)
    `)
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error || !data) {
    return { success: false, error: "Client record not found." };
  }

  return { success: true, data: mapRowToClient(data) };
}

// ── CREATE ─────────────────────────────────────────────────────────────────

export async function createClientAction(rawValues: any) {
  const user = await requireAdmin();
  const supabase = getAdmin();

  const validation = clientFormSchema.safeParse(rawValues);
  if (!validation.success) {
    return {
      success: false,
      error: "Validation failed. Please check form fields.",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const d = validation.data;

  // Generate unique account number
  const accountNumber = `NXS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const { data: newClient, error } = await supabase
    .from("clients")
    .insert({
      company_name: d.companyName,
      full_name: d.name,
      primary_email: d.email,
      primary_phone: d.phone || null,
      whatsapp: d.whatsapp || null,
      website: d.website || null,
      industry: d.industry || null,
      business_reg_no: d.businessRegNo || null,
      billing_address: d.billingAddress || null,
      country: d.country,
      city: d.city || null,
      postal_code: d.postalCode || null,
      tax_number: d.taxNumber || null,
      currency: d.preferredCurrency,
      preferred_language: d.preferredLanguage,
      timezone: d.timezone,
      status: d.clientStatus,
      client_status: d.clientStatus,
      notes: d.notes || null,
      tags: d.tags || [],
      account_number: accountNumber,
      created_by: user.id !== "setup-admin-id" ? user.id : null,
    })
    .select()
    .single();

  if (error || !newClient) {
    return { success: false, error: `Failed to create client: ${error?.message}` };
  }

  // Add primary contact
  await supabase.from("client_contacts").insert({
    client_id: newClient.id,
    first_name: d.name.split(" ")[0],
    last_name: d.name.split(" ").slice(1).join(" ") || "",
    email: d.email,
    phone: d.phone || null,
    is_primary: true,
    job_title: "Primary Contact",
  });

  // Log creation activity
  await logActivity(
    supabase,
    newClient.id,
    "created",
    "Client Created",
    `Client record created for ${d.companyName} by ${user.fullName || user.email}.`,
    user.fullName || user.email
  );

  revalidatePath("/admin/clients");

  // Fetch complete record with contacts
  const result = await getClientByIdAction(newClient.id);
  return result.success ? { success: true, data: result.data } : { success: true, data: mapRowToClient(newClient) };
}

// ── UPDATE STATUS ──────────────────────────────────────────────────────────

export async function updateClientStatusAction(clientId: string, newStatus: ClientStatus) {
  const user = await requireAdmin();
  const supabase = getAdmin();

  // Get old status for activity log
  const { data: old } = await supabase
    .from("clients")
    .select("status, company_name")
    .eq("id", clientId)
    .single();

  const { data, error } = await supabase
    .from("clients")
    .update({ status: newStatus, client_status: newStatus })
    .eq("id", clientId)
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: `Failed to update status: ${error?.message}` };
  }

  await logActivity(
    supabase,
    clientId,
    "status_changed",
    `Status Changed to ${newStatus.toUpperCase()}`,
    `Status updated from ${old?.status || "?"} to ${newStatus} by ${user.fullName || user.email}.`,
    user.fullName || user.email
  );

  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${clientId}`);

  const result = await getClientByIdAction(clientId);
  return result;
}

// ── CONTACTS ───────────────────────────────────────────────────────────────

export async function addContactAction(clientId: string, rawValues: any) {
  const user = await requireAdmin();
  const supabase = getAdmin();

  const validation = clientContactSchema.safeParse(rawValues);
  if (!validation.success) {
    return {
      success: false,
      error: "Contact validation failed.",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const d = validation.data;

  // If marking as primary, unset others
  if (d.isPrimary) {
    await supabase.from("client_contacts").update({ is_primary: false }).eq("client_id", clientId);
  }

  const nameParts = d.name.split(" ");
  const { data, error } = await supabase.from("client_contacts").insert({
    client_id: clientId,
    first_name: nameParts[0],
    last_name: nameParts.slice(1).join(" ") || "",
    email: d.email,
    phone: d.phone || null,
    job_title: d.role,
    is_primary: d.isPrimary,
  }).select().single();

  if (error) {
    return { success: false, error: `Failed to add contact: ${error.message}` };
  }

  await logActivity(
    supabase,
    clientId,
    "contact_added",
    `Contact Added: ${d.name}`,
    `${d.name} (${d.role}) added by ${user.fullName || user.email}.`,
    user.fullName || user.email
  );

  revalidatePath(`/admin/clients/${clientId}`);
  return {
    success: true,
    data: {
      id: data.id,
      clientId,
      name: d.name,
      role: d.role as any,
      email: d.email,
      phone: d.phone,
      isPrimary: d.isPrimary,
      createdAt: data.created_at,
    } as ClientContact,
  };
}

// ── NOTES ──────────────────────────────────────────────────────────────────

export async function addNoteAction(clientId: string, content: string, isPinned: boolean = false) {
  const user = await requireAdmin();
  const supabase = getAdmin();

  const validation = clientNoteSchema.safeParse({ content, isPinned });
  if (!validation.success) {
    return { success: false, error: "Note content is required." };
  }

  const { data, error } = await supabase.from("client_notes").insert({
    client_id: clientId,
    content,
    is_pinned: isPinned,
    created_by: user.id !== "setup-admin-id" ? user.id : null,
    created_by_name: user.fullName || user.email,
  }).select().single();

  if (error) {
    return { success: false, error: `Failed to add note: ${error.message}` };
  }

  await logActivity(
    supabase,
    clientId,
    "note_added",
    "Admin Note Added",
    `Note added by ${user.fullName || user.email}.`,
    user.fullName || user.email
  );

  revalidatePath(`/admin/clients/${clientId}`);
  return {
    success: true,
    data: {
      id: data.id,
      clientId,
      content: data.content,
      isPinned: data.is_pinned,
      createdBy: data.created_by_name || user.fullName || user.email,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    } as ClientNote,
  };
}

export async function togglePinNoteAction(clientId: string, noteId: string) {
  await requireAdmin();
  const supabase = getAdmin();

  const { data: note } = await supabase
    .from("client_notes")
    .select("is_pinned")
    .eq("id", noteId)
    .single();

  if (!note) return { success: false, error: "Note not found." };

  await supabase.from("client_notes").update({ is_pinned: !note.is_pinned }).eq("id", noteId);

  revalidatePath(`/admin/clients/${clientId}`);
  return { success: true };
}

// ── DELETE (Single) ────────────────────────────────────────────────────────

export async function deleteClientAction(clientId: string) {
  const user = await requireAdmin();
  const supabase = getAdmin();

  // Get client info before deletion
  const { data: client } = await supabase
    .from("clients")
    .select("company_name, primary_email, profile_id")
    .eq("id", clientId)
    .single();

  if (!client) {
    return { success: false, error: "Client record not found." };
  }

  // Best-effort: Revoke Supabase Auth user
  try {
    if (client.profile_id) {
      await supabase.auth.admin.deleteUser(client.profile_id);
    } else {
      // Lookup by email
      const { data: userList } = await supabase.auth.admin.listUsers();
      const authUser = userList?.users?.find((u: any) => u.email === client.primary_email);
      if (authUser) {
        await supabase.auth.admin.deleteUser(authUser.id);
      }
    }
  } catch (err) {
    console.warn("[deleteClientAction] Auth revocation failed (non-fatal):", err);
  }

  // Hard delete client (cascades to contacts, notes, activities, invitations)
  const { error } = await supabase.from("clients").delete().eq("id", clientId);

  if (error) {
    return { success: false, error: `Failed to delete client: ${error.message}` };
  }

  revalidatePath("/admin/clients");

  return {
    success: true,
    data: {
      deletedClientId: clientId,
      deletedCompanyName: client.company_name,
      deletedEmail: client.primary_email,
      deletedBy: user.fullName || user.email,
      deletedAt: new Date().toISOString(),
    },
  };
}

// ── DELETE (Bulk) ──────────────────────────────────────────────────────────

export async function deleteManyClientsAction(clientIds: string[]) {
  const user = await requireAdmin();
  const supabase = getAdmin();

  if (!clientIds || clientIds.length === 0) {
    return { success: false, error: "No client IDs provided." };
  }

  // Fetch all clients to be deleted
  const { data: clients } = await supabase
    .from("clients")
    .select("id, company_name, primary_email, profile_id")
    .in("id", clientIds);

  if (!clients || clients.length === 0) {
    return { success: false, error: "No clients found matching provided IDs." };
  }

  // Pre-fetch Supabase Auth users list
  let authUsers: any[] = [];
  try {
    const { data: userList } = await supabase.auth.admin.listUsers();
    authUsers = userList?.users || [];
  } catch (err) {
    console.warn("[deleteManyClientsAction] Could not list auth users (non-fatal):", err);
  }

  const results: { id: string; companyName: string; success: boolean; error?: string }[] = [];

  for (const client of clients) {
    // Best-effort auth revocation
    try {
      const targetAuthUserId = client.profile_id
        || authUsers.find((u: any) => u.email === client.primary_email)?.id;
      if (targetAuthUserId) {
        await supabase.auth.admin.deleteUser(targetAuthUserId);
      }
    } catch (err) {
      console.warn(`[deleteManyClients] Auth revoke failed for ${client.primary_email}:`, err);
    }

    results.push({ id: client.id, companyName: client.company_name, success: true });
  }

  // Bulk delete all clients (CASCADE handles contacts/notes/activities)
  const { error } = await supabase.from("clients").delete().in("id", clientIds);

  if (error) {
    return { success: false, error: `Bulk delete failed: ${error.message}` };
  }

  revalidatePath("/admin/clients");

  const successCount = clients.length;
  const failCount = clientIds.length - clients.length;

  return {
    success: true,
    data: {
      results,
      successCount,
      failCount,
      deletedBy: user.fullName || user.email,
      deletedAt: new Date().toISOString(),
    },
  };
}

// ── ARCHIVE (Single) ───────────────────────────────────────────────────────

export async function archiveClientAction(clientId: string) {
  return updateClientStatusAction(clientId, "archived");
}

// ── ARCHIVE (Bulk) ─────────────────────────────────────────────────────────

export async function archiveManyClientsAction(clientIds: string[]) {
  const user = await requireAdmin();
  const supabase = getAdmin();

  if (!clientIds || clientIds.length === 0) {
    return { success: false, error: "No client IDs provided." };
  }

  const { error } = await supabase
    .from("clients")
    .update({ status: "archived", client_status: "archived" })
    .in("id", clientIds);

  if (error) {
    return { success: false, error: `Bulk archive failed: ${error.message}` };
  }

  revalidatePath("/admin/clients");

  return {
    success: true,
    data: { successCount: clientIds.length, archivedBy: user.fullName || user.email },
  };
}
