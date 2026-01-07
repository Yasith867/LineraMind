# LineraMind Deployment Guide (Netlify)

This document outlines the steps to host the LineraMind frontend on Netlify and connect it to your backend services.

## Prerequisites
- A Netlify account.
- The project's environment variables configured.

## Configuration

### Environment Variables
You will need to set the following environment variables in your Netlify dashboard under **Site settings > Build & deploy > Environment > Environment variables**:

- `VITE_API_URL`: The URL of your backend server (e.g., your Replit deployment URL).
- `AI_INTEGRATIONS_OPENAI_API_KEY`: (If you plan to run serverless functions on Netlify).
- `AI_INTEGRATIONS_OPENAI_BASE_URL`: (If you plan to run serverless functions on Netlify).

### Build Settings
- **Build command**: `cd LineraMind && npm install && npm run build`
- **Publish directory**: `LineraMind/dist/public`

## Deployment Steps
1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket).
2. Connect your repository to Netlify.
3. Configure the build settings as described above.
4. Deploy the site.

## Notes
- Ensure your backend server's CORS settings allow requests from your Netlify domain.
- The backend remains hosted on Replit, while the frontend is served by Netlify.
