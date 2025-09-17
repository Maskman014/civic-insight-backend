import { supabase } from '../lib/supabaseClient';

// Report types
export interface Report {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: string;
  location?: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name?: string;
  };
}

export interface Comment {
  id: string;
  report_id: string;
  author: string;
  content: string;
  created_at: string;
  profiles?: {
    full_name?: string;
  };
}

export interface Profile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  role: string;
  created_at: string;
}

// Create a new report
export const createReport = async (reportData: {
  title: string;
  description?: string;
  location?: string;
}) => {
  const { data, error } = await supabase
    .from('reports')
    .insert([reportData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// List all reports with profile information
export const listReports = async () => {
  const { data, error } = await supabase
    .from('reports')
    .select(`
      *,
      profiles (
        full_name
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Report[];
};

// Get a single report with comments
export const getReport = async (reportId: string) => {
  const { data, error } = await supabase
    .from('reports')
    .select(`
      *,
      profiles (
        full_name
      ),
      comments (
        *,
        profiles (
          full_name
        )
      )
    `)
    .eq('id', reportId)
    .single();

  if (error) throw error;
  return data;
};

// Add a comment to a report
export const addComment = async (commentData: {
  report_id: string;
  content: string;
}) => {
  const { data, error } = await supabase
    .from('comments')
    .insert([commentData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update report status
export const updateReportStatus = async (reportId: string, status: string) => {
  const { data, error } = await supabase
    .from('reports')
    .update({ status })
    .eq('id', reportId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Create or update user profile
export const upsertProfile = async (profileData: {
  id: string;
  full_name?: string;
  avatar_url?: string;
}) => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profileData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get current user profile
export const getCurrentProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};