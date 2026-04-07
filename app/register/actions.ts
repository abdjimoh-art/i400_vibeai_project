'use server'

import { createClient } from '@/lib/supabase/server'

const ALLOWED_SELF_ROLES = ['parent', 'instructor'] as const
type AllowedRole = (typeof ALLOWED_SELF_ROLES)[number]

/**
 * Server Action for profile creation.
 * Enforces a role whitelist so users cannot assign themselves 'admin'
 * by intercepting the client-side request.
 */
export async function createProfile(
  userId: string,
  fullName: string,
  role: string
): Promise<{ error?: string }> {
  if (!ALLOWED_SELF_ROLES.includes(role as AllowedRole)) {
    return { error: 'Invalid role' }
  }
  if (!fullName || fullName.trim().length < 2) {
    return { error: 'Full name must be at least 2 characters' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .insert({ id: userId, full_name: fullName.trim(), role })

  return error ? { error: error.message } : {}
}
