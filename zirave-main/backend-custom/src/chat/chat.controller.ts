import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChatService } from './chat.service';

@ApiTags('Chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('conversations/:userId')
  @ApiOperation({ summary: 'Get user conversations' })
  async getConversations(@Param('userId') userId: string) {
    return this.chatService.getConversations(userId);
  }

  @Post('moderate')
  @ApiOperation({ summary: 'Moderate chat message content' })
  async moderateMessage(@Body() body: { content: string }) {
    return this.chatService.moderateContent(body.content);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get chat statistics' })
  async getChatStats() {
    return this.chatService.getChatStats();
  }
}