import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class UsersService {
  constructor(private supabaseService: SupabaseService) {}

  async getProfile(id: string) {
    const { data, error } = await this.supabaseService.client
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Profile not found: ${error.message}`);
    }

    return data;
  }

  async getUserStats() {
    const { data, error } = await this.supabaseService.admin
      .from('profiles')
      .select('role')
      .eq('deleted_at', null);

    if (error) {
      throw new Error(`Failed to fetch user stats: ${error.message}`);
    }

    const stats = data.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    return {
      total: data.length,
      byRole: stats,
    };
  }
}