import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { EventDTO } from './dto';
@WebSocketGateway({
  cors: { origin: '*' },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  public server: Server;

  public handleConnection(client: Socket): void {
    console.log(`Client connected: ${client.id}`);
  }

  public handleDisconnect(client: Socket): void {
    console.log(`Client disconnected: ${client.id}`);
  }

  public broadcastNewEvent(payload: EventDTO): void {
    this.server.emit('onNewEvent', payload);
  }
}
