import { createClient } from "@supabase/supabase-js";

const supabaseUrl = 'https://vzixytfvlzeanxnkouug.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6aXh5dGZ2bHplYW54bmtvdXVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NzQ5MTgsImV4cCI6MjA2OTU1MDkxOH0.PNjs5yOE2ifJOT66kexWHzyRdKPv5b3esKulmEJvD1Y';
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;