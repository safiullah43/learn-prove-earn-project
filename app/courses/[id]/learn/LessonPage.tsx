"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type LessonPageProps = {
  courseId: string;
  lessonId: string;
};

type Lesson = {
  id: string;
  title: string;
  duration: string;
  description: string;
  points: string[];
  videoId?: string;
};

type YouTubePlayer = {
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  destroy: () => void;
};

type YouTubeAPI = {
  Player: new (
    element: HTMLElement | string,
    options: {
      events?: {
        onReady?: (event: {
          target: YouTubePlayer;
        }) => void;
        onStateChange?: (event: {
          data: number;
          target: YouTubePlayer;
        }) => void;
        onError?: (event: {
          data: number;
        }) => void;
      };
    }
  ) => YouTubePlayer;

  PlayerState: {
    UNSTARTED: number;
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
    BUFFERING: number;
    CUED: number;
  };
};

declare global {
  interface Window {
    YT?: YouTubeAPI;
    onYouTubeIframeAPIReady?: () => void;
  }
}

/*
|--------------------------------------------------------------------------
| COURSE LESSON DATA
|--------------------------------------------------------------------------
*/

const lessons: Record<string, Lesson[]> = {
  "1": [
    {
      id: "amazon-1",
      title: "Amazon FBA Introduction",
      duration: "12 min",
      description:
        "Is lesson mein aap Amazon FBA ka complete basic concept samjhenge aur dekhenge ke FBA business kis tarah kaam karta hai.",
      points: [
        "Amazon FBA kya hai",
        "FBA business model kaise kaam karta hai",
        "Amazon seller account ka basic overview",
        "FBA ke major costs",
        "Product ko Amazon warehouse tak kaise bheja jata hai",
      ],
      videoId: "1oX1ORb1IgY",
    },

    {
      id: "amazon-2",
      title: "Product Research",
      duration: "18 min",
      description:
        "Is lesson mein profitable Amazon products identify karne ka practical framework seekhenge.",
      points: [
        "Product research fundamentals",
        "Demand aur competition analysis",
        "Profit margin calculate karna",
        "Reviews aur competition check karna",
        "Product validation",
      ],
      videoId: "gYg5Y3voVF4",
    },

    {
      id: "amazon-3",
      title: "Supplier Hunting",
      duration: "20 min",
      description:
        "Reliable suppliers find karne aur products ki sourcing samajhne ka practical framework.",
      points: [
        "Supplier research",
        "Supplier verification",
        "MOQ samajhna",
        "Samples mangwana",
        "Supplier negotiation basics",
      ],
      videoId: "EQAlQ33eKDU",
    },

    {
      id: "amazon-4",
      title: "Listing Optimization",
      duration: "22 min",
      description:
        "Amazon product listing ko conversion aur visibility ke liye optimize karna seekhein.",
      points: [
        "Product title optimization",
        "Bullet points",
        "Product description",
        "Product images",
        "Keyword optimization",
      ],
      videoId: "IUETpFpsWXc",
    },

    {
      id: "amazon-5",
      title: "Amazon PPC",
      duration: "25 min",
      description:
        "Amazon PPC advertising ke fundamentals aur campaign structure samjhein.",
      points: [
        "PPC kya hai",
        "Automatic campaigns",
        "Manual campaigns",
        "Keywords",
        "ACOS aur campaign optimization",
      ],
      videoId: "63ybBVzsjJQ",
    },

    {
      id: "amazon-6",
      title: "Scaling Your Business",
      duration: "20 min",
      description:
        "Successful Amazon business ko scale karne ki important strategies.",
      points: [
        "Inventory planning",
        "More products launch karna",
        "Advertising scale karna",
        "Brand building",
        "Long-term growth",
      ],
      videoId: "Ovbj76kPU_k",
    },
  ],

  "2": [
    {
      id: "shopify-1",
      title: "Shopify Basics",
      duration: "12 min",
      description:
        "Shopify kya hai aur e-commerce store ka basic structure kaise kaam karta hai.",
      points: [
        "Shopify introduction",
        "Store structure",
        "Products",
        "Orders",
        "Customers",
      ],
    },

    {
      id: "shopify-2",
      title: "Store Setup",
      duration: "18 min",
      description:
        "Professional Shopify store setup karne ka complete overview.",
      points: [
        "Store settings",
        "Domain",
        "Payment methods",
        "Shipping",
        "Store policies",
      ],
    },

    {
      id: "shopify-3",
      title: "Product Selection",
      duration: "20 min",
      description:
        "Winning products identify karne aur validate karne ka framework.",
      points: [
        "Product research",
        "Demand",
        "Competition",
        "Profit margins",
        "Product validation",
      ],
    },

    {
      id: "shopify-4",
      title: "Store Design",
      duration: "22 min",
      description:
        "High-converting Shopify store design ke fundamentals.",
      points: [
        "Homepage",
        "Product page",
        "Navigation",
        "Trust elements",
        "Mobile optimization",
      ],
    },

    {
      id: "shopify-5",
      title: "Marketing & Sales",
      duration: "25 min",
      description:
        "Shopify store ke liye customer acquisition aur marketing basics.",
      points: [
        "Social media marketing",
        "Paid ads",
        "Content",
        "Email marketing",
        "Conversion optimization",
      ],
    },

    {
      id: "shopify-6",
      title: "Scaling Your Store",
      duration: "20 min",
      description:
        "Profitable Shopify store ko scale karne ke practical concepts.",
      points: [
        "Scaling ads",
        "New products",
        "Customer retention",
        "Automation",
        "Business growth",
      ],
    },
  ],

  "3": [
    {
      id: "ai-1",
      title: "Introduction to AI Automation",
      duration: "15 min",
      description:
        "AI automation ka concept aur modern businesses mein iska use.",
      points: [
        "AI automation kya hai",
        "AI aur traditional automation",
        "Business use cases",
        "Automation opportunities",
        "AI workflow basics",
      ],
    },

    {
      id: "ai-2",
      title: "AI Tools",
      duration: "20 min",
      description:
        "Different AI tools ko business workflows mein use karna.",
      points: [
        "AI assistants",
        "Content tools",
        "Image tools",
        "Video tools",
        "Automation platforms",
      ],
    },

    {
      id: "ai-3",
      title: "Workflow Automation",
      duration: "22 min",
      description:
        "Repeated business tasks ko automated workflows mein convert karna.",
      points: [
        "Workflow mapping",
        "Triggers",
        "Actions",
        "Data flow",
        "Testing",
      ],
    },

    {
      id: "ai-4",
      title: "AI Content Systems",
      duration: "20 min",
      description:
        "AI-powered content production system create karna.",
      points: [
        "Content research",
        "AI writing",
        "Content planning",
        "Content repurposing",
        "Quality control",
      ],
    },

    {
      id: "ai-5",
      title: "Business Automation",
      duration: "25 min",
      description:
        "Businesses ke common processes ko AI se automate karna.",
      points: [
        "Lead generation",
        "Customer support",
        "Reporting",
        "Data processing",
        "Task automation",
      ],
    },

    {
      id: "ai-6",
      title: "Building AI Solutions",
      duration: "25 min",
      description:
        "AI-based solutions ko plan aur build karne ka framework.",
      points: [
        "Problem identification",
        "Solution design",
        "Tool selection",
        "Testing",
        "Deployment",
      ],
    },
  ],

  "4": [
    {
      id: "marketing-1",
      title: "Digital Marketing Fundamentals",
      duration: "15 min",
      description:
        "Digital marketing ke core concepts aur channels samjhein.",
      points: [
        "Digital marketing basics",
        "Target audience",
        "Marketing funnel",
        "Customer journey",
        "KPIs",
      ],
    },

    {
      id: "marketing-2",
      title: "Social Media Marketing",
      duration: "20 min",
      description:
        "Social media platforms par brand aur audience build karna.",
      points: [
        "Content strategy",
        "Platform selection",
        "Audience growth",
        "Engagement",
        "Analytics",
      ],
    },

    {
      id: "marketing-3",
      title: "SEO Marketing",
      duration: "22 min",
      description:
        "Search engines se organic traffic generate karne ke fundamentals.",
      points: [
        "SEO basics",
        "Keyword research",
        "On-page SEO",
        "Technical SEO",
        "Content SEO",
      ],
    },

    {
      id: "marketing-4",
      title: "Paid Advertising",
      duration: "25 min",
      description:
        "Paid advertising campaigns ke fundamentals.",
      points: [
        "Ad platforms",
        "Campaign objectives",
        "Targeting",
        "Creative testing",
        "Optimization",
      ],
    },

    {
      id: "marketing-5",
      title: "Content Marketing",
      duration: "20 min",
      description:
        "Content ko business growth ke liye strategically use karna.",
      points: [
        "Content strategy",
        "Content formats",
        "Content calendar",
        "Distribution",
        "Measurement",
      ],
    },

    {
      id: "marketing-6",
      title: "Marketing Analytics",
      duration: "18 min",
      description:
        "Marketing performance ko data ke through analyze karna.",
      points: [
        "Important metrics",
        "Traffic analysis",
        "Conversion tracking",
        "ROI",
        "Optimization",
      ],
    },
  ],

  "5": [
    {
      id: "youtube-1",
      title: "YouTube Automation Basics",
      duration: "15 min",
      description:
        "Faceless YouTube channels aur automation model ka introduction.",
      points: [
        "YouTube automation",
        "Faceless channels",
        "Channel models",
        "Content workflow",
        "Monetization basics",
      ],
    },

    {
      id: "youtube-2",
      title: "Niche Research",
      duration: "20 min",
      description:
        "YouTube ke liye strong aur sustainable niche identify karna.",
      points: [
        "Niche research",
        "Audience demand",
        "Competition",
        "Content opportunities",
        "Validation",
      ],
    },

    {
      id: "youtube-3",
      title: "Video Scripts",
      duration: "18 min",
      description:
        "Engaging YouTube scripts ka structure samjhein.",
      points: [
        "Hook",
        "Story structure",
        "Retention",
        "Call to action",
        "AI-assisted scripting",
      ],
    },

    {
      id: "youtube-4",
      title: "AI Voice & Video",
      duration: "25 min",
      description:
        "AI tools ko video production workflow mein use karna.",
      points: [
        "AI voice",
        "Visuals",
        "Video editing",
        "Workflow",
        "Quality control",
      ],
    },

    {
      id: "youtube-5",
      title: "YouTube SEO",
      duration: "22 min",
      description:
        "Videos ko YouTube search aur discovery ke liye optimize karna.",
      points: [
        "Keywords",
        "Titles",
        "Thumbnails",
        "Descriptions",
        "Analytics",
      ],
    },

    {
      id: "youtube-6",
      title: "Monetization & Scaling",
      duration: "25 min",
      description:
        "YouTube channel ko monetize aur scale karne ke fundamentals.",
      points: [
        "YouTube Partner Program",
        "Revenue streams",
        "Sponsorships",
        "Affiliate marketing",
        "Scaling",
      ],
    },
  ],

  "6": [
    {
      id: "tiktok-1",
      title: "TikTok Automation Basics",
      duration: "12 min",
      description:
        "TikTok automation aur faceless content model ka introduction.",
      points: [
        "TikTok automation",
        "Faceless content",
        "Content systems",
        "Audience",
        "Monetization basics",
      ],
    },

    {
      id: "tiktok-2",
      title: "Finding Viral Niches",
      duration: "18 min",
      description:
        "TikTok par content opportunities aur niches identify karna.",
      points: [
        "Niche research",
        "Trends",
        "Audience demand",
        "Competition",
        "Content ideas",
      ],
    },

    {
      id: "tiktok-3",
      title: "Content Creation",
      duration: "20 min",
      description:
        "Short-form content ka effective production workflow.",
      points: [
        "Hooks",
        "Short-form structure",
        "Visuals",
        "Captions",
        "Retention",
      ],
    },

    {
      id: "tiktok-4",
      title: "AI Video Creation",
      duration: "25 min",
      description:
        "AI tools ki help se TikTok videos create karna.",
      points: [
        "AI scripts",
        "AI voice",
        "AI visuals",
        "Video editing",
        "Publishing workflow",
      ],
    },

    {
      id: "tiktok-5",
      title: "TikTok Growth",
      duration: "22 min",
      description:
        "TikTok account ko organically grow karne ke fundamentals.",
      points: [
        "Posting strategy",
        "Content testing",
        "Engagement",
        "Analytics",
        "Growth loops",
      ],
    },

    {
      id: "tiktok-6",
      title: "Monetization",
      duration: "20 min",
      description:
        "TikTok audience ko different monetization models mein convert karna.",
      points: [
        "Affiliate marketing",
        "Brand deals",
        "Digital products",
        "Services",
        "Audience monetization",
      ],
    },
  ],
};

