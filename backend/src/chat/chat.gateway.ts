import { ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { ChatService } from './chat.service';

@WebSocketGateway({ cors: true, namespace: 'chat' })
export class ChatGateway {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly chat: ChatService,
    private readonly config: ConfigService,
  ) {}

  @SubscribeMessage('join')
  async join(@ConnectedSocket() socket: Socket, @MessageBody() body: { roomId: string }) {
    this.assertGatewayEnabled();
    socket.join(body.roomId);
    return this.chat.list(body.roomId);
  }

  @SubscribeMessage('message')
  async send(
    @MessageBody()
    body: {
      roomId: string;
      senderId: string;
      senderName?: string;
      senderPhone?: string;
      senderRole?: 'client' | 'doctor' | 'admin' | 'system';
      text?: string;
      mediaUrl?: string;
      mediaType?: 'photo' | 'video';
    },
  ) {
    this.assertGatewayEnabled();
    const message = await this.chat.create(body);
    this.server.to(body.roomId).emit('message', message);
    return message;
  }

  private assertGatewayEnabled() {
    const enabled = (this.config.get<string>('CHAT_WEBSOCKET_ENABLE') ?? 'false').toLowerCase() === 'true';
    if (!enabled) {
      throw new ForbiddenException('Realtime chat socket is disabled. The mobile app uses authenticated HTTP chat endpoints.');
    }
  }
}
