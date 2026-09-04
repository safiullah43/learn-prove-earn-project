"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type CompletedEnrollment = {
  id: string;
  user_id: string;
  course_id: string;
  progress: number;
  certificate_issued: boolean;
  certificate_url: string | null;
  created_at: string;
  courses?: {
    title: string;
  } | null;
};

export default function AdminCertificatesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [enrollments, setEnrollments] = useState<CompletedEnrollment[]>([]);
  const [certUrls, setCertUrls] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

  async function checkAdminAndLoadData() {
    try {
      setLoading(true);
      setError("");

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data: adminUser } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!adminUser) {
        router.push("/dashboard");
        return;
      }

      await loadCompletedEnrollments();
    } catch (err: any) {
      setError(err.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }

  async function loadCompletedEnrollments() {
    const { data, error: fetchErr } = await supabase
      .from("enrollments")
      .select(`
        id,
        user_id,
        course_id,
        progress,
        certificate_issued,
        certificate_url,
        created_at,
        courses ( title )
      `)
      .gte("progress", 100)
      .order("created_at", { ascending: false });

    if (fetchErr) {
      setError(fetchErr.message);
      return;
    }

    setEnrollments((data as unknown as CompletedEnrollment[]) || []);
  }

  async function handleIssueCertificate(item: CompletedEnrollment) {
    try {
      setProcessingId(item.id);
      setError("");
      setSuccess("");

      const urlToSave = certUrls[item.id] || item.certificate_url || null;

      const { error: updateErr } = await supabase
        .from("enrollments")
        .update({
          certificate_issued: true,
          certificate_url: urlToSave,
          certificate_issued_at: new Date().toISOString(),
        })
        .eq("id", item.id);

      if (updateErr) throw updateErr;

      setSuccess(`Certificate issued successfully!`);
      await loadCompletedEnrollments();
    } catch (err: any) {
      setError(err.message || "Failed to issue certificate.");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleRevokeCertificate(itemId: string) {
    try {
      setProcessingId(itemId);
      setError("");
      setSuccess("");

      const { error: updateErr } = await supabase
        .from("enrollments")
        .update({
          certificate_issued: false,
          certificate_url: null,
        })
        .eq("id", itemId);

      if (updateErr) throw updateErr;

      setSuccess("Certificate status revoked.");
      await loadCompletedEnrollments();
    } catch (err: any) {
      setError(err.message || "Failed to revoke certificate.");
    } finally {
      setProcessingId(null);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-yellow-400" />
          <p className="text-slate-400">Loading certificate control panel...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              onClick={() => router.push("/admin/courses")}
              className="mb-2 text-sm text-slate-400 hover:text-white"
            >
              ← Back to Admin Dashboard
            </button>
            <h1 className="text-3xl font-bold tracking-tight">
              Certificate Approvals & Management
            </h1>
            <p className="mt-1 text-slate-400 text-sm">
              Review 100% course completions and manually issue custom certificate links.
            </p>
          </div>

          <button
            onClick={loadCompletedEnrollments}
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold hover:bg-slate-800"
          >
            🔄 Refresh List
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
            {success}
          </div>
        )}

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/60 text-slate-400 uppercase text-xs tracking-wider">
                <tr>
                  <th className="p-4">Student User ID</th>
                  <th className="p-4">Course Title</th>
                  <th className="p-4">Progress</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Custom Certificate URL / PDF Drive Link</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {enrollments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No students have completed 100% progress yet.
                    </td>
                  </tr>
                ) : (
                  enrollments.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-4 font-mono text-xs text-slate-300 select-all">
                        {item.user_id}
                      </td>
                        <td className="p-4 font-bold text-white">
                        {item.courses?.title || item.course_id}
                      </td>
                      <td className="p-4 font-bold text-emerald-400">
                        {item.progress}%
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                            item.certificate_issued
                              ? "bg-emerald-500/15 text-emerald-400"
                              : "bg-yellow-500/15 text-yellow-400"
                          }`}
                        >
                          {item.certificate_issued ? "Issued" : "Pending Approval"}
                        </span>
                      </td>
                      <td className="p-4">
                        <input
                          type="text"
                          placeholder="Paste PDF link or Drive URL"
                          value={certUrls[item.id] ?? (item.certificate_url || "")}
                          onChange={(e) =>
                            setCertUrls({ ...certUrls, [item.id]: e.target.value })
                          }
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white outline-none focus:border-yellow-400"
                        />
                      </td>
                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleIssueCertificate(item)}
                          disabled={processingId === item.id}
                          className="rounded-lg bg-yellow-400 px-3 py-1.5 text-xs font-bold text-black hover:bg-yellow-300 disabled:opacity-50"
                        >
                          {processingId === item.id
                            ? "Saving..."
                            : item.certificate_issued
                            ? "Update Link"
                            : "Issue Certificate"}
                        </button>
                        {item.certificate_issued && (
                          <button
                            onClick={() => handleRevokeCertificate(item.id)}
                            disabled={processingId === item.id}
                            className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/30 disabled:opacity-50"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}