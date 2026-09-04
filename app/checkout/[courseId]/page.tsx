"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const FALLBACK_COURSES: Record<string, { title: string; price: string }> = {
  "1": { title: "Amazon FBA Mastery", price: "5,000" },
  "2": { title: "Shopify Store Mastery", price: "5,000" },
  "3": { title: "AI Automation", price: "5,000" },
  "4": { title: "Digital Marketing Pro", price: "5,000" },
  "5": { title: "YouTube Automation", price: "5,000" },
  "6": { title: "TikTok Automation", price: "5,000" },
};

const PAYMENT_ACCOUNTS = {
  jazzcash: {
    title: "JazzCash",
    accountName: "Safi Ullah Bangash",
    accountNumber: "03XX-XXXXXXX",
    instructions: "Transfer funds via JazzCash App/USSD and enter the 12-digit TID below.",
  },
  easypaisa: {
    title: "EasyPaisa",
    accountName: "Safi Ullah Bangash",
    accountNumber: "03XX-XXXXXXX",
    instructions: "Send payment via EasyPaisa App and enter the Transaction ID.",
  },
  bank: {
    title: "Bank Transfer",
    bankName: "Meezan Bank / HBL",
    accountName: "Safi Ullah Bangash",
    accountNumber: "0101XXXXXXXXXX",
    iban: "PK36MEZN000101XXXXXXXXXX",
    instructions: "Direct bank transfer from any banking app. Enter reference/TID below.",
  },
};

