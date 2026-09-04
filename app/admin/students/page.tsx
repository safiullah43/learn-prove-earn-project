"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Student = {
  id: string;
  email: string;
  name: string;
  created_at: string;
};

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
};

type Enrollment = {
  user_id: string;
  course_id: string;
  progress: number;
  status: string;
  enrolled_at: string;
};

const courseNames: Record<string, string> = {
  "1": "Amazon FBA Mastery",
  "2": "Shopify Store Mastery",
  "3": "AI Automation",
  "4": "Digital Marketing Pro",
  "5": "YouTube Automation",
  "6": "TikTok Automation",
};

export default function StudentsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStudents() {
      setLoading(true);
      setError("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/auth/login?redirect=/admin/students");
        return;
      }

      // Check admin access
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
        router.replace("/dashboard");
        return;
      }

      // Load profiles
      const { data: profileData, error: profileError } =
        await supabase
          .from("profiles")
          .select("id, full_name, email, created_at")
          .order("created_at", {
            ascending: false,
          });

      if (profileError) {
        console.error(profileError);
        setError("Unable to load student profiles.");
        setLoading(false);
        return;
      }

      // Load enrollments
      const { data: enrollmentData, error: enrollmentError } =
        await supabase
          .from("enrollments")
          .select(
            "user_id, course_id, progress, status, enrolled_at"
          )
          .order("enrolled_at", {
            ascending: false,
          });

      if (enrollmentError) {
        console.error(enrollmentError);
        setError("Unable to load enrollment data.");
        setLoading(false);
        return;
      }

      const profiles = (profileData || []) as Profile[];
      const enrollmentRows =
        (enrollmentData || []) as Enrollment[];

      setEnrollments(enrollmentRows);

      const studentRows: Student[] = profiles.map(
        (profile) => ({
          id: profile.id,
          email: profile.email || "No email",
          name:
            profile.full_name?.trim() ||
            "Student",
          created_at: profile.created_at,
        })
      );

      setStudents(studentRows);
      setLoading(false);
    }

    loadStudents();
  }, [router]);

  const filteredStudents = students.filter((student) => {
    const query = search.toLowerCase().trim();

    if (!query) return true;

    return (
      student.name.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query) ||
      student.id.toLowerCase().includes(query)
    );
  });

  function getStudentEnrollments(studentId: string) {
    return enrollments.filter(
      (enrollment) =>
        enrollment.user_id === studentId
    );
  }

  function formatDate(date: string) {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black px-4 py-10 text-white md:px-6">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="h-10 w-64 rounded-xl bg-white/10" />
          <div className="mt-8 h-16 rounded-2xl bg-white/5" />
          <div className="mt-6 h-24 rounded-2xl bg-white/5" />
          <div className="mt-3 h-24 rounded-2xl bg-white/5" />
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
            onClick={() => router.push("/admin")}
            className="text-2xl font-black tracking-tight"
          >
            <span className="text-white">LPE</span>
            <span className="text-yellow-400">.</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/admin")}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/70 transition hover:bg-white/5 hover:text-white"
            >
              ← Admin Dashboard
            </button>

            <button
              onClick={() => router.push("/")}
              className="hidden rounded-xl bg-yellow-400 px-4 py-2 text-sm font-black text-black transition hover:bg-yellow-300 sm:block"
            >
              Homepage
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        {/* Heading */}
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-yellow-400">
            Administration
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
            Students
          </h1>

          <p className="mt-4 text-white/50">
            Manage registered students and monitor their
            learning progress.
          </p>
        </div>

        {/* Search */}
        <div className="mt-8">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by name, email or ID..."
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 pl-12 text-white outline-none transition placeholder:text-white/30 focus:border-yellow-400/40"
            />

            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-white/40">
              🔍
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-sm text-white/40">
              Registered Students
            </p>

            <p className="mt-2 text-3xl font-black">
              {students.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-sm text-white/40">
              Total Enrollments
            </p>

            <p className="mt-2 text-3xl font-black">
              {enrollments.length}
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Students */}
        <section className="mt-8">
          {filteredStudents.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-16 text-center">
              <div className="text-5xl">👥</div>

              <h2 className="mt-5 text-2xl font-black">
                No Students Found
              </h2>

              <p className="mt-2 text-sm text-white/40">
                {search
                  ? "Try a different search."
                  : "No registered students found."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredStudents.map((student) => {
                const studentEnrollments =
                  getStudentEnrollments(student.id);

                return (
                  <div
                    key={student.id}
                    className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]"
                  >
                    {/* Student Header */}
                    <div className="flex flex-col gap-4 border-b border-white/10 p-5 md:flex-row md:items-center md:justify-between md:p-6">
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-yellow-400 font-black text-black">
                          {student.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <h2 className="truncate font-black">
                            {student.name}
                          </h2>

                          <p className="mt-1 truncate text-sm text-white/40">
                            {student.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2">
                          <p className="text-xs text-white/30">
                            Joined
                          </p>

                          <p className="text-sm font-bold">
                            {formatDate(
                              student.created_at
                            )}
                          </p>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2">
                          <p className="text-xs text-white/30">
                            Enrollments
                          </p>

                          <p className="font-black text-yellow-400">
                            {studentEnrollments.length}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Enrolled Courses */}
                    <div className="p-5 md:p-6">
                      <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white/40">
                        Course Activity
                      </h3>

                      {studentEnrollments.length === 0 ? (
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-center">
                          <p className="text-sm text-white/40">
                            This student has not enrolled in
                            any course yet.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {studentEnrollments.map(
                            (enrollment) => (
                              <div
                                key={`${enrollment.user_id}-${enrollment.course_id}`}
                                className="rounded-2xl border border-white/10 bg-black/20 p-4"
                              >
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                  <div>
                                    <h3 className="font-bold">
                                      {courseNames[
                                        enrollment.course_id
                                      ] ||
                                        `Course ${enrollment.course_id}`}
                                    </h3>

                                    <p className="mt-1 text-xs text-white/30">
                                      Enrolled{" "}
                                      {formatDate(
                                        enrollment.enrolled_at
                                      )}
                                    </p>

                                    <span
                                      className={`mt-3 inline-block rounded-lg px-2.5 py-1 text-xs font-bold ${
                                        enrollment.status ===
                                        "completed"
                                          ? "bg-green-400/10 text-green-400"
                                          : enrollment.status ===
                                            "cancelled"
                                          ? "bg-red-400/10 text-red-400"
                                          : "bg-yellow-400/10 text-yellow-400"
                                      }`}
                                    >
                                      {enrollment.status}
                                    </span>
                                  </div>

                                  <div className="w-full md:w-64">
                                    <div className="flex justify-between text-xs">
                                      <span className="text-white/40">
                                        Progress
                                      </span>

                                      <span className="font-bold text-yellow-400">
                                        {
                                          enrollment.progress
                                        }
                                        %
                                      </span>
                                    </div>

                                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                                      <div
                                        className="h-full rounded-full bg-yellow-400 transition-all"
                                        style={{
                                          width: `${enrollment.progress}%`,
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Bottom */}
        <div className="mt-10">
          <button
            onClick={() => router.push("/admin")}
            className="rounded-2xl border border-white/10 px-6 py-4 font-bold text-white/70 transition hover:bg-white/5 hover:text-white"
          >
            ← Back to Admin Dashboard
          </button>
        </div>
      </div>
    </main>
  );
}