-- CONVENCIÓN DE NOMENCLATURA
-- Tablas legacy (Client, ClientService, Service, Plan, Talent, Task, TaskTemplate):
-- mantenidas en inglés para preservar compatibilidad con el código existente.
-- Tablas nuevas (Proyecto, Entregable, Cobro, Pago, Gasto):
-- nombradas en español, alineadas al modelo de negocio de Suggestion.

-- Las tablas legacy gestionan updatedAt a nivel de aplicación (new Date().toISOString()).
-- Las tablas nuevas usan este trigger para consistencia a nivel de base de datos.

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
