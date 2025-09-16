import { useEffect, useState } from "react";
import { signInWithEmail, signOut, getSession, listApplications, listDeals, signUrl } from "@/api/admin";
import { supabase } from "@/lib/supabase";

export default function Admin() {
  const [email, setEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [apps, setApps] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await getSession();
      if (!data.session) { setIsAdmin(false); return; }
      const { data: prof, error } = await supabase
        .from("profiles").select("role").eq("id", data.session.user.id).maybeSingle();
      if (error) { setIsAdmin(false); return; }
      setIsAdmin(prof?.role === "admin");
      if (prof?.role === "admin") {
        const appsData = await listApplications({});
        const dealsData = await listDeals({});
        setApps(appsData.rows);
        setDeals(dealsData.rows);
      }
    })();
  }, []);

  if (isAdmin === null) return <div className="p-4">Loading…</div>;

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md p-4">
        <h1 className="text-2xl font-semibold mb-2">Admin Sign-In</h1>
        <p className="muted mb-4">Enter your email to receive a magic link.</p>
        <div className="space-y-2">
          <input className="input w-full" placeholder="you@company.com" value={email} onChange={e=>setEmail(e.target.value)} />
          <button className="btn w-full" onClick={async ()=>{ await signInWithEmail(email); alert("Check your email for the magic link."); }}>
            Send Magic Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 mx-auto max-w-5xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <button className="btn-ghost" onClick={signOut}>Logout</button>
      </div>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Partner Applications</h2>
        <div className="card">
          <table className="w-full text-sm">
            <thead><tr><th>Name</th><th>Phone</th><th>Company</th><th>Agents</th><th>Papers</th><th>Date</th></tr></thead>
            <tbody>
              {apps.map(a=>(
                <tr key={a.id} className="border-t border-neutral-200">
                  <td>{a.full_name}</td><td>{a.phone}</td><td>{a.company_name}</td>
                  <td>{a.agents_count}</td><td>{a.has_papers ? "Yes":"No"}</td>
                  <td>{new Date(a.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Closed Deals</h2>
        <div className="card">
          <table className="w-full text-sm">
            <thead><tr><th>Developer</th><th>Project</th><th>Client</th><th>Value</th><th>Files</th><th>Date</th></tr></thead>
            <tbody>
              {deals.map(d=>(
                <tr key={d.id} className="border-t border-neutral-200">
                  <td>{d.developer_name}</td><td>{d.project_name}</td><td>{d.client_name}</td>
                  <td>{Number(d.deal_value).toLocaleString()} EGP</td>
                  <td className="space-x-2">
                    {(d.attachments??[]).map((a:any, i:number)=>(
                      <button key={i} className="link" onClick={async ()=>{
                        const url = await signUrl(a.path);
                        window.open(url, "_blank");
                      }}>File {i+1}</button>
                    ))}
                  </td>
                  <td>{new Date(d.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
