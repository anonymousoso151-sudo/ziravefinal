import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  getHealth(): { message: string; timestamp: string; version: string } {
    return this.appService.getHealth();
  }

  @Get('status')
  @ApiOperation({ summary: 'Detailed system status' })
  getStatus() {
    return this.appService.getStatus();
  }
}