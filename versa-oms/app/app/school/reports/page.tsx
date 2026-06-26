import { PageHeader, Card, EmptyState } from "@/components/design";

export default function Page() {
  return (
    <section className="ds-page">
      <PageHeader eyebrow="school" title="Reports" description="This part of the portal will surface its data here." breadcrumbs={[{"label": "School", "href": "/school/dashboard"}, {"label": "Reports"}]} />
      <Card><EmptyState>Nothing to show here yet.</EmptyState></Card>
    </section>
  );
}
