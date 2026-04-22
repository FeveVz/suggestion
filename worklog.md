---
Task ID: Hito-1-Checkpoint
Agent: Main Agent
Task: Documentar el estado exacto del proyecto como Hito 1 (Check Point)

Work Log:
- Verificado el estado completo de la base de datos: 16 servicios, 48 planes, 3 clientes
- Verificado el estado de todos los archivos fuente
- Documentado el problema con Next.js runtime (se crashea en entorno K8s)
- Creado servidor Express.js alternativo (server.js) que funciona estable
- Creado watchdog.sh para reinicio automático

Stage Summary:
- HITO 1 GUARDADO - Estado del proyecto al 22/04/2026
- Base de datos: 16 servicios, 48 planes, 3 clientes (1 aceptado: Aura Andina)
- Servidor: Express.js en server.js (reemplaza Next.js runtime por estabilidad)
- Problema conocido: Next.js runtime se crashea en K8s, Express funciona estable
- Frontend: Pre-renderizado desde Next.js build, servido estáticamente por Express
- APIs: Todas migradas a Express con Prisma directo

ESTADO DETALLADO DEL HITO 1:

=== BASE DE DATOS (SQLite: db/custom.db) ===
- 16 servicios con 48 planes (3 por servicio)
- 3 clientes:
  * Al Toque Venezolano (pendiente) - Redes Sociales, Publicidad Digital, Producción Audiovisual
  * Recreo (pendiente) - Branding
  * Aura Andina (aceptado) - Publicidad Digital->Business, SEO->Profesional, Branding->Business, Desarrollo Web->Web Corporativa, descuento S/2300

=== ARCHIVOS FUENTE ===
1. prisma/schema.prisma (68 líneas) - Modelos: Service, Plan, Client, ClientService
2. src/components/dashboard.tsx (1331 líneas) - Dashboard completo con:
   - ClientForm (crear/editar clientes)
   - ServiceForm (crear/editar servicios con planes)
   - AcceptProformaDialog (selección de planes, anticipo, descuento)
   - ClientCard (tarjetas con badges de estado)
   - Dashboard principal (tabs clientes/servicios, búsqueda, diálogos)
3. src/app/page.tsx (42 líneas) - Página principal (auth check + login/dashboard)
4. src/components/login-form.tsx (108 líneas) - Formulario de login
5. src/app/api/clients/route.ts (84 líneas) - GET/POST clients
6. src/app/api/clients/[id]/route.ts (207 líneas) - GET/PUT/DELETE client con planSelections
7. src/app/api/services/route.ts (69 líneas) - GET/POST services
8. src/lib/auth.ts (18 líneas) - Auth simple (Administrador/Sugg777)
9. src/lib/db.ts (12 líneas) - Prisma client singleton
10. src/lib/proforma-template.ts (753 líneas) - Generador de HTML de proforma
11. server.js (403 líneas) - Servidor Express.js con todas las APIs
12. watchdog.sh (16 líneas) - Script de reinicio automático
13. next.config.ts (11 líneas) - Config Next.js (sin output: standalone)

=== PROBLEMA CONOCIDO ===
- Next.js runtime (next start / next dev) se crashea en el entorno K8s al procesar requests
- El servidor Express.js (server.js) funciona estable con ~85MB RAM
- El frontend usa HTML pre-renderizado de Next.js + chunks estáticos
- Los chunks JS de Next.js requieren su runtime para hydration completa
- SOLUCIÓN ACTUAL: Express server + watchdog.sh para reinicio automático

=== MEJORAS PENDIENTES ===
- El frontend necesita funcionar completamente sin Next.js runtime
- Posible solución: crear frontend vanilla React servido por Express
- O alternativamente: encontrar forma de estabilizar Next.js runtime
