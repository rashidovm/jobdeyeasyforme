'use client';

import { createContext, useContext } from 'react';
import { Profile } from '@/types';

export const AdminContext = createContext<{ profile: Profile | null }>({ profile: null });

export const useAdmin = () => useContext(AdminContext);
