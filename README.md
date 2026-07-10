# FeatureSync - Feature Request Board

A Canny.io clone built on [urBackend](https://github.com/yash-pouranik/urBackend) using Next.js.

## Features

- **Users:** Can sign up, log in, submit feature requests, vote on features, and leave comments.
- **Admins:** Can change the status of any feature request (e.g. Under Review -> Planned) and delete inappropriate features.
- **Real-time UX:** Optimistic UI updates for voting.

## Setup

1. Make sure you have your urBackend project set up and running locally.
2. In your urBackend dashboard, create the following collections:
   - `features` (RLS: `public-read`)
   - `comments` (RLS: `public-read`)
3. Create a `.env.local` file based on `.env.local.example` and add your project's publishable and secret keys.
4. Run `npm run dev` to start the development server.

## Admin Access
To test the admin dashboard, create a user and then manually change their `role` field to `admin` in your urBackend database.

## Documentation
Please refer to [plan.md](./plan.md) for the full implementation guide and technical details.
