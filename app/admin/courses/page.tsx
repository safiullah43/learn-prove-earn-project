"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Course = {
  id: string;
  title: string;
  category: string;
  description: string;
  level: string;
  is_published: boolean;
  thumbnail_url?: string;
  promo_video_url?: string;
  duration?: string;
  price?: string;
};

type Enrollment = {
  course_id: string;
  user_id: string;
  progress: number;
  status: string;
};

type CourseModalProps = {
  title: string;
  submitText: string;
  saving: boolean;
  courseId: string;
  setCourseId: (value: string) => void;
  titleValue: string;
  setTitle: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  level: string;
  setLevel: (value: string) => void;
  thumbnailUrl: string;
  setThumbnailUrl: (value: string) => void;
  promoVideoUrl: string;
  setPromoVideoUrl: (value: string) => void;
  duration: string;
  setDuration: (value: string) => void;
  price: string;
  setPrice: (value: string) => void;
  isPublished: boolean;
  setIsPublished: (value: boolean) => void;
  errorMessage: string;
  onClose: () => void;
  onSubmit: () => void;
  allowId: boolean;
};

export default function AdminCoursesPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [search, setSearch] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [promoVideoUrl, setPromoVideoUrl] = useState("");
  const [duration, setDuration] = useState("6 Weeks");
  const [price, setPrice] = useState("Free");
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data: adminUser, error: adminError } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (adminError || !adminUser) {
        console.error("Admin check error:", adminError);
        router.push("/dashboard");
        return;
      }

      setAuthorized(true);

      await Promise.all([loadCourses(), loadEnrollments()]);
    } catch (error) {
      console.error("Admin loading error:", error);
      setErrorMessage("Unable to load admin panel.");
    } finally {
      setLoading(false);
    }
  }

  async function loadCourses() {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Courses loading error:", error);
        setErrorMessage(error.message || "Unable to load courses.");
        return;
      }

      setCourses((data as Course[]) || []);
    } catch (err: any) {
      console.error("Courses fetch exception:", err);
      setErrorMessage("Failed to query courses table.");
    }
  }

  async function loadEnrollments() {
    const { data, error } = await supabase
      .from("enrollments")
      .select("course_id, user_id, progress, status");

    if (error) {
      console.error("Enrollments loading error:", error);
      return;
    }

    setEnrollments((data as Enrollment[]) || []);
  }

  const filteredCourses = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return courses;
    }

    return courses.filter((course) => {
      return (
        course.title?.toLowerCase().includes(value) ||
        course.category?.toLowerCase().includes(value) ||
        course.id?.toLowerCase().includes(value) ||
        course.level?.toLowerCase().includes(value)
      );
    });
  }, [search, courses]);

  function getCourseEnrollments(courseIdValue: string) {
    return enrollments.filter(
      (enrollment) => enrollment.course_id === courseIdValue
    );
  }

  function getAverageProgress(courseIdValue: string) {
    const courseEnrollments = getCourseEnrollments(courseIdValue);

    if (courseEnrollments.length === 0) {
      return 0;
    }

    const total = courseEnrollments.reduce(
      (sum, enrollment) => sum + (Number(enrollment.progress) || 0),
      0
    );

    return Math.round(total / courseEnrollments.length);
  }

  function getCompletedCount(courseIdValue: string) {
    return getCourseEnrollments(courseIdValue).filter(
      (enrollment) =>
        enrollment.status === "completed" || Number(enrollment.progress) >= 100
    ).length;
  }

  function resetForm() {
    setCourseId("");
    setTitle("");
    setCategory("");
    setDescription("");
    setLevel("Beginner");
    setThumbnailUrl("");
    setPromoVideoUrl("");
    setDuration("6 Weeks");
    setPrice("Free");
    setIsPublished(false);
    setErrorMessage("");
  }

  function openAddModal() {
    resetForm();
    setMessage("");
    setShowAddModal(true);
  }

  function closeAddModal() {
    if (saving) return;
    setShowAddModal(false);
    resetForm();
  }

  function openEditModal(course: Course) {
    setCourseId(course.id);
    setTitle(course.title);
    setCategory(course.category);
    setDescription(course.description);
    setLevel(course.level);
    setThumbnailUrl(course.thumbnail_url || "");
    setPromoVideoUrl(course.promo_video_url || "");
    setDuration(course.duration || "6 Weeks");
    setPrice(course.price || "Free");
    setIsPublished(course.is_published ?? true);

    setMessage("");
    setErrorMessage("");
    setShowEditModal(true);
  }

  function closeEditModal() {
    if (saving) return;
    setShowEditModal(false);
    resetForm();
  }

  function openDeleteModal(course: Course) {
    setSelectedCourse(course);
    setMessage("");
    setErrorMessage("");
    setShowDeleteModal(true);
  }

  function closeDeleteModal() {
    if (saving) return;
    setShowDeleteModal(false);
    setSelectedCourse(null);
    setErrorMessage("");
  }

  function openManageContent(course: Course) {
    const encodedCourseId = encodeURIComponent(course.id);
    router.push(`/admin/courses/${encodedCourseId}/content`);
  }

  async function createCourse() {
    setMessage("");
    setErrorMessage("");

    const cleanId = courseId.trim();
    const cleanTitle = title.trim();
    const cleanCategory = category.trim();
    const cleanDescription = description.trim();
    const cleanLevel = level.trim();

    if (
      !cleanId ||
      !cleanTitle ||
      !cleanCategory ||
      !cleanDescription ||
      !cleanLevel
    ) {
      setErrorMessage("Please fill in all required course fields.");
      return;
    }

    if (courses.some((course) => course.id === cleanId)) {
      setErrorMessage("This Course ID already exists.");
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase.from("courses").insert({
        id: cleanId,
        title: cleanTitle,
        category: cleanCategory,
        description: cleanDescription,
        level: cleanLevel,
        thumbnail_url: thumbnailUrl.trim() || null,
        promo_video_url: promoVideoUrl.trim() || null,
        duration: duration.trim() || "6 Weeks",
        price: price.trim() || "Free",
        is_published: isPublished,
      });

      if (error) {
        console.error("Course creation error:", error);
        setErrorMessage(error.message || "Unable to create course.");
        return;
      }

      await loadCourses();

      setShowAddModal(false);
      resetForm();
      setMessage("Course created successfully.");
    } catch (error) {
      console.error("Course creation error:", error);
      setErrorMessage("Something went wrong while creating the course.");
    } finally {
      setSaving(false);
    }
  }

  async function updateCourse() {
    setMessage("");
    setErrorMessage("");

    const cleanTitle = title.trim();
    const cleanCategory = category.trim();
    const cleanDescription = description.trim();
    const cleanLevel = level.trim();

    if (!cleanTitle || !cleanCategory || !cleanDescription || !cleanLevel) {
      setErrorMessage("Please fill in all required course fields.");
      return;
    }

    if (!courseId) {
      setErrorMessage("Course ID is missing.");
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from("courses")
        .update({
          title: cleanTitle,
          category: cleanCategory,
          description: cleanDescription,
          level: cleanLevel,
          thumbnail_url: thumbnailUrl.trim() || null,
          promo_video_url: promoVideoUrl.trim() || null,
          duration: duration.trim() || "6 Weeks",
          price: price.trim() || "Free",
          is_published: isPublished,
        })
        .eq("id", courseId);

      if (error) {
        console.error("Course update error:", error);
        setErrorMessage(error.message || "Unable to update course.");
        return;
      }

      await loadCourses();

      setShowEditModal(false);
      resetForm();
      setMessage("Course updated successfully.");
    } catch (error) {
      console.error("Course update error:", error);
      setErrorMessage("Something went wrong while updating the course.");
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(course: Course) {
    setSaving(true);
    setMessage("");
    setErrorMessage("");

    try {
      const { error } = await supabase
        .from("courses")
        .update({
          is_published: !course.is_published,
        })
        .eq("id", course.id);

      if (error) {
        console.error("Publish status error:", error);
        setErrorMessage(error.message || "Unable to update course status.");
        return;
      }

      await loadCourses();

      setMessage(
        course.is_published
          ? "Course unpublished successfully."
          : "Course published successfully."
      );
    } catch (error) {
      console.error("Publish status error:", error);
      setErrorMessage("Something went wrong while changing course status.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteCourse() {
    if (!selectedCourse) return;

    setSaving(true);
    setMessage("");
    setErrorMessage("");

    try {
      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", selectedCourse.id);

      if (error) {
        console.error("Course deletion error:", error);
        setErrorMessage(error.message || "Unable to delete course.");
        return;
      }

      await Promise.all([loadCourses(), loadEnrollments()]);

      setShowDeleteModal(false);
      setSelectedCourse(null);
      setMessage("Course deleted successfully.");
    } catch (error) {
      console.error("Course deletion error:", error);
      setErrorMessage("Something went wrong while deleting the course.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-yellow-400" />
          <p className="text-slate-300">Loading admin panel...</p>
        </div>
      </main>
    );
  }

  if (!authorized) return null;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-yellow-400">
              Admin Control Center
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Course & Media Management
            </h1>
            <p className="mt-2 text-slate-400">
              Zero-code control over course content, media assets, duration, and publishing.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="rounded-xl bg-yellow-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-yellow-300"
          >
            + Add New Course
          </button>
        </div>

        {/* SUCCESS MESSAGE */}
        {message && (
          <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {message}
          </div>
        )}

        {/* GLOBAL ERROR */}
        {errorMessage &&
          !showAddModal &&
          !showEditModal &&
          !showDeleteModal && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {errorMessage}
            </div>
          )}

        {/* SEARCH */}
        <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search courses by title, category, ID or level..."
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-yellow-400"
          />
        </div>

        {/* STATS */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Total Courses</p>
            <p className="mt-2 text-3xl font-bold">{courses.length}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Published</p>
            <p className="mt-2 text-3xl font-bold text-emerald-400">
              {courses.filter((course) => course.is_published).length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Total Enrollments</p>
            <p className="mt-2 text-3xl font-bold text-yellow-400">
              {enrollments.length}
            </p>
          </div>
        </div>

        {/* COURSES GRID */}
        {filteredCourses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-12 text-center">
            <h2 className="text-xl font-semibold">No courses found</h2>
            <p className="mt-2 text-slate-400">
              {search
                ? "Try a different search term."
                : "Create your first course to get started."}
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredCourses.map((course) => {
              const courseEnrollments = getCourseEnrollments(course.id);
              const averageProgress = getAverageProgress(course.id);
              const completedCount = getCompletedCount(course.id);

              return (
                <article
                  key={course.id}
                  className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl shadow-black/20 flex flex-col justify-between"
                >
                  {/* CARD BANNER / IMAGE PREVIEW */}
                  <div>
                    {course.thumbnail_url ? (
                      <div className="h-40 w-full overflow-hidden bg-slate-950 border-b border-slate-800">
                        <img
                          src={course.thumbnail_url}
                          alt={course.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-32 w-full items-center justify-center bg-yellow-400/10 text-4xl border-b border-slate-800">
                        🎓
                      </div>
                    )}

                    {/* CARD HEADER */}
                    <div className="border-b border-slate-800 p-5">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
                          {course.category}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            course.is_published
                              ? "bg-emerald-500/15 text-emerald-400"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {course.is_published ? "Published" : "Draft"}
                        </span>
                      </div>

                      <h2 className="text-xl font-bold">{course.title}</h2>

                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">
                        {course.description}
                      </p>
                    </div>

                    {/* COURSE INFO GRID */}
                    <div className="grid grid-cols-2 gap-px bg-slate-800">
                      <div className="bg-slate-900 p-4">
                        <p className="text-xs text-slate-500">Level</p>
                        <p className="mt-1 font-semibold">{course.level}</p>
                      </div>

                      <div className="bg-slate-900 p-4">
                        <p className="text-xs text-slate-500">Duration</p>
                        <p className="mt-1 font-semibold text-yellow-400">
                          {course.duration || "6 Weeks"}
                        </p>
                      </div>

                      <div className="bg-slate-900 p-4">
                        <p className="text-xs text-slate-500">Enrolled</p>
                        <p className="mt-1 text-lg font-bold">
                          {courseEnrollments.length}
                        </p>
                      </div>

                      <div className="bg-slate-900 p-4">
                        <p className="text-xs text-slate-500">Completed</p>
                        <p className="mt-1 text-lg font-bold text-emerald-400">
                          {completedCount}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* PROGRESS + ACTIONS */}
                  <div className="p-5">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-slate-400">Average Progress</span>
                      <span className="font-semibold">{averageProgress}%</span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-yellow-400 transition-all"
                        style={{
                          width: `${Math.min(Math.max(averageProgress, 0), 100)}%`,
                        }}
                      />
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(course)}
                        disabled={saving}
                        className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-yellow-400 hover:text-yellow-400 disabled:opacity-50"
                      >
                        Edit Media / Details
                      </button>

                      <button
                        type="button"
                        onClick={() => openManageContent(course)}
                        disabled={saving}
                        className="rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-2 text-sm font-medium text-purple-300 transition hover:border-purple-400 hover:bg-purple-500/20 hover:text-purple-200 disabled:opacity-50"
                      >
                        Lessons & Videos
                      </button>

                      <button
                        type="button"
                        onClick={() => togglePublish(course)}
                        disabled={saving}
                        className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-emerald-400 hover:text-emerald-400 disabled:opacity-50"
                      >
                        {course.is_published ? "Unpublish" : "Publish"}
                      </button>

                      <button
                        type="button"
                        onClick={() => openDeleteModal(course)}
                        disabled={saving}
                        className="rounded-lg border border-red-500/30 px-3 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* ADD COURSE MODAL */}
      {showAddModal && (
        <CourseModal
          title="Create New Course & Media Setup"
          submitText="Create Course"
          saving={saving}
          courseId={courseId}
          setCourseId={setCourseId}
          titleValue={title}
          setTitle={setTitle}
          category={category}
          setCategory={setCategory}
          description={description}
          setDescription={setDescription}
          level={level}
          setLevel={setLevel}
          thumbnailUrl={thumbnailUrl}
          setThumbnailUrl={setThumbnailUrl}
          promoVideoUrl={promoVideoUrl}
          setPromoVideoUrl={setPromoVideoUrl}
          duration={duration}
          setDuration={setDuration}
          price={price}
          setPrice={setPrice}
          isPublished={isPublished}
          setIsPublished={setIsPublished}
          errorMessage={errorMessage}
          onClose={closeAddModal}
          onSubmit={createCourse}
          allowId={true}
        />
      )}

      {/* EDIT COURSE MODAL */}
      {showEditModal && (
        <CourseModal
          title="Edit Course Media & Details"
          submitText="Save Changes"
          saving={saving}
          courseId={courseId}
          setCourseId={setCourseId}
          titleValue={title}
          setTitle={setTitle}
          category={category}
          setCategory={setCategory}
          description={description}
          setDescription={setDescription}
          level={level}
          setLevel={setLevel}
          thumbnailUrl={thumbnailUrl}
          setThumbnailUrl={setThumbnailUrl}
          promoVideoUrl={promoVideoUrl}
          setPromoVideoUrl={setPromoVideoUrl}
          duration={duration}
          setDuration={setDuration}
          price={price}
          setPrice={setPrice}
          isPublished={isPublished}
          setIsPublished={setIsPublished}
          errorMessage={errorMessage}
          onClose={closeEditModal}
          onSubmit={updateCourse}
          allowId={false}
        />
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h2 className="text-xl font-bold">Delete Course?</h2>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-white">
                {selectedCourse.title}
              </span>
              ? This action cannot be undone.
            </p>

            {errorMessage && (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {errorMessage}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={saving}
                className="flex-1 rounded-xl border border-slate-700 px-4 py-3 font-semibold text-slate-200 transition hover:bg-slate-800 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={deleteCourse}
                disabled={saving}
                className="flex-1 rounded-xl bg-red-500 px-4 py-3 font-semibold text-white transition hover:bg-red-400 disabled:opacity-50"
              >
                {saving ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function CourseModal({
  title,
  submitText,
  saving,
  courseId,
  setCourseId,
  titleValue,
  setTitle,
  category,
  setCategory,
  description,
  setDescription,
  level,
  setLevel,
  thumbnailUrl,
  setThumbnailUrl,
  promoVideoUrl,
  setPromoVideoUrl,
  duration,
  setDuration,
  price,
  setPrice,
  isPublished,
  setIsPublished,
  errorMessage,
  onClose,
  onSubmit,
  allowId,
}: CourseModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        {/* MODAL HEADER */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-yellow-400">
              Admin No-Code Control
            </p>

            <h2 className="mt-1 text-2xl font-bold">{title}</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg px-3 py-2 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {/* ERROR */}
        {errorMessage && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {errorMessage}
          </div>
        )}

        <div className="space-y-5">
          {/* COURSE ID */}
          {allowId && (
            <div>
              <label htmlFor="course-id" className="mb-2 block text-sm font-medium text-slate-300">
                Course ID
              </label>
              <input
                id="course-id"
                type="text"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                placeholder="e.g. amazon-fba"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-yellow-400"
              />
            </div>
          )}

          {/* TITLE */}
          <div>
            <label htmlFor="course-title" className="mb-2 block text-sm font-medium text-slate-300">
              Course Title
            </label>
            <input
              id="course-title"
              type="text"
              value={titleValue}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter course title"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-yellow-400"
            />
          </div>

          {/* CATEGORY & LEVEL */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="course-category" className="mb-2 block text-sm font-medium text-slate-300">
                Category
              </label>
              <input
                id="course-category"
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. E-Commerce"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-yellow-400"
              />
            </div>

            <div>
              <label htmlFor="course-level" className="mb-2 block text-sm font-medium text-slate-300">
                Level
              </label>
              <select
                id="course-level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-yellow-400"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Beginner → Advanced">Beginner → Advanced</option>
              </select>
            </div>
          </div>

          {/* DURATION & PRICE */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="course-duration" className="mb-2 block text-sm font-medium text-slate-300">
                Duration (e.g. 8 Weeks)
              </label>
              <input
                id="course-duration"
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 8 Weeks / 20 Hours"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-yellow-400"
              />
            </div>

            <div>
              <label htmlFor="course-price" className="mb-2 block text-sm font-medium text-slate-300">
                Price (e.g. Free or $99)
              </label>
              <input
                id="course-price"
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. Free"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-yellow-400"
              />
            </div>
          </div>

          {/* MEDIA CONTROLS: THUMBNAIL PHOTO & PROMO VIDEO */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-yellow-400">
              🖼️ Media Assets Control
            </p>

            <div>
              <label htmlFor="thumbnail-url" className="mb-2 block text-sm font-medium text-slate-300">
                Course Thumbnail / Image Banner URL
              </label>
              <input
                id="thumbnail-url"
                type="text"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://example.com/course-banner.jpg"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-yellow-400 text-sm"
              />
            </div>

            <div>
              <label htmlFor="promo-video-url" className="mb-2 block text-sm font-medium text-slate-300">
                Course Intro / Promo 4K Video URL
              </label>
              <input
                id="promo-video-url"
                type="text"
                value={promoVideoUrl}
                onChange={(e) => setPromoVideoUrl(e.target.value)}
                placeholder="https://example.com/promo-video.mp4 or YouTube link"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-yellow-400 text-sm"
              />
            </div>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label htmlFor="course-description" className="mb-2 block text-sm font-medium text-slate-300">
              Description
            </label>
            <textarea
              id="course-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what students will learn..."
              rows={4}
              className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-yellow-400"
            />
          </div>

          {/* PUBLISH */}
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="h-5 w-5 accent-yellow-400"
            />
            <div>
              <p className="font-medium">Publish Course</p>
              <p className="text-sm text-slate-500">
                Visible to students across the site.
              </p>
            </div>
          </label>
        </div>

        {/* MODAL ACTIONS */}
        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-200 transition hover:bg-slate-800 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={saving}
            className="rounded-xl bg-yellow-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-yellow-300 disabled:opacity-50"
          >
            {saving ? "Saving..." : submitText}
          </button>
        </div>
      </div>
    </div>
  );
}