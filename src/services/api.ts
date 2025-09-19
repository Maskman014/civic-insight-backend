import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  role: string;
  created_at: string;
}

export interface Report {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  report_id: string;
  author: string;
  content: string;
  created_at: string;
}

// Profile functions
export async function createProfile(profileData: Omit<Profile, 'created_at'>) {
  const { data, error } = await supabase
    .from('profiles')
    .insert(profileData)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
}

// Report functions
export async function createReport(reportData: Omit<Report, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('reports')
    .insert(reportData)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function listReports() {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function updateReportStatus(reportId: string, status: string) {
  const { data, error } = await supabase
    .from('reports')
    .update({ status })
    .eq('id', reportId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Comment functions
export async function addComment(commentData: Omit<Comment, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('comments')
    .insert(commentData)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getCommentsByReport(reportId: string) {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('report_id', reportId)
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  return data;
}