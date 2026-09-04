"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Enrollment = {
  id: string;
  user_id: string;
  course_id: string;
  status: string;
  progress: number;
  enrolled_at: string;
};

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
};

const courseNames: Record<string, string> = {
  "1": "Amazon FBA Mastery",
  "2": "Shopify Store Mastery",
  "3": "AI Automation",
  "4": "Digital Marketing Pro",
  "5": "YouTube Automation",
  "6": "TikTok Automation",
};

export default function AdminEnrollmentsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadEnrollments();
  }, []);

  async function loadEnrollments() {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/auth/login?redirect=/admin/enrollments");
        return;
      }

      const { data: adminUser, error: adminError } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (adminError || !adminUser) {
        router.replace("/dashboard");
        return;
      }

      setAuthorized(true);

      const { data: enrollmentData, error: enrollmentError } =
        await supabase
          .from("enrollments")
          .select(
            "id, user_id, course_id, status, progress, enrolled_at"
          )
          .order("enrolled_at", { ascending: false });

      if (enrollmentError) {
        console.error(enrollmentError);
        return;
      }

      const { data: profileData, error: profileError } =
        await supabase
          .from("profiles")
          .select("id, full_name, email");

      if (profileError) {
        console.error(profileError);
      }

      setEnrollments(enrollmentData || []);
      setProfiles(profileData || []);
    } catch (error) {
      console.error("Enrollment loading error:", error);
    } finally {
      setLoading(false);
    }
  }

  function getProfile(userId: string) {
    return profiles.find((profile) => profile.id === userId);
  }

  function getCourseName(courseId: string) {
    return courseNames[courseId] || `Course ${courseId}`;
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  const filteredEnrollments = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return enrollments;
    }

    return enrollments.filter((enrollment) => {
      const profile = getProfile(enrollment.user_id);

      const name = profile?.full_name?.toLowerCase() || "";
      const email = profile?.email?.toLowerCase() || "";
      const course = getCourseName(enrollment.course_id).toLowerCase();
      const courseId = enrollment.course_id.toLowerCase();
      const userId = enrollment.user_id.toLowerCase();
      const status = enrollment.status.toLowerCase();

      return (
        name.includes(value) ||
        email.includes(value) ||
        course.includes(value) ||
        courseId.includes(value) ||
        userId.includes(value) ||
        status.includes(value)
      );
    });
  }, [search, enrollments, profiles]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black px-6 py-20 text-white">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="h-10 w-72 rounded-xl bg-white/10" />
          <div className="mt-4 h-5 w-96 max-w-full rounded-xl bg-white/10" />

          <div className="mt-10 h-96 rounded-3xl bg-white/5" />
        </div>
      </main>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <button
            onClick={() => router.push("/admin")}
            className="text-2xl font-black tracking-tight"
          >
            <span className="text-white">LPE</span>
            <span className="text-yellow-400">.</span>
          </button>

          <button
            onClick={() => router.push("/admin")}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/70 transition hover:bg-white/5 hover:text-white"
          >
            ← Admin Dashboard
          </button>
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
            Enrollment Management
          </h1>

          <p className="mt-4 text-base text-white/50">
            Monitor student enrollments and learning progress.
          </p>
        </div>

        {/* Stats */}
        <section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <div className="text-2xl">📚</div>

            <p className="mt-5 text-4xl font-black">
              {enrollments.length}
            </p>

            <p className="mt-2 text-sm text-white/40">
              Total Enrollments
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <div className="text-2xl">👥</div>

            <p className="mt-5 text-4xl font-black">
              {new Set(enrollments.map((item) => item.user_id)).size}
            </p>

            <p className="mt-2 text-sm text-white/40">
              Enrolled Students
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <div className="text-2xl">✅</div>

            <p className="mt-5 text-4xl font-black">
              {
                enrollments.filter(
                  (item) =>
                    item.status === "completed" ||
                    item.progress >= 100
                ).length
              }
            </p>

            <p className="mt-2 text-sm text-white/40">
              Completed Courses
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <div className="text-2xl">📈</div>

            <p className="mt-5 text-4xl font-black">
              {enrollments.length > 0
                ? Math.round(
                    enrollments.reduce(
                      (total, item) => total + (item.progress || 0),
                      0
                    ) / enrollments.length
                  )
                : 0}
              %
            </p>

            <p className="mt-2 text-sm text-white/40">
              Average Progress
            </p>
          </div>
        </section>

        {/* Search */}
        <section className="mt-10">
          <input
            type="text"
            placeholder="Search student, email, course, ID or status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-white outline-none placeholder:text-white/30 focus:border-yellow-400/40"
          />
        </section>

        {/* Enrollment Table */}
        <section className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left">
              <thead className="border-b border-white/10 bg-white/[0.03]">
                <tr>
                  <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-white/40">
                    Student
                  </th>

                  <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-white/40">
                    Course
                  </th>

                  <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-white/40">
                    Progress
                  </th>

                  <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-white/40">
                    Status
                  </th>

                  <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-white/40">
                    Enrolled
                  </th>

                  <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-white/40">
                    User ID
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredEnrollments.map((enrollment) => {
                  const profile = getProfile(enrollment.user_id);

                  return (
                    <tr
                      key={enrollment.id}
                      className="border-b border-white/5 transition hover:bg-white/[0.03]"
                    >
                      <td className="px-6 py-5">
                        <p className="font-bold">
                          {profile?.full_name || "Unnamed Student"}
                        </p>

                        <p className="mt-1 text-sm text-white/40">
                          {profile?.email || "Email unavailable"}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <p className="font-semibold">
                          {getCourseName(enrollment.course_id)}
                        </p>

                        <p className="mt-1 text-xs text-white/30">
                          Course ID: {enrollment.course_id}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <div className="w-36">
                          <div className="mb-2 flex justify-between text-xs">
                            <span className="text-white/40">
                              Progress
                            </span>

                            <span className="font-bold">
                              {enrollment.progress || 0}%
                            </span>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full bg-yellow-400"
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.max(
                                    0,
                                    enrollment.progress || 0
                                  )
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        {enrollment.status === "completed" ||
                        enrollment.progress >= 100 ? (
                          <span className="rounded-full bg-green-400/10 px-3 py-1 text-xs font-bold text-green-400">
                            Completed
                          </span>
                        ) : enrollment.status === "cancelled" ? (
                          <span className="rounded-full bg-red-400/10 px-3 py-1 text-xs font-bold text-red-400">
                            Cancelled
                          </span>
                        ) : (
                          <span className="rounded-full bg-blue-400/10 px-3 py-1 text-xs font-bold text-blue-400">
                            Active
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-5 text-sm text-white/60">
                        {formatDate(enrollment.enrolled_at)}
                      </td>

                      <td className="px-6 py-5">
                        <span className="font-mono text-xs text-white/30">
                          {enrollment.user_id.slice(0, 8)}...
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredEnrollments.length === 0 && (
            <div className="px-6 py-16 text-center">
              <div className="text-5xl">📭</div>

              <h2 className="mt-5 text-xl font-black">
                No Enrollments Found
              </h2>

              <p className="mt-2 text-sm text-white/40">
                There are no enrollments matching your search.
              </p>
            </div>
          )}
        </section>

        {/* Footer Note */}
        <p className="mt-5 text-center text-xs text-white/25">
          Showing {filteredEnrollments.length} of{" "}
          {enrollments.length} enrollments
        </p>
      </div>
    </main>
  );
}