"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type IconName =
    | "home"
    | "user"
    | "network"
    | "project"
    | "courses"
    | "bookmark"
    | "briefcase"
    | "message"
    | "settings"
    | "search"
    | "bell"
    | "plus"
    | "heart"
    | "comment"
    | "share"
    | "save"
    | "arrow";

function Icon({
    name,
    size = 20,
}: {
    name: IconName;
    size?: number;
}) {
    const common = {
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.8,
        strokeLinecap: "round" as const,
        strokeLinejoin: "round" as const,
    };

    const paths: Record<IconName, ReactNode> = {
        home: (
            <>
                <path d="M3 10.5 12 3l9 7.5" />
                <path d="M5 9.5V21h14V9.5" />
                <path d="M9 21v-6h6v6" />
            </>
        ),
        user: (
            <>
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c.8-4.2 3.5-6 8-6s7.2 1.8 8 6" />
            </>
        ),
        network: (
            <>
                <circle cx="7" cy="8" r="3" />
                <circle cx="17" cy="8" r="3" />
                <path d="M2.5 20c.4-3.4 2.3-5 4.5-5" />
                <path d="M17 15c2.2 0 4.1 1.6 4.5 5" />
                <path d="M8 20c.5-3 2-4.5 4-4.5s3.5 1.5 4 4.5" />
            </>
        ),
        project: (
            <>
                <rect x="3" y="7" width="18" height="13" rx="2" />
                <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <path d="M3 12h18" />
            </>
        ),
        courses: (
            <>
                <path d="M3 5.5A3.5 3.5 0 0 1 6.5 2H11v17H6.5A3.5 3.5 0 0 0 3 22Z" />
                <path d="M21 5.5A3.5 3.5 0 0 0 17.5 2H13v17h4.5A3.5 3.5 0 0 1 21 22Z" />
            </>
        ),
        bookmark: <path d="M6 3h12v18l-6-4-6 4Z" />,
        briefcase: (
            <>
                <rect x="3" y="7" width="18" height="13" rx="2" />
                <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <path d="M3 12h18" />
            </>
        ),
        message: (
            <>
                <path d="M4 5h16v11H8l-4 4Z" />
            </>
        ),
        settings: (
            <>
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2 2-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1 1.55V20h-2.8v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.88.34l-.06.06-2-2 .06-.06A1.7 1.7 0 0 0 7.52 15a1.7 1.7 0 0 0-1.55-1H5.9v-2.8h.07a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.88l-.06-.06 2-2 .06.06a1.7 1.7 0 0 0 1.88.34 1.7 1.7 0 0 0 1-1.55V5h2.8v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.88-.34l.06-.06 2 2-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.55 1H20.1V14h-.07a1.7 1.7 0 0 0-1.55 1Z" />
            </>
        ),
        search: (
            <>
                <circle cx="11" cy="11" r="6.5" />
                <path d="m16 16 4.5 4.5" />
            </>
        ),
        bell: (
            <>
                <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                <path d="M10 22h4" />
            </>
        ),
        plus: (
            <>
                <path d="M12 5v14" />
                <path d="M5 12h14" />
            </>
        ),
        heart: (
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.9-8.6a5.5 5.5 0 0 0-.1-7.8Z" />
        ),
        comment: (
            <>
                <path d="M4 5h16v11H8l-4 4Z" />
            </>
        ),
        share: (
            <>
                <path d="m14 5 5 5-5 5" />
                <path d="M19 10H9a5 5 0 0 0-5 5v4" />
            </>
        ),
        save: <path d="M6 3h12v18l-6-4-6 4Z" />,
        arrow: (
            <>
                <path d="M5 12h14" />
                <path d="m13 6 6 6-6 6" />
            </>
        ),
    };

    return <svg {...common}>{paths[name]}</svg>;
}

