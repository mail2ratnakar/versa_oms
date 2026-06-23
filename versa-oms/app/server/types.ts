export type Actor = {
  actor_id: string;
  actor_type: "staff" | "school" | "system" | "public";
  roles: string[];
  scopes: string[];
  school_id?: string;
};

export type GuardResult =
  | { ok: true; actor: Actor; requestId: string }
  | { ok: false; status: number; body: unknown; requestId: string };

export type ModuleAction = "read" | "write" | "approve" | "export" | "download";
