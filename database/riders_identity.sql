-- Extra rider identity fields (run after riders.sql)

ALTER TABLE riders
ADD COLUMN IF NOT EXISTS address text;

ALTER TABLE riders
ADD COLUMN IF NOT EXISTS city text;

ALTER TABLE riders
ADD COLUMN IF NOT EXISTS id_type text;

ALTER TABLE riders
ADD COLUMN IF NOT EXISTS id_number text;

ALTER TABLE riders
ADD COLUMN IF NOT EXISTS id_document_path text;
