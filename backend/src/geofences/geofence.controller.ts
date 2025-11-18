import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { GeofenceService } from './geofence.service';
import { CreateGeofenceDTO, GeofenceDTO, UpdateGeofenceDTO } from './dtos';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

@Controller('geofences')
export class GeofenceController {
  public constructor(private readonly geofenceService: GeofenceService) {}

  @Post()
  @ApiOperation({ operationId: 'create' })
  @ApiOkResponse({ type: [GeofenceDTO] })
  public create(
    @Body() createGeofenceDto: CreateGeofenceDTO,
  ): Promise<GeofenceDTO> {
    return this.geofenceService.create(createGeofenceDto);
  }

  @Get()
  @ApiOperation({ operationId: 'list' })
  @ApiOkResponse({ type: [GeofenceDTO] })
  public findAll(): Promise<GeofenceDTO[]> {
    return this.geofenceService.findAll();
  }

  @Get(':id')
  @ApiOperation({ operationId: 'retrieve' })
  @ApiOkResponse({ type: GeofenceDTO })
  public findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<GeofenceDTO | null> {
    return this.geofenceService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ operationId: 'update' })
  @ApiOkResponse({ type: GeofenceDTO })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateGeofenceDto: UpdateGeofenceDTO,
  ): Promise<GeofenceDTO> {
    return this.geofenceService.update(id, updateGeofenceDto);
  }

  @Delete(':id')
  @ApiOperation({ operationId: 'delete' })
  @ApiOkResponse({ type: null })
  public delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.geofenceService.delete(id);
  }
}
