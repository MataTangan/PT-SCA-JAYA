
"use client";

import { createBackend } from "@backend/index";
import { getBrowserSupabaseClient } from "@backend/lib/supabase/client";

const supabase = getBrowserSupabaseClient();

export const backend = createBackend(supabase);
export { supabase };
