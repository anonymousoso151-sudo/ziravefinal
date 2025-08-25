import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  UploadedFile, 
  UseInterceptors,
  Get 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AiService } from './ai.service';
import { DiagnosisRequestDto, DiagnosisResponseDto } from './dto/diagnosis.dto';

@ApiTags('AI Diagnostics')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiController {
  constructor(private aiService: AiService) {}

  @Get('health')
  @ApiOperation({ summary: 'Check AI service health' })
  async checkAiHealth() {
    return this.aiService.checkHealth();
  }

  @Post('diagnose')
  @ApiOperation({ summary: 'Diagnose plant issues from symptoms' })
  async diagnosePlant(@Body() diagnosisRequest: DiagnosisRequestDto): Promise<DiagnosisResponseDto> {
    return this.aiService.diagnosePlant(diagnosisRequest);
  }

  @Post('diagnose/image')
  @ApiOperation({ summary: 'Diagnose plant from uploaded image' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async diagnoseFromImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('plant_type') plantType?: string
  ) {
    return this.aiService.diagnoseFromImage(file, plantType);
  }

  @Get('plants/diseases')
  @ApiOperation({ summary: 'Get known plant diseases' })
  async getPlantDiseases() {
    return this.aiService.getPlantDiseases();
  }

  @Get('recommendations/types')
  @ApiOperation({ summary: 'Get recommendation types' })
  async getRecommendationTypes() {
    return this.aiService.getRecommendationTypes();
  }
}