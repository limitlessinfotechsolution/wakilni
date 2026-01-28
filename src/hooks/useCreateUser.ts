import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logAuditAction } from '@/hooks/useAuditLogger';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface CreateUserData {
  email: string;
  password: string;
  fullName: string;
  fullNameAr?: string;
  phone?: string;
  role: AppRole;
}

export function useCreateUser() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const createUser = async (userData: CreateUserData): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Create user with Supabase auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.fullName,
            full_name_ar: userData.fullNameAr,
            role: userData.role,
          },
        },
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('User creation failed');
      }

      // Update profile with additional data if provided
      if (userData.phone || userData.fullNameAr) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            phone: userData.phone || null,
            full_name_ar: userData.fullNameAr || null,
          })
          .eq('user_id', authData.user.id);

        if (profileError) {
          console.error('Error updating profile:', profileError);
        }
      }

      // Log audit action
      await logAuditAction({
        action: userData.role === 'admin' || userData.role === 'super_admin' ? 'admin_created' : 'user_created',
        entityType: 'user',
        entityId: authData.user.id,
        newValues: { 
          email: userData.email, 
          full_name: userData.fullName,
          role: userData.role 
        },
        metadata: { 
          created_role: userData.role,
          has_phone: !!userData.phone,
          has_arabic_name: !!userData.fullNameAr
        }
      });

      toast({
        title: 'Success',
        description: `User ${userData.fullName} created successfully with role: ${userData.role}`,
      });

      return true;
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create user',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createUser,
    isLoading,
  };
}
