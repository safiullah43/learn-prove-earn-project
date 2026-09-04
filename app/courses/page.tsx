"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// Supabase Connection setup for Website
const supabaseUrl = "https://sqpwtagrewutewxbhubw.supabase.co";
const supabaseAnonKey = "sb_publishable_fZr7LAmo3taXSkbwJ3VgyA_3YhgBG8r";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type Course = {
    id: number | string;
    title: string;
    category: string;
    description: string;
    level?: string;
    lessons?: number;
    duration?: string;
    students?: string;
    progress?: number;
    price?: number;
    color?: string;
    icon?: string;
    premium?: boolean;
};

const fallbackCourses: Course[] = [
    {
        id: 1,
        title: "Amazon FBA Mastery",
        category: "E-Commerce",
        description: "Learn product research, sourcing, listing optimization, PPC and how to build a profitable Amazon business.",
        level: "Beginner to Advanced",
        lessons: 48,
        duration: "18 Hours",
        students: "2.4K",
        progress: 65,
        price: 50,
        color: "from-orange-500 to-amber-400",
        icon: "📦",
        premium: false,
    },
    {
        id: 2,
        title: "Shopify Store Masterclass",
        category: "E-Commerce",
        description: "Build, design and scale a professional Shopify store with winning products and conversion strategies.",
        level: "Beginner",
        lessons: 36,
        duration: "14 Hours",
        students: "1.8K",
        progress: 32,
        price: 5000,
        color: "from-emerald-500 to-teal-400",
        icon: "🛍️",
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
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("All Courses");
    const [coursesList, setCoursesList] = useState<Course[]>(fallbackCourses);
    const [loading, setLoading] = useState(true);

    // Fetch Live Courses from Supabase Database
    useEffect(() => {
        async function fetchLiveCourses() {
            try {
                const { data, error } = await supabase.from("courses").select("*");
                if (data && data.length > 0 && !error) {
                    const formatted = data.map((c: any, index: number) => ({
                        id: c.id ?? index + 1,
                        title: c.title || "Untitled Course",
                        category: c.category || "E-Commerce",
                        description: c.description || "Learn practical digital skills.",
                        level: c.level || "Beginner to Advanced",
                        lessons: c.lessons || 40,
                        duration: c.duration || "15 Hours",
                        students: c.students || "1.2K",
                        progress: c.progress || 0,
                        price: c.price ?? 50,
                        color: c.color || "from-orange-500 to-amber-400",
                        icon: c.icon || "📦",
                        premium: c.price > 0,
                    }));
                    setCoursesList(formatted);
                }
            } catch (err) {
                console.error("Error fetching live courses:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchLiveCourses();
    }, []);

    const filteredCourses = useMemo(() => {
        return coursesList.filter((course) => {
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
    }, [search, activeCategory, coursesList]);

    return (
        <main className="min-h-screen overflow-x-hidden bg-[#060913] pb-24 text-white md:pb-10">
            {/* Background Effects */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute left-[10%] top-[-10%] h-[300px] w-[300px] sm:h-[500px] sm:w-[500px] rounded-full bg-purple-600/10 blur-[100px] sm:blur-[130px]" />
                <div className="absolute right-[5%] top-[20%] h-[250px] w-[250px] sm:h-[450px] sm:w-[450px] rounded-full bg-blue-500/10 blur-[100px] sm:blur-[130px]" />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#080b15]/90 backdrop-blur-xl">
                <div className="mx-auto flex h-[68px] max-w-[1500px] items-center justify-between gap-3 px-4 sm:h-[74px] sm:px-5">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center gap-2.5 sm:gap-3 shrink-0"
                    >
                        <div className="grid h-9 w-9 sm:h-11 sm:w-11 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-lg sm:text-xl font-black shadow-[0_0_30px_rgba(124,58,237,.45)]">
                            L
                        </div>

                        <div>
                            <h1 className="text-base sm:text-xl font-black tracking-tight">
                                LPE Academy
                            </h1>

                            <p className="text-[7px] sm:text-[9px] font-semibold tracking-[0.16em] sm:tracking-[0.2em] text-slate-500">
                                LEARN · PROVE · EARN
                            </p>
                        </div>
                    </Link>

                    {/* Desktop Search */}
                    <div className="hidden w-full max-w-xl items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 md:flex">
                        <span className="text-slate-500">⌕</span>

                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search courses, skills or topics..."
                            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                        />
                    </div>

                    {/* Back to Home Button */}
                    <Link
                        href="/"
                        className="shrink-0 rounded-xl border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-xs sm:px-4 sm:py-2.5 sm:text-sm font-medium text-slate-300 transition hover:border-purple-500/50 hover:bg-purple-500/10 hover:text-white"
                    >
                        ← <span className="hidden sm:inline">Back to </span>Home
                    </Link>
                </div>
            </header>

            <div className="relative mx-auto max-w-[1500px] px-3.5 sm:px-5 py-6 sm:py-10">
                {/* Mobile Search */}
                <div className="mb-6 flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 md:hidden">
                    <span className="text-slate-500">⌕</span>

                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search courses..."
                        className="w-full bg-transparent text-xs sm:text-sm text-white outline-none placeholder:text-slate-500"
                    />
                </div>

                {/* Hero */}
                <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-600/[0.14] via-[#0b101c] to-blue-600/[0.08] p-5 sm:p-8 md:p-10">
                    <div className="absolute right-[-80px] top-[-100px] h-[300px] w-[300px] rounded-full bg-purple-500/20 blur-[100px]" />

                    <div className="relative max-w-3xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-medium text-purple-300">
                            🎓 LPE LEARNING ACADEMY
                        </div>

                        <h2 className="mt-4 sm:mt-6 text-2xl sm:text-4xl md:text-6xl font-black tracking-tight leading-tight">
                            Learn Skills.
                            <br />
                            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
                                Prove Your Talent.
                            </span>
                            <br />
                            Earn Opportunities.
                        </h2>

                        <p className="mt-4 sm:mt-6 max-w-2xl text-xs sm:text-sm md:text-base leading-6 sm:leading-7 text-slate-400">
                            Learn high-demand digital skills, build real projects,
                            prove your expertise and unlock opportunities from
                            employers, clients and global marketplaces.
                        </p>

                        <div className="mt-6 sm:mt-8 flex flex-wrap gap-2.5 sm:gap-4">
                            <div className="flex-1 min-w-[100px] rounded-xl border border-white/[0.08] bg-black/20 px-3.5 py-2.5 sm:px-5 sm:py-3 text-center sm:text-left">
                                <p className="text-lg sm:text-xl font-bold text-purple-300">
                                    {coursesList.length}+
                                </p>
                                <p className="text-[10px] sm:text-xs text-slate-500">
                                    Courses
                                </p>
                            </div>

                            <div className="flex-1 min-w-[100px] rounded-xl border border-white/[0.08] bg-black/20 px-3.5 py-2.5 sm:px-5 sm:py-3 text-center sm:text-left">
                                <p className="text-lg sm:text-xl font-bold text-cyan-300">
                                    1,000+
                                </p>
                                <p className="text-[10px] sm:text-xs text-slate-500">
                                    Learners
                                </p>
                            </div>

                            <div className="flex-1 min-w-[100px] rounded-xl border border-white/[0.08] bg-black/20 px-3.5 py-2.5 sm:px-5 sm:py-3 text-center sm:text-left">
                                <p className="text-lg sm:text-xl font-bold text-emerald-300">
                                    100%
                                </p>
                                <p className="text-[10px] sm:text-xs text-slate-500">
                                    Practical
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Categories Filter */}
                <section className="mt-10 sm:mt-12">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                                Explore
                            </p>

                            <h2 className="mt-1 sm:mt-2 text-xl sm:text-2xl font-bold">
                                Explore All Courses
                            </h2>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-500">
                            {filteredCourses.length} courses found
                        </p>
                    </div>

                    <div className="no-scrollbar mt-4 sm:mt-6 flex items-center gap-2 overflow-x-auto pb-1">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={`shrink-0 rounded-full px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-medium transition ${activeCategory === category
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
                <section className="mt-6 sm:mt-8">
                    {filteredCourses.length > 0 ? (
                        <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredCourses.map((course) => (
                                <article
                                    key={course.id}
                                    className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b101c] transition duration-300 hover:-translate-y-1 hover:border-purple-500/40 hover:shadow-[0_20px_60px_rgba(0,0,0,.35)]"
                                >
                                    {/* Card Top */}
                                    <div
                                        className={`relative h-36 sm:h-40 overflow-hidden bg-gradient-to-br ${course.color || "from-orange-500 to-amber-400"}`}
                                    >
                                        <div className="absolute inset-0 bg-black/15" />

                                        <div className="absolute left-4 top-4 sm:left-6 sm:top-6 grid h-12 w-12 sm:h-16 sm:w-16 place-items-center rounded-2xl border border-white/20 bg-black/20 text-2xl sm:text-3xl backdrop-blur">
                                            {course.icon || "📦"}
                                        </div>

                                        <div className="absolute right-4 top-4 sm:right-5 sm:top-5">
                                            <span className="rounded-full bg-amber-400 px-2.5 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-bold text-black">
                                                Rs. {course.price}
                                            </span>
                                        </div>

                                        <div className="absolute bottom-4 left-4 sm:bottom-5 sm:left-6">
                                            <span className="rounded-full bg-black/30 px-2.5 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-medium text-white backdrop-blur">
                                                {course.category}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-4 sm:p-6">
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="text-[11px] sm:text-xs font-medium text-purple-300">
                                                {course.level || "All Levels"}
                                            </span>

                                            <span className="text-[11px] sm:text-xs text-slate-500">
                                                ⭐ 4.8
                                            </span>
                                        </div>

                                        <h3 className="mt-2 sm:mt-3 text-lg sm:text-xl font-bold">
                                            {course.title}
                                        </h3>

                                        <p className="mt-2 text-xs sm:text-sm leading-5 sm:leading-6 text-slate-400 min-h-[50px] sm:min-h-[66px]">
                                            {course.description}
                                        </p>

                                        <Link
                                            href={`/courses/${course.id}`}
                                            className="mt-5 sm:mt-6 block w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3 sm:py-3.5 text-center text-xs sm:text-sm font-bold text-white transition hover:scale-[1.02]"
                                        >
                                            Enroll Now (Rs. {course.price}) →
                                        </Link>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-white/[0.08] bg-[#0b101c] p-8 sm:p-16 text-center">
                            <div className="text-4xl sm:text-5xl">🔍</div>

                            <h3 className="mt-4 sm:mt-5 text-lg sm:text-xl font-bold">
                                No Courses Found
                            </h3>

                            <button
                                onClick={() => {
                                    setSearch("");
                                    setActiveCategory("All Courses");
                                }}
                                className="mt-5 sm:mt-6 rounded-xl bg-purple-600 px-5 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-semibold transition hover:bg-purple-500"
                            >
                                Reset Filters
                            </button>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}