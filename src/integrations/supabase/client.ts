// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://genodqiyehczgiqgxekv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdlbm9kcWl5ZWhjemdpcWd4ZWt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMjE4NDUsImV4cCI6MjA2NDg5Nzg0NX0.DFtdiPpjtSvWBqb92IQ1catvkhOGAu0n1NEIPj4g91E";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);