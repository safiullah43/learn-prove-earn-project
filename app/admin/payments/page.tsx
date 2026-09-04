"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type PaymentRecord = {
  id: string;
  user_id: string;
  course_id: string;
  amount: number;
  payment_method: string;
  sender_account_number: string | null;
  transaction_id: string;
  status: string;
  created_at: string;
  courses?: {
    title: string;
  } | null;
};

export default function AdminPaymentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    checkAdminAndLoadPayments();
  }, []);

  async function checkAdminAndLoadPayments() {
    try {
      setLoading(true);
      setError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

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

      await loadPayments();
    } catch (err: any) {
      setError(err.message || "Failed to load payment records.");
    } finally {
      setLoading(false);
    }
  }

  async function loadPayments() {
    const { data, error: payErr } = await supabase
      .from("payments")
      .select(`
        id,
        user_id,
        course_id,
        amount,
        payment_method,
        sender_account_number,
        transaction_id,
        status,
        created_at,
        courses ( title )
      `)
      .order("created_at", { ascending: false });

    if (payErr) {
      setError(payErr.message);
      return;
    }

    setPayments((data as unknown as PaymentRecord[]) || []);
  }

  async function handleApprove(payment: PaymentRecord) {
    try {
      setProcessingId(payment.id);
      setError("");
      setSuccess("");

      // 1. Update Payment Status to Approved
      const { error: payErr } = await supabase
        .from("payments")
        .update({ status: "approved", updated_at: new Date().toISOString() })
        .eq("id", payment.id);

      if (payErr) throw payErr;

      // 2. Activate Enrollment for the student
      const { error: enrollErr } = await supabase
        .from("enrollments")
        .upsert(
          {
            user_id: payment.user_id,
            course_id: payment.course_id,
            status: "active",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,course_id" }
        );

      if (enrollErr) throw enrollErr;

      setSuccess(`Payment ${payment.transaction_id} approved successfully! Student enrolled.`);
      await loadPayments();
    } catch (err: any) {
      setError(err.message || "Failed to approve payment.");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(paymentId: string) {
    try {
      setProcessingId(paymentId);
      setError("");
      setSuccess("");

      const { error: payErr } = await supabase
        .from("payments")
        .update({ status: "rejected", updated_at: new Date().toISOString() })
        .eq("id", paymentId);

      if (payErr) throw payErr;

      setSuccess("Payment request rejected.");
      await loadPayments();
    } catch (err: any) {
      setError(err.message || "Failed to reject payment.");
    } finally {
      setProcessingId(null);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-yellow-400" />
          <p className="text-slate-400">Loading payment panel...</p>
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
              Payment Verification Center
            </h1>
            <p className="mt-1 text-slate-400 text-sm">
              Verify local JazzCash, EasyPaisa, and Bank Transfer TIDs to grant student access.
            </p>
          </div>

          <button
            onClick={loadPayments}
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold hover:bg-slate-800"
          >
            🔄 Refresh Payments
          </button>
        </div>

        {/* Notifications */}
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

        {/* Payment Records Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/60 text-slate-400 uppercase text-xs tracking-wider">
                <tr>
                  <th className="p-4">Date</th>
                  <th className="p-4">Course</th>
                  <th className="p-4">Method</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Transaction ID (TID)</th>
                  <th className="p-4">Sender Phone/Acct</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500">
                      No payment submissions found yet.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-4 text-xs text-slate-400 whitespace-nowrap">
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 font-bold text-white">
                        {p.courses?.title || p.course_id}
                      </td>
                      <td className="p-4 uppercase text-xs font-mono text-yellow-400">
                        {p.payment_method}
                      </td>
                      <td className="p-4 font-bold text-emerald-400">
                        PKR {p.amount}
                      </td>
                      <td className="p-4 font-mono text-purple-300 font-semibold select-all">
                        {p.transaction_id}
                      </td>
                      <td className="p-4 text-slate-300">
                        {p.sender_account_number || "-"}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                            p.status === "approved"
                              ? "bg-emerald-500/15 text-emerald-400"
                              : p.status === "rejected"
                              ? "bg-red-500/15 text-red-400"
                              : "bg-yellow-500/15 text-yellow-400"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        {p.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(p)}
                              disabled={processingId === p.id}
                              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50"
                            >
                              {processingId === p.id ? "Approving..." : "Approve"}
                            </button>
                            <button
                              onClick={() => handleReject(p.id)}
                              disabled={processingId === p.id}
                              className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/30 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
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