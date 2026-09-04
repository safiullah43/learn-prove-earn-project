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
  video_url?: string;
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
        onReady?: (event: { target: YouTubePlayer }) => void;
        onStateChange?: (event: { data: number; target: YouTubePlayer }) => void;
        onError?: (event: { data: number }) => void;
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

function extractYouTubeId(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (url.length === 11 && !url.includes("/") && !url.includes(".")) return url;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : undefined;
}

function isDirectVideoUrl(url?: string | null): boolean {
  if (!url) return false;
  return (
    url.endsWith(".mp4") ||
    url.endsWith(".webm") ||
    url.endsWith(".m3u8") ||
    url.includes("blob:") ||
    (!url.includes("youtube.com") && !url.includes("youtu.be"))
  );
}

export default function LessonPage({ courseId, lessonId }: LessonPageProps) {
  const router = useRouter();

  const [courseLessons, setCourseLessons] = useState<Lesson[]>([]);
  const [lessonIndex, setLessonIndex] = useState<number>(-1);
  const [lesson, setLesson] = useState<Lesson | null>(null);

  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [watchProgress, setWatchProgress] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  const nativeVideoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const trackingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const watchedSecondsRef = useRef(0);
  const lastVideoTimeRef = useRef<number | null>(null);

  const completedRef = useRef(false);
  const savingRef = useRef(false);

  useEffect(() => {
    completedRef.current = completed;
  }, [completed]);

  useEffect(() => {
    savingRef.current = saving;
  }, [saving]);

  /*
  |--------------------------------------------------------------------------
  | FETCH DB LESSON DATA & AUTH CHECK
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    let active = true;

    async function loadLessonAndAuth() {
      try {
        setLoading(true);
        setError("");

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!active) return;

        if (!session) {
          router.replace(`/auth/login?redirect=/courses/${courseId}/learn/${lessonId}`);
          return;
        }

        // Check Enrollment
        const { data: enrollment, error: enrollmentError } = await supabase
          .from("enrollments")
          .select("id, status, progress")
          .eq("user_id", session.user.id)
          .eq("course_id", courseId)
          .maybeSingle();

        if (!active) return;

        if (enrollmentError || !enrollment || enrollment.status === "cancelled") {
          router.replace(`/courses/${courseId}`);
          return;
        }

        // Fetch Modules & Lessons from DB
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
              is_published,
              position
            )
          `)
          .eq("course_id", courseId)
          .order("position", { ascending: true });

        let loadedLessons: Lesson[] = [];

        if (dbModules && dbModules.length > 0) {
          const rawLessons = dbModules.flatMap((m: any) =>
            (m.lessons || [])
              .filter((l: any) => l.is_published !== false)
              .sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
          );

          loadedLessons = rawLessons.map((l: any) => ({
            id: l.id,
            title: l.title,
            duration: "15 min",
            description: l.content || l.notes || "No detailed description provided.",
            points: ["Watch video to complete", "Detailed notes included"],
            videoId: extractYouTubeId(l.video_url),
            video_url: l.video_url,
          }));
        }

        if (active) {
          setCourseLessons(loadedLessons);
          
          let index = loadedLessons.findIndex((item) => item.id === lessonId);
          
          if (index === -1 && loadedLessons.length > 0) {
            const numIndex = parseInt(lessonId, 10) - 1;
            if (!isNaN(numIndex) && numIndex >= 0 && numIndex < loadedLessons.length) {
              index = numIndex;
            } else {
              index = 0;
            }
          }

          setLessonIndex(index);
          const current = index !== -1 ? loadedLessons[index] : null;
          setLesson(current);

          if (current) {
            const { data: progressData } = await supabase
              .from("course_progress")
              .select("completed")
              .eq("user_id", session.user.id)
              .eq("course_id", courseId)
              .eq("lesson_id", current.id)
              .maybeSingle();

            if (active) {
              const alreadyCompleted = progressData?.completed === true;
              setCompleted(alreadyCompleted);
              completedRef.current = alreadyCompleted;
              setWatchProgress(alreadyCompleted ? 100 : 0);
            }
          }
        }
      } catch (err) {
        console.error("Error loading lesson:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadLessonAndAuth();

    return () => {
      active = false;
    };
  }, [courseId, lessonId, router]);

  /*
  |--------------------------------------------------------------------------
  | AUTOMATIC LESSON COMPLETION TRIGGER
  |--------------------------------------------------------------------------
  */
  async function automaticallyCompleteLesson() {
    if (!lesson || completedRef.current || savingRef.current) return;

    completedRef.current = true;
    savingRef.current = true;

    setSaving(true);
    setError("");
    setWatchProgress(100);

    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      completedRef.current = false;
      savingRef.current = false;
      setSaving(false);
      return;
    }

    const now = new Date().toISOString();

    const { error: progressError } = await supabase.from("course_progress").upsert(
      {
        user_id: session.user.id,
        course_id: courseId,
        lesson_id: lesson.id,
        completed: true,
        completed_at: now,
        updated_at: now,
      },
      { onConflict: "user_id,course_id,lesson_id" }
    );

    if (progressError) {
      console.error("Lesson completion error:", progressError);
      completedRef.current = false;
      savingRef.current = false;
      setSaving(false);
      return;
    }

    const { data: allProgress } = await supabase
      .from("course_progress")
      .select("lesson_id")
      .eq("user_id", session.user.id)
      .eq("course_id", courseId)
      .eq("completed", true);

    const completedCount = allProgress?.length || 0;
    const totalCount = courseLessons.length || 1;
    const nextProgress = Math.round((completedCount / totalCount) * 100);

    await supabase
      .from("enrollments")
      .update({
        progress: nextProgress,
        status: nextProgress === 100 ? "completed" : "active",
      })
      .eq("user_id", session.user.id)
      .eq("course_id", courseId);

    setCompleted(true);
    setSaving(false);
    savingRef.current = false;
  }

  function handleSpeedChange(speed: number) {
    setPlaybackSpeed(speed);
    if (nativeVideoRef.current) {
      nativeVideoRef.current.playbackRate = speed;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | YOUTUBE TRACKER
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    if (!lesson?.videoId || isDirectVideoUrl(lesson.video_url) || completed) return;

    let active = true;

    function setupPlayer() {
      if (!active || !window.YT) return;
      const iframe = document.getElementById("youtube-player");
      if (!iframe || playerRef.current) return;

      try {
        playerRef.current = new window.YT.Player("youtube-player", {
          events: {
            onReady: () => {
              if (!active) return;
              watchedSecondsRef.current = 0;
              lastVideoTimeRef.current = null;

              if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);

              trackingIntervalRef.current = setInterval(() => {
                if (!active || !playerRef.current || completedRef.current) return;

                const player = playerRef.current;
                let currentTime = 0;
                let duration = 0;
                let state = -1;

                try {
                  currentTime = player.getCurrentTime();
                  duration = player.getDuration();
                  state = player.getPlayerState();
                } catch {
                  return;
                }

                if (!duration || duration <= 0) return;

                const isPlaying = window.YT && state === window.YT.PlayerState.PLAYING;

                if (isPlaying) {
                  const lastTime = lastVideoTimeRef.current;
                  if (lastTime !== null) {
                    const diff = currentTime - lastTime;
                    if (diff > 0 && diff <= 3) {
                      watchedSecondsRef.current += diff;
                    }
                  }
                  lastVideoTimeRef.current = currentTime;
                } else {
                  lastVideoTimeRef.current = currentTime;
                }

                const percentage = Math.min((watchedSecondsRef.current / duration) * 100, 100);

                if (active) setWatchProgress(percentage);
                if (percentage >= 90) {
                  automaticallyCompleteLesson();
                }
              }, 1000);
            },
          },
        });
      } catch (err) {
        console.error("YouTube init error:", err);
      }
    }

    function loadYouTubeAPI() {
      if (window.YT) {
        setupPlayer();
        return;
      }
      const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
      if (!existingScript) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;
        document.head.appendChild(script);
      }
      window.onYouTubeIframeAPIReady = () => {
        setupPlayer();
      };
    }

    loadYouTubeAPI();

    return () => {
      active = false;
      if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch {}
        playerRef.current = null;
      }
    };
  }, [lesson?.videoId, lesson?.video_url, completed]);

  function goPrevious() {
    if (lessonIndex <= 0) return;
    const prev = courseLessons[lessonIndex - 1];
    if (prev) router.push(`/courses/${courseId}/learn/${prev.id}`);
  }

  function goNext() {
    if (lessonIndex < courseLessons.length - 1) {
      const next = courseLessons[lessonIndex + 1];
      if (next) router.push(`/courses/${courseId}/learn/${next.id}`);
    } else {
      router.push(`/courses/${courseId}/learn`);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black px-6 py-20 text-white">
        <div className="mx-auto max-w-4xl animate-pulse">
          <div className="h-5 w-32 rounded bg-white/10" />
          <div className="mt-6 h-12 w-3/4 rounded bg-white/10" />
          <div className="mt-6 aspect-video rounded-3xl bg-white/5" />
        </div>
      </main>
    );
  }

  if (!lesson) {
    return (
      <main className="min-h-screen bg-black px-6 py-20 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <div className="text-6xl">📚</div>
          <h1 className="mt-6 text-3xl font-black">No Lessons Available</h1>
          <p className="mt-4 text-white/50">There are currently no active lessons or modules set up for this course.</p>
          <button
            onClick={() => router.push(`/courses/${courseId}/learn`)}
            className="mt-8 rounded-2xl bg-yellow-400 px-6 py-3 font-black text-black hover:bg-yellow-300"
          >
            ← Back to Course Syllabus
          </button>
        </div>
      </main>
    );
  }

  const isDirectVideo = isDirectVideoUrl(lesson.video_url);
  const youtubeSrc = lesson.videoId
    ? `https://www.youtube.com/embed/${lesson.videoId}?enablejsapi=1&origin=${encodeURIComponent(
        typeof window !== "undefined" ? window.location.origin : ""
      )}&rel=0&playsinline=1`
    : "";

  const isLastLesson = lessonIndex === courseLessons.length - 1;

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <button onClick={() => router.push("/")} className="text-2xl font-black">
            LPE<span className="text-yellow-400">.</span>
          </button>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => router.push(`/courses/${courseId}/learn`)}
              className="rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-white/70 hover:bg-white/5"
            >
              ← Course Lessons
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-xl bg-yellow-400 px-3 py-2 text-sm font-black text-black hover:bg-yellow-300"
            >
              Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-12">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-yellow-400">
              Lesson {lessonIndex + 1} of {courseLessons.length}
            </p>
            <h1 className="mt-2 text-3xl font-black md:text-5xl">{lesson.title}</h1>
          </div>

          {/* Speed Controls for Direct HD Player */}
          {isDirectVideo && (
            <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1.5 self-start sm:self-auto">
              <span className="px-2 text-xs font-bold text-white/40 uppercase">Speed:</span>
              {[0.75, 1.0, 1.25, 1.5, 2.0].map((speed) => (
                <button
                  key={speed}
                  onClick={() => handleSpeedChange(speed)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                    playbackSpeed === speed
                      ? "bg-yellow-400 text-black"
                      : "text-white/70 hover:bg-white/10"
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Video Player Box */}
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl">
          {isDirectVideo ? (
            <div className="relative aspect-video w-full bg-black">
              <video
                ref={nativeVideoRef}
                src={lesson.video_url!}
                controls
                controlsList="nodownload"
                className="h-full w-full object-contain"
                onTimeUpdate={() => {
                  if (!nativeVideoRef.current || completedRef.current) return;
                  const video = nativeVideoRef.current;
                  if (video.duration > 0) {
                    const percentage = (video.currentTime / video.duration) * 100;
                    setWatchProgress(percentage);
                    if (percentage >= 90) {
                      automaticallyCompleteLesson();
                    }
                  }
                }}
              />
            </div>
          ) : lesson.videoId ? (
            <div className="aspect-video w-full bg-black">
              <iframe
                id="youtube-player"
                title={lesson.title}
                src={youtubeSrc}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="flex aspect-video w-full items-center justify-center bg-black px-6 text-center">
              <div>
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-yellow-400 text-3xl text-black">
                  ▶
                </div>
                <h2 className="mt-5 text-xl font-black">Video Stream Ready</h2>
                <p className="mt-2 text-sm text-white/40">You can attach a video to this lesson from the Admin Panel.</p>
              </div>
            </div>
          )}
        </section>

        {/* Watch Progress Bar */}
        {!completed && (
          <section className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-bold text-white/80">Lesson Completion Progress</p>
                <p className="text-xs text-white/35">Watching 90% completes this lesson automatically.</p>
              </div>
              <span className="text-lg font-black text-yellow-400">{Math.round(watchProgress)}%</span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-yellow-400 transition-all duration-500"
                style={{ width: `${watchProgress}%` }}
              />
            </div>
          </section>
        )}

        {/* Completion Badge */}
        {completed && (
          <section className="mt-6 rounded-3xl border border-green-400/20 bg-green-400/10 p-6 text-center">
            <div className="text-4xl">🎉</div>
            <h3 className="mt-3 text-xl font-black text-green-400">Lesson Completed!</h3>
            <p className="mt-2 text-sm text-white/50">Your progress has been successfully saved to the database.</p>
          </section>
        )}

        {/* Lesson Notes */}
        <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-2xl font-black text-yellow-400">About This Lesson</h2>
          <p className="mt-4 text-white/70 whitespace-pre-line leading-relaxed">
            {lesson.description}
          </p>
        </section>

        {/* Navigation Controls */}
        <section className="mt-8 grid gap-3 sm:grid-cols-2">
          <button
            onClick={goPrevious}
            disabled={lessonIndex === 0}
            className="rounded-2xl border border-white/10 px-6 py-4 font-bold text-white/70 hover:bg-white/5 disabled:opacity-30"
          >
            ← Previous Lesson
          </button>
          <button
            onClick={goNext}
            className="rounded-2xl bg-yellow-400 px-6 py-4 font-black text-black hover:bg-yellow-300"
          >
            {isLastLesson ? "Back to Course Syllabus →" : "Next Lesson →"}
          </button>
        </section>
      </div>
    </main>
  );
}