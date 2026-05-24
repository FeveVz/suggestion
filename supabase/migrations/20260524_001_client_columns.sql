-- Agrega 7 columnas nuevas a la tabla legacy Client.
-- Todas son NULL para no romper los registros existentes.
-- Backfill manual recomendado post-migración para tipoDocumento y numeroDocumento.
--
-- DEUDA TÉCNICA REGISTRADA:
-- Backfill manual de tipoDocumento/numeroDocumento para los 3 clientes existentes
-- → ejecutar UPDATE manual en Supabase Studio después de aplicar esta migración.

ALTER TABLE "Client"
  ADD COLUMN IF NOT EXISTS "tipoDocumento"    TEXT CHECK ("tipoDocumento" IN ('RUC','DNI')),
  ADD COLUMN IF NOT EXISTS "numeroDocumento"  TEXT,
  ADD COLUMN IF NOT EXISTS "razonSocial"      TEXT,
  ADD COLUMN IF NOT EXISTS "contactoNombre"   TEXT,
  ADD COLUMN IF NOT EXISTS "contactoTelefono" TEXT,
  ADD COLUMN IF NOT EXISTS "contactoEmail"    TEXT,
  ADD COLUMN IF NOT EXISTS "sector"           TEXT;
