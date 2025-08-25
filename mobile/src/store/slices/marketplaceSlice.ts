import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase, Product } from '../../lib/supabase';

interface MarketplaceState {
  products: Product[];
  myProducts: Product[];
  loading: boolean;
  error: string | null;
  selectedCategory: string | null;
}

const initialState: MarketplaceState = {
  products: [],
  myProducts: [],
  loading: false,
  error: null,
  selectedCategory: null,
};

// Async thunks for marketplace operations
export const fetchProducts = createAsyncThunk(
  'marketplace/fetchProducts',
  async (category?: string, { rejectWithValue }) => {
    try {
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as Product[];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const searchProducts = createAsyncThunk(
  'marketplace/searchProducts',
  async ({ query, category }: { query: string; category?: string }, { rejectWithValue }) => {
    try {
      let supabaseQuery = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (category) {
        supabaseQuery = supabaseQuery.eq('category', category);
      }

      const { data, error } = await supabaseQuery;
      
      if (error) throw error;
      return data as Product[];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMyProducts = createAsyncThunk(
  'marketplace/fetchMyProducts',
  async (supplierId: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('supplier_id', supplierId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Product[];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createProduct = createAsyncThunk(
  'marketplace/createProduct',
  async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();
      
      if (error) throw error;
      return data as Product;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateProduct = createAsyncThunk(
  'marketplace/updateProduct',
  async ({ id, updates }: { id: string; updates: Partial<Product> }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Product;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const marketplaceSlice = createSlice({
  name: 'marketplace',
  initialState,
  reducers: {
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch My Products
      .addCase(fetchMyProducts.fulfilled, (state, action) => {
        state.myProducts = action.payload;
      })
      // Create Product
      .addCase(createProduct.fulfilled, (state, action) => {
        state.myProducts.unshift(action.payload);
        state.products.unshift(action.payload);
      })
      // Update Product
      .addCase(updateProduct.fulfilled, (state, action) => {
        const updatedProduct = action.payload;
        state.myProducts = state.myProducts.map(p => 
          p.id === updatedProduct.id ? updatedProduct : p
        );
        state.products = state.products.map(p => 
          p.id === updatedProduct.id ? updatedProduct : p
        );
      });
  },
});

export const { setSelectedCategory, clearError } = marketplaceSlice.actions;
export default marketplaceSlice.reducer;