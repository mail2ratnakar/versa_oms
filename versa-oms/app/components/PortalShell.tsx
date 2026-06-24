"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { staffNav, schoolNav, type NavItem } from "./navLinks";

// Core-data links stay hand-maintained (generated separately by gen_core).
const coreLinks: NavItem[] = [
  { href: "/staff/core/schools", label: "Schools" },
  { href: "/staff/core/students", label: "Students" },
  { href: "/staff/core/participations", label: "Participations" },
  { href: "/staff/core/payments", label: "Payments" },
  { href: "/staff/core/exam-slots", label: "Exam Slots" },
  { href: "/staff/core/exam-materials", label: "Exam Materials" },
  { href: "/staff/core/courier-batches", label: "Courier Batches" },
  { href: "/staff/core/omr", label: "OMR Imports" },
  { href: "/staff/core/results", label: "Results" },
  { href: "/staff/core/certificates", label: "Certificates" },
];

export function PortalShell({ children, mode }: { children: ReactNode; mode: "staff" | "school" }) {
  const pathname = usePathname();
  const groups: Array<[string, NavItem[]]> =
    mode === "staff"
      ? [["Operations", staffNav], ["Core data", coreLinks]]
      : [["", schoolNav]];

  const renderLink = ({ href, label, indent }: NavItem) => {
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link key={href} href={href} className={`sidebar-item${indent ? " sidebar-sub" : ""}${active ? " active" : ""}`}>
        {label}
        {active ? <span className="nav-dot" /> : null}
      </Link>
    );
  };

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">Versa Olympiads</div>
        <div className="portal-label">{mode === "staff" ? "Operations Console" : "School Portal"}</div>
        <nav>
          {groups.map(([groupLabel, links]) => (
            <div key={groupLabel}>
              {groupLabel ? <div className="portal-label" style={{ marginTop: 14, marginBottom: 6 }}>{groupLabel}</div> : null}
              {links.map(renderLink)}
            </div>
          ))}
        </nav>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
