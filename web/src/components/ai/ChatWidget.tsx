'use client';

import { BusinessAiWidget } from './BusinessAiWidget';
import { PersonalAiWidget } from './PersonalAiWidget';
import { profileService } from '@/lib/api/profileService';
import { useEffect, useState } from 'react';

export function ChatWidget() {
  const [accountType, setAccountType] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const profile = await profileService.getProfile();
      setAccountType(profile?.account_type || 'business');
    };
    fetchProfile();
  }, []);

  if (!accountType) return null;

  return accountType === 'personal' ? <PersonalAiWidget /> : <BusinessAiWidget />;
}
