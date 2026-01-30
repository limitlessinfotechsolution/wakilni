/**
 * Donations API Service
 * CRUD operations for donations and charity_requests tables
 */

import {
  supabase,
  ApiResponse,
  handleError,
  createSuccessResponse,
  createErrorResponse,
} from '../base';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

export type Donation = Tables<'donations'>;
export type DonationInsert = TablesInsert<'donations'>;
export type CharityRequest = Tables<'charity_requests'>;
export type DonationAllocation = Tables<'donation_allocations'>;

export interface CharityRequestWithBeneficiary extends CharityRequest {
  beneficiary?: {
    full_name: string;
    full_name_ar: string | null;
  } | null;
}

export interface DonationStats {
  totalDonated: number;
  totalAllocated: number;
  availableFunds: number;
  donorCount: number;
  pendingRequests: number;
}

// =============================================================================
// DONATION READ OPERATIONS
// =============================================================================

export async function getDonations(
  status?: string
): Promise<ApiResponse<Donation[]>> {
  try {
    let query = supabase
      .from('donations')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('payment_status', status);
    }

    const { data, error } = await query;
    if (error) throw error;

    return createSuccessResponse(data || []);
  } catch (error) {
    return createErrorResponse(handleError(error));
  }
}

export async function getUserDonations(
  userId: string
): Promise<ApiResponse<Donation[]>> {
  try {
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .eq('donor_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return createSuccessResponse(data || []);
  } catch (error) {
    return createErrorResponse(handleError(error));
  }
}

export async function getDonationStats(): Promise<ApiResponse<DonationStats>> {
  try {
    const { data: donations, error } = await supabase
      .from('donations')
      .select('amount, allocated_amount, donor_id')
      .eq('payment_status', 'completed');

    if (error) throw error;

    const { count: pendingRequests } = await supabase
      .from('charity_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const totalDonated = donations?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;
    const totalAllocated = donations?.reduce((sum, d) => sum + (d.allocated_amount || 0), 0) || 0;
    const uniqueDonors = new Set(donations?.map(d => d.donor_id).filter(Boolean)).size;

    return createSuccessResponse({
      totalDonated,
      totalAllocated,
      availableFunds: totalDonated - totalAllocated,
      donorCount: uniqueDonors,
      pendingRequests: pendingRequests || 0,
    });
  } catch (error) {
    return createErrorResponse(handleError(error));
  }
}

// =============================================================================
// DONATION WRITE OPERATIONS
// =============================================================================

export async function createDonation(
  donation: DonationInsert
): Promise<ApiResponse<Donation>> {
  try {
    const { data, error } = await supabase
      .from('donations')
      .insert({
        ...donation,
        remaining_amount: donation.amount,
      })
      .select()
      .single();

    if (error) throw error;
    return createSuccessResponse(data);
  } catch (error) {
    return createErrorResponse(handleError(error));
  }
}

// =============================================================================
// CHARITY REQUEST OPERATIONS
// =============================================================================

export async function getCharityRequests(
  status?: string
): Promise<ApiResponse<CharityRequestWithBeneficiary[]>> {
  try {
    let query = supabase
      .from('charity_requests')
      .select(`
        *,
        beneficiary:beneficiaries(full_name, full_name_ar)
      `)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Transform array responses
    const transformed = (data || []).map(item => ({
      ...item,
      beneficiary: Array.isArray(item.beneficiary) ? item.beneficiary[0] : item.beneficiary,
    }));

    return createSuccessResponse(transformed as CharityRequestWithBeneficiary[]);
  } catch (error) {
    return createErrorResponse(handleError(error));
  }
}

export async function approveCharityRequest(
  requestId: string,
  approvedAmount: number,
  reviewedBy?: string
): Promise<ApiResponse<CharityRequest>> {
  try {
    const { data, error } = await supabase
      .from('charity_requests')
      .update({
        status: 'approved',
        approved_amount: approvedAmount,
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewedBy,
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return createSuccessResponse(data);
  } catch (error) {
    return createErrorResponse(handleError(error));
  }
}

export async function rejectCharityRequest(
  requestId: string,
  notes: string,
  reviewedBy?: string
): Promise<ApiResponse<CharityRequest>> {
  try {
    const { data, error } = await supabase
      .from('charity_requests')
      .update({
        status: 'rejected',
        notes,
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewedBy,
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return createSuccessResponse(data);
  } catch (error) {
    return createErrorResponse(handleError(error));
  }
}

// =============================================================================
// FUND ALLOCATION
// =============================================================================

export async function allocateFunds(
  donationId: string,
  charityRequestId: string,
  amount: number
): Promise<ApiResponse<DonationAllocation>> {
  try {
    // Create allocation record
    const { data: allocation, error: allocError } = await supabase
      .from('donation_allocations')
      .insert({
        donation_id: donationId,
        charity_request_id: charityRequestId,
        amount,
      })
      .select()
      .single();

    if (allocError) throw allocError;

    // Update donation allocated amount
    const { data: donation } = await supabase
      .from('donations')
      .select('allocated_amount')
      .eq('id', donationId)
      .single();

    await supabase
      .from('donations')
      .update({
        allocated_amount: (donation?.allocated_amount || 0) + amount,
      })
      .eq('id', donationId);

    // Update charity request status
    await supabase
      .from('charity_requests')
      .update({ status: 'funded' })
      .eq('id', charityRequestId);

    return createSuccessResponse(allocation);
  } catch (error) {
    return createErrorResponse(handleError(error));
  }
}
