import type { ReactNode } from "react";
import { PortalShell } from "@/components/PortalShell";

export default function StaffLayout({ children }: { children: ReactNode }) {
  return <PortalShell mode="staff">{children}</PortalShell>;
}
