# Retell Web Call Demo - Frontend

This is the React frontend application for the Retell Web Call Demo. It provides a user-friendly interface to interact with Retell AI agents and make voice calls through the web.

## Features

- **Agent Selection**: Browse and select from available Retell AI agents
- **Voice Calling**: Initiate web calls directly in the browser
- **Real-time Status**: Monitor API connection and call status
- **Responsive Design**: Works on desktop and mobile devices
- **Error Handling**: Comprehensive error messaging and recovery
- **Modern UI**: Clean, intuitive interface with smooth animations

## Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- Backend API running (see `/backend` directory)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the frontend directory (optional):

```env
REACT_APP_API_URL=http://localhost:8000
```

If not specified, the app will default to `http://localhost:8000` for the backend API.

### 3. Development Server

Start the development server:

```bash
npm start
```

The application will open in your browser at `http://localhost:3000`.

### 4. Production Build

Build the application for production:

```bash
npm run build
```

The built files will be in the `build/` directory.

## Available Scripts

- `npm start`: Start development server
- `npm run build`: Build for production
- `npm test`: Run test suite
- `npm run eject`: Eject from Create React App (not recommended)

## Application Structure

```
frontend/
├── public/
│   ├── index.html          # HTML template
│   └── favicon.ico         # App icon
├── src/
│   ├── App.js              # Main application component
│   ├── App.css             # Application styles
│   ├── index.js            # React entry point
│   ├── index.css           # Global styles
│   └── reportWebVitals.js  # Performance monitoring
├── package.json            # Dependencies and scripts
├── Dockerfile             # Docker configuration
├── nginx.conf             # Nginx configuration for production
└── README.md              # This file
```

## Component Overview

### App.js
The main application component that handles:

- **API Health Monitoring**: Checks backend connectivity
- **Agent Management**: Fetches and displays available agents
- **Call Management**: Creates and manages web calls
- **Error Handling**: Displays errors and retry mechanisms
- **UI State**: Manages loading, selection, and call states

### Key Features

1. **Agent Selection Interface**
   - Grid layout showing agent cards
   - Agent details (ID, name, voice, language)
   - Visual selection feedback

2. **Call Interface**
   - Embedded Retell call widget in iframe
   - Call controls and information
   - Instructions for users

3. **Status Monitoring**
   - Real-time API health check
   - Connection status indicators
   - Retry mechanisms

## API Integration

The frontend communicates with the backend through these endpoints:

- `GET /health`: Check API status
- `GET /agents`: Fetch available agents
- `POST /web-call`: Create new web call

## Styling

The application uses custom CSS with:

- **Responsive Design**: Mobile-first approach
- **Modern UI**: Gradient backgrounds and smooth animations
- **Accessibility**: Clear visual feedback and readable fonts
- **Brand Colors**: Purple gradient theme

## Docker Deployment

### Build Docker Image

```bash
docker build -t retell-frontend .
```

### Run with Docker

```bash
docker run -d \
  --name retell-frontend \
  -p 3000:80 \
  retell-frontend
```

### Environment Variables for Docker

- `REACT_APP_API_URL`: Backend API URL (set at build time)

**Note**: React environment variables must be set at build time, not runtime.

### Production Deployment

The Docker image uses a multi-stage build:

1. **Build Stage**: Uses Node.js to build the React app
2. **Production Stage**: Uses Nginx to serve static files

## Browser Compatibility

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Microphone Permissions

The application requires microphone access for voice calls:

- Users will be prompted to allow microphone access
- Ensure HTTPS in production for microphone permissions
- The call widget handles all audio processing

## Security Considerations

- CORS is handled by the backend
- CSP headers configured in Nginx
- No sensitive data stored in frontend
- All API calls go through the backend proxy

## Troubleshooting

### Common Issues

1. **"API Unavailable" Error**
   - Ensure backend is running on port 8000
   - Check backend health endpoint: `http://localhost:8000/health`
   - Verify CORS configuration

2. **"No Agents Found"**
   - Verify Retell API key is configured in backend
   - Check that agents exist in your Retell account
   - Review backend logs for API errors

3. **Call Widget Not Loading**
   - Ensure iframe can load Retell widget domain
   - Check browser console for errors
   - Verify call creation was successful

4. **Microphone Issues**
   - Ensure HTTPS in production
   - Check browser permissions
   - Verify microphone is not blocked

### Development Tips

1. **API Debugging**
   - Open browser dev tools Network tab
   - Check API request/response details
   - Verify correct endpoint URLs

2. **State Debugging**
   - Add console.log statements in event handlers
   - Use React Developer Tools browser extension
   - Monitor component state changes

3. **Styling Issues**
   - Use browser inspector to debug CSS
   - Check responsive breakpoints
   - Verify CSS class names

## Performance Optimization

- Static assets are cached for 1 year
- Gzip compression enabled
- React build optimizations applied
- Lazy loading for large components (if added)

## Customization

### Changing Colors
Edit the CSS custom properties in `App.css`:

```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --error-color: #f44336;
  --success-color: #4caf50;
}
```

### Adding Features
1. Create new components in `src/components/`
2. Update `App.js` to include new functionality
3. Add corresponding styles to `App.css`
4. Update this README with new features

## Contributing

1. Follow React best practices
2. Maintain consistent code style
3. Add comments for complex logic
4. Update documentation for new features
5. Test on multiple browsers

## Support

For issues related to:
- **Retell API**: Check [Retell Documentation](https://docs.retell.ai/)
- **React**: Check [React Documentation](https://reactjs.org/docs/)
- **Application**: Review console logs and check backend connectivity