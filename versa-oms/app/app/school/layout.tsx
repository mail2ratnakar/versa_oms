import type { ReactNode } from "react";
import { PortalShell } from "@/components/PortalShell";

export default function SchoolLayout({ children }: { children: ReactNode }) {
  return <PortalShell mode="school">{children}</PortalShell>;
}
