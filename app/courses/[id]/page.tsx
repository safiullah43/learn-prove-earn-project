import Link from "next/link";
import EnrollmentButton from "./EnrollmentButton";
import { supabase } from "@/lib/supabase";

export async function generateStaticParams() {
  return [
    { id: "1" },
    { id: "2" },
    { id: "3" },
    { id: "4" },
    { id: "5" },
    { id: "6" },
  ];
}

const fallbackCourses: Record<string, any> = {
  "1": {
    title: "Amazon FBA Mastery",
    category: "E-Commerce",
    level: "Beginner → Advanced",
    duration: "8 Weeks",
    lessons: 42,
    students: "2,480+",
    instructor: "Safiullah",
    price: "PKR 5,000",
    description:
      "Learn how to build, launch and scale a profitable Amazon FBA business from product research to PPC and scaling.",
    modules: [
      "Amazon FBA Fundamentals",
      "Product Research & Validation",
      "Supplier Hunting",
      "Amazon Listing Optimization",
      "Keyword Research",
      "Amazon PPC",
      "Inventory & Logistics",
      "Scaling Your Amazon Business",
    ],
  },
  "2": {
    title: "Shopify Store Mastery",
    category: "E-Commerce",
    level: "Beginner → Advanced",
    duration: "6 Weeks",
    lessons: 36,
    students: "1,920+",
    instructor: "Safiullah",
    price: "PKR 5,000",
    description:
      "Build a professional Shopify store and learn product research, store setup, marketing and conversion optimization.",
    modules: [
      "Shopify Fundamentals",
      "Store Setup",
      "Product Research",
      "Product Pages",
      "Payments & Shipping",
      "Store Marketing",
      "Conversion Optimization",
      "Scaling Your Store",
    ],
  },
  "3": {
    title: "AI Automation",
    category: "Artificial Intelligence",
    level: "Beginner → Advanced",
    duration: "5 Weeks",
    lessons: 30,
    students: "1,650+",
    instructor: "Safiullah",
    price: "PKR 5,000",
    description:
      "Learn how to use modern AI tools to automate repetitive business tasks and create AI-powered workflows.",
    modules: [
      "AI Fundamentals",
      "AI Tools & Platforms",
      "Prompt Engineering",
      "Business Automation",
      "AI Content Systems",
      "No-Code Automation",
      "AI Agents",
      "Building AI Services",
    ],
  },
  "4": {
    title: "Digital Marketing Pro",
    category: "Marketing",
    level: "Beginner → Advanced",
    duration: "7 Weeks",
    lessons: 38,
    students: "2,100+",
    instructor: "Safiullah",
    price: "PKR 5,000",
    description:
      "Master digital marketing, social media, paid advertising, content strategy and client acquisition.",
    modules: [
      "Digital Marketing Fundamentals",
      "Social Media Marketing",
      "Content Strategy",
      "Facebook & Instagram Ads",
      "Google Ads",
      "SEO Fundamentals",
      "Lead Generation",
      "Client Acquisition",
    ],
  },
  "5": {
    title: "YouTube Automation",
    category: "Content Creation",
    level: "Beginner → Advanced",
    duration: "6 Weeks",
    lessons: 34,
    students: "1,780+",
    instructor: "Safiullah",
    price: "PKR 5,000",
    description:
      "Create and grow faceless YouTube channels using AI, outsourcing, content systems and smart monetization strategies.",
    modules: [
      "YouTube Automation Fundamentals",
      "Niche Research",
      "Channel Setup",
      "Script Writing",
      "AI Voice & Video",
      "Thumbnail Strategy",
      "YouTube SEO",
      "Monetization & Scaling",
    ],
  },
  "6": {
    title: "TikTok Automation",
    category: "Content Creation",
    level: "Beginner → Advanced",
    duration: "5 Weeks",
    lessons: 28,
    students: "1,420+",
    instructor: "Safiullah",
    price: "PKR 5,000",
    description:
      "Learn how to build TikTok content systems, grow audiences and monetize through affiliate marketing and digital products.",
    modules: [
      "TikTok Fundamentals",
      "Niche Selection",
      "Viral Content Research",
      "AI Content Creation",
      "TikTok SEO",
      "Growth Strategy",
      "Affiliate Marketing",
      "Monetization",
    ],
  },
};

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CourseDetail({ params }: PageProps) {
  const { id } = await params;

  // 1. Query Supabase for dynamic course details
  const { data: dbCourse } = await supabase
    .from("courses")
    .select("id, title, description, category, level, duration, price")
    .eq("id", id)
    .maybeSingle();

  // 2. Query dynamic modules for this course
  const { data: dbModules } = await supabase
    .from("modules")
    .select(`
      id,
      title,
      position,
      lessons (id)
    `)
    .eq("course_id", id)
    .order("position", { ascending: true });

  let course: any = null;

  if (dbCourse) {
    const totalLessons = (dbModules || []).reduce(
      (acc, m: any) => acc + (m.lessons?.length || 0),
      0
    );

    course = {
      title: dbCourse.title,
      category: dbCourse.category || "Digital Skills",
      level: dbCourse.level || "Beginner → Advanced",
      duration: dbCourse.duration || "Self-Paced",
      lessons: totalLessons || "Practical Modules",
      students: "Verified Learners",
      price: dbCourse.price ? `PKR ${dbCourse.price}` : "Premium",
      instructor: "Safiullah",
      description: dbCourse.description || "Master real-world practical skills.",
      modules:
        dbModules && dbModules.length > 0
          ? dbModules.map((m: any) => m.title)
          : ["Course Introduction & Overview"],
    };
  } else if (fallbackCourses[id]) {
    course = fallbackCourses[id];
  }

  if (!course) {
    return (
      <main className="min-h-screen bg-[#060913] text-white flex items-center justify-center px-4 sm:px-6">
        <div className="text-center">
          <div className="text-5xl sm:text-7xl font-black mb-4 sm:mb-5">404</div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">Course Not Found</h1>
          <p className="text-sm sm:text-base text-white/50 mb-6 sm:mb-8">This course is currently unavailable or has been removed.</p>
          <Link
            href="/courses"
            className="inline-flex rounded-xl bg-white px-5 py-2.5 sm:px-6 sm:py-3 text-sm font-bold text-black hover:bg-white/90 transition"
          >
            ← Back to Courses
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#060913] pb-24 text-white md:pb-12">
      {/* TOP NAV */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#060913]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-xl sm:text-2xl font-black tracking-tight">
            LPE<span className="text-yellow-400">.</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm text-white/60">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <Link href="/courses" className="text-white font-semibold">Courses</Link>
            <Link href="/" className="hover:text-white transition">Network</Link>
            <Link href="/" className="hover:text-white transition">Projects</Link>
          </nav>

          <Link
            href="/dashboard"
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold hover:bg-white/10 transition"
          >
            Dashboard
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(234,179,8,0.15),transparent_35%)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-16">
          <div className="max-w-4xl">
            <div className="mb-4 sm:mb-5 flex flex-wrap gap-2 sm:gap-3">
              <span className="rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-yellow-300">
                {course.category}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-semibold text-white/70">
                {course.level}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-6xl font-black leading-tight">
              {course.title}
            </h1>

            <p className="mt-4 sm:mt-6 max-w-3xl text-sm sm:text-lg leading-6 sm:leading-8 text-white/60">
              {course.description}
            </p>

            {/* Mobile-Ready Stats Grid */}
            <div className="mt-6 sm:mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs sm:text-sm text-white/60 rounded-2xl border border-white/5 bg-white/[0.02] p-4 sm:p-0 sm:border-none sm:bg-transparent">
              <div>
                <span className="block text-lg sm:text-xl font-bold text-white">{course.lessons}</span>
                Lessons
              </div>
              <div>
                <span className="block text-lg sm:text-xl font-bold text-white">{course.duration}</span>
                Duration
              </div>
              <div>
                <span className="block text-lg sm:text-xl font-bold text-white">{course.students}</span>
                Students
              </div>
              <div>
                <span className="block text-lg sm:text-xl font-bold text-white">{course.instructor}</span>
                Instructor
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[1fr_360px]">
        {/* ENROLL CARD (Order Top on Mobile) */}
        <aside className="order-1 lg:order-2">
          <div className="sticky top-20 overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl">
            <div className="h-28 sm:h-36 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.25),transparent_65%)] p-4 sm:p-6">
              <div className="flex h-full items-center justify-center">
                <div className="text-4xl sm:text-6xl">🎓</div>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <p className="text-xs sm:text-sm text-white/40">Course Access</p>
              <div className="mt-1 text-2xl sm:text-3xl font-black">{course.price || "Premium"}</div>
              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-white/40">
                Full access to all lessons and future updates.
              </p>

              {/* ENROLLMENT BUTTON */}
              <EnrollmentButton courseId={id} />

              <div className="mt-5 sm:mt-6 space-y-2.5 sm:space-y-3 text-xs sm:text-sm text-white/60">
                <div className="flex justify-between">
                  <span>Lessons</span>
                  <span className="font-semibold text-white">{course.lessons}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration</span>
                  <span className="font-semibold text-white">{course.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span>Level</span>
                  <span className="font-semibold text-white">Beginner+</span>
                </div>
                <div className="flex justify-between">
                  <span>Certificate</span>
                  <span className="font-semibold text-green-400">Included</span>
                </div>
              </div>

              <Link
                href="/courses"
                className="mt-5 sm:mt-6 block text-center text-xs sm:text-sm font-semibold text-white/50 hover:text-white transition"
              >
                ← Browse All Courses
              </Link>
            </div>
          </div>
        </aside>

        {/* CURRICULUM */}
        <div className="order-2 lg:order-1">
          <div className="mb-4 sm:mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-yellow-400">
              Curriculum
            </p>
            <h2 className="mt-1.5 sm:mt-2 text-2xl sm:text-3xl font-black">What You&apos;ll Learn</h2>
            <p className="mt-1 text-xs sm:text-sm text-white/50">Complete structured learning path.</p>
          </div>

          <div className="space-y-2.5 sm:space-y-3">
            {course.modules.map((module: string, index: number) => (
              <div
                key={module + index}
                className="group flex items-center gap-3.5 sm:gap-5 rounded-xl sm:rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 sm:p-5 transition hover:border-yellow-400/30 hover:bg-white/[0.05]"
              >
                <div className="flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-yellow-400/10 text-xs sm:text-base font-black text-yellow-300">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm sm:text-base truncate sm:whitespace-normal">{module}</h3>
                  <p className="mt-0.5 text-[11px] sm:text-sm text-white/40">Practical lessons & real-world training</p>
                </div>

                <span className="text-white/30 group-hover:text-yellow-400 transition text-sm sm:text-base">→</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-4 py-6 sm:px-6 sm:py-10 text-center md:text-left">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 text-xs sm:text-sm text-white/40 md:flex-row">
          <p>© 2026 Learn • Prove • Earn. All rights reserved.</p>
          <Link href="/" className="hover:text-white transition">Back to Home</Link>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-white/10 bg-[#070913]/95 px-2 py-2 backdrop-blur-lg md:hidden">
        <Link href="/" className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-white">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-6h6v6"/></svg>
          <span className="text-[10px] font-medium">Home</span>
        </Link>

        <Link href="/courses" className="flex flex-col items-center gap-0.5 text-yellow-400">
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

        <Link href="/dashboard" className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-white">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c.8-4.2 3.5-6 8-6s7.2 1.8 8 6"/></svg>
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </div>
    </main>
  );
}