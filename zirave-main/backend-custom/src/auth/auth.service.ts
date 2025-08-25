import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private supabaseService: SupabaseService,
  ) {}

  async verifySupabaseToken(token: string) {
    try {
      const { user, error } = await this.supabaseService.verifyToken(token);
      
      if (error || !user) {
        throw new UnauthorizedException('Invalid token');
      }

      return {
        valid: true,
        user: {
          id: user.id,
          phone: user.phone,
          email: user.email,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Token verification failed');
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const { data, error } = await this.supabaseService.client.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error || !data.session) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      };
    } catch (error) {
      throw new UnauthorizedException('Token refresh failed');
    }
  }
}