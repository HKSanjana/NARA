# Walkthrough: How to Drop and Recreate All Tables

I have created a script that simplifies the process of clearing your database. Since you are using Drizzle ORM and Neon, the most effective way to "drop all tables" is to reset the `public` schema.

## 1. Reset the Database (Drop All Tables)

Run the following command to clear your database:

```bash
npx tsx server/scripts/db-reset.ts
```

This script will:

* Connect to your Neon database via `DATABASE_URL`.
* Drop the entire `public` schema (removing all tables, indexes, and types).
* Recreate an empty `public` schema.

## 2. Recreate Tables from Schema

Once the database is empty, run your Drizzle push command to recreate the tables based on your

**shared/schema.ts** file:

```bash
npm run db:push
```

## Verification

After running the commands:

1. The script should output `✅ Database schema cleared successfully`.
2. `npm run db:push` should report that it has created all tables.
3. You can verify the tables exist using the Neon console or by checking your application.

IMPORTANT

This will permanently DELETE all data in your database. Ensure you have backups if needed before running.
