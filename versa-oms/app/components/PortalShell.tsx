"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const staffLinks: Array<[string, string]> = [
  ["/staff/dashboard", "Dashboard"],
  ["/staff/admin/users", "Staff Users"],
  ["/staff/admin/roles", "Roles & Permissions"],
  ["/staff/schools/crm", "School CRM"],
  ["/staff/schools/onboarding", "School Onboarding"],
  ["/staff/students/rosters", "Student Rosters"],
  ["/staff/finance", "Finance"],
  ["/staff/exams/slots", "Exam Slots"],
  ["/staff/exams/materials", "Exam Materials"],
  ["/staff/courier", "Courier"],
  ["/staff/evaluation", "Evaluation"],
  ["/staff/results", "Results"],
  ["/staff/certificates", "Certificates"],
  ["/staff/notifications", "Notifications"],
  ["/staff/support", "Support"],
  ["/staff/tasks", "Tasks"],
  ["/staff/jobs", "Jobs"],
  ["/staff/reports", "Reports"],
  ["/staff/admin/settings", "Admin Settings"],
  ["/staff/security-audit", "Security Audit"],
];

const coreLinks: Array<[string, string]> = [
  ["/staff/core/schools", "Schools"],
  ["/staff/core/students", "Students"],
  ["/staff/core/participations", "Participations"],
  ["/staff/core/payments", "Payments"],
  ["/staff/core/exam-slots", "Exam Slots"],
  ["/staff/core/exam-materials", "Exam Materials"],
  ["/staff/core/courier-batches", "Courier Batches"],
  ["/staff/core/omr", "OMR Imports"],
  ["/staff/core/results", "Results"],
  ["/staff/core/certificates", "Certificates"],
];

const schoolLinks: Array<[string, string]> = [
  ["/school/dashboard", "Dashboard"],
  ["/school/students", "Students"],
  ["/school/payments", "Payments"],
  ["/school/exam-slots", "Exam Slots"],
  ["/school/materials", "Materials"],
  ["/school/results", "Results"],
  ["/school/certificates", "Certificates"],
  ["/school/support", "Support"],
  ["/school/reports", "Reports"],
];

export function PortalShell({ children, mode }: { children: ReactNode; mode: "staff" | "school" }) {
  const pathname = usePathname();
  const groups: Array<[string, Array<[string, string]>]> =
    mode === "staff"
      ? [["Operations", staffLinks], ["Core data", coreLinks]]
      : [["", schoolLinks]];

  const renderLink = ([href, label]: [string, string]) => {
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link key={href} href={href} className={`sidebar-item${active ? " active" : ""}`}>
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
