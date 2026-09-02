"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Course = {
    id: number;
    title: string;
    category: string;
    description: string;
    level: string;
    lessons: number;
    duration: string;
    students: string;
    progress: number;
    color: string;
    icon: string;
    premium: boolean;
};

const courses: Course[] = [
    {
        id: 1,
        title: "Amazon FBA Mastery",
        category: "E-Commerce",
        description:
            "Learn product research, sourcing, listing optimization, PPC and how to build a profitable Amazon business.",
        level: "Beginner to Advanced",
        lessons: 48,
        duration: "18 Hours",
        students: "2.4K",
        progress: 65,
        color: "from-orange-500 to-amber-400",
        icon: "📦",
        premium: false,
    },
    {
        id: 2,
        title: "Shopify Store Masterclass",
        category: "E-Commerce",
        description:
            "Build, design and scale a professional Shopify store with winning products and conversion strategies.",
        level: "Beginner",
        lessons: 36,
        duration: "14 Hours",
        students: "1.8K",
        progress: 32,
        color: "from-emerald-500 to-teal-400",
        icon: "🛍️",
        premium: false,
    },
    {
        id: 3,
        title: "AI Automation",
        category: "Artificial Intelligence",
        description:
            "Learn how to use AI tools and automation systems to create workflows, services and online income opportunities.",
        level: "Intermediate",
        lessons: 42,
        duration: "16 Hours",
        students: "3.1K",
        progress: 0,
        color: "from-purple-600 to-fuchsia-500",
        icon: "🤖",
        premium: true,
    },
    {
        id: 4,
        title: "Digital Marketing Pro",
        category: "Marketing",
        description:
            "Master social media marketing, paid ads, content strategy, branding and customer acquisition.",
        level: "Beginner to Advanced",
        lessons: 52,
        duration: "20 Hours",
        students: "4.2K",
        progress: 18,
        color: "from-pink-500 to-rose-500",
        icon: "📈",
        premium: false,
    },
    {
        id: 5,
        title: "YouTube Automation",
        category: "Content Creation",
        description:
            "Learn faceless channel creation, niche research, scripts, AI tools and YouTube monetization strategies.",
        level: "Intermediate",
        lessons: 40,
        duration: "15 Hours",
        students: "2.7K",
        progress: 0,
        color: "from-red-500 to-orange-500",
        icon: "▶️",
        premium: true,
    },
    {
        id: 6,
        title: "TikTok Automation",
        category: "Content Creation",
        description:
            "Build automated TikTok content systems and learn audience growth, monetization and viral strategies.",
        level: "Beginner",
        lessons: 34,
        duration: "12 Hours",
        students: "2.1K",
        progress: 0,
        color: "from-cyan-500 to-blue-500",
        icon: "🎵",
        premium: false,
    },
];

const categories = [
    "All Courses",
    "E-Commerce",
    "Artificial Intelligence",
    "Marketing",
    "Content Creation",
];

