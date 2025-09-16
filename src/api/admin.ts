import { supabase } from "@/lib/supabase";

export async function signInWithEmail(email: string) {
  const { error } = await supabase.auth.signInWithOtp({ email });
  if (error) throw error;
}

export async function getSession() {
  return await supabase.auth.getSession();
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function signUrl(path: string) {
  const { data, error } = await supabase.storage.from('deal-attachments').createSignedUrl(path, 3600);
  if (error) throw error;
  return data.signedUrl;
}

export async function getMyRole() {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) return null;
  const { data } = await supabase.from("profiles").select("role").eq("id", session.session.user.id).maybeSingle();
  return data?.role ?? null;
}

export async function listApplications(params: {
  page?: number; pageSize?: number; status?: string; q?: string; hasPapers?: boolean; from?: string; to?: string;
}) {
  const { page=1, pageSize=20, status, q, hasPapers, from, to } = params ?? {};
  let query = supabase.from("partner_applications").select("*", { count: "exact" }).order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  if (typeof hasPapers === "boolean") query = query.eq("has_papers", hasPapers);
  if (from) query = query.gte("created_at", from);
  if (to) query = query.lte("created_at", to);
  if (q) query = query.or(`full_name.ilike.%${q}%,phone.ilike.%${q}%,company_name.ilike.%${q}%`);
  const fromIdx = (page-1)*pageSize, toIdx = fromIdx + pageSize - 1;
  const { data, error, count } = await query.range(fromIdx, toIdx);
  if (error) throw error;
  return { rows: data ?? [], total: count ?? 0 };
}

export async function updateApplication(id: string, patch: { status?: string; notes?: string }) {
  const { error } = await supabase.from("partner_applications").update(patch).eq("id", id);
  if (error) throw error;
}

export async function listDeals(params: {
  page?: number; pageSize?: number; status?: string; developer?: string; min?: number; max?: number; from?: string; to?: string; q?: string;
}) {
  const { page=1, pageSize=20, status, developer, min, max, from, to, q } = params ?? {};
  let query = supabase.from("closed_deals").select("*", { count: "exact" }).order("created_at", { ascending: false });
  if (status) query = query.eq("review_status", status);
  if (developer) query = query.ilike("developer_name", `%${developer}%`);
  if (typeof min === "number") query = query.gte("deal_value", min);
  if (typeof max === "number") query = query.lte("deal_value", max);
  if (from) query = query.gte("created_at", from);
  if (to) query = query.lte("created_at", to);
  if (q) query = query.or(`project_name.ilike.%${q}%,client_name.ilike.%${q}%,unit_code.ilike.%${q}%`);
  const fromIdx = (page-1)*pageSize, toIdx = fromIdx + pageSize - 1;
  const { data, error, count } = await query.range(fromIdx, toIdx);
  if (error) throw error;
  return { rows: data ?? [], total: count ?? 0 };
}

export async function updateDeal(id: string, patch: { review_status?: string; internal_note?: string; payment_status?: string; claimed_at?: string }) {
  const { error } = await supabase.from("closed_deals").update(patch).eq("id", id);
  if (error) throw error;
}

export async function signAttachment(path: string) {
  const { data, error } = await supabase.storage.from("deal-attachments").createSignedUrl(path, 60*60);
  if (error) throw error;
  return data.signedUrl;
}

// Developers CRUD
export async function listDevelopers(params: { page?: number; pageSize?: number; q?: string }) {
  const { page=1, pageSize=20, q } = params ?? {};
  let query = supabase.from("developers").select("*", { count: "exact" }).order("name");
  if (q) query = query.ilike("name", `%${q}%`);
  const fromIdx = (page-1)*pageSize, toIdx = fromIdx + pageSize - 1;
  const { data, error, count } = await query.range(fromIdx, toIdx);
  if (error) throw error;
  return { rows: data ?? [], total: count ?? 0 };
}

export async function createDeveloper(developer: { name: string; description?: string; logo_url?: string }) {
  const { data, error } = await supabase.from("developers").insert(developer).select().single();
  if (error) throw error;
  return data;
}

