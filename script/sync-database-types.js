#!/usr/bin/env node

// This script fetches and updates the database types from Supabase
// Run with: node script/sync-database-types.js

require('dotenv').config({ path: '.env.local' });
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if Supabase CLI is installed
try {
  execSync('supabase --version', { stdio: 'ignore' });
} catch (error) {
  console.error('Supabase CLI is not installed. Please install it first:');
  console.error('npm install -g supabase');
  process.exit(1);
}

// Check for required environment variables
const requiredEnvVars = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(`Missing environment variables: ${missingEnvVars.join(', ')}`);
  console.error('Make sure you have a .env.local file with these variables defined.');
  process.exit(1);
}

const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const projectKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Generating database types from Supabase...');

// Create the output directory if it doesn't exist
const typesDir = path.join(__dirname, '..', 'app', 'lib', 'supabase');
if (!fs.existsSync(typesDir)) {
  fs.mkdirSync(typesDir, { recursive: true });
}

// Generate types
try {
  execSync(
    `supabase gen types typescript --project-id "${projectUrl}" --schema public > "${path.join(typesDir, 'database.types.ts')}"`,
    { stdio: 'inherit' }
  );

  console.log('\n✅ Database types have been updated successfully!');
  console.log(`Types file: ${path.join(typesDir, 'database.types.ts')}`);
} catch (error) {
  console.error('\n❌ Failed to generate database types:');
  console.error(error.message);
  process.exit(1);
} 