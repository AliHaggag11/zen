// Helper script to apply Supabase migrations
const { execSync } = require('child_process');
const { existsSync } = require('fs');
const path = require('path');

console.log('Zen Space - Supabase Migrations Helper');
console.log('--------------------------------------');

// Check for .env.local file
const envPath = path.join(process.cwd(), '.env.local');
if (!existsSync(envPath)) {
  console.error('Error: .env.local file not found');
  console.error('Please create a .env.local file with your Supabase credentials:');
  console.error('NEXT_PUBLIC_SUPABASE_URL=your-project-url');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
  console.error('SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
  process.exit(1);
}

// Install required packages
console.log('Installing required packages...');
try {
  execSync('npm install dotenv ts-node tsconfig-paths @supabase/supabase-js --no-save', { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to install required packages');
  process.exit(1);
}

// Run the migration script
console.log('\nApplying migrations...');
try {
  execSync('npx ts-node -r tsconfig-paths/register app/supabase-migrations/apply.ts', { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to apply migrations');
  process.exit(1);
}

console.log('\nMigrations complete!');
console.log('You can now start the application with: npm run dev'); 