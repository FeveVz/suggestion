-- Tabla nueva en español. Ver convención de nomenclatura en 000.
--
-- NOTAS SOBRE COLUMNAS GENERADAS (no incluir en INSERT/UPDATE desde la app):
-- - "total"           GENERATED AS (subtotal + igv)
-- - "fechaVencimiento" GENERATED AS (fechaEmision + diasCredito)  [días calendario]
--
-- DEUDA TÉCNICA REGISTRADA:
-- UNIQUE parcial en (tipoDocumento, numeroDocumento) WHERE ambos NOT NULL
-- → se agrega en Fase 2 con validación complementaria en la API.

CREATE TABLE "Cobro" (
  "id"               TEXT PRIMARY KEY,
  "proyectoId"       TEXT NOT NULL REFERENCES "Proyecto"("id") ON DELETE RESTRICT,
  "concepto"         TEXT NOT NULL,
  "subtotal"         NUMERIC(12,2) NOT NULL,
  "igv"              NUMERIC(12,2) NOT NULL DEFAULT 0,
  "total"            NUMERIC(12,2) GENERATED ALWAYS AS ("subtotal" + "igv") STORED,
  "moneda"           TEXT NOT NULL DEFAULT 'PEN' CHECK ("moneda" IN ('PEN','USD')),
  "tipoDocumento"    TEXT CHECK ("tipoDocumento" IN ('factura','boleta','recibo')),
  "numeroDocumento"  TEXT,
  "fechaEmision"     DATE NOT NULL,
  "diasCredito"      INTEGER NOT NULL DEFAULT 0,
  "fechaVencimiento" DATE GENERATED ALWAYS AS ("fechaEmision" + "diasCredito") STORED,
  "estado"           TEXT NOT NULL DEFAULT 'pendiente'
                       CHECK ("estado" IN ('pendiente','parcial','pagado','vencido','anulado')),
  "createdAt"        TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ON "Cobro"("proyectoId");
CREATE INDEX ON "Cobro"("estado");
CREATE INDEX ON "Cobro"("fechaVencimiento");
CREATE INDEX ON "Cobro"("tipoDocumento");

ALTER TABLE "Cobro" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON "Cobro" FOR ALL TO service_role USING (true);

CREATE TRIGGER trg_cobro_updated_at
  BEFORE UPDATE ON "Cobro"
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
