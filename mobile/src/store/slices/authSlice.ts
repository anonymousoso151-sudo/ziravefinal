import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase, Profile } from '../../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  otpSent: boolean;
}

const initialState: AuthState = {
  user: null,
  profile: null,
  session: null,
  loading: false,
  error: null,
  otpSent: false,
};

// Async thunks for auth operations
export const sendOTP = createAsyncThunk(
  'auth/sendOTP',
  async (phone: string, { rejectWithValue }) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone,
      });
      
      if (error) throw error;
      return { phone };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async ({ phone, token }: { phone: string; token: string }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phone,
        token: token,
        type: 'sms',
      });
      
      if (error) throw error;
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (userId: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data as Profile;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData: Partial<Profile>, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', profileData.id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Profile;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const signOut = createAsyncThunk(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<{ session: Session | null; user: User | null }>) => {
      state.session = action.payload.session;
      state.user = action.payload.user;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetOtpSent: (state) => {
      state.otpSent = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Send OTP
      .addCase(sendOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOTP.fulfilled, (state) => {
        state.loading = false;
        state.otpSent = true;
      })
      .addCase(sendOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Verify OTP
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.session = action.payload.session;
        state.user = action.payload.user;
        state.otpSent = false;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Profile
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      })
      // Update Profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      })
      // Sign Out
      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
        state.profile = null;
        state.session = null;
      });
  },
});

export const { setSession, clearError, resetOtpSent } = authSlice.actions;
export default authSlice.reducer;