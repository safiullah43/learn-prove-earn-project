"use client";

import Link from "next/link";

const courses = [
  {
    title: "Amazon FBA Mastery",
    category: "E-Commerce",
    level: "Beginner to Advanced",
    students: "2,450",
    lessons: "42 Lessons",
    progress: 72,
    icon: "🛒",
    gradient: "from-orange-500 to-amber-400",
  },
  {
    title: "Shopify Store Building",
    category: "E-Commerce",
    level: "Beginner",
    students: "1,890",
    lessons: "36 Lessons",
    progress: 45,
    icon: "🛍️",
    gradient: "from-emerald-500 to-cyan-500",
  },
  {
    title: "AI Automation",
    category: "Artificial Intelligence",
    level: "Advanced",
    students: "3,210",
    lessons: "54 Lessons",
    progress: 0,
    icon: "🤖",
    gradient: "from-purple-600 to-indigo-500",
  },
  {
    title: "YouTube Automation",
    category: "Content Business",
    level: "Intermediate",
    students: "1,760",
    lessons: "38 Lessons",
    progress: 0,
    icon: "▶️",
    gradient: "from-red-500 to-pink-500",
  },
  {
    title: "TikTok Automation",
    category: "Content Business",
    level: "Beginner",
    students: "2,120",
    lessons: "31 Lessons",
    progress: 0,
    icon: "🎬",
    gradient: "from-pink-500 to-purple-500",
  },
  {
    title: "SEO & Digital Marketing",
    category: "Marketing",
    level: "Beginner to Advanced",
    students: "4,320",
    lessons: "48 Lessons",
    progress: 18,
    icon: "📈",
    gradient: "from-blue-500 to-cyan-400",
  },
];

export default function CoursesPage() {
  return (
    <main className="min-h-screen bg-[#060913] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(124,58,237,.22),transparent_30%),radial-gradient(circle_at_90%_20%,rgba(6,182,212,.12),transparent_25%)]" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/[0.07] bg-[#080b15]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[74px] max-w-[1500px] items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 font-black shadow-[0_0_25px_rgba(124,58,237,.4)]">
              L
            </div>

            <div>
              <div className="text-xl font-black">LPE</div>
              <div className="text-[8px] font-semibold tracking-[0.18em] text-slate-500">
                LEARN · PROVE · EARN
              </div>
            </div>
          </Link>

          <Link
            href="/"
            className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-5 py-2.5 text-sm text-slate-300 transition hover:border-purple-500/40 hover:text-white"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-[1500px] px-5 py-10">
        {/* Hero */}
        <section className="overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-600/20 via-[#10152a] to-cyan-500/10 p-8 md:p-12">
          <div className="max-w-3xl">
            <span className="rounded-full border border-purple-400/30 bg-purple-500/10 px-4 py-2 text-xs font-semibold text-purple-300">
              🚀 LPE LEARNING PLATFORM
            </span>

            <h1 className="mt-6 text-4xl font-black tracking-tight md:text-6xl">
              Learn Skills.
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-cyan-300 bg-clip-text text-transparent">
                Prove Your Talent.
              </span>
              <br />
              Start Earning.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-400 md:text-lg">
              Learn practical skills, build real projects, prove your abilities
              and unlock opportunities from employers and clients.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 px-6 py-3 font-semibold shadow-[0_15px_35px_rgba(124,58,237,.25)]">
                Explore Courses →
              </button>

              <button className="rounded-xl border border-white/[0.1] bg-white/[0.03] px-6 py-3 font-semibold text-slate-300">
                How LPE Works
              </button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["50+", "Professional Courses"],
            ["12K+", "Active Learners"],
            ["500+", "Career Opportunities"],
            ["95%", "Skill Completion Rate"],
          ].map(([number, label]) => (
            <div
              key={label}
              className="rounded-2xl border border-white/[0.08] bg-[#0b101c] p-6"
            >
              <p className="text-3xl font-black text-purple-300">{number}</p>
              <p className="mt-2 text-sm text-slate-500">{label}</p>
            </div>
          ))}
        </section>

        {/* Section Header */}
        <section className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-purple-400">
                FEATURED LEARNING
              </p>

              <h2 className="mt-2 text-3xl font-black">
                Build Skills That Pay 💰
              </h2>

              <p className="mt-3 text-slate-400">
                Industry-focused courses designed for real opportunities.
              </p>
            </div>

            <button className="rounded-xl border border-white/[0.08] px-5 py-3 text-sm text-slate-300">
              View All Courses →
            </button>
          </div>

          {/* Course Grid */}
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <article
                key={course.title}
                className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b101c] transition duration-300 hover:-translate-y-1 hover:border-purple-500/40 hover:shadow-[0_20px_50px_rgba(0,0,0,.3)]"
              >
                <div
                  className={`flex h-36 items-center justify-between bg-gradient-to-br ${course.gradient} p-6`}
                >
                  <div className="text-5xl">{course.icon}</div>

                  <span className="rounded-full bg-black/20 px-3 py-1.5 text-xs font-semibold backdrop-blur">
                    {course.category}
                  </span>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold">{course.title}</h3>

                  <p className="mt-2 text-sm text-slate-400">
                    {course.level}
                  </p>

                  <div className="mt-5 flex justify-between text-xs text-slate-500">
                    <span>👥 {course.students} Students</span>
                    <span>{course.lessons}</span>
                  </div>

                  {course.progress > 0 ? (
                    <div className="mt-5">
                      <div className="mb-2 flex justify-between text-xs">
                        <span className="text-slate-400">Your Progress</span>
                        <span className="font-semibold text-cyan-300">
                          {course.progress}%
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-500"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5 rounded-lg bg-purple-500/[0.07] px-3 py-2 text-xs text-purple-300">
                      Ready to start your learning journey
                    </div>
                  )}

                  <button className="mt-6 w-full rounded-xl bg-white/[0.05] py-3 text-sm font-semibold transition group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-indigo-500">
                    {course.progress > 0
                      ? "Continue Learning →"
                      : "Start Learning →"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* LPE Process */}
        <section className="mt-14 rounded-3xl border border-white/[0.08] bg-[#0b101c] p-8 md:p-12">
          <div className="text-center">
            <p className="text-sm font-semibold text-cyan-400">
              THE LPE SYSTEM
            </p>

            <h2 className="mt-3 text-3xl font-black">
              One Platform. Three Steps.
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              [
                "01",
                "📚",
                "Learn",
                "Master practical skills from professional courses.",
              ],
              [
                "02",
                "🏆",
                "Prove",
                "Complete projects and prove your real abilities.",
              ],
              [
                "03",
                "💰",
                "Earn",
                "Unlock jobs, freelance work and career opportunities.",
              ],
            ].map(([number, icon, title, description]) => (
              <div
                key={title}
                className="rounded-2xl border border-white/[0.07] bg-black/20 p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-400">
                    STEP {number}
                  </span>
                  <span className="text-3xl">{icon}</span>
                </div>

                <h3 className="mt-6 text-xl font-bold">{title}</h3>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}