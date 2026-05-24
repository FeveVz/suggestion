-- Tabla nueva en español. Ver convención de nomenclatura en 000.
--
-- ON DELETE CASCADE: si se elimina el Proyecto, sus Entregables se eliminan también.

CREATE TABLE "Entregable" (
  "id"               TEXT PRIMARY KEY,
  "proyectoId"       TEXT NOT NULL REFERENCES "Proyecto"("id") ON DELETE CASCADE,
  "nombre"           TEXT NOT NULL,
  "descripcion"      TEXT,
  "fechaCompromiso"  DATE NOT NULL,
  "fechaEntrega"     DATE,
  "estado"           TEXT NOT NULL DEFAULT 'pendiente'
                       CHECK ("estado" IN ('pendiente','en_proceso','entregado','aprobado','rechazado')),
  "responsable"      TEXT,
  "evidenciaUrl"     TEXT,
  "createdAt"        TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ON "Entregable"("proyectoId");
CREATE INDEX ON "Entregable"("estado");
CREATE INDEX ON "Entregable"("fechaCompromiso");

ALTER TABLE "Entregable" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON "Entregable" FOR ALL TO service_role USING (true);

CREATE TRIGGER trg_entregable_updated_at
  BEFORE UPDATE ON "Entregable"
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
