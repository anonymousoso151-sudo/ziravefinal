import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ChatService {
  constructor(private supabaseService: SupabaseService) {}

  async getConversations(userId: string) {
    const { data, error } = await this.supabaseService.client
      .from('conversations')
      .select(`
        *,
        participant_1:profiles!conversations_participant_1_id_fkey(id, full_name),
        participant_2:profiles!conversations_participant_2_id_fkey(id, full_name)
      `)
      .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch conversations: ${error.message}`);
    }

    return data;
  }

  async moderateContent(content: string) {
    // Simple content moderation - can be enhanced with AI
    const inappropriateWords = ['spam', 'scam', 'fake'];
    const isInappropriate = inappropriateWords.some(word => 
      content.toLowerCase().includes(word)
    );

    return {
      content,
      isAppropriate: !isInappropriate,
      flaggedWords: inappropriateWords.filter(word => 
        content.toLowerCase().includes(word)
      ),
    };
  }

  async getChatStats() {
    const { data: conversations, error: convError } = await this.supabaseService.admin
      .from('conversations')
      .select('id, created_at');

    const { data: messages, error: msgError } = await this.supabaseService.admin
      .from('messages')
      .select('id, created_at, message_type');

    if (convError || msgError) {
      throw new Error('Failed to fetch chat statistics');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayMessages = messages.filter(msg => 
      new Date(msg.created_at) >= today
    );

    return {
      totalConversations: conversations.length,
      totalMessages: messages.length,
      todayMessages: todayMessages.length,
      messageTypes: messages.reduce((acc, msg) => {
        acc[msg.message_type] = (acc[msg.message_type] || 0) + 1;
        return acc;
      }, {}),
    };
  }
}