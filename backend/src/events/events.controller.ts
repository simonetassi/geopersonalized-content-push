import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDTO, EventDTO, FindEventsDTO } from './dto';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiOperation({ operationId: 'create' })
  @ApiOkResponse({ type: [EventDTO] })
  public create(@Body() createEventDTO: CreateEventDTO): Promise<EventDTO> {
    return this.eventsService.create(createEventDTO);
  }

  @Get()
  @ApiOperation({ operationId: 'list' })
  @ApiOkResponse({ type: [EventDTO] })
  findAll(@Query() query: FindEventsDTO) {
    return this.eventsService.findAll(query);
  }
}
