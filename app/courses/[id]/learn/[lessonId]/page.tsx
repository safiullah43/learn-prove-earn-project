import LessonPage from "../LessonPage";

const courseLessons: Record<string, string[]> = {
  "1": [
    "amazon-1",
    "amazon-2",
    "amazon-3",
    "amazon-4",
    "amazon-5",
    "amazon-6",
  ],
  "2": [
    "shopify-1",
    "shopify-2",
    "shopify-3",
    "shopify-4",
    "shopify-5",
    "shopify-6",
  ],
  "3": [
    "ai-1",
    "ai-2",
    "ai-3",
    "ai-4",
    "ai-5",
    "ai-6",
  ],
  "4": [
    "marketing-1",
    "marketing-2",
    "marketing-3",
    "marketing-4",
    "marketing-5",
    "marketing-6",
  ],
  "5": [
    "youtube-1",
    "youtube-2",
    "youtube-3",
    "youtube-4",
    "youtube-5",
    "youtube-6",
  ],
  "6": [
    "tiktok-1",
    "tiktok-2",
    "tiktok-3",
    "tiktok-4",
    "tiktok-5",
    "tiktok-6",
  ],
};

export function generateStaticParams() {
  return Object.entries(courseLessons).flatMap(
    ([id, lessonIds]) =>
      lessonIds.map((lessonId) => ({
        id,
        lessonId,
      }))
  );
}

export default async function LessonRoute({
  params,
}: {
  params: Promise<{
    id: string;
    lessonId: string;
  }>;
}) {
  const { id, lessonId } = await params;

  return (
    <LessonPage
      courseId={id}
      lessonId={lessonId}
    />
  );
}