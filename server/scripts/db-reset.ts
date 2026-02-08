import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

async function resetDatabase() {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
        console.error('❌ DATABASE_URL is not set in .env');
        process.exit(1);
    }

    const sql = neon(databaseUrl);

    console.log('🔄 Resetting database...');

    try {
        // Drop the public schema and recreate it to remove all tables, enums, etc.
        await sql`DROP SCHEMA public CASCADE`;
        await sql`CREATE SCHEMA public`;
        await sql`GRANT ALL ON SCHEMA public TO public`;
        await sql`COMMENT ON SCHEMA public IS 'standard public schema'`;

        console.log('✅ Database schema cleared successfully.');
        console.log('\nNext steps:');
        console.log('1. Run "npm run db:push" to recreate tables from schema.ts');
    } catch (error) {
        console.error('❌ Error resetting database:', error);
        process.exit(1);
    }
}

resetDatabase();
