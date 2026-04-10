import { supabase } from './supabase';

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'publish'
  | 'unpublish'
  | 'approve'
  | 'reject'
  | 'restore';

export async function logAudit(
  action: AuditAction,
  resource: string,
  resourceId?: string,
  details?: Record<string, unknown>,
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('admin_audit_log').insert({
      user_id: user.id,
      user_email: user.email ?? '',
      action,
      resource,
      resource_id: resourceId ?? null,
      details: details ?? null,
    });
  } catch {
    // Non-blocking — audit failures must not interrupt the main operation
  }
}
