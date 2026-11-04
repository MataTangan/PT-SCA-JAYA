import type { Session } from "@supabase/supabase-js";
import type { ProfileWithRole } from "../../../shared/types/domain";

export interface AuthResult {
  userId: string;
  email: string | null;
  session: Session | null;
  profile: ProfileWithRole | null;
  needsEmailConfirmation: boolean;
}

export interface CurrentUser {
  id: string;
  email: string;
  profile: ProfileWithRole;
  role: ProfileWithRole["role"]["slug"];
  permissions: string[];
}
