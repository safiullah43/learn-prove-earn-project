"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type EnrollmentButtonProps = {
  courseId: string;
};

export default function EnrollmentButton({
  courseId,
}: EnrollmentButtonProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkEnrollment() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("enrollments")
        .select("id, status")
        .eq("user_id", session.user.id)
        .eq("course_id", courseId)
        .maybeSingle();

      if (!error && data && data.status !== "cancelled") {
        setEnrolled(true);
      }

      setLoading(false);
    }

    checkEnrollment();
  }, [courseId]);

  async function handleEnroll() {
    setError("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push(`/auth/login?redirect=/courses/${courseId}`);
      return;
    }

    setEnrolling(true);

    const { error: enrollError } = await supabase
      .from("enrollments")
      .insert({
        user_id: session.user.id,
        course_id: courseId,
        status: "active",
        progress: 0,
      });

    if (enrollError) {
      if (enrollError.code === "23505") {
        setEnrolled(true);
        setEnrolling(false);

        // Already enrolled → go directly to learning
        router.push(`/courses/${courseId}/learn`);
        return;
      }

      setError(
        enrollError.message ||
          "Enrollment failed. Please try again."
      );

      setEnrolling(false);
      return;
    }

    setEnrolled(true);
    setEnrolling(false);

    // Successfully enrolled → start learning
    router.push(`/courses/${courseId}/learn`);
  }

  function handleContinueLearning() {
    router.push(`/courses/${courseId}/learn`);
  }

  if (loading) {
    return (
      <button
        type="button"
        disabled
        className="mt-6 block w-full rounded-2xl bg-yellow-400/60 px-5 py-4 text-center font-black text-black/60"
      >
        Checking Access...
      </button>
    );
  }

  if (enrolled) {
    return (
      <div className="mt-6">
        <div className="block w-full rounded-2xl border border-green-400/20 bg-green-400/10 px-5 py-4 text-center font-black text-green-400">
          ✓ Enrolled
        </div>

        <button
          type="button"
          onClick={handleContinueLearning}
          className="mt-3 block w-full rounded-2xl bg-yellow-400 px-5 py-4 text-center font-black text-black transition hover:bg-yellow-300 hover:scale-[1.01]"
        >
          Continue Learning →
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={handleEnroll}
        disabled={enrolling}
        className="block w-full rounded-2xl bg-yellow-400 px-5 py-4 text-center font-black text-black transition hover:bg-yellow-300 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
      >
        {enrolling ? "Enrolling..." : "Enroll Now →"}
      </button>

      {error && (
        <div className="mt-3 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm leading-6 text-red-300">
          {error}
        </div>
      )}
    </div>
  );
}