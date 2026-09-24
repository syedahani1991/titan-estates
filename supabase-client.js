import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://chazzeivbcgvazgvkbsd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoYXp6ZWl2YmNndmF6Z3ZrYnNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1NjQ0NDUsImV4cCI6MjEwNTE0MDQ0NX0.GL9jg4aoVb71yXO0OyMWDoGkps_Vy_H9lEBNuN1Ok8k';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);