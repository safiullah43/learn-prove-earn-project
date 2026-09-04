"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Course = {
  id: string;
  title: string;
  category: string;
  description: string | null;
  level: string | null;
  is_published: boolean;
};

type Module = {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  position: number;
  is_published: boolean;
};

type Lesson = {
  id: string;
  course_id: string;
  module_id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  content: string | null;
  position: number;
  is_preview: boolean;
  is_published: boolean;
};

type ModuleForm = {
  title: string;
  description: string;
  position: number;
  is_published: boolean;
};

type LessonForm = {
  title: string;
  description: string;
  video_url: string;
  content: string;
  position: number;
  is_preview: boolean;
  is_published: boolean;
};

const EMPTY_MODULE_FORM: ModuleForm = {
  title: "",
  description: "",
  position: 1,
  is_published: true,
};

const EMPTY_LESSON_FORM: LessonForm = {
  title: "",
  description: "",
  video_url: "",
  content: "",
  position: 1,
  is_preview: false,
  is_published: true,
};

export default function CourseContentPage() {
  const params = useParams<{ "course-id": string }>();
  const router = useRouter();

  const courseId = useMemo(() => {
    const value = params?.["course-id"];

    if (Array.isArray(value)) {
      return value[0]?.trim() ?? "";
    }

    return value?.trim() ?? "";
  }, [params]);

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [deletingModuleId, setDeletingModuleId] = useState<string | null>(null);
  const [deletingLessonId, setDeletingLessonId] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  const [showModuleForm, setShowModuleForm] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [moduleForm, setModuleForm] = useState<ModuleForm>(EMPTY_MODULE_FORM);

  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [lessonForm, setLessonForm] = useState<LessonForm>(EMPTY_LESSON_FORM);

  const loadCourseContent = useCallback(async () => {
    if (!courseId) {
      setLoading(false);
      setCourse(null);
      setError("Invalid course ID.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(userError.message);
      }

      if (!user) {
        router.replace("/auth/login");
        return;
      }

      const { data: adminUser, error: adminError } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (adminError) {
        throw new Error(adminError.message);
      }

      if (!adminUser) {
        router.replace("/dashboard");
        return;
      }

      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("id, title, category, description, level, is_published")
        .eq("id", courseId)
        .maybeSingle();

      if (courseError) {
        throw new Error(courseError.message);
      }

      if (!courseData) {
        setCourse(null);
        setModules([]);
        setLessons([]);
        setError("Course not found.");
        return;
      }

      const { data: moduleData, error: moduleError } = await supabase
        .from("modules")
        .select("id, course_id, title, description, position, is_published")
        .eq("course_id", courseId)
        .order("position", { ascending: true });

      if (moduleError) {
        throw new Error(moduleError.message);
      }

      const loadedModules = (moduleData ?? []) as Module[];
      const moduleIds = loadedModules.map((module) => module.id);

      let loadedLessons: Lesson[] = [];

      if (moduleIds.length > 0) {
        const { data: lessonData, error: lessonError } = await supabase
          .from("lessons")
          .select("id, course_id, module_id, title, description, video_url, content, position, is_preview, is_published")
          .in("module_id", moduleIds)
          .order("position", { ascending: true });

        if (lessonError) {
          throw new Error(lessonError.message);
        }

        loadedLessons = (lessonData ?? []) as Lesson[];
      }

      const initialExpandedState: Record<string, boolean> = {};
      loadedModules.forEach((module, index) => {
        initialExpandedState[module.id] = index === 0;
      });

      setCourse(courseData as Course);
      setModules(loadedModules);
      setLessons(loadedLessons);
      setExpandedModules(initialExpandedState);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Failed to load course content."
      );
    } finally {
      setLoading(false);
    }
  }, [courseId, router]);

  useEffect(() => {
    void loadCourseContent();
  }, [loadCourseContent]);

  function clearMessages() {
    setError("");
    setSuccess("");
  }

  function toggleModule(moduleId: string) {
    setExpandedModules((current) => ({
      ...current,
      [moduleId]: !current[moduleId],
    }));
  }

  function getModuleLessons(moduleId: string) {
    return lessons
      .filter((lesson) => lesson.module_id === moduleId)
      .sort((a, b) => a.position - b.position);
  }

  function openAddModule() {
    clearMessages();
    setEditingModuleId(null);
    setModuleForm({
      ...EMPTY_MODULE_FORM,
      position: modules.length + 1,
    });
    setShowModuleForm(true);
  }

  function openEditModule(module: Module) {
    clearMessages();
    setEditingModuleId(module.id);
    setModuleForm({
      title: module.title,
      description: module.description ?? "",
      position: module.position,
      is_published: module.is_published,
    });
    setShowModuleForm(true);
  }

  function closeModuleForm() {
    if (saving) return;
    setShowModuleForm(false);
    setEditingModuleId(null);
    setModuleForm(EMPTY_MODULE_FORM);
  }

  function updateModuleField<K extends keyof ModuleForm>(
    field: K,
    value: ModuleForm[K]
  ) {
    setModuleForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function saveModule() {
    const title = moduleForm.title.trim();

    if (!title) {
      setError("Module title is required.");
      return;
    }

    const position = Math.max(1, Number(moduleForm.position) || 1);

    try {
      setSaving(true);
      clearMessages();

      if (editingModuleId) {
        const { data, error: updateError } = await supabase
          .from("modules")
          .update({
            title,
            description: moduleForm.description.trim() || null,
            position,
            is_published: moduleForm.is_published,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingModuleId)
          .select("id, course_id, title, description, position, is_published")
          .single();

        if (updateError) throw new Error(updateError.message);

        setModules((current) =>
          current
            .map((module) => (module.id === editingModuleId ? (data as Module) : module))
            .sort((a, b) => a.position - b.position)
        );

        setSuccess("Module updated successfully.");
      } else {
        const { data, error: insertError } = await supabase
          .from("modules")
          .insert({
            course_id: courseId,
            title,
            description: moduleForm.description.trim() || null,
            position,
            is_published: moduleForm.is_published,
          })
          .select("id, course_id, title, description, position, is_published")
          .single();

        if (insertError) throw new Error(insertError.message);

        const newModule = data as Module;

        setModules((current) =>
          [...current, newModule].sort((a, b) => a.position - b.position)
        );

        setExpandedModules((current) => ({
          ...current,
          [newModule.id]: true,
        }));

        setSuccess("New module created successfully.");
      }

      setShowModuleForm(false);
      setEditingModuleId(null);
      setModuleForm(EMPTY_MODULE_FORM);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to save module.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteModule(module: Module) {
    const confirmed = window.confirm(
      `Delete "${module.title}" and all lessons inside it? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingModuleId(module.id);
      clearMessages();

      const { error: deleteError } = await supabase
        .from("modules")
        .delete()
        .eq("id", module.id);

      if (deleteError) throw new Error(deleteError.message);

      setModules((current) => current.filter((item) => item.id !== module.id));
      setLessons((current) => current.filter((lesson) => lesson.module_id !== module.id));

      setSuccess("Module deleted successfully.");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to delete module.");
    } finally {
      setDeletingModuleId(null);
    }
  }

  async function toggleModulePublished(module: Module) {
    try {
      clearMessages();
      const newStatus = !module.is_published;

      const { error: updateError } = await supabase
        .from("modules")
        .update({
          is_published: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", module.id);

      if (updateError) throw new Error(updateError.message);

      setModules((current) =>
        current.map((item) =>
          item.id === module.id
            ? { ...item, is_published: newStatus }
            : item
        )
      );

      setSuccess(
        newStatus ? "Module published successfully." : "Module unpublished successfully."
      );
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to update module.");
    }
  }

  function openAddLesson(moduleId: string) {
    const moduleLessons = getModuleLessons(moduleId);
    clearMessages();
    setSelectedModuleId(moduleId);
    setEditingLessonId(null);
    setLessonForm({
      ...EMPTY_LESSON_FORM,
      position: moduleLessons.length + 1,
    });
    setShowLessonForm(true);
    setExpandedModules((current) => ({
      ...current,
      [moduleId]: true,
    }));
  }

  function openEditLesson(lesson: Lesson) {
    clearMessages();
    setSelectedModuleId(lesson.module_id);
    setEditingLessonId(lesson.id);
    setLessonForm({
      title: lesson.title,
      description: lesson.description ?? "",
      video_url: lesson.video_url ?? "",
      content: lesson.content ?? "",
      position: lesson.position,
      is_preview: lesson.is_preview,
      is_published: lesson.is_published,
    });
    setShowLessonForm(true);
  }

  function closeLessonForm() {
    if (saving) return;
    setShowLessonForm(false);
    setEditingLessonId(null);
    setSelectedModuleId(null);
    setLessonForm(EMPTY_LESSON_FORM);
  }

  function updateLessonField<K extends keyof LessonForm>(
    field: K,
    value: LessonForm[K]
  ) {
    setLessonForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function saveLesson() {
    if (!selectedModuleId) {
      setError("Please select a module.");
      return;
    }

    const title = lessonForm.title.trim();

    if (!title) {
      setError("Lesson title is required.");
      return;
    }

    const position = Math.max(1, Number(lessonForm.position) || 1);

    try {
      setSaving(true);
      clearMessages();

      if (editingLessonId) {
        const { data, error: updateError } = await supabase
          .from("lessons")
          .update({
            title,
            description: lessonForm.description.trim() || null,
            video_url: lessonForm.video_url.trim() || null,
            content: lessonForm.content.trim() || null,
            position,
            is_preview: lessonForm.is_preview,
            is_published: lessonForm.is_published,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingLessonId)
          .select("id, course_id, module_id, title, description, video_url, content, position, is_preview, is_published")
          .single();

        if (updateError) throw new Error(updateError.message);

        setLessons((current) =>
          current
            .map((lesson) => (lesson.id === editingLessonId ? (data as Lesson) : lesson))
            .sort((a, b) => a.position - b.position)
        );

        setSuccess("Lesson updated successfully.");
      } else {
        const { data, error: insertError } = await supabase
          .from("lessons")
          .insert({
            course_id: courseId,
            module_id: selectedModuleId,
            title,
            description: lessonForm.description.trim() || null,
            video_url: lessonForm.video_url.trim() || null,
            content: lessonForm.content.trim() || null,
            position,
            is_preview: lessonForm.is_preview,
            is_published: lessonForm.is_published,
          })
          .select("id, course_id, module_id, title, description, video_url, content, position, is_preview, is_published")
          .single();

        if (insertError) throw new Error(insertError.message);

        setLessons((current) =>
          [...current, data as Lesson].sort((a, b) => a.position - b.position)
        );

        setSuccess("Lesson created successfully.");
      }

      closeLessonForm();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to save lesson.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteLesson(lessonId: string) {
    const confirmed = window.confirm("Are you sure you want to delete this lesson?");
    if (!confirmed) return;

    try {
      setDeletingLessonId(lessonId);
      clearMessages();

      const { error: deleteError } = await supabase
        .from("lessons")
        .delete()
        .eq("id", lessonId);

      if (deleteError) throw new Error(deleteError.message);

      setLessons((current) => current.filter((lesson) => lesson.id !== lessonId));
      setSuccess("Lesson deleted successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete lesson.");
    } finally {
      setDeletingLessonId(null);
    }
  }

  const totalLessons = lessons.length;
  const publishedLessons = lessons.filter((lesson) => lesson.is_published).length;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#07070a] text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-purple-500" />
          <p className="text-sm text-gray-400">Loading course content...</p>
        </div>
      </main>
    );
  }

  if (!course) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#07070a] px-6 text-white">
        <div className="w-full max-w-xl rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <h1 className="text-2xl font-bold">Course Not Found</h1>
          <p className="mt-3 text-gray-400">{error}</p>
          <button
            type="button"
            onClick={() => router.push("/admin/courses")}
            className="mt-6 rounded-xl bg-white px-5 py-3 font-semibold text-black"
          >
            Back to Courses
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07070a] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-5 border-b border-white/10 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <button
              type="button"
              onClick={() => router.push("/admin/courses")}
              className="mb-4 text-sm text-gray-400 hover:text-white"
            >
              ← Back to Courses
            </button>
            <h1 className="text-3xl font-bold">Course Curriculum & Videos</h1>
            <p className="mt-2 text-gray-400">{course.title}</p>
          </div>

          <button
            type="button"
            onClick={openAddModule}
            className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-3 font-semibold"
          >
            + Add Module
          </button>
        </header>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
            {success}
          </div>
        )}

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm text-gray-500">Modules</p>
            <p className="mt-2 text-3xl font-bold">{modules.length}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm text-gray-500">Total Lessons</p>
            <p className="mt-2 text-3xl font-bold">{totalLessons}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm text-gray-500">Published Lessons</p>
            <p className="mt-2 text-3xl font-bold text-emerald-400">{publishedLessons}</p>
          </div>
        </div>

        <div className="space-y-4">
          {modules.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 p-12 text-center">
              <h2 className="text-xl font-bold">No Modules Yet</h2>
              <p className="mt-2 text-sm text-gray-500">
                Create your first module to start adding lessons and 4K video streams.
              </p>
              <button
                type="button"
                onClick={openAddModule}
                className="mt-5 rounded-xl bg-purple-600 px-5 py-3 font-semibold"
              >
                + Create First Module
              </button>
            </div>
          ) : (
            modules.map((module, index) => {
              const moduleLessons = getModuleLessons(module.id);
              const isExpanded = expandedModules[module.id];
              const isDeleting = deletingModuleId === module.id;

              return (
                <section
                  key={module.id}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]"
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                      <button
                        type="button"
                        onClick={() => toggleModule(module.id)}
                        className="flex flex-1 items-center gap-4 text-left"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 font-bold text-purple-400">
                          {index + 1}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="font-bold">{module.title}</h2>
                            <span
                              className={`rounded-full px-2 py-1 text-xs ${
                                module.is_published
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : "bg-yellow-500/10 text-yellow-400"
                              }`}
                            >
                              {module.is_published ? "Published" : "Draft"}
                            </span>
                          </div>

                          <p className="mt-1 text-sm text-gray-500">
                            {moduleLessons.length} lessons • Position {module.position}
                          </p>
                        </div>

                        <span className="ml-auto text-gray-500">
                          {isExpanded ? "▲" : "▼"}
                        </span>
                      </button>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => openAddLesson(module.id)}
                          disabled={isDeleting}
                          className="rounded-lg bg-purple-600 px-3 py-2 text-sm font-medium"
                        >
                          + Lesson
                        </button>

                        <button
                          type="button"
                          onClick={() => openEditModule(module)}
                          disabled={isDeleting}
                          className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-sm text-blue-300"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => void toggleModulePublished(module)}
                          disabled={isDeleting}
                          className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-sm text-yellow-300"
                        >
                          {module.is_published ? "Unpublish" : "Publish"}
                        </button>

                        <button
                          type="button"
                          onClick={() => void deleteModule(module)}
                          disabled={isDeleting}
                          className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300"
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>

                    {module.description && (
                      <p className="mt-4 border-t border-white/10 pt-4 text-sm text-gray-500">
                        {module.description}
                      </p>
                    )}
                  </div>

                  {isExpanded && (
                    <div className="border-t border-white/10 bg-black/10">
                      {moduleLessons.length === 0 ? (
                        <div className="p-8 text-center">
                          <p className="text-sm text-gray-500">No lessons in this module.</p>
                          <button
                            type="button"
                            onClick={() => openAddLesson(module.id)}
                            className="mt-4 rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm text-purple-300"
                          >
                            + Add First Lesson
                          </button>
                        </div>
                      ) : (
                        <div className="divide-y divide-white/10">
                          {moduleLessons.map((lesson, lessonIndex) => (
                            <div
                              key={lesson.id}
                              className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between"
                            >
                              <div className="flex items-start gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5">
                                  {lessonIndex + 1}
                                </div>

                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="font-semibold">{lesson.title}</h3>

                                    {lesson.video_url && (
                                      <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[10px] font-mono text-blue-300">
                                        🎬 4K/HD Video
                                      </span>
                                    )}

                                    {lesson.is_preview && (
                                      <span className="text-xs text-purple-400">Preview</span>
                                    )}

                                    <span
                                      className={`text-xs ${
                                        lesson.is_published ? "text-emerald-400" : "text-yellow-400"
                                      }`}
                                    >
                                      {lesson.is_published ? "Published" : "Draft"}
                                    </span>
                                  </div>

                                  {lesson.description && (
                                    <p className="mt-1 text-sm text-gray-500">
                                      {lesson.description}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => openEditLesson(lesson)}
                                  className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-xs text-blue-300"
                                >
                                  Edit Video / Content
                                </button>

                                <button
                                  type="button"
                                  onClick={() => void deleteLesson(lesson.id)}
                                  disabled={deletingLessonId === lesson.id}
                                  className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300"
                                >
                                  {deletingLessonId === lesson.id ? "Deleting..." : "Delete"}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </section>
              );
            })
          )}
        </div>

        {/* MODULE FORM MODAL */}
        {showModuleForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#101014] p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-purple-400">Module</p>
                  <h2 className="mt-1 text-xl font-bold">
                    {editingModuleId ? "Edit Module" : "Create New Module"}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={closeModuleForm}
                  disabled={saving}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm text-gray-300">Module Title *</label>
                  <input
                    type="text"
                    value={moduleForm.title}
                    onChange={(e) => updateModuleField("title", e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-300">Description</label>
                  <textarea
                    value={moduleForm.description}
                    onChange={(e) => updateModuleField("description", e.target.value)}
                    rows={4}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-300">Position</label>
                  <input
                    type="number"
                    min={1}
                    value={moduleForm.position}
                    onChange={(e) =>
                      updateModuleField("position", Math.max(1, Number(e.target.value) || 1))
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-purple-500"
                  />
                </div>

                <label className="flex items-center gap-3 rounded-xl border border-white/10 p-4">
                  <input
                    type="checkbox"
                    checked={moduleForm.is_published}
                    onChange={(e) => updateModuleField("is_published", e.target.checked)}
                  />
                  <span>Publish Module</span>
                </label>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModuleForm}
                    disabled={saving}
                    className="rounded-xl border border-white/10 px-5 py-3"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() => void saveModule()}
                    disabled={saving}
                    className="rounded-xl bg-purple-600 px-5 py-3 font-semibold"
                  >
                    {saving ? "Saving..." : editingModuleId ? "Update Module" : "Create Module"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LESSON FORM MODAL WITH DYNAMIC VIDEO CONTROLS */}
        {showLessonForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-[#101014] p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-purple-400">
                    Lesson & Media Management
                  </p>
                  <h2 className="mt-1 text-xl font-bold">
                    {editingLessonId ? "Edit Lesson" : "Create Lesson"}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={closeLessonForm}
                  disabled={saving}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Lesson Title *
                  </label>
                  <input
                    type="text"
                    placeholder="Lesson Title"
                    value={lessonForm.title}
                    onChange={(e) => updateLessonField("title", e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Description
                  </label>
                  <textarea
                    placeholder="Short summary of this lesson"
                    value={lessonForm.description}
                    onChange={(e) => updateLessonField("description", e.target.value)}
                    rows={2}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-purple-500"
                  />
                </div>

                {/* VIDEO URL INPUT & MULTI-SOURCE HINTS */}
                <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-bold text-purple-300">
                      🎥 Video URL (4K / 1080p MP4, HLS, or YouTube)
                    </label>
                    <span className="text-[10px] bg-purple-500/20 px-2 py-0.5 rounded text-purple-300 font-mono">
                      No-Code Upload Target
                    </span>
                  </div>

                  <input
                    type="text"
                    placeholder="Paste Direct MP4 URL (e.g. https://.../video.mp4) or YouTube link"
                    value={lessonForm.video_url}
                    onChange={(e) => updateLessonField("video_url", e.target.value)}
                    className="w-full rounded-xl border border-purple-500/30 bg-black/50 px-4 py-3 outline-none focus:border-purple-400 text-sm font-mono"
                  />

                  <p className="text-xs text-gray-400 leading-relaxed">
                    <strong>Tip:</strong> Paste direct <strong>.mp4</strong> video links for native 1080p/4K HTML5 player with speed controls (1.5x, 2x). You can also paste standard YouTube video links.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Lesson Notes / Extended Content
                  </label>
                  <textarea
                    placeholder="Lesson Notes, Markdown text or detailed guides"
                    value={lessonForm.content}
                    onChange={(e) => updateLessonField("content", e.target.value)}
                    rows={6}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">
                      Position Order
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={lessonForm.position}
                      onChange={(e) =>
                        updateLessonField("position", Math.max(1, Number(e.target.value) || 1))
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="space-y-3 pt-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={lessonForm.is_preview}
                        onChange={(e) => updateLessonField("is_preview", e.target.checked)}
                        className="accent-purple-500 h-4 w-4"
                      />
                      <span className="text-sm">Free Preview Lesson</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={lessonForm.is_published}
                        onChange={(e) => updateLessonField("is_published", e.target.checked)}
                        className="accent-purple-500 h-4 w-4"
                      />
                      <span className="text-sm">Publish Lesson</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={closeLessonForm}
                    disabled={saving}
                    className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold hover:bg-white/5"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() => void saveLesson()}
                    disabled={saving}
                    className="rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold hover:bg-purple-500 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : editingLessonId ? "Update Lesson" : "Create Lesson"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}