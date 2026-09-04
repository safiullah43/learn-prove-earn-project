"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Lesson = {
  id: string;
  title: string;
  duration?: string;
  video_url?: string | null;
  content?: string | null;
  notes?: string | null;
  is_free_preview?: boolean;
  is_published?: boolean;
};

type Module = {
  id: string;
  title: string;
  lessons: Lesson[];
};

type Course = {
  id?: string;
  title: string;
  description: string;
  icon?: string;
  modules?: Module[];
  lessons: Lesson[];
};

const fallbackCourses: Record<string, Course> = {
  "1": {
    title: "Amazon FBA Mastery",
    description: "Learn how to research, launch and grow a profitable Amazon FBA business.",
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
    description: "Build, launch and grow a professional Shopify store from zero.",
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
};

type LearningContentProps = {
  courseId: string;
};

export default function LearningContent({ courseId }: LearningContentProps) {
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [userName, setUserName] = useState("");
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const progress = useMemo(() => {
    if (!course || course.lessons.length === 0) return 0;
    return Math.round((completedLessons.length / course.lessons.length) * 100);
  }, [completedLessons, course]);

  const nextLesson = useMemo(() => {
    if (!course) return null;
    return course.lessons.find((lesson) => !completedLessons.includes(lesson.id)) || null;
  }, [course, completedLessons]);

  useEffect(() => {
    async function loadLearningData() {
      try {
        setLoading(true);
        setError("");

        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          router.replace(`/auth/login?redirect=/courses/${courseId}/learn`);
          return;
        }

        setUserName(
          session.user.user_metadata?.full_name ||
          session.user.email ||
          "Student"
        );

        // 1. Check enrollment status
        const { data: enrollment, error: enrollmentError } = await supabase
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

        // 2. Load dynamic DB Course, Modules, & Lessons
        const { data: dbCourse } = await supabase
          .from("courses")
          .select("id, title, description")
          .eq("id", courseId)
          .maybeSingle();

        const { data: dbModules } = await supabase
          .from("modules")
          .select(`
            id,
            title,
            position,
            lessons (
              id,
              title,
              video_url,
              content,
              notes,
              is_free_preview,
              is_published,
              position
            )
          `)
          .eq("course_id", courseId)
          .order("position", { ascending: true });

        if (dbCourse && dbModules && dbModules.length > 0) {
          const formattedModules: Module[] = dbModules.map((m: any) => ({
            id: m.id,
            title: m.title,
            lessons: (m.lessons || [])
              .filter((l: Lesson) => l.is_published !== false)
              .sort((a: any, b: any) => (a.position || 0) - (b.position || 0)),
          }));

          const allLessons = formattedModules.flatMap((m) => m.lessons);

          setCourse({
            id: dbCourse.id,
            title: dbCourse.title,
            description: dbCourse.description || "Skill-based practical course.",
            icon: "🎓",
            modules: formattedModules,
            lessons: allLessons,
          });
        } else if (fallbackCourses[courseId]) {
          // Fallback to static mock if DB records are not added yet
          setCourse(fallbackCourses[courseId]);
        } else if (dbCourse) {
          setCourse({
            id: dbCourse.id,
            title: dbCourse.title,
            description: dbCourse.description || "",
            icon: "🎓",
            modules: [],
            lessons: [],
          });
        }

        // 3. Load completed progress
        const { data: progressData } = await supabase
          .from("course_progress")
          .select("lesson_id, completed")
          .eq("user_id", session.user.id)
          .eq("course_id", courseId)
          .eq("completed", true);

        if (progressData) {
          setCompletedLessons(progressData.map((item) => item.lesson_id));
        }
      } catch (err) {
        console.error(err);
        setError("Error loading learning content.");
      } finally {
        setLoading(false);
      }
    }

    loadLearningData();
  }, [courseId, router]);

  function openLesson(lessonId: string) {
    setMobileMenuOpen(false);
    router.push(`/courses/${courseId}/learn/${lessonId}`);
  }

  function continueLearning() {
    if (nextLesson) {
      openLesson(nextLesson.id);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black px-6 py-20 text-white">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="h-10 w-2/3 rounded-xl bg-white/10" />
          <div className="mt-4 h-5 w-1/2 rounded-xl bg-white/10" />
          <div className="mt-12 h-32 rounded-3xl bg-white/5" />
        </div>
      </main>
    );
  }

  if (!course) {
    return (
      <main className="min-h-screen bg-black px-6 py-20 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <div className="text-6xl">❌</div>
          <h1 className="mt-6 text-4xl font-black">Course Not Found</h1>
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

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <button onClick={() => router.push("/")} className="text-2xl font-black tracking-tight">
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

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10 lg:flex lg:gap-8">
        {/* Sidebar Syllabus */}
        <aside className="hidden w-80 shrink-0 lg:block">
          <div className="sticky top-24 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
            <div className="border-b border-white/10 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-400 text-2xl text-black">
                  {course.icon || "🎓"}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-yellow-400">Your Course</p>
                  <h2 className="mt-1 truncate font-black">{course.title}</h2>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">Progress</span>
                  <span className="font-black text-yellow-400">{progress}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-yellow-400 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Render Modules / Lessons */}
            <div className="max-h-[calc(100vh-340px)] overflow-y-auto p-3 space-y-4">
              {course.modules && course.modules.length > 0 ? (
                course.modules.map((mod, mIdx) => (
                  <div key={mod.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-2">
                    <p className="text-xs font-bold text-yellow-400 px-2 py-1 uppercase">
                      Module {mIdx + 1}: {mod.title}
                    </p>
                    <div className="mt-1 space-y-1">
                      {mod.lessons.map((lesson) => {
                        const isCompleted = completedLessons.includes(lesson.id);
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => openLesson(lesson.id)}
                            className="flex w-full items-center justify-between rounded-lg p-2 text-left text-xs hover:bg-white/10"
                          >
                            <span className="truncate pr-2">{lesson.title}</span>
                            {isCompleted && <span className="text-green-400 font-bold">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                course.lessons.map((lesson, index) => {
                  const isCompleted = completedLessons.includes(lesson.id);
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => openLesson(lesson.id)}
                      className="mb-2 flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-white/[0.06]"
                    >
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black ${isCompleted ? "bg-green-400 text-black" : "bg-white/10"}`}>
                        {isCompleted ? "✓" : index + 1}
                      </div>
                      <p className="truncate text-sm font-bold text-white/80">{lesson.title}</p>
                    </button>
                  );
                })
              )}
            </div>

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
          </div>
        </aside>

        {/* Main Section */}
        <section className="min-w-0 flex-1">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-yellow-400">Learning Center</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">{course.title}</h1>
            <p className="mt-4 max-w-3xl text-base text-white/55">{course.description}</p>
            <p className="mt-2 text-sm text-white/40">Student: <span className="text-white/80">{userName}</span></p>
          </div>

          {nextLesson && (
            <section className="mb-8 rounded-3xl border border-yellow-400/20 bg-yellow-400/[0.06] p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-yellow-400">Up Next</p>
              <h2 className="mt-2 text-2xl font-black">{nextLesson.title}</h2>
              <button
                onClick={continueLearning}
                className="mt-4 rounded-xl bg-yellow-400 px-6 py-3 font-black text-black transition hover:bg-yellow-300"
              >
                Start Lesson →
              </button>
            </section>
          )}

          {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">{error}</div>}
        </section>
      </div>
    </main>
  );
}