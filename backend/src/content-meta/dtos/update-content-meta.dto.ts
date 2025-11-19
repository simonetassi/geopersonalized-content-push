import { PartialType } from '@nestjs/swagger';
import { CreateContentMetaDTO } from './create-content-meta.dto';

export class UpdateContentMetaDTO extends PartialType(CreateContentMetaDTO) {}
