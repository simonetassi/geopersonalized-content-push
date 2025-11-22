import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ContentMetaService } from './content-meta.service';
import {
  ContentMetaDTO,
  CreateContentMetaDTO,
  FindByCoordsDTO,
  UpdateContentMetaDTO,
} from './dtos';

@Controller('content-meta')
export class ContentMetaController {
  public constructor(private readonly contentMetaService: ContentMetaService) {}

  @Post()
  @ApiOperation({ operationId: 'create' })
  @ApiOkResponse({ type: [ContentMetaDTO] })
  public create(
    @Body() createContentMetaDto: CreateContentMetaDTO,
  ): Promise<ContentMetaDTO> {
    return this.contentMetaService.create(createContentMetaDto);
  }

  @Get()
  @ApiOperation({ operationId: 'list' })
  @ApiOkResponse({ type: [ContentMetaDTO] })
  public findAll(): Promise<ContentMetaDTO[]> {
    return this.contentMetaService.findAll();
  }

  @Get('by-coords')
  @ApiOperation({ operationId: 'by-coords' })
  @ApiOkResponse({ type: [ContentMetaDTO] })
  public findByCoords(
    @Query() coords: FindByCoordsDTO,
  ): Promise<ContentMetaDTO[]> {
    return this.contentMetaService.findByCoords(coords.lat, coords.lon);
  }

  @Get(':id')
  @ApiOperation({ operationId: 'retrieve' })
  @ApiOkResponse({ type: ContentMetaDTO })
  public findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ContentMetaDTO | null> {
    return this.contentMetaService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ operationId: 'update' })
  @ApiOkResponse({ type: ContentMetaDTO })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateContentMetaDTO: UpdateContentMetaDTO,
  ): Promise<ContentMetaDTO> {
    return this.contentMetaService.update(id, updateContentMetaDTO);
  }

  @Delete(':id')
  @ApiOperation({ operationId: 'delete' })
  @ApiOkResponse({ type: null })
  public delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.contentMetaService.delete(id);
  }
}
