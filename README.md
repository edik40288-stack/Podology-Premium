# Podology Premium

**Podology Premium** is a complete mobile booking and client management system designed for the "PODOLOG KUTSYTOI" podology center. The platform consists of a Flutter-based mobile application (iOS and Android) and a robust NestJS backend, seamlessly integrated with the YCLIENTS CRM and Telegram for real-time communication.

## Features

- **Mobile Client App**: Native iOS and Android applications built with Flutter, offering a premium user experience for clients.
- **YCLIENTS CRM Integration**: Full synchronization with YCLIENTS for services, specialists, schedules, and booking creation.
- **Real-time Chat**: WebSocket-powered chat between clients and clinic staff, bridged with Telegram for administrative support.
- **Booking Flow**: Comprehensive booking system allowing clients to select services, specialists, dates, and times.
- **Care Card**: Digital care cards for patients to track post-procedure instructions.
- **Dual Mode Operation**: Supports a local development mode (using real YCLIENTS/Telegram APIs but local authentication) and a full production mode for public release.
- **Content Management**: Dynamic home screen content management via the backend.

## Architecture

The system follows a thin-backend proxy architecture, where the backend acts as a secure middleware between the mobile clients and external services (YCLIENTS, Telegram).

| Component | Technology Stack | Description |
| :--- | :--- | :--- |
| **Mobile App** | Flutter (Dart) | Cross-platform client application handling UI, navigation, and local state. |
| **Backend API** | Node.js, NestJS (TypeScript) | RESTful API and WebSocket server managing authentication, YCLIENTS proxying, and chat logic. |
| **Database** | PostgreSQL (Production) | Stores user profiles, chat history indexes, and technical booking data. |
| **CRM** | YCLIENTS | The system of record for services, staff, and actual booking records. |
| **Communication** | Telegram Bot API | Used for chat bridging and administrative notifications. |

## Installation & Setup

### Prerequisites
- **Node.js 24+** (for the backend)
- **Flutter SDK 3.4.0+** (for the mobile app)
- **PostgreSQL 16** (for production) or SQLite (for development)
- **YCLIENTS API Credentials**
- **Telegram Bot Tokens**

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables by copying the appropriate example file:
   ```bash
   cp ../.env.example ../.env
   # or for local development with real integrations:
   cp ../.env.laptop-real.example ../.env
   ```
4. Start the server:
   ```bash
   npm run start:dev
   ```

### Mobile App Setup
1. Navigate to the mobile directory:
   ```bash
   cd mobile_flutter
   ```
2. Install Flutter dependencies:
   ```bash
   flutter pub get
   ```
3. Run the application:
   ```bash
   flutter run
   ```

### Production Deployment
For production deployment, the project includes Docker Compose configurations.
1. Review `.env.production.example` and configure all required variables.
2. Run the production check script:
   ```powershell
   powershell -NoProfile -ExecutionPolicy Bypass -File ./scripts/CHECK_PRODUCTION_READY.ps1
   ```
3. Start the services:
   ```bash
   docker-compose -f docker-compose.production.yml up -d
   ```

## Tech Stack
- **Mobile**: Flutter, Dart
- **Backend**: Node.js, NestJS, TypeScript, Socket.IO
- **Database**: PostgreSQL
- **Infrastructure**: Docker, Docker Compose

## License
This project is licensed under the MIT License.