function NavItem({
    icon,
    label,
    active,
    badge,
    href,
    onClick,
}: {
    icon: IconName;
    label: string;
    active?: boolean;
    badge?: string;
    href?: string;
    onClick?: () => void;
}) {
    const className = `group flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition ${
        active
            ? "border border-purple-500/40 bg-gradient-to-r from-purple-500/20 to-transparent text-white shadow-[0_0_25px_rgba(124,58,237,.12)]"
            : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
    }`;

    const content = (
        <>
            <span className="flex items-center gap-3">
                <span
                    className={
                        active
                            ? "text-purple-400"
                            : "text-slate-500 transition group-hover:text-purple-300"
                    }
                >
                    <Icon name={icon} size={20} />
                </span>

                <span className="text-sm font-medium">{label}</span>
            </span>

            {badge && (
                <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-xs text-purple-300">
                    {badge}
                </span>
            )}
        </>
    );

    if (href && !onClick) {
        return (
            <Link href={href} className={className}>
                {content}
            </Link>
        );
    }

    return (
        <button
            type="button"
            onClick={onClick}
            className={className}
        >
            {content}
        </button>
    );
}

function Avatar({
    initials,
    color = "purple",
    size = "md",
}: {
    initials: string;
    color?: "purple" | "blue" | "orange" | "green";
    size?: "sm" | "md" | "lg";
}) {
    const sizeClass = {
        sm: "h-10 w-10 text-xs",
        md: "h-12 w-12 text-sm",
        lg: "h-24 w-24 text-2xl",
    };

    const colors = {
        purple:
            "from-purple-600 via-violet-500 to-fuchsia-400 shadow-[0_0_30px_rgba(168,85,247,.35)]",
        blue: "from-blue-700 via-blue-500 to-cyan-400",
        orange: "from-orange-700 via-orange-500 to-amber-300",
        green: "from-emerald-700 via-emerald-500 to-teal-300",
    };

    return (
        <div
            className={`grid shrink-0 place-items-center rounded-full bg-gradient-to-br ${colors[color]} ${sizeClass[size]} font-bold text-white ring-2 ring-white/10`}
        >
            {initials}
        </div>
    );
}

function Action({
    icon,
    label,
    count,
    onClick,
}: {
    icon: IconName;
    label: string;
    count?: string;
    onClick?: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-white/[0.05] hover:text-purple-300"
        >
            <Icon name={icon} size={18} />
            <span>{label}</span>
            {count && (
                <span className="text-xs text-slate-600">
                    {count}
                </span>
            )}
        </button>
    );
}

