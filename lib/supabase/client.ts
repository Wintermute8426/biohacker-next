import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    'https://egyflvqtijzbkydmgafh.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVneWZsdnF0aWp6Ymt5ZG1nYWZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NzE3NTQsImV4cCI6MjA4NjE0Nzc1NH0.jX4FqyHeTe1Z5-lhiVtb8IdSy9w4Ht9_p7J-3x_Waq4'
  );
}
