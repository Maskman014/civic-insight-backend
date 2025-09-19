import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const url = "https://bxfrhkrtrztgluzwildd.supabase.co";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4ZnJoa3J0cnp0Z2x1endpbGRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMjYwNDcsImV4cCI6MjA3MzcwMjA0N30.EEu73L8eoWqMnBtV2hv3GKKCxUtbbnplEyfWI_RzmxQ";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(url, anonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});