import { supabase } from "@/lib/supabase";

export async function signInWithEmail(email: string) {
  const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin }});
  if (error) throw error;
  return true;
}
export async function signOut() { await supabase.auth.signOut(); }

export async function getSession() { return supabase.auth.getSession(); }

export async function listApplications() {
  const { data, error } = await supabase.from("partner_applications")
    .select("*").order("created_at", { ascending: false });
  if (error) throw error; return data;
}
export async function listDeals() {
  const { data, error } = await supabase.from("closed_deals")
    .select("*").order("created_at", { ascending: false });
  if (error) throw error; return data;
}

export async function signUrl(path: string) {
  const { data, error } = await supabase.storage.from("deal-attachments").createSignedUrl(path, 60*60);
  if (error) throw error;
  return data.signedUrl;
}