/*
|--------------------------------------------------------------------------
| LESSON PAGE
|--------------------------------------------------------------------------
*/

export default function LessonPage({
  courseId,
  lessonId,
}: LessonPageProps) {
  const router = useRouter();

  const courseLessons =
    lessons[courseId] || [];

  const lessonIndex =
    courseLessons.findIndex(
      (item) => item.id === lessonId
    );

  const lesson =
    courseLessons[lessonIndex];

  /*
   * UI states
   */
  const [loading, setLoading] =
    useState(true);

  const [completed, setCompleted] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [watchProgress, setWatchProgress] =
    useState(0);

  /*
   * YouTube player reference.
   */
  const playerRef =
    useRef<YouTubePlayer | null>(null);

  /*
   * Interval used for tracking playback.
   */
  const trackingIntervalRef =
    useRef<ReturnType<
      typeof setInterval
    > | null>(null);

  /*
   * Actual watched seconds.
   */
  const watchedSecondsRef =
    useRef(0);

  /*
   * Last known YouTube position.
   */
  const lastVideoTimeRef =
    useRef<number | null>(null);

  /*
   * Prevent duplicate completion calls.
   */
  const completedRef =
    useRef(false);

  const savingRef =
    useRef(false);

  /*
   * Track whether component is mounted.
   */
  const mountedRef =
    useRef(true);

  /*
   * Keep current video ID available
   * to the API callback.
   */
  const currentVideoIdRef =
    useRef<string | undefined>(
      lesson?.videoId
    );

  /*
   * Sync refs with state.
   */
  useEffect(() => {
    completedRef.current =
      completed;
  }, [completed]);

  useEffect(() => {
    savingRef.current =
      saving;
  }, [saving]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  /*
   * Update current video ID.
   */
  useEffect(() => {
    currentVideoIdRef.current =
      lesson?.videoId;
  }, [lesson?.videoId]);

  /*
  |--------------------------------------------------------------------------
  | AUTH + ENROLLMENT + EXISTING PROGRESS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let active = true;

    async function loadLesson() {
      setLoading(true);
      setError("");

      const {
        data: { session },
      } =
        await supabase.auth.getSession();

      if (!active) {
        return;
      }

      if (!session) {
        router.replace(
          "/auth/login?redirect=/courses/" +
            courseId +
            "/learn/" +
            lessonId
        );

        return;
      }

      /*
       * Check enrollment.
       */
      const {
        data: enrollment,
        error: enrollmentError,
      } =
        await supabase
          .from("enrollments")
          .select(
            "id, status, progress"
          )
          .eq(
            "user_id",
            session.user.id
          )
          .eq(
            "course_id",
            courseId
          )
          .maybeSingle();

      if (!active) {
        return;
      }

      if (
        enrollmentError ||
        !enrollment ||
        enrollment.status ===
          "cancelled"
      ) {
        router.replace(
          "/courses/" + courseId
        );

        return;
      }

      /*
       * Get current lesson progress.
       */
      const {
        data: progressData,
        error: progressError,
      } =
        await supabase
          .from("course_progress")
          .select(
            "completed, completed_at"
          )
          .eq(
            "user_id",
            session.user.id
          )
          .eq(
            "course_id",
            courseId
          )
          .eq(
            "lesson_id",
            lessonId
          )
          .maybeSingle();

      if (!active) {
        return;
      }

      if (progressError) {
        console.error(
          "Progress load error:",
          progressError
        );
      }

      const alreadyCompleted =
        progressData?.completed === true;

      setCompleted(
        alreadyCompleted
      );

      completedRef.current =
        alreadyCompleted;

      if (alreadyCompleted) {
        setWatchProgress(100);
      } else {
        setWatchProgress(0);
      }

      setLoading(false);
    }

    loadLesson();

    return () => {
      active = false;
    };
  }, [
    courseId,
    lessonId,
    router,
  ]);

  /*
  |--------------------------------------------------------------------------
  | AUTOMATICALLY COMPLETE LESSON
  |--------------------------------------------------------------------------
  */

  async function automaticallyCompleteLesson() {
    if (
      completedRef.current ||
      savingRef.current
    ) {
      return;
    }

    /*
     * Immediately lock completion
     * to prevent duplicate requests.
     */
    completedRef.current = true;
    savingRef.current = true;

    setSaving(true);
    setError("");
    setWatchProgress(100);

    /*
     * Stop tracker.
     */
    if (
      trackingIntervalRef.current
    ) {
      clearInterval(
        trackingIntervalRef.current
      );

      trackingIntervalRef.current =
        null;
    }

    /*
     * Get authenticated user.
     */
    const {
      data: { session },
    } =
      await supabase.auth.getSession();

    if (!session) {
      completedRef.current =
        false;

      savingRef.current =
        false;

      setSaving(false);

      router.replace(
        "/auth/login?redirect=/courses/" +
          courseId +
          "/learn/" +
          lessonId
      );

      return;
    }

    const now =
      new Date().toISOString();

    /*
     * Save lesson completion.
     */
    const {
      error: progressError,
    } =
      await supabase
        .from("course_progress")
        .upsert(
          {
            user_id:
              session.user.id,

            course_id:
              courseId,

            lesson_id:
              lessonId,

            completed: true,

            completed_at:
              now,

            updated_at:
              now,
          },
          {
            onConflict:
              "user_id,course_id,lesson_id",
          }
        );

    if (progressError) {
      console.error(
        "Lesson completion error:",
        progressError
      );

      completedRef.current =
        false;

      savingRef.current =
        false;

      setSaving(false);

      setError(
        "Lesson progress save nahi ho saki. Dobara try karein."
      );

      return;
    }

    /*
     * Count all completed lessons.
     */
    const {
      data: allProgress,
      error: countError,
    } =
      await supabase
        .from("course_progress")
        .select("lesson_id")
        .eq(
          "user_id",
          session.user.id
        )
        .eq(
          "course_id",
          courseId
        )
        .eq(
          "completed",
          true
        );

    if (countError) {
      console.error(
        "Progress count error:",
        countError
      );
    }

    const completedCount =
      allProgress?.length || 0;

    /*
     * Calculate percentage.
     */
    const nextProgress =
      courseLessons.length > 0
        ? Math.round(
            (completedCount /
              courseLessons.length) *
              100
          )
        : 0;

    /*
     * Update enrollment progress.
     */
    const {
      error: enrollmentError,
    } =
      await supabase
        .from("enrollments")
        .update({
          progress:
            nextProgress,

          status:
            nextProgress === 100
              ? "completed"
              : "active",
        })
        .eq(
          "user_id",
          session.user.id
        )
        .eq(
          "course_id",
          courseId
        );

    if (enrollmentError) {
      console.error(
        "Enrollment progress error:",
        enrollmentError
      );

      setError(
        "Lesson complete ho gayi, lekin course progress update nahi ho saki."
      );
    }

    setCompleted(true);

    completedRef.current =
      true;

    setSaving(false);

    savingRef.current =
      false;
  }

  /*
  |--------------------------------------------------------------------------
  | LOAD YOUTUBE IFRAME API
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    /*
     * No video means no YouTube tracking.
     */
    if (!lesson?.videoId) {
      return;
    }

    /*
     * If lesson already completed,
     * we don't need to track again.
     */
    if (completed) {
      return;
    }

    let active = true;

    function setupPlayer() {
      if (!active) {
        return;
      }

      if (!window.YT) {
        return;
      }

      const iframe =
        document.getElementById(
          "youtube-player"
        );

      if (!iframe) {
        return;
      }

      /*
       * Prevent duplicate players.
       */
      if (playerRef.current) {
        return;
      }

      try {
        /*
         * The iframe is already rendered
         * directly in JSX.
         *
         * We attach the YouTube API to it.
         */
        playerRef.current =
          new window.YT.Player(
            "youtube-player",
            {
              events: {
                onReady: () => {
                  if (!active) {
                    return;
                  }

                  /*
                   * Reset tracking.
                   */
                  watchedSecondsRef.current =
                    0;

                  lastVideoTimeRef.current =
                    null;

                  /*
                   * Clear previous interval.
                   */
                  if (
                    trackingIntervalRef.current
                  ) {
                    clearInterval(
                      trackingIntervalRef.current
                    );
                  }

                  /*
                   * Start actual watch-time tracker.
                   */
                  trackingIntervalRef.current =
                    setInterval(() => {
                      if (
                        !active ||
                        !playerRef.current ||
                        completedRef.current
                      ) {
                        return;
                      }

                      const player =
                        playerRef.current;

                      let currentTime = 0;
                      let duration = 0;
                      let state = -1;

                      try {
                        currentTime =
                          player.getCurrentTime();

                        duration =
                          player.getDuration();

                        state =
                          player.getPlayerState();
                      } catch {
                        return;
                      }

                      if (
                        !duration ||
                        duration <= 0
                      ) {
                        return;
                      }

                      /*
                       * Only count PLAYING.
                       */
                      const isPlaying =
                        window.YT &&
                        state ===
                          window.YT
                            .PlayerState
                            .PLAYING;

                      if (isPlaying) {
                        const lastTime =
                          lastVideoTimeRef.current;

                        /*
                         * First position.
                         */
                        if (
                          lastTime ===
                          null
                        ) {
                          lastVideoTimeRef.current =
                            currentTime;

                          return;
                        }

                        const difference =
                          currentTime -
                          lastTime;

                        /*
                         * Normal playback:
                         *
                         * 0 < difference <= 3
                         *
                         * Anything bigger is
                         * treated as a seek.
                         */
                        if (
                          difference > 0 &&
                          difference <= 3
                        ) {
                          watchedSecondsRef.current +=
                            difference;
                        }

                        /*
                         * Always update current
                         * position.
                         */
                        lastVideoTimeRef.current =
                          currentTime;
                      } else {
                        /*
                         * Pause / buffering:
                         * don't count time.
                         */
                        lastVideoTimeRef.current =
                          currentTime;
                      }

                      /*
                       * Calculate actual watch
                       * percentage.
                       */
                      const percentage =
                        Math.min(
                          (watchedSecondsRef.current /
                            duration) *
                            100,
                          100
                        );

                      if (active) {
                        setWatchProgress(
                          percentage
                        );
                      }

                      /*
                       * Automatically complete
                       * at 90% actual watch time.
                       */
                      if (
                        percentage >=
                        90
                      ) {
                        automaticallyCompleteLesson();
                      }
                    }, 1000);
                },

                onStateChange: (
                  event
                ) => {
                  if (
                    !active ||
                    !window.YT ||
                    completedRef.current
                  ) {
                    return;
                  }

                  /*
                   * Video starts playing.
                   */
                  if (
                    event.data ===
                    window.YT
                      .PlayerState
                      .PLAYING
                  ) {
                    if (
                      playerRef.current
                    ) {
                      try {
                        lastVideoTimeRef.current =
                          playerRef.current.getCurrentTime();
                      } catch {
                        lastVideoTimeRef.current =
                          null;
                      }
                    }

                    return;
                  }

                  /*
                   * Pause.
                   */
                  if (
                    event.data ===
                    window.YT
                      .PlayerState
                      .PAUSED
                  ) {
                    if (
                      playerRef.current
                    ) {
                      try {
                        lastVideoTimeRef.current =
                          playerRef.current.getCurrentTime();
                      } catch {
                        lastVideoTimeRef.current =
                          null;
                      }
                    }

                    return;
                  }

                  /*
                   * Buffering.
                   */
                  if (
                    event.data ===
                    window.YT
                      .PlayerState
                      .BUFFERING
                  ) {
                    if (
                      playerRef.current
                    ) {
                      try {
                        lastVideoTimeRef.current =
                          playerRef.current.getCurrentTime();
                      } catch {
                        lastVideoTimeRef.current =
                          null;
                      }
                    }

                    return;
                  }

                  /*
                   * Video ended.
                   */
                  if (
                    event.data ===
                    window.YT
                      .PlayerState
                      .ENDED
                  ) {
                    if (
                      !playerRef.current
                    ) {
                      return;
                    }

                    let duration = 0;

                    try {
                      duration =
                        playerRef.current.getDuration();
                    } catch {
                      return;
                    }

                    if (
                      duration <= 0
                    ) {
                      return;
                    }

                    const percentage =
                      (watchedSecondsRef.current /
                        duration) *
                      100;

                    if (
                      percentage >=
                      90
                    ) {
                      automaticallyCompleteLesson();
                    }
                  }
                },

                onError: (
                  event
                ) => {
                  console.error(
                    "YouTube player error:",
                    event.data
                  );

                  /*
                   * Common YouTube embed errors:
                   *
                   * 2   = invalid parameter
                   * 5   = HTML5 player error
                   * 100 = video not found/private
                   * 101 = embedding not allowed
                   * 150 = embedding not allowed
                   * 153 = missing referer/client identity
                   */
                  setError(
                    "YouTube video load nahi ho saki. Error code: " +
                      event.data
                  );
                },
              },
            }
          );
        } catch (playerError) {
          console.error(
            "YouTube player initialization error:",
            playerError
          );

          setError(
            "YouTube player initialize nahi ho saka."
          );
        }
    }

    function loadYouTubeAPI() {
      /*
       * API already available.
       */
      if (window.YT) {
        setupPlayer();
        return;
      }

      /*
       * If script already exists,
       * wait for callback.
       */
      const existingScript =
        document.querySelector(
          'script[src="https://www.youtube.com/iframe_api"]'
        );

      /*
       * Preserve previous callback.
       */
      const previousCallback =
        window.onYouTubeIframeAPIReady;

      window.onYouTubeIframeAPIReady =
        () => {
          if (
            typeof previousCallback ===
            "function"
          ) {
            try {
              previousCallback();
            } catch {
              // Ignore previous callback errors.
            }
          }

          setupPlayer();
        };

      /*
       * Add script only once.
       */
      if (!existingScript) {
        const script =
          document.createElement(
            "script"
          );

        script.src =
          "https://www.youtube.com/iframe_api";

        script.async = true;

        document.head.appendChild(
          script
        );
      }
    }

    /*
     * Small delay ensures iframe is
     * already mounted in DOM.
     */
    const timeout =
      setTimeout(() => {
        loadYouTubeAPI();
      }, 100);

    return () => {
      active = false;

      clearTimeout(timeout);

      /*
       * Stop tracker.
       */
      if (
        trackingIntervalRef.current
      ) {
        clearInterval(
          trackingIntervalRef.current
        );

        trackingIntervalRef.current =
          null;
      }

      /*
       * Destroy API player.
       */
      if (
        playerRef.current
      ) {
        try {
          playerRef.current.destroy();
        } catch {
          // Ignore destroy errors.
        }

        playerRef.current =
          null;
      }

      /*
       * Reset tracking.
       */
      watchedSecondsRef.current =
        0;

      lastVideoTimeRef.current =
        null;
    };
  }, [
    lesson?.videoId,
    completed,
  ]);

  /*
  |--------------------------------------------------------------------------
  | PREVIOUS LESSON
  |--------------------------------------------------------------------------
  */

  function goPrevious() {
    if (
      lessonIndex <= 0
    ) {
      return;
    }

    const previousLesson =
      courseLessons[
        lessonIndex - 1
      ];

    if (!previousLesson) {
      return;
    }

    router.push(
      "/courses/" +
        courseId +
        "/learn/" +
        previousLesson.id
    );
  }

  /*
  |--------------------------------------------------------------------------
  | NEXT LESSON
  |--------------------------------------------------------------------------
  */

  function goNext() {
    if (
      lessonIndex <
      courseLessons.length - 1
    ) {
      const nextLesson =
        courseLessons[
          lessonIndex + 1
        ];

      if (!nextLesson) {
        return;
      }

      router.push(
        "/courses/" +
          courseId +
          "/learn/" +
          nextLesson.id
      );

      return;
    }

    /*
     * Course finished.
     */
    router.push("/dashboard");
  }

  /*
  |--------------------------------------------------------------------------
  | INVALID LESSON
  |--------------------------------------------------------------------------
  */

  if (!lesson) {
    return (
      <main className="min-h-screen bg-black px-6 py-20 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <div className="text-6xl">
            ❌
          </div>

          <h1 className="mt-6 text-4xl font-black">
            Lesson Not Found
          </h1>

          <p className="mt-4 text-white/50">
            Ye lesson available nahi hai.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/courses/" +
                  courseId +
                  "/learn"
              )
            }
            className="mt-8 rounded-2xl bg-yellow-400 px-6 py-3 font-black text-black transition hover:bg-yellow-300"
          >
            Back to Course
          </button>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | LOADING SCREEN
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <main className="min-h-screen bg-black px-6 py-20 text-white">
        <div className="mx-auto max-w-4xl animate-pulse">
          <div className="h-5 w-32 rounded bg-white/10" />

          <div className="mt-6 h-12 w-3/4 rounded bg-white/10" />

          <div className="mt-6 aspect-video rounded-3xl bg-white/5" />

          <div className="mt-6 h-40 rounded-3xl bg-white/5" />
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | YOUTUBE EMBED URL
  |--------------------------------------------------------------------------
  */

  const youtubeSrc =
    lesson.videoId
      ? "https://www.youtube.com/embed/" +
        lesson.videoId +
        "?enablejsapi=1&origin=" +
        encodeURIComponent(
          typeof window !== "undefined"
            ? window.location.origin
            : ""
        ) +
        "&rel=0&playsinline=1"
      : "";

  return (
    <main className="min-h-screen bg-black text-white">
      {/*
      |--------------------------------------------------------------------------
      | HEADER
      |--------------------------------------------------------------------------
      */}

      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <button
            type="button"
            onClick={() =>
              router.push("/")
            }
            className="text-2xl font-black"
          >
            LPE
            <span className="text-yellow-400">
              .
            </span>
          </button>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/courses/" +
                    courseId +
                    "/learn"
                )
              }
              className="rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/5 hover:text-white md:px-4"
            >
              ← Course Lessons
            </button>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/dashboard"
                )
              }
              className="rounded-xl bg-yellow-400 px-3 py-2 text-sm font-black text-black transition hover:bg-yellow-300 md:px-4"
            >
              Dashboard
            </button>
          </div>
        </div>
      </header>

      {/*
      |--------------------------------------------------------------------------
      | MAIN CONTENT
      |--------------------------------------------------------------------------
      */}

      <div className="mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-12">
        {/*
        |--------------------------------------------------------------------------
        | LESSON HEADER
        |--------------------------------------------------------------------------
        */}

        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-yellow-400">
            Lesson{" "}
            {lessonIndex + 1} of{" "}
            {courseLessons.length}
          </p>

          <h1 className="mt-3 text-3xl font-black leading-tight md:text-5xl">
            {lesson.title}
          </h1>

          <p className="mt-3 text-sm text-white/40">
            ⏱ {lesson.duration}
          </p>
        </div>

        {/*
        |--------------------------------------------------------------------------
        | VIDEO PLAYER
        |--------------------------------------------------------------------------
        */}

        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl">
          {lesson.videoId ? (
            <div className="aspect-video w-full bg-black">
              <iframe
                id="youtube-player"
                title={lesson.title}
                src={youtubeSrc}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="flex aspect-video w-full items-center justify-center bg-black px-6">
              <div className="text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-yellow-400 text-3xl text-black">
                  ▶
                </div>

                <h2 className="mt-5 text-xl font-black">
                  Video Coming Soon
                </h2>

                <p className="mt-2 max-w-md text-sm leading-6 text-white/40">
                  Is lesson ki video abhi
                  available nahi hai.
                </p>
              </div>
            </div>
          )}
        </section>

        {/*
        |--------------------------------------------------------------------------
        | WATCH PROGRESS
        |--------------------------------------------------------------------------
        */}

        {lesson.videoId &&
          !completed && (
            <section className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 md:p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-white/80">
                    Actual Watch Progress
                  </p>

                  <p className="mt-1 max-w-xl text-xs leading-5 text-white/35">
                    Sirf actual video playback
                    time count hota hai.
                    Forward seek ki hui duration
                    progress mein add nahi hoti.
                  </p>
                </div>

                <span className="shrink-0 text-lg font-black text-yellow-400">
                  {Math.round(
                    watchProgress
                  )}
                  %
                </span>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-yellow-400 transition-all duration-500"
                  style={{
                    width:
                      watchProgress +
                      "%",
                  }}
                />
              </div>

              <p className="mt-3 text-xs leading-5 text-white/30">
                Required actual watch time
                complete hone par lesson
                automatically complete ho jayega.
              </p>
            </section>
          )}

        {/*
        |--------------------------------------------------------------------------
        | SAVING NOTICE
        |--------------------------------------------------------------------------
        */}

        {saving && (
          <div className="mt-4 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 px-5 py-4 text-center">
            <p className="text-sm font-bold text-yellow-400">
              Saving your progress...
            </p>
          </div>
        )}

        {/*
        |--------------------------------------------------------------------------
        | COMPLETED NOTICE
        |--------------------------------------------------------------------------
        */}

        {completed && (
          <section className="mt-6 rounded-3xl border border-green-400/20 bg-green-400/10 p-6 md:p-8">
            <div className="text-center">
              <div className="text-4xl">
                🎉
              </div>

              <h3 className="mt-3 text-xl font-black text-green-400">
                Lesson Completed
              </h3>

              <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-white/50">
                Aap ne is lesson ka required
                actual video watch time complete
                kar liya hai. Aapki progress
                automatically save ho gayi hai.
              </p>
            </div>
          </section>
        )}

        {/*
        |--------------------------------------------------------------------------
        | ERROR
        |--------------------------------------------------------------------------
        */}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm leading-6 text-red-300">
            {error}
          </div>
        )}

        {/*
        |--------------------------------------------------------------------------
        | ABOUT LESSON
        |--------------------------------------------------------------------------
        */}

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400 font-black text-black">
              01
            </div>

            <h2 className="text-2xl font-black">
              About This Lesson
            </h2>
          </div>

          <p className="mt-5 text-base leading-8 text-white/60">
            {lesson.description}
          </p>
        </section>

        {/*
        |--------------------------------------------------------------------------
        | WHAT YOU WILL LEARN
        |--------------------------------------------------------------------------
        */}

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400 font-black text-black">
              02
            </div>

            <h2 className="text-2xl font-black">
              What You Will Learn
            </h2>
          </div>

          <div className="mt-6 space-y-4">
            {lesson.points.map(
              (
                point,
                index
              ) => (
                <div
                  key={point}
                  className="flex items-start gap-4 rounded-2xl border border-white/5 bg-black/20 p-4"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-xs font-black text-black">
                    {index + 1}
                  </span>

                  <p className="pt-1 text-sm leading-6 text-white/70 md:text-base">
                    {point}
                  </p>
                </div>
              )
            )}
          </div>
        </section>

        {/*
        |--------------------------------------------------------------------------
        | LESSON NAVIGATION
        |--------------------------------------------------------------------------
        */}

        <section className="mt-8">
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={goPrevious}
              disabled={
                lessonIndex === 0
              }
              className="rounded-2xl border border-white/10 px-6 py-4 font-bold text-white/70 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              ← Previous Lesson
            </button>

            <button
              type="button"
              onClick={goNext}
              className="rounded-2xl bg-yellow-400 px-6 py-4 font-black text-black transition hover:bg-yellow-300 hover:scale-[1.01]"
            >
              {lessonIndex ===
              courseLessons.length - 1
                ? "Finish Course →"
                : "Next Lesson →"}
            </button>
          </div>
        </section>

        {/*
        |--------------------------------------------------------------------------
        | FOOTER INFO
        |--------------------------------------------------------------------------
        */}

        <div className="mt-10 border-t border-white/10 pt-6 text-center">
          <p className="text-xs leading-6 text-white/25">
            Learn Prove Earn • Learn skills.
            Build proof. Earn opportunities.
          </p>
        </div>
      </div>
    </main>
  );
}