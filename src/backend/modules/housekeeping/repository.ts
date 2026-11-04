import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../shared/types/database.types";
import type {
  HousekeepingTask,
  HousekeepingTaskWithRoom,
  Profile,
} from "../../../shared/types/domain";
import type { Paginated } from "../../../shared/types/contracts";
import type {
  CreateHousekeepingTaskInput,
  ListHousekeepingTasksInput,
} from "../../../shared/schemas";
import { normalizePagination, totalPages } from "../../shared/utils/pagination";
import { unwrap, unwrapCount, unwrapRequired } from "../../shared/utils/supabase";

export const HOUSEKEEPING_TASK_SELECT =
  "*, room:rooms(id,room_number,floor,occupancy_status,housekeeping_status), assignee:profiles!housekeeping_tasks_assigned_to_fkey(id,full_name)";

export interface RawHousekeepingTask extends HousekeepingTaskWithRoom {
  assignee: Pick<Profile, "id" | "full_name"> | null;
}

export function createHousekeepingRepository(client: SupabaseClient<Database>) {
  return {
    async list(input: ListHousekeepingTasksInput): Promise<Paginated<HousekeepingTaskWithRoom>> {
      const { page, pageSize, from, to } = normalizePagination(input.page, input.pageSize);
      let query = client
        .from("housekeeping_tasks")
        .select(HOUSEKEEPING_TASK_SELECT, { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);
      if (input.status) query = query.eq("status", input.status);
      if (input.roomId) query = query.eq("room_id", input.roomId);
      if (input.assignedTo) query = query.eq("assigned_to", input.assignedTo);
      if (input.taskType) query = query.eq("task_type", input.taskType);
      if (input.openOnly) query = query.neq("status", "clean");

      const result = await query;
      const items = unwrap(result) as unknown as HousekeepingTaskWithRoom[];
      const total = unwrapCount(result);
      return { items, page, pageSize, total, totalPages: totalPages(total, pageSize) };
    },

    async getById(id: string): Promise<HousekeepingTaskWithRoom> {
      const result = await client
        .from("housekeeping_tasks")
        .select(HOUSEKEEPING_TASK_SELECT)
        .eq("id", id)
        .maybeSingle();
      return unwrapRequired(
        result,
        "Housekeeping task not found",
      ) as unknown as HousekeepingTaskWithRoom;
    },

    async create(
      input: CreateHousekeepingTaskInput & { createdBy: string },
    ): Promise<HousekeepingTask> {
      const result = await client
        .from("housekeeping_tasks")
        .insert({
          room_id: input.roomId,
          reservation_id: input.reservationId ?? null,
          task_type: input.taskType ?? "checkout_clean",
          status: "dirty",
          assigned_to: input.assignedTo ?? null,
          notes: input.notes ?? null,
          created_by: input.createdBy,
        })
        .select("*")
        .single();
      return unwrapRequired(result, "Housekeeping task not found") as unknown as HousekeepingTask;
    },

    async update(
      id: string,
      patch: Database["public"]["Tables"]["housekeeping_tasks"]["Update"],
    ): Promise<HousekeepingTaskWithRoom> {
      const result = await client
        .from("housekeeping_tasks")
        .update(patch)
        .eq("id", id)
        .select(HOUSEKEEPING_TASK_SELECT)
        .single();
      return unwrapRequired(
        result,
        "Housekeeping task not found",
      ) as unknown as HousekeepingTaskWithRoom;
    },
  };
}

export type HousekeepingRepository = ReturnType<typeof createHousekeepingRepository>;
