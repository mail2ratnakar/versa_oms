import { DashboardView } from "@/components/DashboardView";

export default function Page() {
  return <DashboardView title="School Dashboard" eyebrow="school \u00b7 overview" endpoint="/api/school/overview" />;
}
