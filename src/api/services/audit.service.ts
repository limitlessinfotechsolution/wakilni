/**
 * Audit Logs API Service
 * Read operations for audit_logs table
 */

import {
  supabase,
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
  handleError,
  createSuccessResponse,
  createErrorResponse,
} from '../base';
import type { Tables } from '@/integrations/supabase/types';

export type AuditLog = Tables<'audit_logs'>;

export interface AuditLogFilters {
  entityType?: string;
  action?: string;
  actorId?: string;
  dateFrom?: string;
  dateTo?: string;
}

// =============================================================================
// READ OPERATIONS (Admin/SuperAdmin only)
// =============================================================================

export async function getAuditLogs(
  filters?: AuditLogFilters,
  pagination?: PaginationParams
): Promise<PaginatedResponse<AuditLog>> {
  try {
    let query = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.entityType) {
      query = query.eq('entity_type', filters.entityType);
    }

    if (filters?.action) {
      query = query.eq('action', filters.action);
    }

    if (filters?.actorId) {
      query = query.eq('actor_id', filters.actorId);
    }

    if (filters?.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }

    if (filters?.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }

    // Apply pagination
    const { page = 1, pageSize = 25 } = pagination || {};
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data: data || [],
      count: count || 0,
      page,
      pageSize,
      hasMore: (count || 0) > page * pageSize,
    };
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return {
      data: [],
      count: 0,
      page: 1,
      pageSize: 25,
      hasMore: false,
    };
  }
}

export async function getAuditLogById(
  logId: string
): Promise<ApiResponse<AuditLog>> {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('id', logId)
      .single();

    if (error) throw error;
    return createSuccessResponse(data);
  } catch (error) {
    return createErrorResponse(handleError(error));
  }
}

// =============================================================================
// AGGREGATIONS
// =============================================================================

export async function getAuditLogStats(): Promise<ApiResponse<{
  totalLogs: number;
  byEntityType: Record<string, number>;
  byAction: Record<string, number>;
  recentActivity: number; // Last 24 hours
}>> {
  try {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from('audit_logs')
      .select('entity_type, action, created_at');

    if (error) throw error;

    const logs = data || [];
    const byEntityType: Record<string, number> = {};
    const byAction: Record<string, number> = {};
    let recentActivity = 0;

    logs.forEach((log) => {
      byEntityType[log.entity_type] = (byEntityType[log.entity_type] || 0) + 1;
      byAction[log.action] = (byAction[log.action] || 0) + 1;

      if (new Date(log.created_at) > yesterday) {
        recentActivity++;
      }
    });

    return createSuccessResponse({
      totalLogs: logs.length,
      byEntityType,
      byAction,
      recentActivity,
    });
  } catch (error) {
    return createErrorResponse(handleError(error));
  }
}

export async function getEntityAuditHistory(
  entityType: string,
  entityId: string
): Promise<ApiResponse<AuditLog[]>> {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return createSuccessResponse(data || []);
  } catch (error) {
    return createErrorResponse(handleError(error));
  }
}
