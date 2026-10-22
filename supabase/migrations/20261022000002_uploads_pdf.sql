-- La tabla uploads ahora también guarda PDFs.
--
-- Nació solo para fotos de producto y la restricción lo fijaba. Los catálogos
-- de temporada son PDFs y viven en la misma tabla: se sirven desde /archivos/
-- en vez de /imagenes/, pero el almacenamiento es el mismo.

alter table public.uploads drop constraint if exists uploads_content_type;

alter table public.uploads
  add constraint uploads_content_type
  check (content_type in ('image/webp', 'image/jpeg', 'image/png', 'image/avif', 'application/pdf'));
