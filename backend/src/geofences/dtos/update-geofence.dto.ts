import { PartialType } from '@nestjs/swagger';
import { CreateGeofenceDTO } from './create-geofence.dto';

export class UpdateGeofenceDTO extends PartialType(CreateGeofenceDTO) {}
