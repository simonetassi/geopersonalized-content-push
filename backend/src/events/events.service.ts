import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEventDTO } from './dto/create-event.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import {
  Between,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { GeofenceService } from '@/geofences/geofence.service';
import { UsersService } from '@/users/users.service';
import { EventDTO, FindEventsDTO } from './dto';
import { EventsGateway } from './events.gateway';

@Injectable()
export class EventsService {
  public constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    private readonly geofenceService: GeofenceService,
    private readonly userService: UsersService,
    private readonly eventsGateway: EventsGateway,
  ) {}
  public async create(createEventDTO: CreateEventDTO): Promise<EventDTO> {
    const { userId, fenceId, ...eventData } = createEventDTO;

    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const fence = await this.geofenceService.findOne(fenceId);
    if (!fence) {
      throw new NotFoundException(`Geofence with ID ${fenceId} not found`);
    }

    const savedEvent = await this.eventRepository.save({
      ...eventData,
      user,
      fence,
    });

    this.eventsGateway.broadcastNewEvent(savedEvent);

    return savedEvent;
  }

  public async findAll(query: FindEventsDTO) {
    const { userId, fenceId, type, from, to } = query;

    const where: FindOptionsWhere<Event> = {};

    if (userId) where.user = { id: userId };
    if (fenceId) where.fence = { id: fenceId };
    if (type) where.type = type;

    if (from && to) where.timestamp = Between(new Date(from), new Date(to));
    else if (from) where.timestamp = MoreThanOrEqual(new Date(from));
    else if (to) where.timestamp = LessThanOrEqual(new Date(to));

    return await this.eventRepository.find({
      where,
      relations: ['user', 'fence'],
      order: {
        timestamp: 'DESC',
      },
    });
  }
}
