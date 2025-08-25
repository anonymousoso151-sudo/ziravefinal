import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase, Conversation, Message } from '../../lib/supabase';

interface ChatState {
  conversations: Conversation[];
  messages: { [conversationId: string]: Message[] };
  activeConversation: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  conversations: [],
  messages: {},
  activeConversation: null,
  loading: false,
  error: null,
};

// Async thunks for chat operations
export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (userId: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
        .order('last_message_at', { ascending: false });
      
      if (error) throw error;
      return data as Conversation[];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return { conversationId, messages: data as Message[] };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (messageData: Omit<Message, 'id' | 'created_at'>, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([messageData])
        .select()
        .single();
      
      if (error) throw error;

      // Update conversation's last message
      await supabase
        .from('conversations')
        .update({
          last_message: messageData.content,
          last_message_at: new Date().toISOString(),
        })
        .eq('id', messageData.conversation_id);

      return data as Message;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createConversation = createAsyncThunk(
  'chat/createConversation',
  async ({ participant1Id, participant2Id }: { participant1Id: string; participant2Id: string }, { rejectWithValue }) => {
    try {
      // Check if conversation already exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('*')
        .or(`and(participant_1_id.eq.${participant1Id},participant_2_id.eq.${participant2Id}),and(participant_1_id.eq.${participant2Id},participant_2_id.eq.${participant1Id})`)
        .single();

      if (existing) {
        return existing as Conversation;
      }

      // Create new conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert([{
          participant_1_id: participant1Id,
          participant_2_id: participant2Id,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data as Conversation;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveConversation: (state, action: PayloadAction<string | null>) => {
      state.activeConversation = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      const message = action.payload;
      if (!state.messages[message.conversation_id]) {
        state.messages[message.conversation_id] = [];
      }
      state.messages[message.conversation_id].push(message);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Conversations
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Messages
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { conversationId, messages } = action.payload;
        state.messages[conversationId] = messages;
      })
      // Send Message
      .addCase(sendMessage.fulfilled, (state, action) => {
        const message = action.payload;
        if (!state.messages[message.conversation_id]) {
          state.messages[message.conversation_id] = [];
        }
        state.messages[message.conversation_id].push(message);
      })
      // Create Conversation
      .addCase(createConversation.fulfilled, (state, action) => {
        const conversation = action.payload;
        const exists = state.conversations.find(c => c.id === conversation.id);
        if (!exists) {
          state.conversations.unshift(conversation);
        }
      });
  },
});

export const { setActiveConversation, addMessage, clearError } = chatSlice.actions;
export default chatSlice.reducer;