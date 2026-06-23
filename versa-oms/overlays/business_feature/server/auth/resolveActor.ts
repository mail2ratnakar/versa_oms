import type { NextRequest } from "next/server";

export type ActorType = "staff" | "school" | "system" | "public";

export type ResolvedActor = {
  actor_id: string;
  actor_type: ActorType;
  email?: string;
  roles: string[];
  scopes: string[];
  school_id?: string;
  status: "active" | "disabled" | "public" | "system";
};

export async function resolveActor(request: NextRequest): Promise<ResolvedActor> {
  const staffDemo = request.headers.get("x-demo-staff");
  const schoolDemo = request.headers.get("x-demo-school");

  if (staffDemo) {
    return {
      actor_id: staffDemo,
      actor_type: "staff",
      email: `${staffDemo}@example.test`,
      roles: staffDemo === "staff_001" ? ["super_admin"] : ["operations_executive"],
      scopes: staffDemo === "staff_001" ? ["global"] : ["assigned"],
      status: "active"
    };
  }

  if (schoolDemo) {
    return {
      actor_id: `school_user_${schoolDemo}`,
      actor_type: "school",
      roles: ["school_coordinator"],
      scopes: ["own_school"],
      school_id: schoolDemo,
      status: "active"
    };
  }

  return {
    actor_id: "public",
    actor_type: "public",
    roles: [],
    scopes: [],
    status: "public"
  };
}
