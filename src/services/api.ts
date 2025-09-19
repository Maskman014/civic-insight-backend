import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  role: string;
  created_at: string;
}

export interface ProfileSummary {
  id: string;
  full_name?: string;
  avatar_url?: string;
  role: string;
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
  profiles?: ProfileSummary;
}

export interface Comment {
  id: string;
  report_id: string;
  author: string;
  content: string;
  created_at: string;
  profiles?: ProfileSummary;
}

// Enhanced error handling wrapper
const handleSupabaseError = (error: any, operation: string) => {
  console.error(`Error in ${operation}:`, error);
  throw new Error(error.message || `Failed to ${operation}`);
};

// Profile functions
export async function createProfile(profileData: Omit<Profile, 'created_at'>) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error, 'create profile');
  }
}

export async function getProfile(userId: string) {
  try {
    if (!userId) throw new Error('User ID is required');
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error, 'get profile');
  }
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  try {
    if (!userId) throw new Error('User ID is required');
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error, 'update profile');
  }
}

// Report functions
export async function createReport(reportData: Omit<Report, 'id' | 'created_at' | 'updated_at'>) {
  try {
    if (!reportData.title?.trim()) {
      throw new Error('Title is required');
    }
    if (!reportData.user_id) {
      throw new Error('User ID is required');
    }

    const { data, error } = await supabase
      .from('reports')
      .insert({
        ...reportData,
        title: reportData.title.trim(),
        description: reportData.description?.trim() || null,
        location: reportData.location?.trim() || null,
      })
      .select(`
        *,
        profiles (
          id,
          full_name,
          avatar_url,
          role
        )
      `)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error, 'create report');
  }
}

export async function listReports() {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select(`
        *,
        profiles (
          id,
          full_name,
          avatar_url,
          role
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    handleSupabaseError(error, 'list reports');
  }
}

export async function getReport(reportId: string) {
  try {
    if (!reportId) throw new Error('Report ID is required');
    
    const { data, error } = await supabase
      .from('reports')
      .select(`
        *,
        profiles (
          id,
          full_name,
          avatar_url,
          role
        )
      `)
      .eq('id', reportId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error, 'get report');
  }
}

export async function updateReportStatus(reportId: string, status: string) {
  try {
    if (!reportId) throw new Error('Report ID is required');
    if (!status) throw new Error('Status is required');
    
    const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const { data, error } = await supabase
      .from('reports')
      .update({ status })
      .eq('id', reportId)
      .select(`
        *,
        profiles (
          id,
          full_name,
          avatar_url,
          role
        )
      `)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error, 'update report status');
  }
}

export async function deleteReport(reportId: string) {
  try {
    if (!reportId) throw new Error('Report ID is required');
    
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', reportId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    handleSupabaseError(error, 'delete report');
  }
}

// Comment functions
export async function addComment(commentData: Omit<Comment, 'id' | 'created_at'>) {
  try {
    if (!commentData.content?.trim()) {
      throw new Error('Comment content is required');
    }
    if (!commentData.report_id) {
      throw new Error('Report ID is required');
    }
    if (!commentData.author) {
      throw new Error('Author is required');
    }

    const { data, error } = await supabase
      .from('comments')
      .insert({
        ...commentData,
        content: commentData.content.trim(),
      })
      .select(`
        *,
        profiles (
          id,
          full_name,
          avatar_url,
          role
        )
      `)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error, 'add comment');
  }
}

export async function getCommentsByReport(reportId: string) {
  try {
    if (!reportId) throw new Error('Report ID is required');
    
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles (
          id,
          full_name,
          avatar_url,
          role
        )
      `)
      .eq('report_id', reportId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    handleSupabaseError(error, 'get comments');
  }
}

export async function updateComment(commentId: string, content: string) {
  try {
    if (!commentId) throw new Error('Comment ID is required');
    if (!content?.trim()) throw new Error('Comment content is required');
    
    const { data, error } = await supabase
      .from('comments')
      .update({ content: content.trim() })
      .eq('id', commentId)
      .select(`
        *,
        profiles (
          id,
          full_name,
          avatar_url,
          role
        )
      `)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error, 'update comment');
  }
}

export async function deleteComment(commentId: string) {
  try {
    if (!commentId) throw new Error('Comment ID is required');
    
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    handleSupabaseError(error, 'delete comment');
  }
}

// Utility functions
export async function getCurrentUserProfile() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user found');
    
    return await getProfile(user.id);
  } catch (error) {
    handleSupabaseError(error, 'get current user profile');
  }
}