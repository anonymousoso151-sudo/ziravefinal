import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;
  private supabaseAdmin: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY');
    const supabaseServiceKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    // Client for user operations (with RLS)
    this.supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Admin client for server operations (bypasses RLS)
    this.supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  get client(): SupabaseClient {
    return this.supabase;
  }

  get admin(): SupabaseClient {
    return this.supabaseAdmin;
  }

  // Helper method to verify JWT token
  async verifyToken(token: string) {
    const { data, error } = await this.supabase.auth.getUser(token);
    return { user: data.user, error };
  }
}