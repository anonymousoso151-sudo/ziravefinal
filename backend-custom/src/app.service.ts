import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth(): { message: string; timestamp: string; version: string } {
    return {
      message: 'ZİRAVE Backend is running successfully!',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  getStatus() {
    return {
      service: 'ZİRAVE Backend',
      status: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    };
  }
}