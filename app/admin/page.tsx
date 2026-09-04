
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Stats = {
  students: number;
  courses: number;
  enrollments: number;
  averageProgress: number;
};

export default function AdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [stats, setStats] = useState<Stats>({
    students: 0,
    courses: 6,
    enrollments: 0,
    averageProgress: 0,
  });
  const [adminEmail, setAdminEmail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAdminDashboard() {
      setLoading(true);
      setError("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/auth/login?redirect=/admin");
        return;
      }

      setAdminEmail(session.user.email || "");

      const { data: adminUser, error: adminError } =
        await supabase
          .from("admin_users")
          .select("user_id")
          .eq("user_id", session.user.id)
          .maybeSingle();

      if (adminError) {
        console.error(adminError);
        setError("Unable to verify admin access.");
        setLoading(false);
        return;
      }

      if (!adminUser) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      setAuthorized(true);

      const { data: enrollments, error: enrollmentError } =
        await supabase
          .from("enrollments")
          .select("user_id, progress");

      if (enrollmentError) {
        console.error(enrollmentError);
        setError("Unable to load enrollment statistics.");
        setLoading(false);
        return;
      }

      const uniqueStudents = new Set(
        (enrollments || []).map((item) => item.user_id)
      );

      const totalEnrollments = enrollments?.length || 0;

      const averageProgress =
        totalEnrollments > 0
          ? Math.round(
              (enrollments || []).reduce(
                (total, item) => total + (item.progress || 0),
                0
              ) / totalEnrollments
            )
          : 0;

      setStats({
        students: uniqueStudents.size,
        courses: 6,
        enrollments: totalEnrollments,
        averageProgress,
      });

      setLoading(false);
    }

    loadAdminDashboard();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/auth/login");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black px-6 py-20 text-white">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="h-10 w-64 rounded-xl bg-white/10" />
          <div className="mt-4 h-5 w-96 max-w-full rounded-xl bg-white/10" />

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <div className="h-36 rounded-3xl bg-white/5" />
            <div className="h-36 rounded-3xl bg-white/5" />
            <div className="h-36 rounded-3xl bg-white/5" />
            <div className="h-36 rounded-3xl bg-white/5" />
          </div>
        </div>
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="min-h-screen bg-black px-6 py-20 text-white">
        <div className="mx-auto max-w-xl text-center">
          <div className="text-6xl">🔒</div>

          <h1 className="mt-6 text-4xl font-black">
            Access Denied
          </h1>

          <p className="mt-4 leading-7 text-white/50">
            You do not have permission to access the
            admin dashboard.
          </p>

          <button
            onClick={() => router.push("/dashboard")}
            className="mt-8 rounded-2xl bg-yellow-400 px-6 py-3 font-black text-black transition hover:bg-yellow-300"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <button
            onClick={() => router.push("/")}
            className="text-2xl font-black tracking-tight"
          >
            <span className="text-white">LPE</span>
            <span className="text-yellow-400">.</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/70 transition hover:bg-white/5 hover:text-white"
            >
              Student Dashboard
            </button>

            <button
              onClick={handleLogout}
              className="rounded-xl bg-yellow-400 px-4 py-2 text-sm font-black text-black transition hover:bg-yellow-300"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        {/* Heading */}
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-yellow-400">
            Administration
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
            Admin Dashboard
          </h1>

          <p className="mt-4 text-base text-white/50">
            Welcome back,{" "}
            <span className="font-semibold text-white/80">
              {adminEmail}
            </span>
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Stats */}
        <section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Students */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition hover:bg-white/[0.06]">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-400/10 text-2xl">
                👥
              </div>

              <span className="text-xs font-bold uppercase tracking-wider text-white/30">
                Users
              </span>
            </div>

            <p className="mt-6 text-4xl font-black">
              {stats.students}
            </p>

            <p className="mt-2 text-sm text-white/40">
              Active Students
            </p>
          </div>

          {/* Courses */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition hover:bg-white/[0.06]">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400/10 text-2xl">
                🎓
              </div>

              <span className="text-xs font-bold uppercase tracking-wider text-white/30">
                Content
              </span>
            </div>

            <p className="mt-6 text-4xl font-black">
              {stats.courses}
            </p>

            <p className="mt-2 text-sm text-white/40">
              Available Courses
            </p>
          </div>

          {/* Enrollments */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition hover:bg-white/[0.06]">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-400/10 text-2xl">
                📚
              </div>

              <span className="text-xs font-bold uppercase tracking-wider text-white/30">
                Activity
              </span>
            </div>

            <p className="mt-6 text-4xl font-black">
              {stats.enrollments}
            </p>

            <p className="mt-2 text-sm text-white/40">
              Total Enrollments
            </p>
          </div>

          {/* Progress */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition hover:bg-white/[0.06]">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-400/10 text-2xl">
                📈
              </div>

              <span className="text-xs font-bold uppercase tracking-wider text-white/30">
                Learning
              </span>
            </div>

            <p className="mt-6 text-4xl font-black">
              {stats.averageProgress}%
            </p>

            <p className="mt-2 text-sm text-white/40">
              Average Progress
            </p>
          </div>
        </section>

        {/* Management */}
        <section className="mt-10">
          <div className="mb-5">
            <h2 className="text-2xl font-black">
              Management
            </h2>

            <p className="mt-1 text-sm text-white/40">
              Manage your Learn Prove Earn platform.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {/* Students */}
            <button
              type="button"
              onClick={() => router.push("/admin/students")}
              className="group rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-left transition hover:border-yellow-400/20 hover:bg-white/[0.06]"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-400/10 text-3xl">
                👥
              </div>

              <h3 className="mt-5 text-xl font-black">
                Students
              </h3>

              <p className="mt-2 text-sm leading-6 text-white/40">
                View registered students and their learning
                activity.
              </p>

              <span className="mt-5 inline-block text-sm font-bold text-yellow-400">
                Manage Students →
              </span>
            </button>

            {/* Courses */}
            <button
              type="button"
              onClick={() => router.push("/admin/courses")}
              className="group rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-left transition hover:border-yellow-400/20 hover:bg-white/[0.06]"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400/10 text-3xl">
                🎓
              </div>

              <h3 className="mt-5 text-xl font-black">
                Courses
              </h3>

              <p className="mt-2 text-sm leading-6 text-white/40">
                Manage courses, course information and future
                content.
              </p>

              <span className="mt-5 inline-block text-sm font-bold text-yellow-400">
                Manage Courses →
              </span>
            </button>

            {/* Enrollments */}
            <button
              type="button"
              onClick={() => router.push("/admin/enrollments")}
              className="group rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-left transition hover:border-yellow-400/20 hover:bg-white/[0.06]"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-400/10 text-3xl">
                📊
              </div>

              <h3 className="mt-5 text-xl font-black">
                Enrollments
              </h3>

              <p className="mt-2 text-sm leading-6 text-white/40">
                Track course enrollments and student progress.
              </p>

              <span className="mt-5 inline-block text-sm font-bold text-yellow-400">
                Manage Enrollments →
              </span>
            </button>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:p-8">
          <h2 className="text-2xl font-black">
            Quick Actions
          </h2>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => router.push("/courses")}
              className="rounded-xl border border-white/10 px-5 py-3 text-sm font-bold text-white/70 transition hover:bg-white/5 hover:text-white"
            >
              📚 View Courses
            </button>

            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-xl border border-white/10 px-5 py-3 text-sm font-bold text-white/70 transition hover:bg-white/5 hover:text-white"
            >
              👨‍🎓 View Student Dashboard
            </button>

            <button
              onClick={() => router.push("/")}
              className="rounded-xl bg-yellow-400 px-5 py-3 text-sm font-black text-black transition hover:bg-yellow-300"
            >
              🏠 View Homepage
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}