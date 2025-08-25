import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile/:id')
  @ApiOperation({ summary: 'Get user profile by ID' })
  async getProfile(@Param('id') id: string) {
    return this.usersService.getProfile(id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get platform user statistics' })
  async getUserStats() {
    return this.usersService.getUserStats();
  }
}