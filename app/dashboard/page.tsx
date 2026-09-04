"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

type Enrollment = {
  id: string;
  course_id: string;
  status: string;
  progress: number;
  enrolled_at: string;
  certificate_issued?: boolean;
  certificate_url?: string | null;
  course_title?: string;
  course_description?: string;
};

const fallbackNames: Record<string, string> = {
  "1": "Amazon FBA Mastery",
  "2": "Shopify Store Mastery",
  "3": "AI Automation",
  "4": "Digital Marketing Pro",
  "5": "YouTube Automation",
  "6": "TikTok Automation",
};

const fallbackDescriptions: Record<string, string> = {
  "1": "Build and scale a profitable Amazon FBA business.",
  "2": "Learn how to build, launch and grow your Shopify store.",
  "3": "Master AI tools and automation for modern businesses.",
  "4": "Learn powerful digital marketing strategies.",
  "5": "Build automated YouTube channels and grow your audience.",
  "6": "Learn TikTok automation and content growth strategies.",
};

const courseIcons: Record<string, string> = {
  "1": "📦",
  "2": "🛍️",
  "3": "🤖",
  "4": "📈",
  "5": "▶️",
  "6": "🎵",
};

export default function DashboardPage() {
  const router = useRouter();

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [enrollmentLoading, setEnrollmentLoading] = useState(true);

  useEffect(() => {
    async function checkUserAndLoadData() {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.replace("/auth/login");
        return;
      }

      setSession(data.session);

      // Fetch student enrollments along with certificate fields
      const { data: enrollmentData, error } = await supabase
        .from("enrollments")
        .select("id, course_id, status, progress, enrolled_at, certificate_issued, certificate_url")
        .eq("user_id", data.session.user.id)
        .neq("status", "cancelled")
        .order("enrolled_at", { ascending: false });

      if (!error && enrollmentData) {
        // Fetch real course details from Supabase courses table for active IDs
        const courseIds = enrollmentData.map((e) => e.course_id);
        
        let coursesMap: Record<string, { title: string; description: string }> = {};

        if (courseIds.length > 0) {
          const { data: dbCourses } = await supabase
            .from("courses")
            .select("id, title, description")
            .in("id", courseIds);

          if (dbCourses) {
            dbCourses.forEach((c) => {
              coursesMap[c.id] = {
                title: c.title,
                description: c.description || "",
              };
            });
          }
        }

        const formattedEnrollments: Enrollment[] = enrollmentData.map((item) => ({
          ...item,
          course_title:
            coursesMap[item.course_id]?.title ||
            fallbackNames[item.course_id] ||
            `Course ${item.course_id}`,
          course_description:
            coursesMap[item.course_id]?.description ||
            fallbackDescriptions[item.course_id] ||
            "Continue your learning journey.",
        }));

        setEnrollments(formattedEnrollments);
      }

      setEnrollmentLoading(false);
      setLoading(false);
    }

    checkUserAndLoadData();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#060913] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl font-black">
            LPE<span className="text-yellow-400">.</span>
          </div>

          <p className="mt-3 text-white/40">Loading dashboard...</p>
        </div>
      </main>
    );
  }

  const fullName =
    session?.user?.user_metadata?.full_name ||
    session?.user?.email?.split("@")[0] ||
    "User";

  const email = session?.user?.email || "";

  const totalProgress =
    enrollments.length > 0
      ? Math.round(
          enrollments.reduce(
            (total, course) => total + course.progress,
            0
          ) / enrollments.length
        )
      : 0;

  return (
    <main className="min-h-screen bg-[#060913] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          {/* Logo */}
          <Link href="/" className="text-2xl font-black">
            LPE<span className="text-yellow-400">.</span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-3">
            {/* Homepage Button */}
            <Link
              href="/"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              🏠 Homepage
            </Link>

            {/* Courses Button */}
            <Link
              href="/courses"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              📚 Courses
            </Link>

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl bg-yellow-400 px-4 py-2 text-sm font-black text-black transition hover:bg-yellow-300"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        {/* Welcome */}
        <div className="mb-10">
          <p className="text-sm font-bold tracking-wider text-yellow-400">
            YOUR DASHBOARD
          </p>

          <h1 className="mt-2 text-4xl font-black md:text-5xl">
            Welcome, {fullName} 👋
          </h1>

          <p className="mt-3 text-white/40">{email}</p>
        </div>

        {/* Dashboard Metric Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* My Learning */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7">
            <div className="text-4xl">📚</div>

            <h2 className="mt-5 text-xl font-black">My Learning</h2>

            <p className="mt-2 text-sm leading-6 text-white/45">
              Your enrolled courses and learning progress.
            </p>

            <div className="mt-5">
              {enrollmentLoading ? (
                <p className="text-sm text-white/40">Loading your courses...</p>
              ) : enrollments.length === 0 ? (
                <div>
                  <p className="text-sm text-white/40">
                    You haven't enrolled in any course yet.
                  </p>

                  <Link
                    href="/courses"
                    className="mt-5 inline-block text-sm font-bold text-yellow-400"
                  >
                    Explore Courses →
                  </Link>
                </div>
              ) : (
                <p className="text-sm font-bold text-yellow-400">
                  {enrollments.length}{" "}
                  {enrollments.length === 1 ? "Course" : "Courses"} Enrolled ✓
                </p>
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7">
            <div className="text-4xl">📈</div>

            <h2 className="mt-5 text-xl font-black">Your Progress</h2>

            <p className="mt-2 text-sm leading-6 text-white/45">
              Your overall learning progress.
            </p>

            <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-yellow-400 transition-all duration-500"
                style={{
                  width: `${totalProgress}%`,
                }}
              />
            </div>

            <p className="mt-2 text-xs text-white/30">
              {enrollments.length > 0
                ? `${totalProgress}% overall progress`
                : "Getting started"}
            </p>
          </div>

          {/* Profile */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7">
            <div className="text-4xl">👤</div>

            <h2 className="mt-5 text-xl font-black">My Profile</h2>

            <p className="mt-2 text-sm leading-6 text-white/45">
              Your profile and achievements will appear here.
            </p>

            <div className="mt-6 text-sm font-semibold text-white/60">
              Account Active ✓
            </div>
          </div>
        </div>

        {/* My Enrolled Courses */}
        <div className="mt-10">
          <div className="mb-6">
            <p className="text-sm font-bold tracking-wider text-yellow-400">
              MY LEARNING
            </p>

            <h2 className="mt-2 text-3xl font-black">Your Enrolled Courses</h2>

            <p className="mt-2 text-sm text-white/40">
              Continue learning from where you left off.
            </p>
          </div>

          {enrollmentLoading ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
              <p className="text-white/40">Loading courses...</p>
            </div>
          ) : enrollments.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center">
              <div className="text-5xl">📚</div>

              <h3 className="mt-5 text-xl font-black">No courses yet</h3>

              <p className="mt-2 text-sm text-white/40">
                Start learning by enrolling in your first course.
              </p>

              <Link
                href="/courses"
                className="mt-6 inline-block rounded-xl bg-yellow-400 px-6 py-3 text-sm font-black text-black transition hover:bg-yellow-300"
              >
                Browse Courses →
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {enrollments.map((enrollment) => {
                const icon = courseIcons[enrollment.course_id] || "🎓";
                const isCompleted = enrollment.progress >= 100;

                return (
                  <div
                    key={enrollment.id}
                    className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 transition hover:border-yellow-400/20 hover:bg-white/[0.06]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400/10 text-3xl">
                          {icon}
                        </div>

                        <div>
                          <h3 className="text-xl font-black">
                            {enrollment.course_title}
                          </h3>

                          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-yellow-400">
                            {enrollment.status}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-xl border border-yellow-400/20 bg-yellow-400/10 px-3 py-2 text-sm font-black text-yellow-400">
                        {enrollment.progress}%
                      </div>
                    </div>

                    <p className="mt-5 text-sm leading-6 text-white/45">
                      {enrollment.course_description}
                    </p>

                    {/* Progress Bar */}
                    <div className="mt-6">
                      <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="text-white/40">Course Progress</span>

                        <span className="font-bold text-white/60">
                          {enrollment.progress}%
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-yellow-400 transition-all duration-500"
                          style={{
                            width: `${enrollment.progress}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Action Area: Continue Learning OR Admin Certificate Status */}
                    <div className="mt-6">
                      {isCompleted ? (
                        enrollment.certificate_issued && enrollment.certificate_url ? (
                          <a
                            href={enrollment.certificate_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block rounded-xl bg-emerald-500 px-5 py-3 text-center text-sm font-black text-black transition hover:bg-emerald-400"
                          >
                            🎓 Download Official Certificate
                          </a>
                        ) : (
                          <div className="rounded-xl border border-yellow-400/20 bg-yellow-400/10 p-3.5 text-center text-xs font-bold text-yellow-300">
                            🎓 Course 100% Completed! Certificate Pending Admin Review & Approval.
                          </div>
                        )
                      ) : (
                        <Link
                          href={`/courses/${enrollment.course_id}/learn`}
                          className="block rounded-xl bg-yellow-400 px-5 py-3 text-center text-sm font-black text-black transition hover:bg-yellow-300"
                        >
                          Continue Learning →
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="mt-10 rounded-3xl border border-yellow-400/10 bg-yellow-400/[0.04] p-8">
          <p className="text-sm font-bold tracking-wider text-yellow-400">
            LEARN • PROVE • EARN
          </p>

          <h2 className="mt-2 text-2xl font-black">
            Your journey starts here.
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/45">
            Learn practical skills, prove what you know, build your portfolio,
            and turn your skills into real opportunities.
          </p>
        </div>
      </section>
    </main>
  );
}