export default function CheckoutPage() {
  const params = useParams<{ courseId: string }>();
  const router = useRouter();
  const courseId = params?.courseId;

  const [course, setCourse] = useState<{ id: string; title: string; price: string } | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<"jazzcash" | "easypaisa" | "bank">("jazzcash");
  const [transactionId, setTransactionId] = useState("");
  const [senderAccount, setSenderAccount] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadCourse() {
      if (!courseId) return;

      try {
        setLoading(true);

        const { data } = await supabase
          .from("courses")
          .select("id, title, price")
          .eq("id", courseId)
          .maybeSingle();

        if (data) {
          setCourse({
            id: data.id,
            title: data.title,
            price: data.price ? String(data.price) : "5,000",
          });
        } else if (FALLBACK_COURSES[courseId]) {
          setCourse({
            id: courseId,
            ...FALLBACK_COURSES[courseId],
          });
        } else {
          setCourse(null);
        }
      } catch (err) {
        console.error("Error loading course:", err);
      } finally {
        setLoading(false);
      }
    }

    loadCourse();
  }, [courseId]);

  async function handleSubmitPayment(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!transactionId.trim()) {
      setError("Please enter the Transaction ID (TID).");
      return;
    }

    try {
      setSubmitting(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push(`/auth/login?redirect=/checkout/${courseId}`);
        return;
      }

      let receiptUrl: string | null = null;

      // 1. Upload Screenshot File to Supabase Storage Bucket
      if (screenshotFile) {
        const fileExt = screenshotFile.name.split(".").pop();
        const fileName = `${session.user.id}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("receipts")
          .upload(filePath, screenshotFile);

        if (uploadError) {
          throw new Error(`Screenshot Upload Failed: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from("receipts")
          .getPublicUrl(filePath);

        receiptUrl = publicUrlData.publicUrl;
      }

      // 2. Insert Payment Record
      const { error: payError } = await supabase.from("payments").insert({
        user_id: session.user.id,
        course_id: courseId,
        amount: Number(course?.price.replace(/[^0-9]/g, "")) || 5000,
        payment_method: selectedMethod,
        sender_account_number: senderAccount.trim() || null,
        transaction_id: transactionId.trim(),
        receipt_url: receiptUrl,
        status: "pending",
      });

      if (payError) throw payError;

      // 3. Mark Enrollment Pending
      await supabase.from("enrollments").upsert({
        user_id: session.user.id,
        course_id: courseId,
        status: "pending",
        progress: 0,
      }, { onConflict: "user_id,course_id" });

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to submit payment request.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#07070a] text-white flex items-center justify-center p-6">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-yellow-400" />
          <p className="text-gray-400 text-sm">Loading Checkout Details...</p>
        </div>
      </main>
    );
  }

  if (!course) {
    return (
      <main className="min-h-screen bg-[#07070a] text-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-6xl font-black mb-4">404</div>
          <h1 className="text-2xl font-bold mb-2">Course Not Found</h1>
          <p className="text-gray-400 text-sm mb-6">The requested course could not be located for checkout.</p>
          <button
            onClick={() => router.push("/courses")}
            className="rounded-xl bg-white px-6 py-3 font-bold text-black hover:bg-white/90"
          >
            ← Back to Courses
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07070a] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() => router.push(`/courses/${courseId}`)}
          className="text-sm text-gray-400 hover:text-white mb-6 block"
        >
          ← Back to Course Details
        </button>

        <h1 className="text-3xl font-bold mb-2">Payment Checkout</h1>
        <p className="text-gray-400 mb-8">Send payment to any of the accounts below to gain course access.</p>

        {/* Course Summary */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">{course.title}</h2>
            <p className="text-sm text-gray-400">Manual Verification Access</p>
          </div>
          <div className="text-2xl font-black text-yellow-400">
            PKR {course.price}
          </div>
        </div>

        {/* Payment Method Tabs */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {(["jazzcash", "easypaisa", "bank"] as const).map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => setSelectedMethod(method)}
              className={`py-3 rounded-xl font-bold border transition ${
                selectedMethod === method
                  ? "border-yellow-400 bg-yellow-400/10 text-yellow-400"
                  : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              {method.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Selected Account Details Box */}
        <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-6 mb-8 space-y-3">
          <h3 className="text-lg font-bold text-yellow-400">
            {PAYMENT_ACCOUNTS[selectedMethod].title} Details
          </h3>
          <div className="text-sm space-y-1 font-mono text-gray-300">
            <p><strong>Account Name:</strong> {PAYMENT_ACCOUNTS[selectedMethod].accountName}</p>
            <p><strong>Account Number:</strong> {PAYMENT_ACCOUNTS[selectedMethod].accountNumber}</p>
            {"iban" in PAYMENT_ACCOUNTS[selectedMethod] && (
              <p><strong>IBAN:</strong> {PAYMENT_ACCOUNTS[selectedMethod].iban}</p>
            )}
          </div>
          <p className="text-xs text-gray-400 pt-2 border-t border-white/10">
            {PAYMENT_ACCOUNTS[selectedMethod].instructions}
          </p>
        </div>

        {/* Submission Form */}
        {success ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center space-y-4">
            <div className="text-5xl">🎉</div>
            <h2 className="text-2xl font-bold text-emerald-400">Payment Request Submitted!</h2>
            <p className="text-gray-300 text-sm">
              Your transaction is being verified. As soon as the payment is confirmed, your course will be activated on your dashboard.
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="mt-4 rounded-xl bg-yellow-400 px-6 py-3 font-bold text-black hover:bg-yellow-300"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitPayment} className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">{error}</div>}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Transaction ID (TID) *
              </label>
              <input
                type="text"
                placeholder="e.g., 123456789012"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 outline-none focus:border-yellow-400 font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Your Account / Mobile Number (Optional)
              </label>
              <input
                type="text"
                placeholder="Sender phone/account number"
                value={senderAccount}
                onChange={(e) => setSenderAccount(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 outline-none focus:border-yellow-400 text-sm"
              />
            </div>

            {/* SCREENSHOT UPLOAD INPUT */}
            <div className="rounded-xl border border-dashed border-white/20 p-4 text-center bg-black/30">
              <label className="block text-sm font-medium text-yellow-400 mb-2 cursor-pointer">
                📷 Upload Payment Receipt Screenshot (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setScreenshotFile(e.target.files?.[0] || null)}
                className="block w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-yellow-400 file:text-black hover:file:bg-yellow-300 cursor-pointer"
              />
              {screenshotFile && (
                <p className="mt-2 text-xs text-emerald-400 font-mono">
                  Selected: {screenshotFile.name}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-yellow-400 py-4 font-black text-black hover:bg-yellow-300 disabled:opacity-50"
            >
              {submitting ? "Uploading & Submitting..." : "Submit Payment for Verification"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}