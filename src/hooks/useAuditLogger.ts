import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export type AuditAction = 
  | 'user_created'
  | 'user_deleted'
  | 'role_changed'
  | 'provider_kyc_approved'
  | 'provider_kyc_rejected'
  | 'provider_suspended'
  | 'provider_activated'
  | 'vendor_kyc_approved'
  | 'vendor_kyc_rejected'
  | 'vendor_suspended'
  | 'vendor_activated'
  | 'subscription_updated'
  | 'subscription_extended'
  | 'booking_allocated'
  | 'booking_status_changed'
  | 'donation_allocated'
  | 'system_setting_updated'
  | 'admin_created'
  | 'admin_deleted';

export type EntityType = 
  | 'user'
  | 'provider'
  | 'vendor'
  | 'booking'
  | 'donation'
  | 'subscription'
  | 'system';

interface AuditLogParams {
  action: AuditAction;
  entityType: EntityType;
  entityId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export async function logAuditAction({
  action,
  entityType,
  entityId,
  oldValues,
  newValues,
  metadata = {}
}: AuditLogParams): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Get actor role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user?.id || '')
      .maybeSingle();

    const { error } = await supabase.from('audit_logs').insert({
      actor_id: user?.id || null,
      actor_role: roleData?.role || null,
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      old_values: (oldValues as Json) || null,
      new_values: (newValues as Json) || null,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
      } as Json,
    });

    if (error) {
      console.error('Error logging audit action:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in logAuditAction:', error);
    return false;
  }
}

// Hook for components
export function useAuditLogger() {
  return { logAuditAction };
}
