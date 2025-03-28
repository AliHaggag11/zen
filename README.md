# Zen Space - Mental Wellness Assistant

A mental wellness application with theme customization based on mood, profile management, and authentication.

## Features

- **Mood-Based Theming**: Interface adapts to your emotional state
- **User Authentication**: Secure login and registration with Supabase
- **Profile Management**: Customize your profile and upload avatars
- **Responsive Design**: Works on all devices

## Setup

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- Supabase account

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/zen-space.git
   cd zen-space
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Create a `.env.local` file with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Set up Supabase database:
   - Go to your Supabase dashboard
   - Navigate to the SQL Editor
   - Run the SQL in `apply_migration.sql` to create tables and policies

5. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Database Setup Details

The application requires two main resources in Supabase:

1. **Profiles Table**: Stores user profile information
2. **Storage Bucket**: For storing user avatars

You can set these up by running the SQL in `apply_migration.sql` in the Supabase SQL Editor.

## Authentication

The application uses Supabase Auth with the following features:
- Email/password registration and login
- Password reset
- User profile management

## License

[MIT](LICENSE)
