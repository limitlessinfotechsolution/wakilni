/**
 * Base API Configuration
 * Centralized Supabase client and common utilities
 */

import { supabase } from '@/integrations/supabase/client';
import type { PostgrestError } from '@supabase/supabase-js';

export { supabase };

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

// =============================================================================
// ERROR HANDLING
// =============================================================================

export function handleError(error: PostgrestError | Error | unknown): ApiError {
  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'UNKNOWN_ERROR',
    };
  }

  const pgError = error as PostgrestError;
  if (pgError?.code) {
    return {
      message: pgError.message || 'Database error occurred',
      code: pgError.code,
      details: pgError.details,
    };
  }

  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
  };
}

export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    data,
    error: null,
    success: true,
  };
}

export function createErrorResponse<T>(error: ApiError): ApiResponse<T> {
  return {
    data: null,
    error,
    success: false,
  };
}

// =============================================================================
// QUERY HELPERS
// =============================================================================

export function applyPagination<T>(
  query: any,
  { page = 1, pageSize = 10 }: PaginationParams
) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return query.range(from, to);
}

// =============================================================================
// EDGE FUNCTION CALLER
// =============================================================================

interface EdgeFunctionOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: Record<string, unknown> | object;
  headers?: Record<string, string>;
}

export async function callEdgeFunction<T>(
  functionName: string,
  options: EdgeFunctionOptions = {}
): Promise<ApiResponse<T>> {
  const { method = 'POST', body, headers = {} } = options;

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;

    if (!accessToken) {
      return createErrorResponse({
        message: 'No valid session',
        code: 'AUTH_ERROR',
      });
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}`,
      {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return createErrorResponse({
        message: result.error || 'Edge function error',
        code: `HTTP_${response.status}`,
      });
    }

    return createSuccessResponse(result.data || result);
  } catch (error) {
    return createErrorResponse(handleError(error));
  }
}

// =============================================================================
// REALTIME SUBSCRIPTION HELPER
// =============================================================================

export function subscribeToTable(
  tableName: string,
  callback: (payload: any) => void,
  filter?: { column: string; value: string }
) {
  let channel = supabase.channel(`${tableName}-changes`);

  const subscriptionConfig: any = {
    event: '*',
    schema: 'public',
    table: tableName,
  };

  if (filter) {
    subscriptionConfig.filter = `${filter.column}=eq.${filter.value}`;
  }

  channel = channel.on('postgres_changes', subscriptionConfig, callback);

  return channel.subscribe();
}

export function unsubscribe(channel: ReturnType<typeof supabase.channel>) {
  return supabase.removeChannel(channel);
}
