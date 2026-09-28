# Book Club — free deployment

A mobile-first monthly book club review app.

## What it includes

- Public member review page
- Name, 1–5 star rating, review text, optional photo
- Private admin login/dashboard
- Current book management
- Monthly book switching without deleting old reviews
- Historical book archive
- Supabase database + storage
- Vercel deployment

## Setup

### 1. Create Supabase

Go to https://supabase.com and create a free project.

Open **SQL Editor**, create a new query, paste the entire contents of `supabase/schema.sql`, and run it.

Then go to **Project Settings → API** and copy:
- Project URL
- anon/public key

### 2. Create your admin account

In Supabase open **Authentication → Users → Add user**.

Create your email/password. This is the account used for `/admin/login`.

### 3. Run locally (optional)

Install Node.js LTS.

In this folder run:

    npm install

Create `.env.local`:

    NEXT_PUBLIC_SUPABASE_URL=YOUR_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY

Then:

    npm run dev

Open http://localhost:3000

### 4. Deploy free with Vercel

Create a free account at https://vercel.com.

Upload this project to a GitHub repository, then in Vercel choose **Add New → Project** and import the repository.

Add the same two environment variables:

    NEXT_PUBLIC_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY

Deploy.

Your free app will have a URL similar to:

    https://your-project.vercel.app

Members use:

    /review

You use:

    /admin/login

## Monthly workflow

1. Log into `/admin/login`.
2. Open **Change book**.
3. Enter the new title and author.
4. Upload its cover.
5. Click **START THIS BOOK**.
6. The member page immediately shows the new book.
7. Previous reviews remain attached to the previous book and appear in the archive.

## Important

This project is designed for the free tiers. Free service limits can change over time. For a small book club, the expected usage is comfortably within typical free-tier usage, but very large photo uploads or traffic can eventually exceed provider limits.
