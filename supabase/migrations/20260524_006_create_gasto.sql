-- Tabla nueva en español. Ver convención de nomenclatura en 000.
--
-- proyectoId es nullable: un Gasto puede ser general (sin proyecto asociado).
-- ON DELETE SET NULL: si se elimina el Proyecto, el Gasto queda como gasto general.

CREATE TABLE "Gasto" (
  "id"          TEXT PRIMARY KEY,
  "proyectoId"  TEXT REFERENCES "Proyecto"("id") ON DELETE SET NULL,
  "concepto"    TEXT NOT NULL,
  "monto"       NUMERIC(12,2) NOT NULL,
  "moneda"      TEXT NOT NULL DEFAULT 'PEN' CHECK ("moneda" IN ('PEN','USD')),
  "fecha"       DATE NOT NULL,
  "categoria"   TEXT,
  "comprobante" TEXT,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ON "Gasto"("proyectoId");
CREATE INDEX ON "Gasto"("fecha");

ALTER TABLE "Gasto" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON "Gasto" FOR ALL TO service_role USING (true);

CREATE TRIGGER trg_gasto_updated_at
  BEFORE UPDATE ON "Gasto"
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
