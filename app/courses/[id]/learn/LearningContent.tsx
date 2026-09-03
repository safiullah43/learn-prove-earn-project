"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Lesson = {
  id: string;
  title: string;
  duration: string;
};

type Course = {
  title: string;
  description: string;
  icon: string;
  lessons: Lesson[];
};

const courses: Record<string, Course> = {
  "1": {
    title: "Amazon FBA Mastery",
    description:
      "Learn how to research, launch and grow a profitable Amazon FBA business.",
    icon: "📦",
    lessons: [
      { id: "amazon-1", title: "Amazon FBA Introduction", duration: "12 min" },
      { id: "amazon-2", title: "Product Research", duration: "18 min" },
      { id: "amazon-3", title: "Supplier Hunting", duration: "20 min" },
      { id: "amazon-4", title: "Listing Optimization", duration: "22 min" },
      { id: "amazon-5", title: "Amazon PPC", duration: "25 min" },
      { id: "amazon-6", title: "Scaling Your Business", duration: "20 min" },
    ],
  },

  "2": {
    title: "Shopify Store Mastery",
    description:
      "Build, launch and grow a professional Shopify store from zero.",
    icon: "🛍️",
    lessons: [
      { id: "shopify-1", title: "Shopify Basics", duration: "12 min" },
      { id: "shopify-2", title: "Store Setup", duration: "18 min" },
      { id: "shopify-3", title: "Product Selection", duration: "20 min" },
      { id: "shopify-4", title: "Store Design", duration: "22 min" },
      { id: "shopify-5", title: "Marketing & Sales", duration: "25 min" },
      { id: "shopify-6", title: "Scaling Your Store", duration: "20 min" },
    ],
  },

  "3": {
    title: "AI Automation",
    description:
      "Learn how to use AI tools and automation to build modern online systems.",
    icon: "🤖",
    lessons: [
      {
        id: "ai-1",
        title: "Introduction to AI Automation",
        duration: "15 min",
      },
      { id: "ai-2", title: "AI Tools", duration: "20 min" },
      { id: "ai-3", title: "Workflow Automation", duration: "22 min" },
      { id: "ai-4", title: "AI Content Systems", duration: "20 min" },
      { id: "ai-5", title: "Business Automation", duration: "25 min" },
      { id: "ai-6", title: "Building AI Solutions", duration: "25 min" },
    ],
  },

  "4": {
    title: "Digital Marketing Pro",
    description:
      "Master digital marketing, social media and customer acquisition.",
    icon: "📈",
    lessons: [
      {
        id: "marketing-1",
        title: "Digital Marketing Fundamentals",
        duration: "15 min",
      },
      {
        id: "marketing-2",
        title: "Social Media Marketing",
        duration: "20 min",
      },
      { id: "marketing-3", title: "SEO Marketing", duration: "22 min" },
      { id: "marketing-4", title: "Paid Advertising", duration: "25 min" },
      { id: "marketing-5", title: "Content Marketing", duration: "20 min" },
      { id: "marketing-6", title: "Marketing Analytics", duration: "18 min" },
    ],
  },

  "5": {
    title: "YouTube Automation",
    description:
      "Learn how to build and scale a faceless YouTube automation channel.",
    icon: "▶️",
    lessons: [
      {
        id: "youtube-1",
        title: "YouTube Automation Basics",
        duration: "15 min",
      },
      { id: "youtube-2", title: "Niche Research", duration: "20 min" },
      { id: "youtube-3", title: "Video Scripts", duration: "18 min" },
      { id: "youtube-4", title: "AI Voice & Video", duration: "25 min" },
      { id: "youtube-5", title: "YouTube SEO", duration: "22 min" },
      {
        id: "youtube-6",
        title: "Monetization & Scaling",
        duration: "25 min",
      },
    ],
  },

  "6": {
    title: "TikTok Automation",
    description:
      "Build a TikTok content system and learn how to grow and monetize it.",
    icon: "🎵",
    lessons: [
      {
        id: "tiktok-1",
        title: "TikTok Automation Basics",
        duration: "12 min",
      },
      { id: "tiktok-2", title: "Finding Viral Niches", duration: "18 min" },
      { id: "tiktok-3", title: "Content Creation", duration: "20 min" },
      { id: "tiktok-4", title: "AI Video Creation", duration: "25 min" },
      { id: "tiktok-5", title: "TikTok Growth", duration: "22 min" },
      { id: "tiktok-6", title: "Monetization", duration: "20 min" },
    ],
  },
};

