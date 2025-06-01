import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function fetchTask1ExamList() {
  const { data, error } = await supabase
    .from("task1")
    .select("id, title")
    .order("id", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchTask2ExamList() {
  const { data, error } = await supabase
    .from("task2")
    .select("id, title")
    .order("id", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchTask1ExamById(id: number) {
  const { data, error } = await supabase
    .from("task1")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function fetchTask2ExamById(id: number) {
  const { data, error } = await supabase
    .from("task2")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}