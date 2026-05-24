-- Tabla nueva en español. Ver convención de nomenclatura en 000.
--
-- NOTA: el campo "total" es GENERATED ALWAYS AS (subtotal + igv).
-- No incluir "total" en INSERT ni UPDATE desde la aplicación — la DB lo calcula sola.

CREATE TABLE "Proyecto" (
  "id"                  TEXT PRIMARY KEY,
  "clienteId"           TEXT NOT NULL REFERENCES "Client"("id") ON DELETE RESTRICT,
  "clientServiceId"     TEXT REFERENCES "ClientService"("id") ON DELETE SET NULL,
  "nombre"              TEXT NOT NULL,
  "tipo"                TEXT NOT NULL CHECK ("tipo" IN ('retainer','proyecto','consultoria')),
  "subtotal"            NUMERIC(12,2) NOT NULL DEFAULT 0,
  "igv"                 NUMERIC(12,2) NOT NULL DEFAULT 0,
  "total"               NUMERIC(12,2) GENERATED ALWAYS AS ("subtotal" + "igv") STORED,
  "moneda"              TEXT NOT NULL DEFAULT 'PEN' CHECK ("moneda" IN ('PEN','USD')),
  "estado"              TEXT NOT NULL DEFAULT 'propuesta'
                          CHECK ("estado" IN ('propuesta','activo','pausado','cerrado','perdido')),
  "responsableInterno"  TEXT,
  "fechaInicio"         DATE NOT NULL,
  "fechaFin"            DATE,
  "notas"               TEXT,
  "createdAt"           TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ON "Proyecto"("clienteId");
CREATE INDEX ON "Proyecto"("estado");
CREATE INDEX ON "Proyecto"("tipo");

ALTER TABLE "Proyecto" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON "Proyecto" FOR ALL TO service_role USING (true);

CREATE TRIGGER trg_proyecto_updated_at
  BEFORE UPDATE ON "Proyecto"
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
