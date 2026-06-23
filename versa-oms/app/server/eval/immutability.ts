/**
 * Result immutability + versioning. Published results are immutable; a correction
 * does not mutate the published row — it creates a superseding version.
 */
const PUBLISHED = new Set(["published", "partially_published"]);

export class ImmutableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImmutableError";
  }
}

/** Throw if attempting to edit a published result in place. */
export function assertNotPublished(currentStatus: string | null | undefined, op = "edit"): void {
  if (currentStatus && PUBLISHED.has(currentStatus)) {
    throw new ImmutableError(`Cannot ${op} a published result in place; create a correction version instead.`);
  }
}

/** Build a superseding correction version from the published row. */
export function nextResultVersion(current: { version?: string | null; [k: string]: unknown }): {
  version: string;
  supersedes_version: string | null;
  status: string;
} {
  const cur = current.version ?? "v1";
  const n = Number.parseInt(String(cur).replace(/^v/, ""), 10) || 1;
  return { version: `v${n + 1}`, supersedes_version: String(cur), status: "correction_pending" };
}
