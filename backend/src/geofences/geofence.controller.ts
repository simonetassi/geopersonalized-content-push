import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { GeofenceService } from './geofence.service';
import { CreateGeofenceDTO } from './dtos/create-geofence.dto';
import { Geofence } from './entities/geofence.entity';

@Controller('geofences')
export class GeofenceController {
  public constructor(private readonly geofenceService: GeofenceService) {}

  @Post()
  public create(
    @Body() createGeofenceDto: CreateGeofenceDTO,
  ): Promise<Geofence> {
    return this.geofenceService.create(createGeofenceDto);
  }

  @Get()
  public findAll(): Promise<Geofence[]> {
    return this.geofenceService.findAll();
  }

  @Get(':id')
  public findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Geofence | null> {
    return this.geofenceService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateGeofenceDto: CreateGeofenceDTO,
  ): Promise<Geofence> {
    return this.geofenceService.update(id, updateGeofenceDto);
  }

  @Patch(':id')
  async partialUpdate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateGeofenceDto: Partial<CreateGeofenceDTO>,
  ): Promise<Geofence> {
    return this.geofenceService.update(id, updateGeofenceDto);
  }

  @Delete(':id')
  public delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.geofenceService.delete(id);
  }
}
