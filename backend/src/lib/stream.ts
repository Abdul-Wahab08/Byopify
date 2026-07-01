import type { UserRole } from '../db/schema';

export function streamDisplayName(
    role: UserRole,
    displayName: string | null,
    email: string
): string {
    const base = displayName ?? email.split('@')[0];
    if(role === 'admin') return `Admin: ${base}`;
    if(role === 'support') return `Support: ${base}`;
    return base;
}