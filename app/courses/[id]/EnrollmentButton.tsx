"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type EnrollmentButtonProps = {
  courseId: string;
};

export default function EnrollmentButton({ courseId }: EnrollmentButtonProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [pendingPayment, setPendingPayment] = useState(false);

  useEffect(() => {
    async function checkEnrollmentAndPayment() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          setLoading(false);
          return;
        }

        // Check active enrollment
        const { data: enrollment } = await supabase
          .from("enrollments")
          .select("id, status")
          .eq("user_id", session.user.id)
          .eq("course_id", courseId)
          .maybeSingle();

        if (enrollment && enrollment.status === "active") {
          setEnrolled(true);
          setLoading(false);
          return;
        }

        // Check pending payment
        const { data: payment } = await supabase
          .from("payments")
          .select("id, status")
          .eq("user_id", session.user.id)
          .eq("course_id", courseId)
          .eq("status", "pending")
          .maybeSingle();

        if (payment) {
          setPendingPayment(true);
        }
      } catch (err) {
        console.error("Error checking access:", err);
      } finally {
        setLoading(false);
      }
    }

    checkEnrollmentAndPayment();
  }, [courseId]);

  async function handleEnrollClick() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push(`/auth/login?redirect=/checkout/${courseId}`);
      return;
    }

    router.push(`/checkout/${courseId}`);
  }

  function handleContinueLearning() {
    router.push(`/courses/${courseId}/learn`);
  }

  if (loading) {
    return (
      <button
        type="button"
        disabled
        className="mt-6 block w-full rounded-2xl bg-yellow-400/60 px-5 py-4 text-center font-black text-black/60 cursor-not-allowed"
      >
        Checking Access...
      </button>
    );
  }

  if (enrolled) {
    return (
      <div className="mt-6 space-y-3">
        <div className="block w-full rounded-2xl border border-green-400/20 bg-green-400/10 px-5 py-4 text-center font-black text-green-400">
          ✓ Active Enrollment
        </div>

        <button
          type="button"
          onClick={handleContinueLearning}
          className="block w-full rounded-2xl bg-yellow-400 px-5 py-4 text-center font-black text-black transition hover:bg-yellow-300 hover:scale-[1.01]"
        >
          Continue Learning →
        </button>
      </div>
    );
  }

  if (pendingPayment) {
    return (
      <div className="mt-6 space-y-3">
        <div className="block w-full rounded-2xl border border-yellow-400/30 bg-yellow-400/10 px-5 py-4 text-center font-bold text-yellow-300 text-sm">
          ⏳ Payment Verification Pending
        </div>
        <p className="text-xs text-center text-white/50">
          Your transaction is being reviewed by the admin.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={handleEnrollClick}
        className="block w-full rounded-2xl bg-yellow-400 px-5 py-4 text-center font-black text-black transition hover:bg-yellow-300 hover:scale-[1.01]"
      >
        Enroll Now →
      </button>
    </div>
  );
}