type ModuleLandingProps = {
  title: string;
  moduleId: string;
  description: string;
  routeType: "staff" | "school" | "public";
};

export function ModuleLanding({ title, moduleId, description, routeType }: ModuleLandingProps) {
  return (
    <section>
      <span className="badge">{routeType} · {moduleId}</span>
      <h1>{title}</h1>
      <p>{description}</p>
      <div className="grid">
        <div className="card">
          <h2>Implementation status</h2>
          <p>Skeleton route ready. Business implementation pending.</p>
        </div>
        <div className="card">
          <h2>Security rule</h2>
          <p>Server-side role, scope and audit guards must be attached before production use.</p>
        </div>
        <div className="card">
          <h2>Next build step</h2>
          <p>Read module spec, generate schema, routes, UI, tests and rollback metadata.</p>
        </div>
      </div>
    </section>
  );
}
