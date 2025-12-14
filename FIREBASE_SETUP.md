# Firebase Setup Guide

This guide will help you set up Firebase to track global visitor statistics for your portfolio.

## What Gets Tracked

- **Total page loads** - How many times the site has been visited
- **Total commands executed** - Aggregate command usage across all visitors
- **Popular commands** - Which commands are used most frequently
- **Last activity** - When was the site last accessed

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create Project"
3. Name it something like "portfolio-stats"
4. Accept the default settings and create

## Step 2: Set Up Realtime Database

1. In Firebase Console, go to **Build > Realtime Database**
2. Click "Create Database"
3. Choose region (us-central1 is fine)
4. Start in **Test mode** (for development)
5. Click "Enable"

## Step 3: Get Your Web App Credentials

1. In Firebase Console, click the gear icon ⚙️ → **Project Settings**
2. Go to the **Your apps** section
3. Click on your web app (or create one if you don't have it yet)
4. Copy the config object that looks like:

```javascript
{
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
}
```

## Step 4: Add Credentials to Your Project

1. In your project root, copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

2. Open `.env.local` and fill in your Firebase credentials:

```
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

3. Save the file

## Step 5: Set Database Rules (Important for Security)

In Firebase Console → **Realtime Database → Rules**, replace with:

```json
{
  "rules": {
    "stats": {
      ".read": true,
      ".write": false,
      "totalPageLoads": {
        ".increment": true
      },
      "totalCommands": {
        ".increment": true
      },
      "lastPageLoad": {
        ".write": true
      },
      "lastCommand": {
        ".write": true
      },
      "lastCommandTime": {
        ".write": true
      },
      "commands": {
        "$cmd": {
          ".increment": true
        }
      }
    }
  }
}
```

Click "Publish" when done.

## Step 6: Test It Out

1. Start your local dev server:
```bash
npm start
```

2. Open the site and use a few commands

3. Go back to Firebase Console → **Realtime Database**

4. You should see data appearing in the `stats` node!

5. In your terminal, try the new commands:
   - `stats` - Shows your personal session stats
   - `global-stats` - Shows aggregate stats from all visitors

## Troubleshooting

### "No global stats available yet"
- Make sure you've executed at least one command
- Check that Firebase Console shows data in Realtime Database
- Verify your `.env.local` file has correct credentials

### Firebase not connecting
- Double-check your `.env.local` file
- Make sure all credentials are correct (copy-paste from Firebase Console)
- Check browser console for errors (F12 → Console tab)

### Data not showing up
- Make sure database rules are published
- Verify that the rules allow writes to the stats node
- Check that commands are actually being executed on your terminal

## Going to Production

When you deploy:

1. Set environment variables in your hosting provider (Vercel, Netlify, etc.)
2. Deploy your code

Your live site will automatically start collecting stats!

## Next Steps

You can further customize this by:
- Adding more metrics to track
- Creating a public analytics dashboard
- Tracking user flow through your site
- Adding custom events for specific interactions

For more Firebase docs: https://firebase.google.com/docs
