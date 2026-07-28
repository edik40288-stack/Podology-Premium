import { BadRequestException, Controller, Get, NotFoundException, Param, Post, Res, StreamableFile, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { diskStorage } from 'multer';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MediaService } from './media.service';

const uploadTmpDir = join(process.cwd(), 'storage', 'upload-tmp');
mkdirSync(uploadTmpDir, { recursive: true });

@Controller('media')
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @Post('chat')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: uploadTmpDir,
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname || '').toLowerCase();
          cb(null, `${Date.now()}-${randomUUID()}${ext}`);
        },
      }),
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  async uploadChatMedia(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('file is required');
    const mimeType = this.media.resolveMimeType(file.mimetype, file.originalname || file.filename || '');
    try {
      await this.media.assertAllowedMediaFile({ ...file, mimetype: mimeType });
    } catch {
      throw new BadRequestException('Only valid image and video files are allowed');
    }
    return this.media.saveChatFile({ ...file, mimetype: mimeType });
  }

  @Get('public/chat/:filename')
  async publicChatMedia(@Param('filename') filename: string, @Res({ passthrough: true }) response: Response) {
    return this.streamFile(await this.media.readChatFile(filename), response);
  }

  @Get('public/content/:filename')
  async publicContentMedia(@Param('filename') filename: string, @Res({ passthrough: true }) response: Response) {
    return this.streamFile(await this.media.readContentFile(filename), response);
  }

  private streamFile(file: Awaited<ReturnType<MediaService['readChatFile']>>, response: Response) {
    if (!file) throw new NotFoundException('Media file not found');
    response.setHeader('Content-Type', file.mimeType);
    response.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return new StreamableFile(file.stream);
  }
}
