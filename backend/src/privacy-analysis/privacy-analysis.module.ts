import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrivacyAnalysisService } from './privacy-analysis.service';
import { PrivacyAnalysisController } from './privacy-analysis.controller';
import { PrivacyAnalysisLog } from './entities/privacy-analysis-log.entity';
import { Geofence } from '@/geofences/entities/geofence.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PrivacyAnalysisLog, Geofence])],
  controllers: [PrivacyAnalysisController],
  providers: [PrivacyAnalysisService],
})
export class PrivacyAnalysisModule {}
