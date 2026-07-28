# Google Play Data safety draft

Использовать как черновик. Финально сверить с реальным production backend и privacy policy.

## Collects data

Да.

## Data types

Personal info:
- Name
- Phone number

Photos and videos:
- User-provided photos
- User-provided videos

Messages:
- In-app messages / chat content

App activity:
- App interactions related to appointments and chat

## Purpose

- App functionality
- Account management
- Customer support / communication with center
- Appointment booking and management

## Sharing

Data is transferred to service providers needed for app functionality:
- YCLIENTS / Altegio for booking operations;
- SMS provider for phone verification;
- Telegram bot/channel used by the center as operational communication archive.

No sale of user data. No advertising SDK. No cross-app tracking.

## Security

Data is transmitted over HTTPS in production. User authentication is token-based.

## Deletion

Account deletion is available in-app from Profile → Delete account and data.
