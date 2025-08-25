import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { GiftedChat, IMessage, User } from 'react-native-gifted-chat';
import { useSelector, useDispatch } from 'react-redux';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootState, AppDispatch } from '../../store';
import { fetchMessages, sendMessage, addMessage } from '../../store/slices/chatSlice';
import { supabase } from '../../lib/supabase';
import { MainStackParamList } from '../../navigation/MainNavigator';

type ChatScreenRouteProp = RouteProp<MainStackParamList, 'Chat'>;
type ChatScreenNavigationProp = StackNavigationProp<MainStackParamList, 'Chat'>;

interface Props {
  route: ChatScreenRouteProp;
  navigation: ChatScreenNavigationProp;
}

const ChatScreen: React.FC<Props> = ({ route }) => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { conversationId } = route.params;

  // Convert our message format to GiftedChat format
  const convertToGiftedChatMessage = (msg: any): IMessage => ({
    _id: msg.id,
    text: msg.content,
    createdAt: new Date(msg.created_at),
    user: {
      _id: msg.sender_id,
      name: 'User', // TODO: Get actual user name
    },
  });

  // Load initial messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const giftedMessages = data.map(convertToGiftedChatMessage);
        setMessages(giftedMessages);
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    loadMessages();
  }, [conversationId]);

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`messages:conversation_id=eq.${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = convertToGiftedChatMessage(payload.new);
          setMessages((previousMessages) =>
            GiftedChat.append(previousMessages, [newMessage])
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    if (!user?.id) return;

    const message = newMessages[0];
    
    try {
      // Insert message into Supabase
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            conversation_id: conversationId,
            sender_id: user.id,
            content: message.text,
            message_type: 'text',
          },
        ]);

      if (error) throw error;

      // Update conversation's last message
      await supabase
        .from('conversations')
        .update({
          last_message: message.text,
          last_message_at: new Date().toISOString(),
        })
        .eq('id', conversationId);

    } catch (error) {
      console.error('Error sending message:', error);
      // Optionally show error to user
    }
  }, [conversationId, user?.id]);

  const currentUser: User = {
    _id: user?.id || '',
    name: user?.phone || 'You',
  };

  return (
    <View style={styles.container}>
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={currentUser}
        placeholder="Mesaj yazın..."
        showUserAvatar={false}
        renderAvatar={null}
        messagesContainerStyle={styles.messagesContainer}
        textInputStyle={styles.textInput}
        sendButtonProps={{
          containerStyle: styles.sendButtonContainer,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  messagesContainer: {
    backgroundColor: '#F5F5F5',
  },
  textInput: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    marginHorizontal: 8,
    marginVertical: 4,
  },
  sendButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 4,
  },
});

export default ChatScreen;