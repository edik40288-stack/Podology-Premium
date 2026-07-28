import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { createHash, createHmac } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { copyFile, mkdir, readFile, stat, unlink, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

@Injectable()
export class MediaService {
  constructor(private readonly config: ConfigService) {}


  async assertAllowedMediaFile(file: Express.Multer.File) {
    const mimeType = this.resolveMimeType(file.mimetype, file.originalname || file.filename || '');
    if (!mimeType.startsWith('image/') && !mimeType.startsWith('video/')) {
      throw new Error('Only image and video files are allowed');
    }
    const head = file.buffer ? file.buffer.subarray(0, 16) : (file.path ? (await readFile(file.path)).subarray(0, 16) : Buffer.alloc(0));
    if (!this.matchesMagicBytes(mimeType, head)) {
      throw new Error('File content does not match declared media type');
    }
  }

  private matchesMagicBytes(mimeType: string, head: Buffer) {
    if (head.length < 4) return false;
    const hex = head.toString('hex');
    if (mimeType === 'image/jpeg') return hex.startsWith('ffd8ff');
    if (mimeType === 'image/png') return hex.startsWith('89504e47');
    if (mimeType === 'image/webp') return head.slice(0, 4).toString('ascii') === 'RIFF' && head.slice(8, 12).toString('ascii') === 'WEBP';
    if (mimeType === 'image/gif') return head.slice(0, 3).toString('ascii') === 'GIF';
    if (mimeType === 'video/mp4' || mimeType === 'video/quicktime') {
      return head.includes(Buffer.from('ftyp'));
    }
    return false;
  }

  async saveChatFile(file: Express.Multer.File) {
    const mimeType = this.resolveMimeType(file.mimetype, file.originalname || file.filename || '');
    if (file.path) {
      return this.saveUploadedPathFile({ area: 'chat', originalName: file.originalname || file.filename, path: file.path, mimeType, size: file.size });
    }
    return this.saveBufferFile({ area: 'chat', originalName: file.originalname, buffer: file.buffer, mimeType, size: file.size });
  }

  async saveChatBufferFile(input: { originalName: string; buffer: Buffer; mimeType: string; size?: number }) {
    return this.saveBufferFile({ area: 'chat', ...input });
  }

  async saveContentFile(input: { originalName: string; buffer: Buffer; mimeType: string; size?: number }) {
    return this.saveBufferFile({ area: 'content', ...input });
  }

  async readChatFile(filename: string) {
    return this.readFileFromArea('chat', filename);
  }

  async readContentFile(filename: string) {
    return this.readFileFromArea('content', filename);
  }

  resolveMimeType(mimeType: string | undefined, filename: string) {
    const detected = this.detectMimeType(filename);
    const clean = (mimeType || '').toLowerCase();
    if (!clean || clean === 'application/octet-stream' || clean === 'binary/octet-stream') return detected;
    return clean;
  }

  private async saveUploadedPathFile(input: { area: 'chat' | 'content'; originalName: string; path: string; mimeType: string; size?: number }) {
    const safeName = `${Date.now()}-${input.originalName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const key = `${input.area}/${safeName}`;

    if (this.storageDriver === 's3') {
      const body = await import('node:fs/promises').then((fs) => fs.readFile(input.path));
      await this.putS3Object(key, body, input.mimeType);
      await unlink(input.path).catch(() => undefined);
      return {
        url: `${this.s3PublicBaseUrl.replace(/\/$/, '')}/${key}`,
        mimeType: input.mimeType,
        size: input.size ?? body.byteLength,
        mediaType: input.mimeType.startsWith('video/') ? 'video' : 'photo',
        storage: 's3',
      };
    }

    const dir = this.storageDir(input.area);
    await mkdir(dir, { recursive: true });
    const targetPath = join(dir, safeName);
    await copyFile(input.path, targetPath);
    await unlink(input.path).catch(() => undefined);
    return {
      url: `/media/public/${input.area}/${safeName}`,
      mimeType: input.mimeType,
      size: input.size ?? 0,
      mediaType: input.mimeType.startsWith('video/') ? 'video' : 'photo',
      storage: this.storageDriver === 'telegram' ? 'telegram-cache' : 'local',
      telegramPrimary: this.storageDriver === 'telegram',
    };
  }

  private async saveBufferFile(input: { area: 'chat' | 'content'; originalName: string; buffer: Buffer; mimeType: string; size?: number }) {
    const safeName = `${Date.now()}-${input.originalName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const key = `${input.area}/${safeName}`;

    if (this.storageDriver === 's3') {
      await this.putS3Object(key, input.buffer, input.mimeType);
      return {
        url: `${this.s3PublicBaseUrl.replace(/\/$/, '')}/${key}`,
        mimeType: input.mimeType,
        size: input.size ?? input.buffer.byteLength,
        mediaType: input.mimeType.startsWith('video/') ? 'video' : 'photo',
        storage: 's3',
      };
    }

    const dir = this.storageDir(input.area);
    await mkdir(dir, { recursive: true });
    const path = join(dir, safeName);
    await writeFile(path, input.buffer);
    return {
      url: `/media/public/${input.area}/${safeName}`,
      mimeType: input.mimeType,
      size: input.size ?? input.buffer.byteLength,
      mediaType: input.mimeType.startsWith('video/') ? 'video' : 'photo',
      storage: this.storageDriver === 'telegram' ? 'telegram-cache' : 'local',
      telegramPrimary: this.storageDriver === 'telegram',
    };
  }

  private async readFileFromArea(area: 'chat' | 'content', filename: string) {
    if (this.storageDriver === 's3') return null;
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = join(this.storageDir(area), safeName);

    try {
      await stat(path);
    } catch {
      return null;
    }

    return {
      stream: createReadStream(path),
      mimeType: this.detectMimeType(path),
    };
  }

  private get storageDriver() {
    return (this.config.get<string>('FILE_STORAGE_DRIVER') ?? 'local').toLowerCase();
  }

  private storageDir(area: 'chat' | 'content') {
    return join(process.cwd(), 'storage', area);
  }

  private detectMimeType(path: string) {
    const ext = extname(path).toLowerCase();
    if (['.jpg', '.jpeg'].includes(ext)) return 'image/jpeg';
    if (ext === '.png') return 'image/png';
    if (ext === '.webp') return 'image/webp';
    if (ext === '.gif') return 'image/gif';
    if (ext === '.mp4') return 'video/mp4';
    if (ext === '.mov') return 'video/quicktime';
    return 'application/octet-stream';
  }

  private async putS3Object(key: string, body: Buffer, mimeType: string) {
    const endpoint = this.required('S3_ENDPOINT').replace(/\/$/, '');
    const bucket = this.required('S3_BUCKET');
    const region = this.config.get<string>('S3_REGION')?.trim() || 'ru-1';
    const accessKeyId = this.required('S3_ACCESS_KEY_ID');
    const secretAccessKey = this.required('S3_SECRET_ACCESS_KEY');
    const host = new URL(endpoint).host;
    const pathStyle = this.config.get<string>('S3_FORCE_PATH_STYLE', 'true') !== 'false';
    const canonicalUri = pathStyle ? `/${bucket}/${key}` : `/${key}`;
    const url = pathStyle ? `${endpoint}/${bucket}/${key}` : `${endpoint.replace('://', `://${bucket}.`)}/${key}`;
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.slice(0, 8);
    const payloadHash = this.sha256Hex(body);
    const canonicalHeaders = `host:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
    const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';
    const canonicalRequest = ['PUT', canonicalUri, '', canonicalHeaders, signedHeaders, payloadHash].join('\n');
    const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
    const stringToSign = ['AWS4-HMAC-SHA256', amzDate, credentialScope, this.sha256Hex(Buffer.from(canonicalRequest))].join('\n');
    const signingKey = this.getSignatureKey(secretAccessKey, dateStamp, region, 's3');
    const signature = createHmac('sha256', signingKey).update(stringToSign).digest('hex');
    const authorization = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    await axios.put(url, body, {
      timeout: 30_000,
      headers: {
        Authorization: authorization,
        'Content-Type': mimeType,
        'x-amz-content-sha256': payloadHash,
        'x-amz-date': amzDate,
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });
  }

  private get s3PublicBaseUrl() {
    return this.required('S3_PUBLIC_BASE_URL');
  }

  private required(name: string) {
    const value = this.config.get<string>(name)?.trim();
    if (!value || value.startsWith('put_') || value.includes('_here')) throw new Error(`${name} must be configured for FILE_STORAGE_DRIVER=s3`);
    return value;
  }

  private sha256Hex(value: Buffer) {
    return createHash('sha256').update(value).digest('hex');
  }

  private getSignatureKey(key: string, dateStamp: string, regionName: string, serviceName: string) {
    const kDate = createHmac('sha256', `AWS4${key}`).update(dateStamp).digest();
    const kRegion = createHmac('sha256', kDate).update(regionName).digest();
    const kService = createHmac('sha256', kRegion).update(serviceName).digest();
    return createHmac('sha256', kService).update('aws4_request').digest();
  }
}
