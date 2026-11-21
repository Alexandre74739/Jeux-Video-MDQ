import type { Metadata } from "next";
import CourseHub from "@/app/jouer/_components/CourseHub";

export const metadata: Metadata = { title: "Choisis ton défi" };

export default function Page() {
  return <CourseHub />;
}
