import Link from "next/link";

export default function HomePage() {
  return (
    <div className="center-page">
      <div className="hero-glass" style={{ maxWidth: 760, width: "100%" }}>
        <span className="eyebrow">
          <span className="dot" />
          Versa Olympiads · Operations
        </span>
        <h1 style={{ marginTop: 14 }}>Run the olympiad, end to end.</h1>
        <p style={{ maxWidth: 560 }}>
          Agentic operations for schools, exams, evaluation, results and certificates — with
          server-side authorization, audit and field masking on every action.
        </p>
        <div className="grid" style={{ marginTop: 20 }}>
          <div className="card">
            <h2>Staff Console</h2>
            <p>Internal company operations.</p>
            <Link className="btn btn-dark" href="/staff/dashboard" style={{ marginTop: 8 }}>
              Open staff console
            </Link>
          </div>
          <div className="card">
            <h2>School Portal</h2>
            <p>School-facing operations.</p>
            <Link className="btn btn-blue" href="/school/dashboard" style={{ marginTop: 8 }}>
              Open school portal
            </Link>
          </div>
          <div className="card">
            <h2>Verify Certificate</h2>
            <p>Public certificate verification.</p>
            <Link className="btn btn-light" href="/verify/certificate/demo" style={{ marginTop: 8 }}>
              Open verification
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
