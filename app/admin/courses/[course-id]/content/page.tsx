import CourseContentClient from "./CourseContentClient";

export async function generateStaticParams() {
  return [
    { "course-id": "1" },
    { "course-id": "2" },
    { "course-id": "3" },
    { "course-id": "4" },
    { "course-id": "5" },
    { "course-id": "6" },
  ];
}

export default function Page() {
  return <CourseContentClient />;
}