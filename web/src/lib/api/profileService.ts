import { createClient } from '../supabase/client';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const getHeaders = async () => {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('No session found');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
  };
};

export const profileService = {
  async getProfile() {
    const response = await fetch(`${BACKEND_URL}/api/v1/business-profile/profile`, {
      headers: await getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  },

  async updateProfile(updates: any) {
    const response = await fetch(`${BACKEND_URL}/api/v1/business-profile/profile`, {
      method: 'PUT',
      headers: await getHeaders(),
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update profile');
    return response.json();
  },

  async getTenant() {
    const response = await fetch(`${BACKEND_URL}/api/v1/business-profile/tenant`, {
      headers: await getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch tenant');
    return response.json();
  },

  async updateTenant(updates: any) {
    const response = await fetch(`${BACKEND_URL}/api/v1/business-profile/tenant`, {
      method: 'PUT',
      headers: await getHeaders(),
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update tenant');
    return response.json();
  },

  async getStaff() {
    const response = await fetch(`${BACKEND_URL}/api/v1/business-profile/staff`, {
      headers: await getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch staff');
    return response.json();
  },

  async inviteStaff(email: string, role: string) {
    const response = await fetch(`${BACKEND_URL}/api/v1/business-profile/staff/invite`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify({ email, role }),
    });
    if (!response.ok) throw new Error('Failed to invite staff');
    return response.json();
  },

  async deleteAccount() {
    const response = await fetch(`${BACKEND_URL}/api/v1/business-profile/account/delete`, {
      method: 'POST',
      headers: await getHeaders(),
    });
    
    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Unknown error');
      throw new Error(`Failed to delete account: ${errorBody}`);
    }
    return response.json();
  }
};
