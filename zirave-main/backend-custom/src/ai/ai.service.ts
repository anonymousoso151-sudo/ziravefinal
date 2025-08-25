import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { DiagnosisRequestDto, DiagnosisResponseDto } from './dto/diagnosis.dto';
import FormData from 'form-data';

@Injectable()
export class AiService {
  private readonly aiServiceUrl: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.aiServiceUrl = this.configService.get<string>('AI_SERVICE_URL', 'http://localhost:8000');
  }

  async checkHealth() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.aiServiceUrl}/health`)
      );
      return {
        aiService: response.data,
        backend: {
          status: 'healthy',
          message: 'NestJS backend is operational',
          timestamp: new Date().toISOString(),
        },
        integration: 'successful'
      };
    } catch (error) {
      throw new HttpException(
        {
          message: 'AI service is not available',
          error: error.message,
          aiServiceUrl: this.aiServiceUrl,
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async diagnosePlant(diagnosisRequest: DiagnosisRequestDto): Promise<DiagnosisResponseDto> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.aiServiceUrl}/diagnose`, diagnosisRequest)
      );
      
      return response.data;
    } catch (error) {
      console.error('AI diagnosis error:', error.response?.data || error.message);
      throw new HttpException(
        {
          message: 'Plant diagnosis failed',
          error: error.response?.data || error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async diagnoseFromImage(file: Express.Multer.File, plantType?: string) {
    try {
      const formData = new FormData();
      formData.append('file', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });
      
      if (plantType) {
        formData.append('plant_type', plantType);
      }

      const response = await firstValueFrom(
        this.httpService.post(`${this.aiServiceUrl}/diagnose/image`, formData, {
          headers: {
            ...formData.getHeaders(),
          },
        })
      );
      
      return response.data;
    } catch (error) {
      console.error('AI image diagnosis error:', error.response?.data || error.message);
      throw new HttpException(
        {
          message: 'Image diagnosis failed',
          error: error.response?.data || error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPlantDiseases() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.aiServiceUrl}/plants/diseases`)
      );
      
      return response.data;
    } catch (error) {
      throw new HttpException(
        {
          message: 'Failed to fetch plant diseases',
          error: error.response?.data || error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getRecommendationTypes() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.aiServiceUrl}/recommendations/types`)
      );
      
      return response.data;
    } catch (error) {
      throw new HttpException(
        {
          message: 'Failed to fetch recommendation types',
          error: error.response?.data || error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}