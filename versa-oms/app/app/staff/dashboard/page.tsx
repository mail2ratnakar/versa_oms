import { DashboardView } from "@/components/DashboardView";

export default function Page() {
  return <DashboardView title="Operations Dashboard" eyebrow="staff \u00b7 overview" endpoint="/api/staff/overview" />;
}
