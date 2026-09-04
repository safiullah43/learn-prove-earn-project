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

      const { data: enrollmentData, error } = await supabase
        .from("enrollments")
        .select("id, course_id, status, progress, enrolled_at, certificate_issued, certificate_url")
        .eq("user_id", data.session.user.id)
        .neq("status", "cancelled")
        .order("enrolled_at", { ascending: false });

      if (!error && enrollmentData) {
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
      <main className="min-h-screen bg-[#060913] text-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-3xl font-black">
            LPE<span className="text-yellow-400">.</span>
          </div>
          <p className="mt-3 text-sm text-white/40">Loading dashboard...</p>
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
    <main className="min-h-screen overflow-x-hidden bg-[#060913] pb-24 text-white md:pb-12">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#060913]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-xl sm:text-2xl font-black">
            LPE<span className="text-yellow-400">.</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="rounded-xl border border-white/10 px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              Home
            </Link>

            <Link
              href="/courses"
              className="rounded-xl border border-white/10 px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              Courses
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl bg-yellow-400 px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-black text-black transition hover:bg-yellow-300"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Welcome Banner */}
        <div className="mb-8 sm:mb-10">
          <p className="text-xs sm:text-sm font-bold tracking-wider text-yellow-400">
            YOUR DASHBOARD
          </p>

          <h1 className="mt-1.5 sm:mt-2 text-3xl font-black sm:text-4xl md:text-5xl">
            Welcome, {fullName} 👋
          </h1>

          <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-white/40">{email}</p>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {/* My Learning */}
          <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-7">
            <div className="text-3xl sm:text-4xl">📚</div>

            <h2 className="mt-4 sm:mt-5 text-lg sm:text-xl font-black">My Learning</h2>

            <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm leading-5 sm:leading-6 text-white/45">
              Your enrolled courses and learning progress.
            </p>

            <div className="mt-4 sm:mt-5">
              {enrollmentLoading ? (
                <p className="text-xs sm:text-sm text-white/40">Loading your courses...</p>
              ) : enrollments.length === 0 ? (
                <div>
                  <p className="text-xs sm:text-sm text-white/40">
                    You haven&apos;t enrolled in any course yet.
                  </p>

                  <Link
                    href="/courses"
                    className="mt-4 inline-block text-xs sm:text-sm font-bold text-yellow-400 hover:underline"
                  >
                    Explore Courses →
                  </Link>
                </div>
              ) : (
                <p className="text-xs sm:text-sm font-bold text-yellow-400">
                  {enrollments.length}{" "}
                  {enrollments.length === 1 ? "Course" : "Courses"} Enrolled ✓
                </p>
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-7">
            <div className="text-3xl sm:text-4xl">📈</div>

            <h2 className="mt-4 sm:mt-5 text-lg sm:text-xl font-black">Your Progress</h2>

            <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm leading-5 sm:leading-6 text-white/45">
              Your overall learning progress.
            </p>

            <div className="mt-4 sm:mt-6 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-yellow-400 transition-all duration-500"
                style={{
                  width: `${totalProgress}%`,
                }}
              />
            </div>

            <p className="mt-2 text-[11px] sm:text-xs text-white/30">
              {enrollments.length > 0
                ? `${totalProgress}% overall progress`
                : "Getting started"}
            </p>
          </div>

          {/* Profile */}
          <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-7 sm:col-span-2 lg:col-span-1">
            <div className="text-3xl sm:text-4xl">👤</div>

            <h2 className="mt-4 sm:mt-5 text-lg sm:text-xl font-black">My Profile</h2>

            <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm leading-5 sm:leading-6 text-white/45">
              Your profile and achievements will appear here.
            </p>

            <div className="mt-4 sm:mt-6 text-xs sm:text-sm font-semibold text-white/60">
              Account Active ✓
            </div>
          </div>
        </div>

        {/* Enrolled Courses Section */}
        <div className="mt-8 sm:mt-12">
          <div className="mb-4 sm:mb-6">
            <p className="text-xs font-bold tracking-wider text-yellow-400 uppercase">
              MY LEARNING
            </p>

            <h2 className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-black">Your Enrolled Courses</h2>

            <p className="mt-1 text-xs sm:text-sm text-white/40">
              Continue learning from where you left off.
            </p>
          </div>

          {enrollmentLoading ? (
            <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8 text-center">
              <p className="text-xs sm:text-sm text-white/40">Loading courses...</p>
            </div>
          ) : enrollments.length === 0 ? (
            <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-10 text-center">
              <div className="text-4xl sm:text-5xl">📚</div>

              <h3 className="mt-4 sm:mt-5 text-lg sm:text-xl font-black">No courses yet</h3>

              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-white/40">
                Start learning by enrolling in your first course.
              </p>

              <Link
                href="/courses"
                className="mt-5 sm:mt-6 inline-block rounded-xl bg-yellow-400 px-5 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-black text-black transition hover:bg-yellow-300"
              >
                Browse Courses →
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
              {enrollments.map((enrollment) => {
                const icon = courseIcons[enrollment.course_id] || "🎓";
                const isCompleted = enrollment.progress >= 100;

                return (
                  <div
                    key={enrollment.id}
                    className="rounded-2xl sm:rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-7 transition hover:border-yellow-400/20 hover:bg-white/[0.06]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-yellow-400/10 text-2xl sm:text-3xl shrink-0">
                          {icon}
                        </div>

                        <div>
                          <h3 className="text-base sm:text-xl font-black leading-snug">
                            {enrollment.course_title}
                          </h3>

                          <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-yellow-400">
                            {enrollment.status}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 rounded-xl border border-yellow-400/20 bg-yellow-400/10 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-black text-yellow-400">
                        {enrollment.progress}%
                      </div>
                    </div>

                    <p className="mt-3 sm:mt-5 text-xs sm:text-sm leading-5 sm:leading-6 text-white/45 min-h-[40px]">
                      {enrollment.course_description}
                    </p>

                    {/* Progress Bar */}
                    <div className="mt-4 sm:mt-6">
                      <div className="mb-1.5 sm:mb-2 flex items-center justify-between text-[11px] sm:text-xs">
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

                    {/* Action Area */}
                    <div className="mt-5 sm:mt-6">
                      {isCompleted ? (
                        enrollment.certificate_issued && enrollment.certificate_url ? (
                          <a
                            href={enrollment.certificate_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block rounded-xl bg-emerald-500 px-4 py-2.5 sm:px-5 sm:py-3 text-center text-xs sm:text-sm font-black text-black transition hover:bg-emerald-400"
                          >
                            🎓 Download Official Certificate
                          </a>
                        ) : (
                          <div className="rounded-xl border border-yellow-400/20 bg-yellow-400/10 p-3 text-center text-[11px] sm:text-xs font-bold text-yellow-300">
                            🎓 Course 100% Completed! Certificate Pending Admin Review.
                          </div>
                        )
                      ) : (
                        <Link
                          href={`/courses/${enrollment.course_id}/learn`}
                          className="block rounded-xl bg-yellow-400 px-4 py-2.5 sm:px-5 sm:py-3 text-center text-xs sm:text-sm font-black text-black transition hover:bg-yellow-300"
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

        {/* Bottom Banner */}
        <div className="mt-8 sm:mt-10 rounded-2xl sm:rounded-3xl border border-yellow-400/10 bg-yellow-400/[0.04] p-5 sm:p-8">
          <p className="text-xs sm:text-sm font-bold tracking-wider text-yellow-400 uppercase">
            LEARN • PROVE • EARN
          </p>

          <h2 className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-black">
            Your journey starts here.
          </h2>

          <p className="mt-2 sm:mt-3 max-w-2xl text-xs sm:text-sm leading-5 sm:leading-7 text-white/45">
            Learn practical skills, prove what you know, build your portfolio,
            and turn your skills into real opportunities.
          </p>
        </div>
      </section>

      {/* Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-white/10 bg-[#070913]/95 px-2 py-2 backdrop-blur-lg md:hidden">
        <Link href="/" className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-white">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-6h6v6"/></svg>
          <span className="text-[10px] font-medium">Home</span>
        </Link>

        <Link href="/courses" className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-white">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5.5A3.5 3.5 0 0 1 6.5 2H11v17H6.5A3.5 3.5 0 0 0 3 22Z"/><path d="M21 5.5A3.5 3.5 0 0 0 17.5 2H13v17h4.5A3.5 3.5 0 0 1 21 22Z"/></svg>
          <span className="text-[10px] font-medium">Courses</span>
        </Link>

        <Link href="/" className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-white">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 12h18"/></svg>
          <span className="text-[10px] font-medium">Jobs</span>
        </Link>

        <Link href="/" className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-white">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5h16v11H8l-4 4Z"/></svg>
          <span className="text-[10px] font-medium">Messages</span>
        </Link>

        <Link href="/dashboard" className="flex flex-col items-center gap-0.5 text-yellow-400">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c.8-4.2 3.5-6 8-6s7.2 1.8 8 6"/></svg>
          <span className="text-[10px] font-medium">Dashboard</span>
        </Link>
      </div>
    </main>
  );
}