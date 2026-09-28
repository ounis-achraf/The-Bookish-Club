-- Run this entire file in Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text not null,
  cover_url text,
  month integer,
  year integer,
  is_current boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index if not exists one_current_book
on public.books (is_current)
where is_current = true;

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  member_name text not null check (char_length(member_name) between 1 and 100),
  rating integer not null check (rating between 1 and 5),
  review_text text not null check (char_length(review_text) between 1 and 5000),
  photo_url text,
  created_at timestamptz not null default now()
);

alter table public.books enable row level security;
alter table public.reviews enable row level security;

-- Public members can see the current book only.
create policy "Public can view current book"
on public.books for select
to anon, authenticated
using (is_current = true);

-- Public members can submit reviews.
create policy "Public can submit reviews"
on public.reviews for insert
to anon, authenticated
with check (
  exists (select 1 from public.books b where b.id = book_id and b.is_current = true)
);

-- Authenticated admin can manage books and reviews.
create policy "Admin can manage books"
on public.books for all
to authenticated
using (true)
with check (true);

create policy "Admin can manage reviews"
on public.reviews for all
to authenticated
using (true)
with check (true);

-- Storage buckets.
insert into storage.buckets (id, name, public)
values ('review-photos','review-photos',true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('book-covers','book-covers',true)
on conflict (id) do nothing;

-- Public can upload review photos.
create policy "Public upload review photos"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'review-photos');

create policy "Public read review photos"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'review-photos');

-- Authenticated admin can upload/read book covers.
create policy "Admin upload book covers"
on storage.objects for insert
to authenticated
with check (bucket_id = 'book-covers');

create policy "Public read book covers"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'book-covers');

-- Authenticated admin may delete stored files.
create policy "Admin delete storage files"
on storage.objects for delete
to authenticated
using (bucket_id in ('book-covers','review-photos'));
