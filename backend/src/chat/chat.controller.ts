import { Body, Controller, ForbiddenException, Get, Param, Post, Req, UseGuards } from '@nestjs/common';

import { AuthenticatedRequest, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChatService } from './chat.service';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  @Get('rooms')
  rooms(@Req() request: AuthenticatedRequest) {
    if (!request.user.testMode) throw new ForbiddenException('Rooms list is available only for test/admin mode');
    return this.chat.rooms();
  }

  @Get('rooms/:roomId/messages')
  list(@Param('roomId') roomId: string, @Req() request: AuthenticatedRequest) {
    this.assertOwnRoom(roomId, request);
    return this.chat.list(roomId);
  }

  @Post('messages')
  create(
    @Req() request: AuthenticatedRequest,
    @Body()
    body: {
      roomId: string;
      text?: string;
      mediaUrl?: string;
      mediaType?: 'photo' | 'video';
    },
  ) {
    const roomId = body.roomId || this.roomIdForPhone(request.user.phone);
    this.assertOwnRoom(roomId, request);
    return this.chat.create({
      roomId,
      senderId: request.user.phone,
      senderName: `${request.user.firstName ?? ''} ${request.user.lastName ?? ''}`.trim() || 'Клиент',
      senderPhone: request.user.phone,
      senderRole: 'client',
      text: body.text,
      mediaUrl: body.mediaUrl,
      mediaType: body.mediaType,
    });
  }

  private assertOwnRoom(roomId: string, request: AuthenticatedRequest) {
    if (request.user.testMode) return;
    if (roomId !== this.roomIdForPhone(request.user.phone)) throw new ForbiddenException('Room does not belong to authenticated user');
  }

  private roomIdForPhone(phone: string) {
    return `client-${phone.replace(/[^0-9]+/g, '')}`;
  }
}
