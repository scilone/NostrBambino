# NostrBambino

A Tinder-like baby naming Progressive Web App (PWA) for couples to find the perfect name together.

## Features

- 🔐 **Pairing**: Connect with your partner using a shared secret - no login required
- 👆 **Swiping**: Swipe right to like, left to pass on baby names
- 💕 **Matching**: When both partners like the same name, it appears in your matches
- 🔌 **Offline-First**: Works offline and syncs when back online
- 📡 **Nostr Integration**: Votes sync between partners via Nostr relays
- 📱 **PWA**: Install on your device and use like a native app

## Tech Stack

- **Vue 3**: Progressive JavaScript framework
- **Vite**: Fast build tool and dev server
- **Pinia**: State management
- **nostr-tools**: Decentralized sync via Nostr protocol
- **vite-plugin-pwa**: Progressive Web App support

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## How to Use

1. **Pairing**: Both partners open the app and enter the same shared secret (something only you two know)
2. **Swiping**: Browse through baby names and swipe right (❤️) to like or left (👎) to pass
3. **Matching**: When both partners like the same name, it appears in your "Matches" list
4. **Offline Mode**: The app works offline - your votes are saved locally and sync when you're back online

## Privacy & Security

- No account creation or login required
- No personal data stored on servers
- Shared secret creates a private connection between partners
- All votes synced via decentralized Nostr relays

## Development

The app uses:
- **localStorage** for offline data persistence
- **Nostr relays** for real-time sync between partners
- **Service Workers** for offline functionality
- **Responsive design** for mobile and desktop

## License

MIT