type LearningContentProps = {
  courseId: string;
};

export default function LearningContent({
  courseId,
}: LearningContentProps) {
  const router = useRouter();
  const course = courses[courseId];

  const [loading, setLoading] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [userName, setUserName] = useState("");
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const progress = useMemo(() => {
    if (!course || course.lessons.length === 0) {
      return 0;
    }

    return Math.round(
      (completedLessons.length / course.lessons.length) * 100
    );
  }, [completedLessons, course]);

  const nextLesson = useMemo(() => {
    if (!course) return null;

    return (
      course.lessons.find(
        (lesson) => !completedLessons.includes(lesson.id)
      ) || null
    );
  }, [course, completedLessons]);

  useEffect(() => {
    async function loadLearningData() {
      if (!course) {
        setLoading(false);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace(
          `/auth/login?redirect=/courses/${courseId}/learn`
        );
        return;
      }

      setUserName(
        session.user.user_metadata?.full_name ||
          session.user.email ||
          "Student"
      );

      const { data: enrollment, error: enrollmentError } =
        await supabase
          .from("enrollments")
          .select("id, status, progress")
          .eq("user_id", session.user.id)
          .eq("course_id", courseId)
          .maybeSingle();

      if (enrollmentError) {
        console.error(enrollmentError);
        setError("Unable to check your course access.");
        setLoading(false);
        return;
      }

      if (!enrollment || enrollment.status === "cancelled") {
        router.replace(`/courses/${courseId}`);
        return;
      }

      const { data: progressData, error: progressError } =
        await supabase
          .from("course_progress")
          .select("lesson_id, completed")
          .eq("user_id", session.user.id)
          .eq("course_id", courseId)
          .eq("completed", true);

      if (progressError) {
        console.error(progressError);
        setError("Unable to load your course progress.");
        setLoading(false);
        return;
      }

      setCompletedLessons(
        (progressData || []).map((item) => item.lesson_id)
      );

      setLoading(false);
    }

    loadLearningData();
  }, [course, courseId, router]);

  function openLesson(lessonId: string) {
    setMobileMenuOpen(false);

    router.push(
      `/courses/${courseId}/learn/${lessonId}`
    );
  }

  function continueLearning() {
    if (nextLesson) {
      openLesson(nextLesson.id);
    }
  }

  if (!course) {
    return (
      <main className="min-h-screen bg-black px-6 py-20 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <div className="text-6xl">❌</div>

          <h1 className="mt-6 text-4xl font-black">
            Course Not Found
          </h1>

          <button
            onClick={() => router.push("/courses")}
            className="mt-8 rounded-2xl bg-yellow-400 px-6 py-3 font-black text-black"
          >
            Back to Courses
          </button>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black px-6 py-20 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse">
            <div className="h-10 w-2/3 rounded-xl bg-white/10" />
            <div className="mt-4 h-5 w-1/2 rounded-xl bg-white/10" />

            <div className="mt-12 h-32 rounded-3xl bg-white/5" />

            <div className="mt-6 h-20 rounded-2xl bg-white/5" />
            <div className="mt-4 h-20 rounded-2xl bg-white/5" />
            <div className="mt-4 h-20 rounded-2xl bg-white/5" />
          </div>
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

          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => router.push("/courses")}
              className="hidden rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/5 hover:text-white sm:block"
            >
              📚 Courses
            </button>

            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-xl bg-yellow-400 px-4 py-2 text-sm font-black text-black transition hover:bg-yellow-300"
            >
              Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Course Menu */}
      <div className="border-b border-white/10 bg-white/[0.02] lg:hidden">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <button
            onClick={() =>
              setMobileMenuOpen(!mobileMenuOpen)
            }
            className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-yellow-400">
                Course Curriculum
              </p>

              <p className="mt-1 font-bold">
                {completedLessons.length}/
                {course.lessons.length} lessons completed
              </p>
            </div>

            <span className="text-xl">
              {mobileMenuOpen ? "↑" : "↓"}
            </span>
          </button>

          {mobileMenuOpen && (
            <div className="mt-3 space-y-2 pb-2">
              {course.lessons.map((lesson, index) => {
                const isCompleted =
                  completedLessons.includes(lesson.id);

                return (
                  <button
                    key={lesson.id}
                    onClick={() => openLesson(lesson.id)}
                    className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition ${
                      isCompleted
                        ? "border-green-400/20 bg-green-400/[0.06]"
                        : "border-white/10 bg-white/[0.03]"
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-black ${
                        isCompleted
                          ? "bg-green-400 text-black"
                          : "bg-white/10 text-white/70"
                      }`}
                    >
                      {isCompleted ? "✓" : index + 1}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">
                        {lesson.title}
                      </p>

                      <p className="mt-1 text-xs text-white/40">
                        {lesson.duration}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Layout */}
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10 lg:flex lg:gap-8">
        {/* Sidebar */}
        <aside className="hidden w-80 shrink-0 lg:block">
          <div className="sticky top-24 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
            {/* Sidebar Header */}
            <div className="border-b border-white/10 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-400 text-2xl">
                  {course.icon}
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-yellow-400">
                    Your Course
                  </p>

                  <h2 className="mt-1 truncate font-black">
                    {course.title}
                  </h2>
                </div>
              </div>

              {/* Sidebar Progress */}
              <div className="mt-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">
                    Progress
                  </span>

                  <span className="font-black text-yellow-400">
                    {progress}%
                  </span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-yellow-400 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <p className="mt-2 text-xs text-white/40">
                  {completedLessons.length} of{" "}
                  {course.lessons.length} lessons completed
                </p>
              </div>
            </div>

            {/* Sidebar Lessons */}
            <div className="max-h-[calc(100vh-340px)] overflow-y-auto p-3">
              {course.lessons.map((lesson, index) => {
                const isCompleted =
                  completedLessons.includes(lesson.id);

                const isNext =
                  nextLesson?.id === lesson.id;

                return (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => openLesson(lesson.id)}
                    className={`mb-2 flex w-full items-center gap-3 rounded-xl p-3 text-left transition last:mb-0 ${
                      isNext
                        ? "border border-yellow-400/30 bg-yellow-400/[0.08]"
                        : isCompleted
                        ? "bg-green-400/[0.05] hover:bg-green-400/[0.10]"
                        : "hover:bg-white/[0.06]"
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                        isCompleted
                          ? "bg-green-400 text-black"
                          : isNext
                          ? "bg-yellow-400 text-black"
                          : "bg-white/10 text-white/60"
                      }`}
                    >
                      {isCompleted ? "✓" : index + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`truncate text-sm font-bold ${
                          isNext
                            ? "text-yellow-300"
                            : "text-white/80"
                        }`}
                      >
                        {lesson.title}
                      </p>

                      <p className="mt-1 text-xs text-white/35">
                        {lesson.duration}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Continue Button */}
            {nextLesson && (
              <div className="border-t border-white/10 p-4">
                <button
                  onClick={continueLearning}
                  className="w-full rounded-xl bg-yellow-400 px-4 py-3 text-sm font-black text-black transition hover:bg-yellow-300"
                >
                  Continue Learning →
                </button>
              </div>
            )}

            {progress === 100 && (
              <div className="border-t border-white/10 p-4">
                <div className="rounded-xl border border-green-400/20 bg-green-400/10 p-4 text-center">
                  <div className="text-2xl">🏆</div>

                  <p className="mt-2 text-sm font-black text-green-400">
                    Course Completed!
                  </p>

                  <p className="mt-1 text-xs text-white/40">
                    Great work, {userName}.
                  </p>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <section className="min-w-0 flex-1">
          {/* Welcome */}
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-yellow-400">
              Learning Center
            </p>

            <h1 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">
              {course.icon} {course.title}
            </h1>

            <p className="mt-4 max-w-3xl text-base leading-7 text-white/55 md:text-lg md:leading-8">
              {course.description}
            </p>

            <p className="mt-4 text-sm text-white/40">
              Welcome back{" "}
              <span className="font-semibold text-white/70">
                {userName}
              </span>
            </p>
          </div>

          {/* Continue Learning */}
          {nextLesson && progress < 100 && (
            <section className="mb-8 overflow-hidden rounded-3xl border border-yellow-400/20 bg-yellow-400/[0.06] p-5 md:p-7">
              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-400">
                    Continue Learning
                  </p>

                  <h2 className="mt-2 text-xl font-black md:text-2xl">
                    {nextLesson.title}
                  </h2>

                  <p className="mt-2 text-sm text-white/45">
                    Lesson{" "}
                    {course.lessons.findIndex(
                      (lesson) =>
                        lesson.id === nextLesson.id
                    ) + 1}{" "}
                    of {course.lessons.length} •{" "}
                    {nextLesson.duration}
                  </p>
                </div>

                <button
                  onClick={continueLearning}
                  className="shrink-0 rounded-xl bg-yellow-400 px-6 py-3 font-black text-black transition hover:bg-yellow-300"
                >
                  Start Lesson →
                </button>
              </div>
            </section>
          )}

          {/* Progress Card */}
          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 md:p-8">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="text-sm font-semibold text-white/50">
                  Your Course Progress
                </p>

                <div className="mt-2 flex items-end gap-3">
                  <span className="text-4xl font-black md:text-5xl">
                    {progress}%
                  </span>

                  <span className="mb-1 text-sm text-white/40">
                    {completedLessons.length} /{" "}
                    {course.lessons.length} lessons
                  </span>
                </div>
              </div>

              {progress === 100 && (
                <div className="rounded-xl border border-green-400/20 bg-green-400/10 px-4 py-2 text-sm font-bold text-green-400">
                  🎉 Course Completed!
                </div>
              )}
            </div>

            <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-yellow-400 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </section>

          {/* Error */}
          {error && (
            <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Lessons */}
          <section className="mt-10">
            <div className="mb-5">
              <h2 className="text-2xl font-black">
                Course Lessons
              </h2>

              <p className="mt-1 text-sm text-white/40">
                Watch each lesson. Your progress will be tracked automatically.
              </p>
            </div>

            <div className="space-y-4">
              {course.lessons.map((lesson, index) => {
                const isCompleted =
                  completedLessons.includes(lesson.id);

                const isNext =
                  nextLesson?.id === lesson.id;

                return (
                  <div
                    key={lesson.id}
                    className={`rounded-2xl border p-5 transition ${
                      isNext
                        ? "border-yellow-400/30 bg-yellow-400/[0.04]"
                        : isCompleted
                        ? "border-green-400/20 bg-green-400/[0.05]"
                        : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                      <div className="flex min-w-0 items-center gap-4">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-black ${
                            isCompleted
                              ? "bg-green-400 text-black"
                              : isNext
                              ? "bg-yellow-400 text-black"
                              : "bg-white/10 text-white"
                          }`}
                        >
                          {isCompleted ? "✓" : index + 1}
                        </div>

                        <div className="min-w-0">
                          {isCompleted && (
                            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-green-400">
                              Completed
                            </p>
                          )}

                          {isNext && !isCompleted && (
                            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-yellow-400">
                              Next Lesson
                            </p>
                          )}

                          <h3 className="truncate font-bold text-white">
                            {lesson.title}
                          </h3>

                          <p className="mt-1 text-sm text-white/40">
                            ⏱ {lesson.duration}
                          </p>
                        </div>
                      </div>

                      {/* Only Open Lesson — No Manual Completion */}
                      <button
                        type="button"
                        onClick={() =>
                          openLesson(lesson.id)
                        }
                        className="rounded-xl border border-white/10 px-5 py-3 text-sm font-bold text-white/70 transition hover:bg-white/5 hover:text-white"
                      >
                        {isCompleted
                          ? "Watch Again →"
                          : "Open Lesson →"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Bottom Navigation */}
          <div className="mt-12 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => router.push("/courses")}
              className="flex-1 rounded-2xl border border-white/10 px-6 py-4 font-bold text-white/70 transition hover:bg-white/5 hover:text-white"
            >
              ← Back to Courses
            </button>

            <button
              onClick={() => router.push("/dashboard")}
              className="flex-1 rounded-2xl bg-yellow-400 px-6 py-4 font-black text-black transition hover:bg-yellow-300"
            >
              Go to Dashboard →
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}