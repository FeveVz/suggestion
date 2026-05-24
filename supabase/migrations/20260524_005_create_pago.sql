-- Tabla nueva en español. Ver convención de nomenclatura en 000.
--
-- REGLA CRÍTICA (validada en la API, no en DB):
-- SUM(Pago.monto) para un Cobro nunca puede superar Cobro.total.
-- El estado de Cobro se actualiza automáticamente desde la API al registrar/eliminar pagos:
--   - parcial: si SUM(pagos) < cobro.total
--   - pagado:  si SUM(pagos) = cobro.total
--
-- ON DELETE RESTRICT en cobroId: no se puede eliminar un Cobro que tenga Pagos registrados.

CREATE TABLE "Pago" (
  "id"         TEXT PRIMARY KEY,
  "cobroId"    TEXT NOT NULL REFERENCES "Cobro"("id") ON DELETE RESTRICT,
  "monto"      NUMERIC(12,2) NOT NULL,
  "fecha"      DATE NOT NULL,
  "metodo"     TEXT NOT NULL
                 CHECK ("metodo" IN ('yape','plin','transferencia','efectivo','deposito')),
  "referencia" TEXT,
  "notas"      TEXT,
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ON "Pago"("cobroId");
CREATE INDEX ON "Pago"("fecha");

ALTER TABLE "Pago" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON "Pago" FOR ALL TO service_role USING (true);

CREATE TRIGGER trg_pago_updated_at
  BEFORE UPDATE ON "Pago"
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
