-- =============================================================================
-- Migration 17: the private storage box for invoice and receipt photos
-- =============================================================================
-- What this file does, in plain words:
--   1. Makes a PRIVATE storage box (a "bucket") called `expense-photos`.
--      It accepts only JPG and PNG pictures, at most 5 MB each.
--   2. Rules for putting a photo in: only a TECHNICIAN, only into the folder
--      named after their own id, only with a .jpg, .jpeg or .png file name.
--   3. Rules for opening a photo: the technician who owns the folder, the
--      manager and the owner. Workers and visitors cannot.
--   4. There is NO rule for changing or deleting a photo, so no app can do
--      either. A receipt that was sent stays as it was sent.
--
-- Contract: docs/api-contract.md section 4.8, "The photos".
--
-- Deleting photos (for example after testing) is done by hand in the Supabase
-- dashboard under Storage.
--
-- Rules for this folder (see supabase/CLAUDE.md):
--   * Never edit an old migration. Add a NEW file for every change.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. The box
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'expense-photos', 'expense-photos', false, 5242880,
  array['image/jpeg', 'image/png']
)
on conflict (id) do update set
  public             = excluded.public,
  file_size_limit    = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;


-- -----------------------------------------------------------------------------
-- 2. Putting a photo in: a technician, into their own folder
-- -----------------------------------------------------------------------------
-- The path must look like:  <my id>/<file name>.jpg
-- The file name may hold letters, numbers, dashes and underscores.
create policy expense_photos_technician_uploads_own
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'expense-photos'
    and (select public.get_my_role()) = 'technician'
    and name ~ ('^' || (select auth.uid())::text
                || '/[A-Za-z0-9_-]{1,100}\.(jpg|jpeg|png)$')
  );


-- -----------------------------------------------------------------------------
-- 3. Opening a photo
-- -----------------------------------------------------------------------------
create policy expense_photos_read_by_role
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'expense-photos'
    and (
      (select public.get_my_role()) in ('manager', 'owner')
      or (
        (select public.get_my_role()) = 'technician'
        and split_part(name, '/', 1) = (select auth.uid())::text
      )
    )
  );
