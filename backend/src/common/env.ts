import { ConfigService } from '@nestjs/config';

export function isProductionEnv(config: ConfigService) {
  return (config.get<string>('APP_ENV') ?? 'local').toLowerCase() === 'production';
}

export function requireProductionEnv(config: ConfigService) {
  if (!isProductionEnv(config)) return;

  const operatingModel = (config.get<string>('APP_OPERATING_MODEL') ?? 'full').toLowerCase();
  const thinBackendMode = operatingModel === 'thin_proxy' || operatingModel === 'yclients_telegram_thin';
  const fileStorageDriver = (config.get<string>('FILE_STORAGE_DRIVER') ?? 'local').toLowerCase();
  const storageDriver = (config.get<string>('STORAGE_DRIVER') ?? 'json').toLowerCase();

  const required = [
    'API_BASE_URL',
    'APP_PUBLIC_BASE_URL',
    'APP_JWT_SECRET',
    'SMS_RU_API_ID',
    'CONTENT_ADMIN_TOKEN',
    'YCLIENTS_PARTNER_TOKEN',
    'YCLIENTS_USER_TOKEN',
    'YCLIENTS_COMPANY_ID',
    'YCLIENTS_FORM_ID',
    'TELEGRAM_CHAT_BOT_TOKEN',
    'TELEGRAM_CHAT_GROUP_ID',
    'PRIVACY_POLICY_URL',
    'TERMS_URL',
    'ACCOUNT_DELETION_URL',
    'SUPPORT_EMAIL',
  ];
  const missing = required.filter((name) => !isReal(config.get<string>(name)));
  if (missing.length > 0) throw new Error(`Production env is incomplete: ${missing.join(', ')}`);

  const secret = config.get<string>('APP_JWT_SECRET')?.trim() ?? '';
  if (secret.length < 32) throw new Error('APP_JWT_SECRET must be at least 32 characters');
  if ((config.get<string>('AUTH_MODE') ?? '').toLowerCase() !== 'sms_ru') throw new Error('AUTH_MODE must be sms_ru in production');

  if (storageDriver !== 'postgres') throw new Error('STORAGE_DRIVER must be postgres in production');
  if (!isReal(config.get<string>('DATABASE_URL'))) throw new Error('STORAGE_DRIVER=postgres requires DATABASE_URL');

  if (!thinBackendMode && fileStorageDriver !== 's3') throw new Error('FILE_STORAGE_DRIVER must be s3 in full production mode');
  if (fileStorageDriver === 's3') {
    for (const name of ['S3_ENDPOINT', 'S3_BUCKET', 'S3_ACCESS_KEY_ID', 'S3_SECRET_ACCESS_KEY', 'S3_PUBLIC_BASE_URL']) {
      if (!isReal(config.get<string>(name))) throw new Error(`Production S3 env is incomplete: ${name}`);
    }
  }
  if (thinBackendMode && !['telegram', 's3'].includes(fileStorageDriver)) {
    throw new Error('FILE_STORAGE_DRIVER must be telegram or s3 in thin backend production mode');
  }

  const apiBaseUrl = config.get<string>('API_BASE_URL')?.trim() ?? '';
  const publicBaseUrl = config.get<string>('APP_PUBLIC_BASE_URL')?.trim() ?? '';
  for (const [name, value] of [
    ['API_BASE_URL', apiBaseUrl],
    ['APP_PUBLIC_BASE_URL', publicBaseUrl],
  ] as const) {
    if (!value.startsWith('https://')) throw new Error(`${name} must use HTTPS in production`);
    if (value.includes('localhost') || value.includes('127.0.0.1')) throw new Error(`${name} cannot be localhost in production`);
  }


  const corsOrigin = config.get<string>('CORS_ORIGIN')?.trim() ?? '';
  if (!isReal(corsOrigin) || corsOrigin === '*' || corsOrigin.includes('localhost') || corsOrigin.includes('127.0.0.1')) {
    throw new Error('CORS_ORIGIN must be a real HTTPS origin in production');
  }
  if (!corsOrigin.startsWith('https://')) throw new Error('CORS_ORIGIN must use HTTPS in production');

  const testModeEnabled = (config.get<string>('TEST_MODE_ENABLED') ?? 'false').toLowerCase() === 'true';
  if (testModeEnabled) {
    for (const name of ['TEST_MODE_FIRST_NAME', 'TEST_MODE_LAST_NAME', 'TEST_MODE_PHONE']) {
      if (!isReal(config.get<string>(name))) throw new Error(`TEST_MODE_ENABLED=true requires ${name}`);
    }
  }

  const retryEndpointEnabled = (config.get<string>('TELEGRAM_RETRY_UNDELIVERED_ENABLED') ?? 'false').toLowerCase() === 'true';
  if (retryEndpointEnabled && !testModeEnabled) {
    throw new Error('TELEGRAM_RETRY_UNDELIVERED_ENABLED=true requires TEST_MODE_ENABLED=true for review/admin safety');
  }
}

export function isReal(value?: string) {
  const text = value?.trim() ?? '';
  return Boolean(text) && !text.startsWith('put_') && !text.startsWith('CHANGE_') && !text.startsWith('change_') && !text.includes('_here') && !text.includes('your-') && !text.includes('your_') && !text.includes('example.com');
}
