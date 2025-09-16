import { supabase } from "@/lib/supabase";

export async function getCommissions() {
  const { data, error } = await supabase
    .from("commission_rates")
    .select("id, percent, notes, developer:developer_id(name)");
  if (error) throw error;
  return data;
}

export async function getLaunches() {
  const { data, error } = await supabase
    .from("launches")
    .select("id, min_price, launch_date, phone, project:project_id(name, developer:developer_id(name))")
    .order("launch_date", { ascending: true });
  if (error) throw error;
  return data;
}

export async function submitApplication(payload: {
  full_name: string; phone: string; company_name: string; agents_count: number; has_papers: boolean;
}) {
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('You must be signed in to submit an application. Please sign in or create an account.');
  }

  const { data, error } = await supabase.from("partner_applications").insert(payload).select().single();
  if (error) throw error;
  
  // Send email notification as backup (in case database trigger fails)
  try {
    const { error: emailError } = await supabase.functions.invoke('send-notification-email', {
      body: {
        type: 'application',
        data: data,
        submitted_at: new Date().toISOString()
      }
    });
    
    if (emailError) {
      console.warn('Email notification failed:', emailError);
      // Don't throw error - form submission should still succeed
    }
  } catch (emailError) {
    console.warn('Email notification request failed:', emailError);
    // Don't throw error - form submission should still succeed
  }
  
  return true;
}

export async function getUserDeals() {
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('You must be signed in to view deals. Please sign in or create an account.');
  }

  // RLS policies will automatically filter to user's own deals
  const { data, error } = await supabase
    .from("closed_deals")
    .select("*")
    .order("created_at", { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function uploadDealFile(file: File) {
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('You must be signed in to upload files. Please sign in or create an account.');
  }

  const path = `deals/${crypto.randomUUID()}-${file.name}`;
  const { error } = await supabase.storage.from("deal-attachments").upload(path, file);
  if (error) throw error;
  return path; // store in DB
}

export async function submitClosedDeal(payload: {
  developer_name: string; project_name: string; client_name: string; unit_code: string;
  dev_sales_name: string; dev_phone: string; deal_value: number; attachmentPaths: string[];
  payment_plan?: {
    downpaymentPercentage: number;
    installmentYears: number;
    installmentFrequency: 'monthly' | 'quarterly' | 'yearly';
    notes?: string;
  };
}) {
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('You must be signed in to submit a deal. Please sign in or create an account.');
  }

  const attachments = payload.attachmentPaths.map((p) => ({ path: p }));
  
  // First, try with payment plan fields (if migration is applied)
  let dealData = {
    developer_name: payload.developer_name,
    project_name: payload.project_name,
    client_name: payload.client_name,
    unit_code: payload.unit_code,
    dev_sales_name: payload.dev_sales_name,
    dev_phone: payload.dev_phone,
    deal_value: payload.deal_value,
    attachments,
    partner_id: user.id, // Automatically assign to current user
    payment_plan: payload.payment_plan || null,
    payment_status: payload.payment_plan ? 'pending' : null,
  };
  
  let { data, error } = await supabase.from("closed_deals").insert(dealData).select().single();
  
  // If payment plan columns don't exist yet, try without them
  if (error && error.message?.includes('column') && (error.message?.includes('payment_plan') || error.message?.includes('payment_status'))) {
    console.warn('Payment plan columns not found. Submitting deal without payment tracking. Please apply the payment plan migration to enable this feature.');
    
    const basicDealData = {
      developer_name: payload.developer_name,
      project_name: payload.project_name,
      client_name: payload.client_name,
      unit_code: payload.unit_code,
      dev_sales_name: payload.dev_sales_name,
      dev_phone: payload.dev_phone,
      deal_value: payload.deal_value,
      attachments,
    };
    
    const result = await supabase.from("closed_deals").insert(basicDealData).select().single();
    data = result.data;
    error = result.error;
  }
  
  if (error) throw error;
  
  // Send email notification as backup (in case database trigger fails)
  try {
    const { error: emailError } = await supabase.functions.invoke('send-notification-email', {
      body: {
        type: 'deal',
        data: data,
        submitted_at: new Date().toISOString()
      }
    });
    
    if (emailError) {
      console.warn('Email notification failed:', emailError);
      // Don't throw error - form submission should still succeed
    }
  } catch (emailError) {
    console.warn('Email notification request failed:', emailError);
    // Don't throw error - form submission should still succeed
  }
  
  return true;
}
