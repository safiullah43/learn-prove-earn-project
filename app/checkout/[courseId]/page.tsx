import CheckoutClient from "./CheckoutClient";

export async function generateStaticParams() {
  return [
    { courseId: "1" },
    { courseId: "2" },
    { courseId: "3" },
    { courseId: "4" },
    { courseId: "5" },
    { courseId: "6" },
  ];
}

export default function CheckoutPage() {
  return <CheckoutClient />;
}