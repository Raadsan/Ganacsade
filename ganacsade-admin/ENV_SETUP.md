# Environment Configuration

Create a `.env.local` file in the root directory with the following variables:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# App Configuration
NEXT_PUBLIC_APP_NAME=GANACSADE Admin

# Optional: For production
# NEXT_PUBLIC_API_URL=https://your-production-api.com/api
```

## Required Environment Variables

- `NEXT_PUBLIC_API_URL`: Backend API base URL (default: http://localhost:3000/api)
- `NEXT_PUBLIC_APP_NAME`: Application name displayed in the dashboard

## Setup Instructions

1. Copy the content above to `.env.local`
2. Update the API URL to match your backend server
3. Restart the development server after making changes
