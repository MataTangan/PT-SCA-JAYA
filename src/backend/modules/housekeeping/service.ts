import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../shared/types/database.types";
import type { HousekeepingTask, HousekeepingTaskWithRoom } from "../../../shared/types/domain";
import type { Paginated } from "../../../shared/types/contracts";
import {
  createHousekeepingTaskSchema,
  listHousekeepingTasksSchema,
  updateHousekeepingTaskSchema,
  type CreateHousekeepingTaskInput,
  type ListHousekeepingTasksInput,
  type UpdateHousekeepingTaskInput,
} from "../../../shared/schemas";
import { uuidSchema } from "../../../shared/schemas/common";
import { mapSupabaseError } from "../../shared/errors";
import { requireUserId } from "../../shared/utils/auth";
import { parseInput } from "../../shared/validators";
import { createHousekeepingRepository } from "./repository";

export function createHousekeepingService(client: SupabaseClient<Database>) {
  const repository = createHousekeepingRepository(client);

  return {
    getHousekeepingTasks(
      input: ListHousekeepingTasksInput = {},
    ): Promise<Paginated<HousekeepingTaskWithRoom>> {
      return repository.list(parseInput(listHousekeepingTasksSchema, input));
    },

    async getHousekeepingTask(id: string): Promise<HousekeepingTaskWithRoom> {
      return repository.getById(parseInput(uuidSchema, id));
    },

    async createHousekeepingTask(input: CreateHousekeepingTaskInput): Promise<HousekeepingTask> {
      const parsed = parseInput(createHousekeepingTaskSchema, input);
      const createdBy = await requireUserId(client);
      try {
        return await repository.create({ ...parsed, createdBy });
      } catch (error) {
        throw mapSupabaseError(error);
      }
    },

    async updateHousekeepingTask(
      id: string,
      input: UpdateHousekeepingTaskInput,
    ): Promise<HousekeepingTaskWithRoom> {
      const taskId = parseInput(uuidSchema, id);
      const parsed = parseInput(updateHousekeepingTaskSchema, input);
      const patch: Database["public"]["Tables"]["housekeeping_tasks"]["Update"] = {};
      if (parsed.status !== undefined) patch.status = parsed.status;
      if (parsed.assignedTo !== undefined) patch.assigned_to = parsed.assignedTo;
      if (parsed.notes !== undefined) patch.notes = parsed.notes;

      try {
        return await repository.update(taskId, patch);
      } catch (error) {
        throw mapSupabaseError(error);
      }
    },
  };
}

export type HousekeepingService = ReturnType<typeof createHousekeepingService>;
