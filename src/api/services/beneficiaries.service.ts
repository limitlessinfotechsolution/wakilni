/**
 * Beneficiaries API Service
 * CRUD operations for beneficiaries table
 */

import {
  supabase,
  ApiResponse,
  handleError,
  createSuccessResponse,
  createErrorResponse,
} from '../base';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Beneficiary = Tables<'beneficiaries'>;
export type BeneficiaryInsert = TablesInsert<'beneficiaries'>;
export type BeneficiaryUpdate = TablesUpdate<'beneficiaries'>;

// =============================================================================
// READ OPERATIONS
// =============================================================================

export async function getBeneficiaries(
  userId: string
): Promise<ApiResponse<Beneficiary[]>> {
  try {
    const { data, error } = await supabase
      .from('beneficiaries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return createSuccessResponse(data || []);
  } catch (error) {
    return createErrorResponse(handleError(error));
  }
}

export async function getBeneficiaryById(
  beneficiaryId: string
): Promise<ApiResponse<Beneficiary>> {
  try {
    const { data, error } = await supabase
      .from('beneficiaries')
      .select('*')
      .eq('id', beneficiaryId)
      .single();

    if (error) throw error;
    return createSuccessResponse(data);
  } catch (error) {
    return createErrorResponse(handleError(error));
  }
}

// =============================================================================
// WRITE OPERATIONS
// =============================================================================

export async function createBeneficiary(
  beneficiary: BeneficiaryInsert
): Promise<ApiResponse<Beneficiary>> {
  try {
    const { data, error } = await supabase
      .from('beneficiaries')
      .insert(beneficiary)
      .select()
      .single();

    if (error) throw error;
    return createSuccessResponse(data);
  } catch (error) {
    return createErrorResponse(handleError(error));
  }
}

export async function updateBeneficiary(
  beneficiaryId: string,
  updates: BeneficiaryUpdate
): Promise<ApiResponse<Beneficiary>> {
  try {
    const { data, error } = await supabase
      .from('beneficiaries')
      .update(updates)
      .eq('id', beneficiaryId)
      .select()
      .single();

    if (error) throw error;
    return createSuccessResponse(data);
  } catch (error) {
    return createErrorResponse(handleError(error));
  }
}

export async function deleteBeneficiary(
  beneficiaryId: string
): Promise<ApiResponse<boolean>> {
  try {
    const { error } = await supabase
      .from('beneficiaries')
      .delete()
      .eq('id', beneficiaryId);

    if (error) throw error;
    return createSuccessResponse(true);
  } catch (error) {
    return createErrorResponse(handleError(error));
  }
}

// =============================================================================
// ADMIN OPERATIONS
// =============================================================================

export async function getAllBeneficiaries(): Promise<ApiResponse<Beneficiary[]>> {
  try {
    const { data, error } = await supabase
      .from('beneficiaries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return createSuccessResponse(data || []);
  } catch (error) {
    return createErrorResponse(handleError(error));
  }
}