export async function updateDeveloper(id: string, patch: { name?: string; description?: string; logo_url?: string }) {
  const { error } = await supabase.from("developers").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteDeveloper(id: string) {
  const { error } = await supabase.from("developers").delete().eq("id", id);
  if (error) throw error;
}

// Projects CRUD
export async function listProjects(params: { page?: number; pageSize?: number; q?: string; developerId?: string }) {
  const { page=1, pageSize=20, q, developerId } = params ?? {};
  let query = supabase.from("projects").select("*, developers(name)", { count: "exact" }).order("name");
  if (q) query = query.ilike("name", `%${q}%`);
  if (developerId) query = query.eq("developer_id", developerId);
  const fromIdx = (page-1)*pageSize, toIdx = fromIdx + pageSize - 1;
  const { data, error, count } = await query.range(fromIdx, toIdx);
  if (error) throw error;
  return { rows: data ?? [], total: count ?? 0 };
}

export async function createProject(project: { name: string; developer_id: string; description?: string; location?: string }) {
  const { data, error } = await supabase.from("projects").insert(project).select().single();
  if (error) throw error;
  return data;
}

export async function updateProject(id: string, patch: { name?: string; description?: string; location?: string }) {
  const { error } = await supabase.from("projects").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteProject(id: string) {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}

// Commission Rates CRUD
export async function listCommissionRates(params: { page?: number; pageSize?: number }) {
  const { page=1, pageSize=20 } = params ?? {};
  let query = supabase.from("commission_rates").select("*, developers(name), projects(name)", { count: "exact" }).order("percentage", { ascending: false });
  const fromIdx = (page-1)*pageSize, toIdx = fromIdx + pageSize - 1;
  const { data, error, count } = await query.range(fromIdx, toIdx);
  if (error) throw error;
  return { rows: data ?? [], total: count ?? 0 };
}

export async function createCommissionRate(rate: { developer_id: string; project_id?: string; percentage: number }) {
  if (rate.percentage < 0 || rate.percentage > 20) {
    throw new Error("Commission percentage must be between 0 and 20");
  }
  const { data, error } = await supabase.from("commission_rates").insert(rate).select().single();
  if (error) throw error;
  return data;
}

export async function updateCommissionRate(id: string, patch: { percentage?: number }) {
  if (patch.percentage && (patch.percentage < 0 || patch.percentage > 20)) {
    throw new Error("Commission percentage must be between 0 and 20");
  }
  const { error } = await supabase.from("commission_rates").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteCommissionRate(id: string) {
  const { error } = await supabase.from("commission_rates").delete().eq("id", id);
  if (error) throw error;
}

// Launches CRUD
export async function listLaunches(params: { page?: number; pageSize?: number; q?: string }) {
  const { page=1, pageSize=20, q } = params ?? {};
  let query = supabase.from("launches").select("*, developers(name), projects(name)", { count: "exact" }).order("launch_date", { ascending: false });
  if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
  const fromIdx = (page-1)*pageSize, toIdx = fromIdx + pageSize - 1;
  const { data, error, count } = await query.range(fromIdx, toIdx);
  if (error) throw error;
  return { rows: data ?? [], total: count ?? 0 };
}

export async function createLaunch(launch: { title: string; description?: string; developer_id: string; project_id?: string; launch_date: string }) {
  const { data, error } = await supabase.from("launches").insert(launch).select().single();
  if (error) throw error;
  return data;
}

export async function updateLaunch(id: string, patch: { title?: string; description?: string; launch_date?: string }) {
  const { error } = await supabase.from("launches").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteLaunch(id: string) {
  const { error } = await supabase.from("launches").delete().eq("id", id);
  if (error) throw error;
}

// Inventory CRUD
export async function listInventory(params: { page?: number; pageSize?: number; q?: string; available?: boolean }) {
  const { page=1, pageSize=20, q, available } = params ?? {};
  let query = supabase.from("inventory_items").select("*, developers(name), projects(name)", { count: "exact" }).order("unit_number");
  if (q) query = query.or(`unit_number.ilike.%${q}%,unit_type.ilike.%${q}%`);
  if (typeof available === "boolean") query = query.eq("is_available", available);
  const fromIdx = (page-1)*pageSize, toIdx = fromIdx + pageSize - 1;
  const { data, error, count } = await query.range(fromIdx, toIdx);
  if (error) throw error;
  return { rows: data ?? [], total: count ?? 0 };
}

export async function createInventoryItem(item: { 
  unit_number: string; 
  unit_type: string; 
  developer_id: string; 
  project_id: string; 
  price?: number; 
  is_available?: boolean 
}) {
  const { data, error } = await supabase.from("inventory_items").insert(item).select().single();
  if (error) throw error;
  return data;
}

export async function updateInventoryItem(id: string, patch: { 
  unit_number?: string; 
  unit_type?: string; 
  price?: number; 
  is_available?: boolean 
}) {
  const { error } = await supabase.from("inventory_items").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteInventoryItem(id: string) {
  const { error } = await supabase.from("inventory_items").delete().eq("id", id);
  if (error) throw error;
}

// Users/Profiles CRUD
export async function listUsers(params: { page?: number; pageSize?: number; q?: string; role?: string }) {
  const { page=1, pageSize=20, q, role } = params ?? {};
  let query = supabase.from("profiles").select("*", { count: "exact" }).order("created_at", { ascending: false });
  if (q) query = query.or(`full_name.ilike.%${q}%,phone.ilike.%${q}%`);
  if (role) query = query.eq("role", role);
  const fromIdx = (page-1)*pageSize, toIdx = fromIdx + pageSize - 1;
  const { data, error, count } = await query.range(fromIdx, toIdx);
  if (error) throw error;
  return { rows: data ?? [], total: count ?? 0 };
}

export async function updateUserRole(id: string, role: string) {
  const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
  if (error) throw error;
}

// Payment Records CRUD
export async function listPaymentRecords(dealId: string) {
  const { data, error } = await supabase
    .from("payment_records")
    .select("*")
    .eq("deal_id", dealId)
    .order("payment_date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addPaymentRecord(payment: {
  deal_id: string;
  amount: number;
  payment_date: string;
  payment_method?: string;
  reference_number?: string;
  notes?: string;
}) {
  const { data, error } = await supabase
    .from("payment_records")
    .insert(payment)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePaymentRecord(id: string, patch: {
  amount?: number;
  payment_date?: string;
  payment_method?: string;
  reference_number?: string;
  notes?: string;
}) {
  const { error } = await supabase
    .from("payment_records")
    .update(patch)
    .eq("id", id);
  if (error) throw error;
}

export async function deletePaymentRecord(id: string) {
  const { error } = await supabase
    .from("payment_records")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// Admin Notifications
export async function listAdminNotifications(params: { page?: number; pageSize?: number; unreadOnly?: boolean }) {
  const { page = 1, pageSize = 20, unreadOnly = false } = params;
  let query = supabase
    .from("admin_notifications")
    .select("*, closed_deals(client_name, deal_value)", { count: "exact" })
    .order("created_at", { ascending: false });
  
  if (unreadOnly) {
    query = query.eq("is_read", false);
  }
  
  const fromIdx = (page - 1) * pageSize;
  const toIdx = fromIdx + pageSize - 1;
  const { data, error, count } = await query.range(fromIdx, toIdx);
  if (error) throw error;
  return { rows: data ?? [], total: count ?? 0 };
}

export async function markNotificationRead(id: string) {
  const { error } = await supabase
    .from("admin_notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function markAllNotificationsRead() {
  const { error } = await supabase
    .from("admin_notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("is_read", false);
  if (error) throw error;
}

// Claim Deal
export async function claimDeal(dealId: string) {
  const { error } = await supabase
    .from("closed_deals")
    .update({
      payment_status: 'claimed',
      claimed_at: new Date().toISOString()
    })
    .eq("id", dealId);
  if (error) throw error;
}

// Get deals ready to claim
export async function getDealsReadyToClaim() {
  const { data, error } = await supabase
    .from("closed_deals")
    .select("*")
    .eq("payment_status", "ready_to_claim")
    .order("ready_to_claim_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// Storage utilities
export async function getStorageUsage() {
  try {
    const { data, error } = await supabase.storage.from("deal-attachments").list();
    if (error) throw error;
    
    const fileCount = data?.length ?? 0;
    // Note: Getting file sizes would require listing each file individually
    // For now, just return file count
    return { fileCount, totalSize: null };
  } catch (error) {
    console.error("Failed to get storage usage:", error);
    return { fileCount: 0, totalSize: null };
  }
}