/**
 * Announcement Bar Utilities
 *
 * Handles fetching and updating site announcements from Supabase.
 */

import { getSupabaseClient, getSupabaseServiceClient } from './supabase';

// Type definition for announcement
export type AnnouncementColor = 'yellow' | 'green';

export interface SiteAnnouncement {
  id: number;
  is_active: boolean;
  message: string;
  color: AnnouncementColor;
  created_at: string;
  updated_at: string;
}

/**
 * Get the current active announcement (if any)
 * Uses the anon client - safe for public pages
 */
export async function getAnnouncement(): Promise<SiteAnnouncement | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('site_announcements')
    .select('*')
    .order('id', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching announcement:', error);
    return null;
  }

  return data as SiteAnnouncement;
}

/**
 * Get the active announcement for display (only if is_active is true)
 */
export async function getActiveAnnouncement(): Promise<SiteAnnouncement | null> {
  const announcement = await getAnnouncement();

  if (!announcement || !announcement.is_active) {
    return null;
  }

  return announcement;
}

/**
 * Get announcement for admin panel (bypasses RLS)
 * Uses service client to read regardless of is_active status
 */
export async function getAnnouncementAdmin(): Promise<SiteAnnouncement | null> {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from('site_announcements')
    .select('*')
    .order('id', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching announcement (admin):', error);
    return null;
  }

  return data as SiteAnnouncement;
}

/**
 * Update the announcement settings (admin only)
 * Uses the service client to bypass RLS
 */
export async function updateAnnouncement(
  id: number,
  updates: { is_active?: boolean; message?: string; color?: AnnouncementColor }
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseServiceClient();

  const { error } = await supabase
    .from('site_announcements')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating announcement:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
