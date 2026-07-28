import { IsEmail, IsInt, IsOptional, IsString } from "class-validator";

export class CreateBookingDto {
  @IsString()
  fullname!: string;

  @IsString()
  phone!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsInt()
  serviceId!: number;

  @IsOptional()
  @IsString()
  serviceTitle?: string;

  @IsInt()
  staffId!: number;

  @IsOptional()
  @IsString()
  specialistName?: string;

  @IsString()
  datetime!: string;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsString()
  clientRequestId?: string;
}

export class CancelBookingDto {
  @IsString()
  reason!: string;
}

export class LateBookingDto {
  @IsOptional()
  @IsString()
  minutes?: string;

  @IsOptional()
  @IsString()
  message?: string;
}
