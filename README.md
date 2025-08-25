# AI Workout Timer (Mobile)

A React Native mobile app that converts workout descriptions into intelligent interval timers with voice cues, built with Expo.

## Features

- **AI-Powered**: Convert natural language workout descriptions to structured timers
- **Voice Cues**: Text-to-speech announcements for each interval
- **Vibration**: Haptic feedback for transitions
- **Multiple Formats**: Supports EMOM, Intervals, Circuits, and Tabata
- **Keep Awake**: Screen stays on during workouts
- **Mobile-First**: Built for mobile with touch-friendly controls

## Tech Stack

- **Frontend**: React Native + Expo + TypeScript
- **Routing**: expo-router (file-based routing)
- **State**: Zustand
- **Validation**: Zod schemas
- **Audio**: expo-speech (TTS)
- **Native**: expo-keep-awake, expo-av
- **Backend**: Node.js + Fastify + OpenAI (hosted on Railway)

## Quick Start

### Prerequisites

- Node.js 18+
- Expo CLI
- iOS Simulator or Android Emulator (or Expo Go app)

### Installation

1. Clone the repository:
```bash
git clone <your-repo>
cd ai-timer-mobile
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env file (copy from .env.example)
cp .env.example .env

# Edit .env with your Railway API URL
API_BASE_URL=https://your-railway-app.up.railway.app
```

4. Start the development server:
```bash
npm start
```

5. Run on device/simulator:
```bash
# iOS
npm run ios

# Android  
npm run android

# Or scan QR code with Expo Go app
```

## App Structure

```
app/
├── _layout.tsx          # Root layout with navigation
├── index.tsx            # Input screen (describe workout)
├── preview.tsx          # Preview workout before starting
└── run.tsx              # Timer runner screen

components/
├── Field.tsx            # Reusable UI components
└── TimerRunner.tsx      # Main timer component

lib/
├── types.ts             # TypeScript types & Zod schemas
├── timeline.ts          # Timeline generation logic
├── api.ts               # API client
└── supabase.ts          # Database client (optional)

store/
└── useTimerStore.ts     # Zustand state management
```

## Usage

1. **Describe Workout**: Enter a workout description like "20-min EMOM. Odd: 12 burpees. Even: 45s plank."

2. **Preview**: Review the generated workout structure and timing

3. **Run**: Start the timer with voice cues and vibration feedback

4. **Control**: Pause, resume, or navigate between intervals

## Supported Workout Types

### EMOM (Every Minute On the Minute)
- Fixed 1-minute intervals
- Support for odd/even minute variations
- Example: "20-min EMOM. Odd: 12 burpees. Even: 45s plank."

### Intervals
- Work/rest cycles
- Configurable work and rest durations
- Example: "10 rounds: 30s work, 15s rest"

### Circuits
- Multiple exercises per round
- Configurable rest between exercises and rounds
- Example: "3 rounds: 10 pushups, 20 squats, 30s rest between exercises"

### Tabata
- High-intensity interval training
- Configurable work/rest ratios
- Example: "8 rounds: 20s work, 10s rest"

## Backend Setup

The app requires a backend API that converts workout descriptions to JSON. See the `ai-timer-api` directory for setup instructions.

### Railway Deployment

1. Create Railway account
2. Connect GitHub repository
3. Set environment variable: `OPENAI_API_KEY`
4. Deploy (automatically exposes port 8080)
5. Copy the public URL to your app's `.env` file

## Building for Production

### EAS Build (No Xcode/Android Studio needed)

1. Install EAS CLI:
```bash
npm install -g @expo/eas-cli
```

2. Login to Expo:
```bash
eas login
```

3. Configure build:
```bash
eas build:configure
```

4. Build for platforms:
```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

5. Submit to stores (optional):
```bash
eas submit --platform ios
eas submit --platform android
```

## Environment Variables

Create a `.env` file in the root directory:

```env
API_BASE_URL=https://your-railway-app.up.railway.app
SUPABASE_URL=your_supabase_url  # Optional
SUPABASE_ANON_KEY=your_supabase_key  # Optional
```

## Development

### Running Locally

```bash
# Start development server
npm start

# Run on specific platform
npm run ios
npm run android
npm run web
```

### Testing

- Use Expo Go app on your device for real-world testing
- Test voice cues and vibration on physical device
- Verify timer accuracy and transitions

## Troubleshooting

### Common Issues

1. **Voice not working**: Ensure device volume is on and TTS is enabled
2. **Timer not advancing**: Check that screen stays awake (keep-awake is enabled)
3. **API errors**: Verify Railway backend is running and URL is correct

### Debug Mode

Enable debug logging in the app for troubleshooting timer and API issues.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on device
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Check the troubleshooting section
- Review Expo documentation
- Open an issue on GitHub
