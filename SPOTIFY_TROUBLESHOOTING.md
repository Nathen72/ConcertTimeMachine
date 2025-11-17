# Spotify 400 Error Troubleshooting Guide

## The Problem
You're seeing a `400 (Bad Request)` error when trying to connect to Spotify.

## Step-by-Step Fix

### 1. Check Browser Console
When you click "Connect Spotify", open the browser console (F12 or Cmd+Option+I) and look for the debug logs. You should see:
- Client ID
- Redirect URI (exact value)
- Full authorization URL

### 2. Verify Redirect URI in Spotify Dashboard

1. Go to https://developer.spotify.com/dashboard
2. Click on your app (Client ID: `0dc2537dffbf48ee94a5eaa72dd36c50`)
3. Click **"Edit Settings"**
4. Scroll to **"Redirect URIs"**
5. **Remove** any existing redirect URI for localhost
6. **Add** exactly: `http://localhost:5173/callback`
   - No trailing slash
   - Use `http://` (not `https://`)
   - Port must be `5173`
7. Click **"Add"**
8. **IMPORTANT**: Click **"Save"** at the bottom of the page
9. Wait 30-60 seconds for changes to propagate

### 3. Check Network Tab for Detailed Error

1. Open DevTools (F12)
2. Go to **Network** tab
3. Click "Connect Spotify" button
4. Find the request to `accounts.spotify.com/authorize`
5. Click on it
6. Go to **Response** tab
7. Look for the error message - this will tell you exactly what Spotify is complaining about

### 4. Common Issues

#### Issue: Redirect URI not found
**Solution**: Make sure you added it in the Dashboard and clicked "Save"

#### Issue: Invalid client_id
**Solution**: Verify your Client ID in `.env` matches the one in Spotify Dashboard

#### Issue: Redirect URI mismatch
**Solution**: 
- Copy the exact Redirect URI from the console logs
- Paste it into Spotify Dashboard (don't type it manually)
- Make sure there are no extra spaces

#### Issue: App not saved
**Solution**: After adding the redirect URI, you MUST click "Save" at the bottom

### 5. Verify Your .env File

Your `.env` should have:
```env
VITE_SPOTIFY_CLIENT_ID=0dc2537dffbf48ee94a5eaa72dd36c50
VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/callback
VITE_SPOTIFY_CLIENT_SECRET=your_secret_here
```

### 6. Restart Dev Server

After making changes:
1. Stop the dev server (Ctrl+C)
2. Restart it: `npm run dev` or `bun dev`
3. Hard refresh the browser (Cmd+Shift+R or Ctrl+Shift+R)

### 7. Test Again

1. Click "Connect Spotify"
2. Check the console for debug logs
3. If you still get a 400 error, check the Network tab Response for the exact error message

## Still Not Working?

If you've verified everything above and still get a 400 error:

1. **Check the Network tab Response** - This will show the exact error from Spotify
2. **Try a different browser** - Sometimes browser extensions can interfere
3. **Clear browser cache** - Old cached data might be causing issues
4. **Verify the app is active** - Make sure your Spotify app isn't in a restricted state
5. **Check for typos** - Copy-paste the redirect URI instead of typing it

## Quick Test

To verify your redirect URI is correct, check the console when you click "Connect Spotify". The logged Redirect URI should match EXACTLY what's in your Spotify Dashboard.

