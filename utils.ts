import { User } from './types';

export const hasRole = (user: User | null | undefined, role: string | string[]): boolean => {
  if (!user || !user.role) return false;
  const userRoles = user.role.split(',').map(r => r.trim().toLowerCase());
  const targetRoles = (Array.isArray(role) ? role : [role]).map(r => r.trim().toLowerCase());
  
  return targetRoles.some(r => {
    if (r === 'vip+' || r === 'vip_plus') {
      return userRoles.includes('vip+') || userRoles.includes('vip_plus') || userRoles.includes('vip');
    }
    return userRoles.includes(r);
  });
};

export const getRoles = (user: User | null | undefined): string[] => {
  if (!user || !user.role) return [];
  return user.role.split(',').map(r => r.trim()).filter(Boolean);
};

