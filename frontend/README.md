# Frontend - React Retell Voice Call Interface

This is the React frontend application for the Retell Web Voice Call Demo. It provides a user-friendly interface for making voice calls with Retell AI agents through the browser.

## Features

- 📞 **One-Click Voice Calls**: Simple phone button interface
- 🎙️ **Real-time Audio**: WebRTC-based audio streaming with visual indicators
- 🤖 **Agent Selection**: Dropdown to choose from available Retell AI agents
- 🔊 **Audio Controls**: Mute/unmute and volume controls
- 📊 **Call Status**: Real-time call status updates
- 🎨 **Responsive Design**: Works on desktop and mobile devices
- ⚡ **Fast Loading**: Optimized React components with lazy loading

## Technology Stack

- **React 18**: Modern React with hooks and functional components
- **Retell Web SDK**: Official SDK for Retell AI web integration
- **Material-UI**: Modern React UI framework
- **Axios**: HTTP client for API requests
- **React Router**: Client-side routing
- **Web Audio API**: Browser audio handling

## Setup

### Prerequisites

- Node.js 16+ and npm/yarn
- Backend service running (see backend README)

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set environment variables:
```bash
# Create .env file in the frontend directory
echo "REACT_APP_BACKEND_URL=http://localhost:8000" > .env
```

### Running the Application

#### Development Mode
```bash
npm start
# or
yarn start
```

The application will be available at http://localhost:3000

#### Production Build
```bash
npm run build
# or
yarn build
```

#### Serve Production Build
```bash
npm install -g serve
serve -s build -p 3000
```

## Project Structure

```
frontend/
├── public/              # Static assets
│   ├── index.html      # Main HTML file
│   ├── favicon.ico     # App icon
│   └── manifest.json   # PWA manifest
├── src/                # Source code
│   ├── components/     # React components
│   │   ├── CallButton.js       # Main call button component
│   │   ├── AgentSelector.js    # Agent selection dropdown
│   │   ├── CallStatus.js       # Call status indicator
│   │   ├── AudioControls.js    # Audio control buttons
│   │   └── ErrorBoundary.js    # Error handling component
│   ├── services/       # API services
│   │   ├── api.js      # Backend API client
│   │   └── retell.js   # Retell Web SDK integration
│   ├── hooks/          # Custom React hooks
│   │   ├── useRetellCall.js    # Retell call management
│   │   └── useAgents.js        # Agent data fetching
│   ├── utils/          # Utility functions
│   │   ├── audio.js    # Audio helper functions
│   │   └── constants.js # App constants
│   ├── styles/         # CSS styles
│   │   ├── App.css     # Main app styles
│   │   └── components/ # Component-specific styles
│   ├── App.js          # Main app component
│   └── index.js        # App entry point
├── package.json        # Dependencies and scripts
├── Dockerfile         # Docker configuration
└── README.md          # This file
```

## Components

### CallButton
The main component that handles voice call initiation and termination.

**Props:**
- `selectedAgent`: The currently selected agent object
- `onCallStart`: Callback when call starts
- `onCallEnd`: Callback when call ends

### AgentSelector
Dropdown component for selecting available Retell AI agents.

**Props:**
- `agents`: Array of available agents
- `selectedAgent`: Currently selected agent
- `onAgentChange`: Callback when agent selection changes

### CallStatus
Component that displays the current call status with visual indicators.

**Props:**
- `status`: Current call status ('idle', 'connecting', 'connected', 'ended')
- `duration`: Call duration in seconds

### AudioControls
Component for controlling audio settings during calls.

**Props:**
- `isMuted`: Current mute status
- `volume`: Current volume level (0-100)
- `onMuteToggle`: Callback for mute toggle
- `onVolumeChange`: Callback for volume changes

## API Integration

### Backend API Service
```javascript
import api from './services/api';

// Get available agents
const agents = await api.getAgents();

// Create web call
const callData = await api.createWebCall(agentId);
```

### Retell Web SDK Integration
```javascript
import { RetellWebClient } from 'retell-client-js';

const retellClient = new RetellWebClient();

// Start call
await retellClient.startCall({
  accessToken: callData.access_token,
  sampleRate: callData.sample_rate,
  captureDeviceId: selectedMicrophone
});
```

## Environment Variables

- `REACT_APP_BACKEND_URL`: Backend API URL (default: http://localhost:8000)
- `REACT_APP_DEBUG`: Enable debug mode (default: false)

## Styling

The application uses a combination of:
- **Material-UI**: For consistent, modern UI components
- **CSS Modules**: For component-scoped styling
- **Responsive Design**: Mobile-first approach with breakpoints

### Theme Customization
Edit `src/theme.js` to customize the Material-UI theme:

```javascript
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});
```

## Error Handling

The app includes comprehensive error handling:

1. **Error Boundaries**: Catch React component errors
2. **API Error Handling**: Graceful handling of backend errors
3. **Audio Permission Errors**: User-friendly messages for microphone access
4. **Network Error Handling**: Offline detection and retry mechanisms

## Browser Compatibility

- **Chrome 70+**: Full support
- **Firefox 65+**: Full support
- **Safari 12+**: Full support (HTTPS required for microphone access)
- **Edge 79+**: Full support

**Note**: HTTPS is required in production for microphone access.

## Development

### Adding New Components

1. Create component file in `src/components/`
2. Add corresponding CSS module in `src/styles/components/`
3. Export from `src/components/index.js`
4. Import in parent components

### Running Tests

```bash
npm test
# or
yarn test
```

### Code Style

This project uses:
- **Prettier**: Code formatting
- **ESLint**: Code linting
- **Husky**: Git hooks for pre-commit checks

```bash
# Format code
npm run format

# Lint code
npm run lint

# Run all checks
npm run pre-commit
```

## Production Deployment

### Build Optimization
The production build includes:
- Code splitting for better loading performance
- Bundle size optimization
- Service worker for PWA functionality
- Static asset optimization

### Environment Setup
- Use HTTPS in production for microphone access
- Configure proper CORS settings on backend
- Set up CDN for static assets
- Enable gzip compression

### Deployment Commands
```bash
# Build for production
npm run build

# Test production build locally
npm run serve

# Deploy to static hosting (Netlify, Vercel, etc.)
npm run deploy
```

## Docker

### Build the image
```bash
docker build -t retell-frontend .
```

### Run the container
```bash
docker run -p 3000:3000 -e REACT_APP_BACKEND_URL=http://localhost:8000 retell-frontend
```

## Troubleshooting

### Common Issues

1. **Microphone not working**: 
   - Ensure HTTPS in production
   - Check browser permissions
   - Verify audio device availability

2. **API connection errors**:
   - Check backend service status
   - Verify CORS settings
   - Check network connectivity

3. **Build errors**:
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify all environment variables

### Debug Mode

Set `REACT_APP_DEBUG=true` for detailed console logging:

```bash
REACT_APP_DEBUG=true npm start
```

## Performance Tips

1. **Lazy Loading**: Components are lazy-loaded for better initial load times
2. **Memoization**: Use React.memo for expensive components
3. **Bundle Splitting**: Automatic code splitting for better caching
4. **Audio Optimization**: Efficient audio stream handling
