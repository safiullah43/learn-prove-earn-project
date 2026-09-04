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
      <main className="min-h-screen bg-[#060913] text-white flex items-center justify-center px-6">
        <div className="text-center">
          <div className="text-7xl font-black mb-5">404</div>
          <h1 className="text-3xl font-bold mb-3">Course Not Found</h1>
          <p className="text-white/50 mb-8">This course is currently unavailable or has been removed.</p>
          <Link
            href="/courses"
            className="inline-flex rounded-xl bg-white px-6 py-3 font-bold text-black hover:bg-white/90 transition"
          >
            ← Back to Courses
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#060913] text-white">
      {/* TOP NAV */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#060913]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-2xl font-black tracking-tight">
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
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10 transition"
          >
            My Dashboard
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(234,179,8,0.15),transparent_35%)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-24">
          <div className="max-w-4xl">
            <div className="mb-5 flex flex-wrap gap-3">
              <span className="rounded-full border border-yellow-400/20 bg-yellow-400/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-yellow-300">
                {course.category}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/70">
                {course.level}
              </span>
            </div>

            <h1 className="text-4xl font-black leading-tight md:text-6xl">
              {course.title}
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/60">
              {course.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-8 text-sm text-white/60">
              <div>
                <span className="block text-xl font-bold text-white">{course.lessons}</span>
                Lessons
              </div>
              <div>
                <span className="block text-xl font-bold text-white">{course.duration}</span>
                Duration
              </div>
              <div>
                <span className="block text-xl font-bold text-white">{course.students}</span>
                Students
              </div>
              <div>
                <span className="block text-xl font-bold text-white">{course.instructor}</span>
                Instructor
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[1fr_360px]">
        {/* CURRICULUM */}
        <div>
          <div className="mb-6">
            <p className="text-sm font-bold uppercase tracking-widest text-yellow-400">
              Curriculum
            </p>
            <h2 className="mt-2 text-3xl font-black">What You&apos;ll Learn</h2>
            <p className="mt-2 text-white/50">Complete structured learning path.</p>
          </div>

          <div className="space-y-3">
            {course.modules.map((module: string, index: number) => (
              <div
                key={module + index}
                className="group flex items-center gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-yellow-400/30 hover:bg-white/[0.05]"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-yellow-400/10 font-black text-yellow-300">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="flex-1">
                  <h3 className="font-bold">{module}</h3>
                  <p className="mt-1 text-sm text-white/40">Practical lessons & real-world training</p>
                </div>

                <span className="text-white/30 group-hover:text-yellow-400 transition">→</span>
              </div>
            ))}
          </div>
        </div>

        {/* ENROLL CARD */}
        <aside>
          <div className="sticky top-24 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl">
            <div className="h-40 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.25),transparent_65%)] p-6">
              <div className="flex h-full items-center justify-center">
                <div className="text-6xl">🎓</div>
              </div>
            </div>

            <div className="p-6">
              <p className="text-sm text-white/40">Course Access</p>
              <div className="mt-1 text-3xl font-black">{course.price || "Premium"}</div>
              <p className="mt-2 text-sm text-white/40">
                Full access to all lessons and future updates.
              </p>

              {/* ENROLLMENT BUTTON */}
              <EnrollmentButton courseId={id} />

              <div className="mt-6 space-y-3 text-sm text-white/60">
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
                className="mt-6 block text-center text-sm font-semibold text-white/50 hover:text-white transition"
              >
                ← Browse All Courses
              </Link>
            </div>
          </div>
        </aside>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-sm text-white/40 md:flex-row">
          <p>© 2026 Learn • Prove • Earn. All rights reserved.</p>
          <Link href="/" className="hover:text-white transition">Back to Home</Link>
        </div>
      </footer>
    </main>
  );
}