export default function Home() {
    const router = useRouter();

    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        let mounted = true;

        async function loadSession() {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (mounted) {
                setSession(session);
            }
        }

        loadSession();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(
            (_event, newSession) => {
                setSession(newSession);
            }
        );

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    function requireAuth() {
        if (session) {
            return true;
        }

        router.push("/auth/login");
        return false;
    }

    function protectedAction() {
        requireAuth();
    }

    async function handleLogout() {
        await supabase.auth.signOut();
        setSession(null);
        router.push("/");
    }

    const userName =
        session?.user?.user_metadata?.full_name ||
        session?.user?.email?.split("@")[0] ||
        "Safiullah";

    return (
        <main className="min-h-screen overflow-x-hidden bg-[#060913] text-white">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(99,102,241,.18),transparent_35%),radial-gradient(circle_at_100%_30%,rgba(168,85,247,.09),transparent_25%)]" />

            {/* TOP NAVIGATION */}
            <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#080b15]/85 backdrop-blur-xl">
                <div className="mx-auto flex h-[74px] max-w-[1600px] items-center gap-6 px-5">

                    <div className="flex min-w-[170px] items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-[0_0_25px_rgba(124,58,237,.4)]">
                            <span className="text-xl font-black">
                                L
                            </span>
                        </div>

                        <div>
                            <div className="text-xl font-black tracking-tight">
                                LPE
                            </div>

                            <div className="text-[8px] font-semibold tracking-[0.18em] text-slate-500">
                                LEARN · PROVE · EARN
                            </div>
                        </div>
                    </div>

                    <div className="hidden min-w-[330px] items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.035] px-4 py-3 lg:flex">
                        <span className="text-slate-500">
                            <Icon name="search" size={18} />
                        </span>

                        <input
                            onClick={protectedAction}
                            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                            placeholder="Search jobs, people, skills, opportunities..."
                        />

                        <kbd className="rounded bg-white/[0.06] px-2 py-1 text-[10px] text-slate-500">
                            Ctrl + K
                        </kbd>
                    </div>

                    <nav className="mx-auto hidden items-center gap-2 md:flex">

                        <button
                            type="button"
                            className="relative flex flex-col items-center gap-1 rounded-xl bg-purple-500/10 px-4 py-2 text-xs text-purple-300"
                        >
                            <Icon name="home" size={20} />
                            <span>Home</span>
                        </button>

                        {[
                            ["briefcase", "Opportunities"],
                            ["network", "Network"],
                            ["message", "Messages"],
                            ["bell", "Notifications"],
                        ].map(([icon, label]) => (
                            <button
                                type="button"
                                key={label}
                                onClick={protectedAction}
                                className="relative flex flex-col items-center gap-1 rounded-xl px-4 py-2 text-xs text-slate-400 transition hover:text-white"
                            >
                                <Icon
                                    name={icon as IconName}
                                    size={20}
                                />

                                <span>{label}</span>

                                {label === "Notifications" && (
                                    <span className="absolute right-2 top-1 grid h-4 w-4 place-items-center rounded-full bg-red-500 text-[9px] text-white">
                                        5
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>

                    {!session ? (
                        <div className="ml-auto hidden items-center gap-2 sm:flex">
                            <button
                                type="button"
                                onClick={() =>
                                    router.push("/auth/login")
                                }
                                className="rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/5 hover:text-white"
                            >
                                Login
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    router.push("/auth/signup")
                                }
                                className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 px-5 py-3 text-sm font-semibold shadow-[0_10px_30px_rgba(124,58,237,.25)] transition hover:scale-[1.02]"
                            >
                                Sign Up
                            </button>
                        </div>
                    ) : (
                        <div className="ml-auto flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() =>
                                    router.push("/dashboard")
                                }
                                className="hidden rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 px-5 py-3 text-sm font-semibold shadow-[0_10px_30px_rgba(124,58,237,.25)] transition hover:scale-[1.02] sm:flex"
                            >
                                Dashboard
                            </button>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="hidden rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white sm:block"
                            >
                                Logout
                            </button>
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={protectedAction}
                        >
                            <Avatar
                                initials={
                                    userName
                                        .charAt(0)
                                        .toUpperCase()
                                }
                                size="sm"
                            />
                        </button>

                        <span className="hidden text-sm font-semibold lg:block">
                            {userName}
                        </span>
                    </div>
                </div>
            </header>

            <div className="relative mx-auto grid max-w-[1600px] grid-cols-1 gap-6 px-5 py-6 xl:grid-cols-[260px_minmax(0,1fr)_320px]">

                {/* LEFT SIDEBAR */}
                <aside className="hidden xl:block">
                    <div className="sticky top-24 space-y-5">

                        <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b101c]">

                            <div className="h-20 bg-[linear-gradient(135deg,rgba(124,58,237,.35),rgba(14,165,233,.12),rgba(6,9,19,.2))]" />

                            <div className="-mt-10 px-5 pb-5">
                                <button
                                    type="button"
                                    onClick={protectedAction}
                                >
                                    <Avatar
                                        initials={userName
                                            .charAt(0)
                                            .toUpperCase()}
                                        size="lg"
                                    />
                                </button>

                                <div className="mt-3">
                                    <div className="flex items-center gap-2">
                                        <h2 className="font-bold">
                                            {userName}
                                        </h2>

                                        <span className="text-blue-400">
                                            ✓
                                        </span>
                                    </div>

                                    <p className="mt-1 text-xs leading-5 text-slate-400">
                                        Digital Entrepreneur
                                        <br />
                                        & Cybersecurity Learner
                                    </p>

                                    <div className="mt-3 flex gap-3 text-xs text-slate-500">
                                        <span>
                                            1.2K Connections
                                        </span>
                                        <span>•</span>
                                        <span>
                                            47 Posts
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-5 rounded-xl border border-white/[0.07] bg-black/20 p-3">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-400">
                                            Profile Strength
                                        </span>

                                        <span className="font-semibold text-cyan-300">
                                            82%
                                        </span>
                                    </div>

                                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                                        <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-cyan-400 to-purple-500" />
                                    </div>
                                </div>
                            </div>

                            {/* SIDEBAR MENU */}
                            <div className="border-t border-white/[0.06] p-3">

                                <NavItem
                                    icon="home"
                                    label="Home Feed"
                                    active
                                />

                                <NavItem
                                    icon="user"
                                    label="My Profile"
                                    onClick={protectedAction}
                                />

                                <NavItem
                                    icon="network"
                                    label="Network"
                                    onClick={protectedAction}
                                />

                                <NavItem
                                    icon="project"
                                    label="Projects"
                                    onClick={protectedAction}
                                />

                                <NavItem
                                    icon="courses"
                                    label="Courses"
                                    badge="NEW"
                                    onClick={() => {
                                        if (requireAuth()) {
                                            router.push("/courses");
                                        }
                                    }}
                                />

                                <NavItem
                                    icon="bookmark"
                                    label="Saved"
                                    onClick={protectedAction}
                                />

                                <NavItem
                                    icon="briefcase"
                                    label="My Applications"
                                    onClick={protectedAction}
                                />

                                <NavItem
                                    icon="message"
                                    label="Messages"
                                    onClick={protectedAction}
                                />

                                <NavItem
                                    icon="settings"
                                    label="Settings"
                                    onClick={protectedAction}
                                />
                            </div>
                        </section>

                        <section className="rounded-2xl border border-white/[0.08] bg-[#0b101c] p-5">
                            <h3 className="font-semibold">
                                Your Career Journey 🚀
                            </h3>

                            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                                {[
                                    ["72%", "Skills", "cyan"],
                                    ["65%", "Network", "purple"],
                                    ["48%", "Earnings", "orange"],
                                ].map(
                                    ([value, label, color]) => (
                                        <div key={label}>
                                            <div
                                                className={`mx-auto grid h-14 w-14 place-items-center rounded-full border text-xs font-bold ${
                                                    color === "cyan"
                                                        ? "border-cyan-400/50 text-cyan-300"
                                                        : color === "purple"
                                                          ? "border-purple-400/50 text-purple-300"
                                                          : "border-orange-400/50 text-orange-300"
                                                }`}
                                            >
                                                {value}
                                            </div>

                                            <div className="mt-2 text-[10px] text-slate-500">
                                                {label}
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </section>

                        <section className="rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/[0.08] to-purple-500/[0.06] p-5">
                            <div className="text-xl">👑</div>

                            <h3 className="mt-3 font-semibold">
                                Upgrade to LPE Pro
                            </h3>

                            <div className="mt-4 space-y-2 text-xs text-slate-400">
                                <p>✓ Premium Opportunities</p>
                                <p>✓ Direct Employer Access</p>
                                <p>✓ Advanced Analytics</p>
                            </div>

                            <button
                                type="button"
                                onClick={protectedAction}
                                className="mt-5 w-full rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 py-3 text-sm font-bold text-black"
                            >
                                Upgrade Now →
                            </button>
                        </section>
                    </div>
                </aside>

                {/* MAIN FEED */}
                <section className="min-w-0 space-y-5">

                    <div className="rounded-2xl border border-white/[0.08] bg-[#0b101c] p-5 shadow-2xl shadow-black/20">

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={protectedAction}
                            >
                                <Avatar
                                    initials={userName
                                        .charAt(0)
                                        .toUpperCase()}
                                    size="md"
                                />
                            </button>

                            <input
                                onClick={protectedAction}
                                readOnly={!session}
                                placeholder="What are you working on today?"
                                className="h-14 flex-1 rounded-xl border border-white/[0.08] bg-[#090d17] px-5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-purple-500/50"
                            />
                        </div>

                        <div className="mt-4 flex flex-wrap gap-3">
                            {[
                                ["briefcase", "Post a Job", "text-orange-400"],
                                ["project", "Share Project", "text-cyan-400"],
                                ["message", "Ask for Help", "text-purple-400"],
                                ["plus", "Share Update", "text-blue-400"],
                            ].map(([icon, label, color]) => (
                                <button
                                    type="button"
                                    key={label}
                                    onClick={protectedAction}
                                    className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.025] px-4 py-2.5 text-xs text-slate-300 transition hover:border-purple-500/40 hover:bg-purple-500/10"
                                >
                                    <span className={color}>
                                        <Icon
                                            name={icon as IconName}
                                            size={16}
                                        />
                                    </span>
                                    {label}
                                </button>
                            ))}
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-4">

                            <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                                <button
                                    type="button"
                                    onClick={protectedAction}
                                >
                                    ▣ Photo/Video
                                </button>

                                <button
                                    type="button"
                                    onClick={protectedAction}
                                >
                                    ▥ Poll
                                </button>

                                <button
                                    type="button"
                                    onClick={protectedAction}
                                >
                                    ◫ Document
                                </button>

                                <button
                                    type="button"
                                    onClick={protectedAction}
                                >
                                    🔗 Link
                                </button>

                                <button
                                    type="button"
                                    onClick={protectedAction}
                                >
                                    ▣ Event
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={protectedAction}
                                className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 px-8 py-3 text-sm font-semibold shadow-[0_10px_30px_rgba(124,58,237,.3)]"
                            >
                                Post
                            </button>
                        </div>
                    </div>

                    {/* FEED FILTER */}
                    <div className="flex flex-wrap items-center gap-2">
                        {[
                            "For You",
                            "Opportunities",
                            "Projects",
                            "Discussions",
                            "Success Stories",
                        ].map((item, index) => (
                            <button
                                type="button"
                                key={item}
                                onClick={
                                    index === 0
                                        ? undefined
                                        : protectedAction
                                }
                                className={`rounded-full px-5 py-2.5 text-sm transition ${
                                    index === 0
                                        ? "border border-purple-500/50 bg-purple-500/15 text-purple-300"
                                        : "border border-white/[0.07] bg-white/[0.025] text-slate-400 hover:text-white"
                                }`}
                            >
                                {item}
                            </button>
                        ))}
                    </div>

                    {/* JOB POST */}
                    <article className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b101c]">
                        <div className="p-6">

                            <div className="flex items-start justify-between">
                                <div className="flex gap-3">
                                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 font-bold">
                                        T
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold">
                                                TechNova Solutions
                                            </h3>

                                            <span className="text-cyan-400">
                                                ✓
                                            </span>

                                            <span className="text-xs text-emerald-400">
                                                • Hiring
                                            </span>
                                        </div>

                                        <p className="mt-1 text-xs text-slate-500">
                                            2 hours ago • Remote
                                        </p>
                                    </div>
                                </div>

                                <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-300">
                                    ⭐ Featured
                                </span>
                            </div>

                            <div className="mt-5 grid gap-5 md:grid-cols-[1fr_270px]">
                                <div>
                                    <h2 className="text-xl font-bold">
                                        🚀 We&apos;re Hiring{" "}
                                        <span className="text-blue-400">
                                            Frontend Developer
                                        </span>
                                    </h2>

                                    <p className="mt-3 text-sm leading-7 text-slate-400">
                                        We&apos;re looking for a passionate Frontend
                                        Developer to join our remote team and build
                                        modern web applications for global clients.
                                    </p>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {[
                                            "React",
                                            "Next.js",
                                            "TypeScript",
                                            "Tailwind CSS",
                                        ].map((skill) => (
                                            <span
                                                key={skill}
                                                className="rounded-lg border border-cyan-400/15 bg-cyan-400/[0.05] px-3 py-1.5 text-xs text-cyan-200"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="mt-5 flex flex-wrap gap-3 text-xs">
                                        <span className="rounded-full bg-emerald-500/10 px-3 py-2 text-emerald-300">
                                            💰 $2,500 – $4,000 / month
                                        </span>

                                        <span className="rounded-full bg-white/[0.04] px-3 py-2 text-slate-400">
                                            📍 Remote Worldwide
                                        </span>

                                        <span className="rounded-full bg-white/[0.04] px-3 py-2 text-slate-400">
                                            💼 Full-time
                                        </span>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-purple-500/20 bg-[radial-gradient(circle_at_50%_20%,rgba(124,58,237,.6),transparent_45%),linear-gradient(135deg,#111a36,#070a13)] p-5">

                                    <div className="flex h-32 items-center justify-center rounded-lg border border-purple-400/20 bg-black/30">
                                        <div className="text-center">
                                            <div className="text-4xl">
                                                ⌘
                                            </div>

                                            <p className="mt-2 text-xs text-purple-200">
                                                Remote Development
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={protectedAction}
                                        className="mt-4 w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 py-3 text-sm font-semibold"
                                    >
                                        Apply Now →
                                    </button>
                                </div>
                            </div>

                            <div className="mt-5 flex gap-5 text-xs text-slate-500">
                                <button
                                    type="button"
                                    onClick={protectedAction}
                                    className="text-pink-400"
                                >
                                    ♥ 432
                                </button>

                                <button
                                    type="button"
                                    onClick={protectedAction}
                                >
                                    ▢ 68 Comments
                                </button>

                                <button
                                    type="button"
                                    onClick={protectedAction}
                                >
                                    🔖 124 Saves
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-between border-t border-white/[0.06] px-4 py-2">
                            <Action
                                icon="heart"
                                label="Appreciate"
                                onClick={protectedAction}
                            />

                            <Action
                                icon="comment"
                                label="Comment"
                                onClick={protectedAction}
                            />

                            <Action
                                icon="share"
                                label="Share"
                                onClick={protectedAction}
                            />

                            <Action
                                icon="save"
                                label="Save"
                                onClick={protectedAction}
                            />
                        </div>
                    </article>

                    {/* PROJECT POST */}
                    <article className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b101c]">
                        <div className="p-6">

                            <div className="flex items-center justify-between">
                                <div className="flex gap-3">
                                    <Avatar
                                        initials="A"
                                        color="purple"
                                        size="md"
                                    />

                                    <div>
                                        <h3 className="font-semibold">
                                            Ayesha | UI/UX Designer{" "}
                                            <span className="text-blue-400">
                                                ✓
                                            </span>
                                        </h3>

                                        <p className="mt-1 text-xs text-slate-500">
                                            3 hours ago
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-300">
                                        ✦ Project Showcase
                                    </span>

                                    <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-300">
                                        ⭐ Featured
                                    </span>
                                </div>
                            </div>

                            <p className="mt-5 text-sm text-slate-300">
                                Excited to share my latest project! 🎉 Just
                                completed a modern SaaS dashboard design for a
                                UK-based client.
                            </p>

                            <div className="mt-4 flex flex-wrap gap-2">
                                {[
                                    "UI/UX",
                                    "Figma",
                                    "Product Design",
                                    "SaaS",
                                ].map((item) => (
                                    <span
                                        key={item}
                                        className="rounded-full bg-purple-500/10 px-3 py-1.5 text-xs text-purple-300"
                                    >
                                        {item}
                                    </span>
                                ))}
                            </div>

                            <div className="mt-5 overflow-hidden rounded-xl border border-white/[0.08] bg-[#090d17]">

                                <div className="grid h-44 grid-cols-3 gap-3 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,.5),transparent_30%),radial-gradient(circle_at_80%_70%,rgba(34,211,238,.35),transparent_25%)] p-4">
                                    <div className="rounded-lg border border-white/10 bg-white/[0.05]" />
                                    <div className="rounded-lg border border-white/10 bg-white/[0.08]" />
                                    <div className="rounded-lg border border-white/10 bg-white/[0.04]" />
                                </div>

                                <div className="flex items-center justify-between p-4">
                                    <div>
                                        <h4 className="font-semibold">
                                            SaaS Dashboard Design
                                        </h4>

                                        <p className="mt-1 text-xs text-slate-500">
                                            Complete UI/UX case study
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={protectedAction}
                                        className="rounded-lg bg-blue-600/80 px-4 py-2 text-xs font-semibold"
                                    >
                                        View Full Project →
                                    </button>
                                </div>
                            </div>

                            <div className="mt-5 flex gap-5 text-xs text-slate-500">
                                <button
                                    type="button"
                                    onClick={protectedAction}
                                    className="text-pink-400"
                                >
                                    ♥ 298
                                </button>

                                <button
                                    type="button"
                                    onClick={protectedAction}
                                >
                                    ▢ 42 Comments
                                </button>

                                <button
                                    type="button"
                                    onClick={protectedAction}
                                >
                                    ↗ 63 Shares
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-between border-t border-white/[0.06] px-4 py-2">
                            <Action
                                icon="heart"
                                label="Appreciate"
                                onClick={protectedAction}
                            />

                            <Action
                                icon="comment"
                                label="Comment"
                                onClick={protectedAction}
                            />

                            <Action
                                icon="project"
                                label="Collaborate"
                                onClick={protectedAction}
                            />

                            <Action
                                icon="share"
                                label="Share"
                                onClick={protectedAction}
                            />
                        </div>
                    </article>

                    {/* FREELANCE POST */}
                    <article className="rounded-2xl border border-white/[0.08] bg-[#0b101c] p-6">
                        <div className="flex gap-3">

                            <Avatar
                                initials="H"
                                color="orange"
                                size="md"
                            />

                            <div className="min-w-0 flex-1">

                                <h3 className="font-semibold">
                                    Hassan | Amazon VA{" "}
                                    <span className="text-blue-400">
                                        ✓
                                    </span>
                                </h3>

                                <p className="mt-1 text-xs text-slate-500">
                                    5 hours ago
                                </p>

                                <h2 className="mt-5 font-semibold">
                                    Looking for an Amazon FBA Virtual Assistant
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-slate-400">
                                    Need an experienced Amazon VA for product
                                    research, listing optimization and long-term
                                    support.
                                </p>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    {[
                                        "Amazon FBA",
                                        "Product Research",
                                        "PPC",
                                    ].map((item) => (
                                        <span
                                            key={item}
                                            className="rounded-lg bg-orange-500/[0.08] px-3 py-1.5 text-xs text-orange-300"
                                        >
                                            {item}
                                        </span>
                                    ))}
                                </div>

                                <div className="mt-5 flex flex-wrap items-center justify-between gap-4">

                                    <div className="flex flex-wrap gap-3 text-xs">
                                        <span className="rounded-full bg-emerald-500/10 px-3 py-2 text-emerald-300">
                                            💰 $400 – $800 / month
                                        </span>

                                        <span className="rounded-full bg-white/[0.04] px-3 py-2 text-slate-400">
                                            📍 Remote
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={protectedAction}
                                        className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-3 text-sm font-bold text-black"
                                    >
                                        I&apos;m Interested
                                    </button>
                                </div>
                            </div>
                        </div>
                    </article>
                </section>

                {/* RIGHT SIDEBAR */}
                <aside className="hidden xl:block">
                    <div className="sticky top-24 space-y-5">

                        <section className="rounded-2xl border border-white/[0.08] bg-[#0b101c] p-5">

                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold">
                                    🔥 Trending Opportunities
                                </h3>

                                <button
                                    type="button"
                                    onClick={protectedAction}
                                    className="text-xs text-cyan-300"
                                >
                                    See All →
                                </button>
                            </div>

                            <div className="mt-5 space-y-3">
                                {[
                                    ["React Developer", "$3k–$6k", "blue"],
                                    ["Shopify Store Manager", "$1.5k–$3k", "green"],
                                    ["Video Editor", "$800–$1.5k", "purple"],
                                    ["Cybersecurity Analyst", "$4k–$7k", "blue"],
                                    ["Content Writer", "$600–$1k", "purple"],
                                ].map(([title, salary, color]) => (
                                    <button
                                        type="button"
                                        key={title}
                                        onClick={protectedAction}
                                        className="flex w-full items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.025] p-3 text-left"
                                    >
                                        <div className="flex items-center gap-3">

                                            <div
                                                className={`grid h-10 w-10 place-items-center rounded-lg ${
                                                    color === "green"
                                                        ? "bg-emerald-500/15 text-emerald-300"
                                                        : color === "purple"
                                                          ? "bg-purple-500/15 text-purple-300"
                                                          : "bg-blue-500/15 text-blue-300"
                                                }`}
                                            >
                                                <Icon
                                                    name="briefcase"
                                                    size={18}
                                                />
                                            </div>

                                            <div>
                                                <p className="text-xs font-medium">
                                                    {title}
                                                </p>

                                                <p className="mt-1 text-[10px] text-slate-500">
                                                    Remote
                                                </p>
                                            </div>
                                        </div>

                                        <span className="text-[10px] font-semibold text-emerald-300">
                                            {salary}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section className="rounded-2xl border border-white/[0.08] bg-[#0b101c] p-5">

                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold">
                                    People You May Connect With
                                </h3>

                                <button
                                    type="button"
                                    onClick={protectedAction}
                                    className="text-xs text-cyan-300"
                                >
                                    See All →
                                </button>
                            </div>

                            <div className="mt-5 space-y-4">
                                {[
                                    ["Ahmed Raza", "Full Stack Developer", "A"],
                                    ["Sara Khan", "UI/UX Designer", "S"],
                                    ["Bilal Ahmad", "Amazon Expert USA", "B"],
                                    ["Hira Malik", "Digital Marketer", "H"],
                                ].map(([name, role, initial]) => (
                                    <div
                                        key={name}
                                        className="flex items-center gap-3"
                                    >
                                        <button
                                            type="button"
                                            onClick={protectedAction}
                                        >
                                            <Avatar
                                                initials={initial}
                                                size="sm"
                                                color={
                                                    initial === "S"
                                                        ? "purple"
                                                        : "blue"
                                                }
                                            />
                                        </button>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-xs font-semibold">
                                                {name}
                                            </p>

                                            <p className="truncate text-[10px] text-slate-500">
                                                {role}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={protectedAction}
                                            className="rounded-lg border border-blue-500/30 px-3 py-2 text-xs text-blue-300 transition hover:bg-blue-500/10"
                                        >
                                            Connect
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="rounded-2xl border border-white/[0.08] bg-[#0b101c] p-5">

                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold">
                                    Recommended Skills
                                </h3>

                                <button
                                    type="button"
                                    onClick={protectedAction}
                                    className="text-xs text-cyan-300"
                                >
                                    See All →
                                </button>
                            </div>

                            <div className="mt-5 space-y-3">
                                {[
                                    ["Next.js", "8.4K learners"],
                                    ["AI & Prompt Engineering", "18.7K learners"],
                                    ["Digital Marketing", "22.1K learners"],
                                    ["Shopify", "9.6K learners"],
                                ].map(([skill, learners]) => (
                                    <button
                                        type="button"
                                        key={skill}
                                        onClick={protectedAction}
                                        className="flex w-full items-center gap-3 rounded-xl bg-white/[0.025] p-3 text-left"
                                    >
                                        <div className="grid h-10 w-10 place-items-center rounded-lg bg-purple-500/10 text-sm font-bold text-purple-300">
                                            {skill[0]}
                                        </div>

                                        <div>
                                            <p className="text-xs font-medium">
                                                {skill}
                                            </p>

                                            <p className="mt-1 text-[10px] text-slate-500">
                                                {learners}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section className="rounded-2xl border border-white/[0.08] bg-[#0b101c] p-5">

                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold">
                                    Platform Activity
                                </h3>

                                <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] text-emerald-300">
                                    ● LIVE
                                </span>
                            </div>

                            <div className="mt-5 grid grid-cols-2 gap-3">
                                {[
                                    ["1,247", "Active Learners"],
                                    ["342", "New Opportunities"],
                                    ["56", "Projects Shared"],
                                    ["12", "Success Stories"],
                                ].map(([number, label]) => (
                                    <button
                                        type="button"
                                        key={label}
                                        onClick={protectedAction}
                                        className="rounded-xl border border-white/[0.06] bg-black/20 p-3 text-left"
                                    >
                                        <p className="font-bold text-purple-200">
                                            {number}
                                        </p>

                                        <p className="mt-1 text-[10px] text-slate-500">
                                            {label}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </section>

                    </div>
                </aside>
            </div>
        </main>
    );
}