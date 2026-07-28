import {
  Controller,
  ForbiddenException,
  Get,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { AuthenticatedRequest, JwtAuthGuard } from "../auth/jwt-auth.guard";
import { TelegramService } from "./telegram.service";

@Controller("telegram")
export class TelegramController {
  constructor(
    private readonly telegram: TelegramService,
    private readonly config: ConfigService,
  ) {}

  @Get("status")
  status() {
    return {
      ok: true,
      adminBot: this.isSet(this.config.get<string>("TELEGRAM_ADMIN_BOT_TOKEN")),
      chatBot: this.isSet(this.config.get<string>("TELEGRAM_CHAT_BOT_TOKEN")),
      chatGroup: this.isSet(this.config.get<string>("TELEGRAM_CHAT_GROUP_ID")),
      topicsEnabled:
        this.config.get<string>("TELEGRAM_CHAT_TOPICS_ENABLED", "true") !==
        "false",
    };
  }

  @Post("test")
  @UseGuards(JwtAuthGuard)
  test(@Req() request: AuthenticatedRequest) {
    if (!request.user.testMode)
      throw new ForbiddenException(
        "Telegram test is available only in hidden test mode",
      );
    return this.telegram.sendTestMessage();
  }

  @Post("retry-undelivered")
  @UseGuards(JwtAuthGuard)
  retryUndelivered(@Req() request: AuthenticatedRequest) {
    if (!request.user.testMode)
      throw new ForbiddenException(
        "Telegram retry is available only in hidden test mode",
      );
    return this.telegram.retryUndeliveredClientMessages();
  }

  private isSet(value?: string) {
    const text = value?.trim() ?? "";
    if (!text) return false;
    if (text.startsWith("put_")) return false;
    if (text.includes("your-") || text.includes("your_")) return false;
    if (text.includes("_here")) return false;
    return true;
  }
}