export default function CoursesPage() {
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("All Courses");

    const filteredCourses = useMemo(() => {
        return courses.filter((course) => {
            const matchesCategory =
                activeCategory === "All Courses" ||
                course.category === activeCategory;

            const matchesSearch =
                course.title
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                course.description
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                course.category
                    .toLowerCase()
                    .includes(search.toLowerCase());

            return matchesCategory && matchesSearch;
        });
    }, [search, activeCategory]);

    return (
        <main className="min-h-screen bg-[#060913] text-white">
            {/* Background Effects */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute left-[10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[130px]" />
                <div className="absolute right-[5%] top-[20%] h-[450px] w-[450px] rounded-full bg-blue-500/10 blur-[130px]" />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#080b15]/90 backdrop-blur-xl">
                <div className="mx-auto flex h-[74px] max-w-[1500px] items-center justify-between gap-4 px-5">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center gap-3"
                    >
                        <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-xl font-black shadow-[0_0_30px_rgba(124,58,237,.45)]">
                            L
                        </div>

                        <div>
                            <h1 className="text-xl font-black tracking-tight">
                                LPE Academy
                            </h1>

                            <p className="text-[9px] font-semibold tracking-[0.2em] text-slate-500">
                                LEARN · PROVE · EARN
                            </p>
                        </div>
                    </Link>

                    {/* Search */}
                    <div className="hidden w-full max-w-xl items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 md:flex">
                        <span className="text-slate-500">⌕</span>

                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search courses, skills or topics..."
                            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                        />
                    </div>

                    {/* Home Button */}
                    <Link
                        href="/"
                        className="rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-purple-500/50 hover:bg-purple-500/10 hover:text-white"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </header>

            <div className="relative mx-auto max-w-[1500px] px-5 py-10">
                {/* Mobile Search */}
                <div className="mb-8 flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 md:hidden">
                    <span className="text-slate-500">⌕</span>

                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search courses..."
                        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                    />
                </div>

                {/* Hero */}
                <section className="relative overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-600/[0.14] via-[#0b101c] to-blue-600/[0.08] p-6 md:p-10">
                    <div className="absolute right-[-80px] top-[-100px] h-[300px] w-[300px] rounded-full bg-purple-500/20 blur-[100px]" />

                    <div className="relative max-w-3xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-4 py-2 text-xs font-medium text-purple-300">
                            🎓 LPE LEARNING ACADEMY
                        </div>

                        <h2 className="mt-6 text-4xl font-black tracking-tight md:text-6xl">
                            Learn Skills.
                            <br />
                            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
                                Prove Your Talent.
                            </span>
                            <br />
                            Earn Opportunities.
                        </h2>

                        <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-400 md:text-base">
                            Learn high-demand digital skills, build real projects,
                            prove your expertise and unlock opportunities from
                            employers, clients and global marketplaces.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-4">
                            <div className="rounded-xl border border-white/[0.08] bg-black/20 px-5 py-3">
                                <p className="text-xl font-bold text-purple-300">
                                    6+
                                </p>
                                <p className="text-xs text-slate-500">
                                    Professional Courses
                                </p>
                            </div>

                            <div className="rounded-xl border border-white/[0.08] bg-black/20 px-5 py-3">
                                <p className="text-xl font-bold text-cyan-300">
                                    1,000+
                                </p>
                                <p className="text-xs text-slate-500">
                                    Active Learners
                                </p>
                            </div>

                            <div className="rounded-xl border border-white/[0.08] bg-black/20 px-5 py-3">
                                <p className="text-xl font-bold text-emerald-300">
                                    100%
                                </p>
                                <p className="text-xs text-slate-500">
                                    Practical Learning
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Continue Learning */}
                <section className="mt-10">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-400">
                                Your Learning Journey
                            </p>

                            <h2 className="mt-2 text-2xl font-bold">
                                Continue Learning
                            </h2>
                        </div>

                        <p className="text-sm text-slate-500">
                            Keep building your skills every day 🚀
                        </p>
                    </div>

                    <div className="mt-6 grid gap-5 md:grid-cols-3">
                        {courses
                            .filter((course) => course.progress > 0)
                            .slice(0, 3)
                            .map((course) => (
                                <div
                                    key={course.id}
                                    className="group rounded-2xl border border-white/[0.08] bg-[#0b101c] p-5 transition hover:-translate-y-1 hover:border-purple-500/40"
                                >
                                    <div className="flex items-start justify-between">
                                        <div
                                            className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${course.color} text-2xl shadow-lg`}
                                        >
                                            {course.icon}
                                        </div>

                                        <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs text-purple-300">
                                            {course.progress}% Complete
                                        </span>
                                    </div>

                                    <h3 className="mt-5 font-bold">
                                        {course.title}
                                    </h3>

                                    <p className="mt-2 text-xs text-slate-500">
                                        {course.lessons} Lessons · {course.duration}
                                    </p>

                                    <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                                        <div
                                            style={{
                                                width: `${course.progress}%`,
                                            }}
                                            className={`h-full rounded-full bg-gradient-to-r ${course.color}`}
                                        />
                                    </div>

                                    <Link
                                        href={`/courses/${course.id}`}
                                        className="mt-5 block w-full rounded-xl bg-white/[0.05] py-3 text-center text-sm font-semibold text-white transition hover:bg-purple-600"
                                    >
                                        Continue Learning →
                                    </Link>
                                </div>
                            ))}
                    </div>
                </section>

                {/* Categories */}
                <section className="mt-12">
                    <div className="flex flex-wrap items-center justify-between gap-5">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                                Explore
                            </p>

                            <h2 className="mt-2 text-2xl font-bold">
                                Explore All Courses
                            </h2>
                        </div>

                        <p className="text-sm text-slate-500">
                            {filteredCourses.length} courses found
                        </p>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() =>
                                    setActiveCategory(category)
                                }
                                className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${
                                    activeCategory === category
                                        ? "bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-[0_8px_25px_rgba(124,58,237,.25)]"
                                        : "border border-white/[0.08] bg-white/[0.025] text-slate-400 hover:border-purple-500/40 hover:text-white"
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Courses Grid */}
                <section className="mt-8">
                    {filteredCourses.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {filteredCourses.map((course) => (
                                <article
                                    key={course.id}
                                    className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b101c] transition duration-300 hover:-translate-y-1 hover:border-purple-500/40 hover:shadow-[0_20px_60px_rgba(0,0,0,.35)]"
                                >
                                    {/* Card Top */}
                                    <div
                                        className={`relative h-40 overflow-hidden bg-gradient-to-br ${course.color}`}
                                    >
                                        <div className="absolute inset-0 bg-black/15" />

                                        <div className="absolute left-6 top-6 grid h-16 w-16 place-items-center rounded-2xl border border-white/20 bg-black/20 text-3xl backdrop-blur">
                                            {course.icon}
                                        </div>

                                        <div className="absolute right-5 top-5">
                                            {course.premium ? (
                                                <span className="rounded-full bg-amber-400 px-3 py-1.5 text-xs font-bold text-black">
                                                    👑 PREMIUM
                                                </span>
                                            ) : (
                                                <span className="rounded-full bg-emerald-400 px-3 py-1.5 text-xs font-bold text-black">
                                                    FREE
                                                </span>
                                            )}
                                        </div>

                                        <div className="absolute bottom-5 left-6">
                                            <span className="rounded-full bg-black/30 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
                                                {course.category}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-6">
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="text-xs font-medium text-purple-300">
                                                {course.level}
                                            </span>

                                            <span className="text-xs text-slate-500">
                                                ⭐ 4.8
                                            </span>
                                        </div>

                                        <h3 className="mt-3 text-xl font-bold">
                                            {course.title}
                                        </h3>

                                        <p className="mt-3 min-h-[66px] text-sm leading-6 text-slate-400">
                                            {course.description}
                                        </p>

                                        <div className="mt-5 grid grid-cols-3 gap-3 border-y border-white/[0.06] py-4 text-center">
                                            <div>
                                                <p className="text-sm font-bold">
                                                    {course.lessons}
                                                </p>
                                                <p className="mt-1 text-[10px] text-slate-500">
                                                    Lessons
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-sm font-bold">
                                                    {course.duration}
                                                </p>
                                                <p className="mt-1 text-[10px] text-slate-500">
                                                    Duration
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-sm font-bold">
                                                    {course.students}
                                                </p>
                                                <p className="mt-1 text-[10px] text-slate-500">
                                                    Learners
                                                </p>
                                            </div>
                                        </div>

                                        {course.progress > 0 && (
                                            <div className="mt-5">
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-slate-500">
                                                        Your Progress
                                                    </span>

                                                    <span className="font-semibold text-purple-300">
                                                        {course.progress}%
                                                    </span>
                                                </div>

                                                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                                                    <div
                                                        style={{
                                                            width: `${course.progress}%`,
                                                        }}
                                                        className={`h-full rounded-full bg-gradient-to-r ${course.color}`}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <Link
                                            href={`/courses/${course.id}`}
                                            className={`mt-6 block w-full rounded-xl bg-gradient-to-r ${course.color} py-3.5 text-center text-sm font-bold text-white transition hover:scale-[1.02]`}
                                        >
                                            {course.progress > 0
                                                ? "Continue Course →"
                                                : course.premium
                                                  ? "Unlock Premium →"
                                                  : "Start Learning →"}
                                        </Link>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-white/[0.08] bg-[#0b101c] p-16 text-center">
                            <div className="text-5xl">🔍</div>

                            <h3 className="mt-5 text-xl font-bold">
                                No Courses Found
                            </h3>

                            <p className="mt-2 text-sm text-slate-500">
                                Try searching with another keyword or category.
                            </p>

                            <button
                                onClick={() => {
                                    setSearch("");
                                    setActiveCategory("All Courses");
                                }}
                                className="mt-6 rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold transition hover:bg-purple-500"
                            >
                                Reset Filters
                            </button>
                        </div>
                    )}
                </section>

                {/* Learning Path */}
                <section className="mt-14 rounded-3xl border border-white/[0.08] bg-[#0b101c] p-6 md:p-10">
                    <div className="grid gap-10 lg:grid-cols-[1fr_1.5fr]">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-400">
                                LPE Method
                            </p>

                            <h2 className="mt-3 text-3xl font-black">
                                Learn. Prove.
                                <br />
                                <span className="text-purple-400">
                                    Earn.
                                </span>
                            </h2>

                            <p className="mt-5 text-sm leading-7 text-slate-400">
                                LPE is designed to go beyond traditional
                                courses. Learn practical skills, build real
                                projects, showcase your work and connect with
                                opportunities.
                            </p>

                            <Link
                                href="/"
                                className="mt-6 inline-block rounded-xl border border-purple-500/40 bg-purple-500/10 px-5 py-3 text-sm font-semibold text-purple-300 transition hover:bg-purple-500/20"
                            >
                                Explore Opportunities →
                            </Link>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="rounded-2xl border border-purple-500/20 bg-purple-500/[0.06] p-5">
                                <div className="text-3xl">📚</div>

                                <h3 className="mt-4 font-bold">
                                    01. Learn
                                </h3>

                                <p className="mt-2 text-xs leading-6 text-slate-400">
                                    Learn high-demand skills through practical
                                    lessons.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.06] p-5">
                                <div className="text-3xl">🏆</div>

                                <h3 className="mt-4 font-bold">
                                    02. Prove
                                </h3>

                                <p className="mt-2 text-xs leading-6 text-slate-400">
                                    Complete projects and prove your real
                                    abilities.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-5">
                                <div className="text-3xl">💰</div>

                                <h3 className="mt-4 font-bold">
                                    03. Earn
                                </h3>

                                <p className="mt-2 text-xs leading-6 text-slate-400">
                                    Unlock jobs, clients and income
                                    opportunities.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="mt-14 border-t border-white/[0.06] py-8 text-center">
                    <p className="text-sm font-semibold text-slate-300">
                        LPE — Learn · Prove · Earn
                    </p>

                    <p className="mt-2 text-xs text-slate-600">
                        Build skills. Build proof. Build your future.
                    </p>
                </footer>
            </div>
        </main>
    );
}