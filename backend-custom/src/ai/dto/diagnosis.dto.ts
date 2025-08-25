import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray } from 'class-validator';

export class DiagnosisRequestDto {
  @ApiProperty({ 
    description: 'Type of plant to diagnose',
    example: 'domates',
    required: false 
  })
  @IsOptional()
  @IsString()
  plant_type?: string;

  @ApiProperty({ 
    description: 'List of observed symptoms',
    example: ['yaprak sararması', 'lekeler'],
    required: false 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  symptoms?: string[];

  @ApiProperty({ 
    description: 'Location/region',
    example: 'Antalya',
    required: false 
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ 
    description: 'Current season',
    example: 'yaz',
    required: false 
  })
  @IsOptional()
  @IsString()
  season?: string;
}

export class DetectedIssueDto {
  @ApiProperty({ description: 'Name of the detected disease' })
  name: string;

  @ApiProperty({ description: 'List of symptoms' })
  symptoms: string[];

  @ApiProperty({ description: 'Recommended treatment' })
  treatment: string;

  @ApiProperty({ description: 'Confidence level (0-1)' })
  confidence: number;
}

export class RecommendationDto {
  @ApiProperty({ description: 'Type of recommendation' })
  type: string;

  @ApiProperty({ description: 'Title of the recommendation' })
  title: string;

  @ApiProperty({ description: 'Detailed description' })
  description: string;

  @ApiProperty({ description: 'Priority level' })
  priority: string;
}

export class DiagnosisResponseDto {
  @ApiProperty({ description: 'Unique diagnosis identifier' })
  diagnosis_id: string;

  @ApiProperty({ description: 'Type of plant diagnosed' })
  plant_type: string;

  @ApiProperty({ 
    description: 'List of detected issues',
    type: [DetectedIssueDto] 
  })
  detected_issues: DetectedIssueDto[];

  @ApiProperty({ 
    description: 'List of recommendations',
    type: [RecommendationDto] 
  })
  recommendations: RecommendationDto[];

  @ApiProperty({ description: 'Overall confidence level' })
  confidence: number;

  @ApiProperty({ description: 'Diagnosis timestamp' })
  timestamp: string;
}