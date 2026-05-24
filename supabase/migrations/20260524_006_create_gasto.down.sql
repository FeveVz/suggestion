-- Nota: Gasto tiene FK nullable a Proyecto.
-- Ejecutar este archivo ANTES de 002.down.
-- No tiene dependencias con Cobro ni Pago — puede ejecutarse en cualquier orden
-- entre 006.down, 005.down y 004.down, siempre antes de 002.down.
DROP TABLE IF EXISTS "Gasto";
