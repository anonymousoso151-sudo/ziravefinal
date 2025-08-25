import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ProductsService {
  constructor(private supabaseService: SupabaseService) {}

  async getProducts(category?: string, limit?: number) {
    let query = this.supabaseService.client
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    return data;
  }

  async getProductStats() {
    const { data, error } = await this.supabaseService.admin
      .from('products')
      .select('category, is_active')
      .eq('deleted_at', null);

    if (error) {
      throw new Error(`Failed to fetch product stats: ${error.message}`);
    }

    const stats = data.reduce((acc, product) => {
      if (!acc.byCategory[product.category]) {
        acc.byCategory[product.category] = { active: 0, inactive: 0 };
      }
      
      if (product.is_active) {
        acc.byCategory[product.category].active++;
        acc.totalActive++;
      } else {
        acc.byCategory[product.category].inactive++;
        acc.totalInactive++;
      }
      
      return acc;
    }, {
      totalActive: 0,
      totalInactive: 0,
      byCategory: {},
    });

    return {
      total: data.length,
      ...stats,
    };
  }
}