-- DEUDA TÉCNICA → FASE 2: índice UNIQUE parcial en Cobro(tipoDocumento, numeroDocumento).
--
-- Simple UNIQUE no sirve porque ambas columnas son nullable y PostgreSQL no considera
-- dos NULLs como iguales en UNIQUE — permitiría duplicados silenciosos cuando ambos son NULL.
-- La solución correcta es un índice parcial que solo actúa cuando ambas columnas tienen valor.
--
-- La validación complementaria en la API (comprobar duplicado antes de INSERT) se documenta
-- como deuda para Fase 3.

CREATE UNIQUE INDEX IF NOT EXISTS "Cobro_tipoDocumento_numeroDocumento_unique"
  ON "Cobro" ("tipoDocumento", "numeroDocumento")
  WHERE "tipoDocumento" IS NOT NULL AND "numeroDocumento" IS NOT NULL;
