import type { Metadata } from "next";
import CourseHub from "@/components/CourseHub";

export const metadata: Metadata = { title: "Choisis ton défi · CuboCode" };

export default function Page() {
  return <CourseHub />;
}
