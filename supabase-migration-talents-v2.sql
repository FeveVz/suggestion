-- ============================================================
-- MIGRACIÓN v2: Módulo de Talentos + Derivación Automática
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- 0. Limpiar tablas si existen de un intento anterior (orden inverso por dependencias)
DROP TABLE IF EXISTS "Task" CASCADE;
DROP TABLE IF EXISTS "TaskTemplate" CASCADE;
DROP TABLE IF EXISTS "Talent" CASCADE;

-- 1. Tabla Talent
CREATE TABLE "Talent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT '',
    "phone" TEXT DEFAULT '',
    "active" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Talent_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Talent_email_key" UNIQUE ("email")
);

-- 2. Tabla TaskTemplate
CREATE TABLE "TaskTemplate" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT DEFAULT '',
    "priority" TEXT DEFAULT 'media',
    "deadlineDays" INTEGER DEFAULT 7,
    "role" TEXT DEFAULT '',
    "order" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskTemplate_pkey" PRIMARY KEY ("id")
);

-- 3. Tabla Task
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT DEFAULT '',
    "status" TEXT DEFAULT 'pendiente',
    "priority" TEXT DEFAULT 'media',
    "deadline" DATE,
    "talentId" TEXT,
    "clientServiceId" TEXT,
    "serviceId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "additionalInfo" TEXT DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- 4. Claves foráneas (separadas como en la migración original de Prisma)
ALTER TABLE "TaskTemplate" ADD CONSTRAINT "TaskTemplate_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_talentId_fkey" FOREIGN KEY ("talentId") REFERENCES "Talent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_clientServiceId_fkey" FOREIGN KEY ("clientServiceId") REFERENCES "ClientService"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 5. Índices para performance
CREATE INDEX "idx_task_talentId" ON "Task"("talentId");
CREATE INDEX "idx_task_clientId" ON "Task"("clientId");
CREATE INDEX "idx_task_serviceId" ON "Task"("serviceId");
CREATE INDEX "idx_task_status" ON "Task"("status");
CREATE INDEX "idx_tasktemplate_serviceId" ON "TaskTemplate"("serviceId");
CREATE INDEX "idx_talent_email" ON "Talent"("email");
CREATE INDEX "idx_talent_role" ON "Talent"("role");

-- 6. Habilitar RLS
ALTER TABLE "Talent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Task" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TaskTemplate" ENABLE ROW LEVEL SECURITY;

-- 7. Políticas de acceso total
CREATE POLICY "Service role full access on Talent" ON "Talent" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on Task" ON "Task" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on TaskTemplate" ON "TaskTemplate" FOR ALL USING (true) WITH CHECK (true);

-- 8. Plantillas de tareas predefinidas para los 16 servicios
-- CORREGIDO: serviceIds alineados con los servicios reales en la base de datos
-- svc01=Marketing Digital, svc02=Redes Sociales, svc03=Publicidad Digital, svc04=SEO,
-- svc05=Branding, svc06=Desarrollo Web, svc07=Consultoría, svc08=CRM y Automatización,
-- svc09=Producción Audiovisual, svc10=Investigación de Mercado, svc11=Merchandising,
-- svc12=Imprenta Corporativa, svc13=Estructuras Publicitarias, svc14=Publicidad Móvil,
-- svc15=BTL y Activaciones, svc16=Material POP
INSERT INTO "TaskTemplate" ("id", "serviceId", "title", "description", "priority", "deadlineDays", "role", "order") VALUES
-- svc01: Marketing Digital
('tpl0101', 'svc01', 'Investigación de mercado', 'Analizar público objetivo, competencia y tendencias del sector digital', 'alta', 2, 'Community Manager', 1),
('tpl0102', 'svc01', 'Estrategia digital', 'Diseñar plan de marketing digital con objetivos medibles y KPIs', 'alta', 5, 'Community Manager', 2),
('tpl0103', 'svc01', 'Creación de contenido', 'Producir contenido para redes sociales, blog y canales digitales', 'media', 10, 'Community Manager', 3),
('tpl0104', 'svc01', 'Gestión de campañas', 'Implementar y gestionar campañas digitales pagadas y orgánicas', 'media', 15, 'Media Planner', 4),
('tpl0105', 'svc01', 'Reporte mensual', 'Elaborar reporte de métricas, resultados y recomendaciones', 'baja', 30, 'Community Manager', 5),

-- svc02: Redes Sociales
('tpl0201', 'svc02', 'Auditoría de redes sociales', 'Analizar presencia actual en redes, competencia y oportunidades', 'alta', 2, 'Community Manager', 1),
('tpl0202', 'svc02', 'Estrategia social media', 'Definir tono, frecuencia, tipo de contenido y calendario editorial', 'alta', 4, 'Community Manager', 2),
('tpl0203', 'svc02', 'Diseño de piezas gráficas', 'Crear imágenes, stories y videos para publicaciones en redes', 'media', 7, 'Diseñador Gráfico', 3),
('tpl0204', 'svc02', 'Publicación y programación', 'Programar y publicar contenido en todas las redes sociales', 'media', 10, 'Community Manager', 4),
('tpl0205', 'svc02', 'Gestión de comunidad', 'Responder comentarios, mensajes y gestionar interacciones', 'media', 30, 'Community Manager', 5),

-- svc03: Publicidad Digital
('tpl0301', 'svc03', 'Estrategia de campaña', 'Definir objetivos, público objetivo, presupuesto y plataformas publicitarias', 'alta', 2, 'Media Planner', 1),
('tpl0302', 'svc03', 'Creación de anuncios', 'Diseñar y redactar los anuncios para cada plataforma (Meta, Google, TikTok)', 'alta', 5, 'Diseñador Gráfico', 2),
('tpl0303', 'svc03', 'Configuración de plataformas', 'Configurar campañas en Meta Ads, Google Ads y otras plataformas', 'alta', 6, 'Media Planner', 3),
('tpl0304', 'svc03', 'Monitoreo y optimización', 'Supervisar rendimiento, ajustar pujas y optimizar resultados', 'media', 30, 'Media Planner', 4),

-- svc04: SEO
('tpl0401', 'svc04', 'Auditoría SEO inicial', 'Análisis completo del sitio actual: técnico, contenido y autoridad', 'alta', 3, 'Especialista SEO', 1),
('tpl0402', 'svc04', 'Investigación de keywords', 'Identificar palabras clave objetivo con volumen y dificultad de ranking', 'alta', 5, 'Especialista SEO', 2),
('tpl0403', 'svc04', 'Optimización on-page', 'Aplicar mejoras en meta tags, contenido, estructura y velocidad', 'media', 10, 'Especialista SEO', 3),
('tpl0404', 'svc04', 'Estrategia de contenidos SEO', 'Planificar contenido optimizado para posicionamiento orgánico', 'media', 14, 'Especialista SEO', 4),

-- svc05: Branding
('tpl0501', 'svc05', 'Investigación de marca', 'Analizar mercado, competencia y posicionamiento actual de la marca', 'alta', 3, 'Branding Strategist', 1),
('tpl0502', 'svc05', 'Identidad visual', 'Desarrollar logo, paleta de colores, tipografía y elementos visuales', 'alta', 7, 'Diseñador Gráfico', 2),
('tpl0503', 'svc05', 'Manual de marca', 'Crear brandbook con normas de uso, tono de voz y aplicaciones', 'media', 12, 'Branding Strategist', 3),
('tpl0504', 'svc05', 'Aplicaciones de marca', 'Diseñar aplicaciones en papelería, digital y puntos de contacto', 'media', 15, 'Diseñador Gráfico', 4),

-- svc06: Desarrollo Web
('tpl0601', 'svc06', 'Wireframes y estructura', 'Definir arquitectura de información y wireframes del sitio', 'alta', 3, 'Desarrollador Web', 1),
('tpl0602', 'svc06', 'Diseño UI/UX', 'Diseñar la interfaz visual y la experiencia de usuario del sitio', 'alta', 7, 'Diseñador UI/UX', 2),
('tpl0603', 'svc06', 'Desarrollo frontend', 'Codificar el frontend del sitio web con tecnologías modernas', 'alta', 14, 'Desarrollador Web', 3),
('tpl0604', 'svc06', 'Desarrollo backend', 'Implementar funcionalidades del lado del servidor y base de datos', 'alta', 18, 'Desarrollador Web', 4),
('tpl0605', 'svc06', 'Pruebas y lanzamiento', 'Testing, optimización de rendimiento y despliegue en producción', 'media', 21, 'Desarrollador Web', 5),

-- svc07: Consultoría
('tpl0701', 'svc07', 'Diagnóstico digital', 'Evaluar presencia digital actual del negocio y identificar oportunidades', 'alta', 2, 'Consultor Digital', 1),
('tpl0702', 'svc07', 'Plan de acción', 'Desarrollar estrategia y roadmap digital con prioridades y timelines', 'alta', 5, 'Consultor Digital', 2),
('tpl0703', 'svc07', 'Sesiones de seguimiento', 'Monitorear avances, resolver dudas y ajustar estrategia', 'media', 30, 'Consultor Digital', 3),

-- svc08: CRM y Automatización
('tpl0801', 'svc08', 'Auditoría de procesos', 'Mapear procesos actuales de ventas, marketing y atención al cliente', 'alta', 3, 'Consultor Digital', 1),
('tpl0802', 'svc08', 'Configuración de CRM', 'Implementar y configurar plataforma CRM según necesidades del negocio', 'alta', 7, 'Desarrollador Web', 2),
('tpl0803', 'svc08', 'Automatización de flujos', 'Crear flujos automatizados de nurturing, seguimiento y conversión', 'media', 12, 'Consultor Digital', 3),
('tpl0804', 'svc08', 'Capacitación del equipo', 'Entrenar al equipo en uso del CRM y procesos automatizados', 'media', 15, 'Consultor Digital', 4),

-- svc09: Producción Audiovisual
('tpl0901', 'svc09', 'Guion y storyboard', 'Desarrollar guion creativo y storyboard del video o pieza audiovisual', 'alta', 3, 'Productor Audiovisual', 1),
('tpl0902', 'svc09', 'Planificación de grabación', 'Coordinar locación, talentos, equipamiento y cronograma', 'alta', 5, 'Productor Audiovisual', 2),
('tpl0903', 'svc09', 'Grabación', 'Sesión de grabación del contenido audiovisual en locación o estudio', 'alta', 8, 'Productor Audiovisual', 3),
('tpl0904', 'svc09', 'Edición y postproducción', 'Editar el material, agregar efectos, música y gráficos', 'media', 14, 'Editor de Video', 4),
('tpl0905', 'svc09', 'Entrega final', 'Exportar en formatos requeridos y entregar archivos finales', 'baja', 16, 'Productor Audiovisual', 5),

-- svc10: Investigación de Mercado
('tpl1001', 'svc10', 'Diseño de investigación', 'Definir objetivos, metodología y herramientas de investigación', 'alta', 2, 'Analista de Datos', 1),
('tpl1002', 'svc10', 'Recolección de datos', 'Ejecutar encuestas, entrevistas y recopilar fuentes secundarias', 'alta', 7, 'Analista de Datos', 2),
('tpl1003', 'svc10', 'Análisis de resultados', 'Procesar datos, identificar patrones y generar insights', 'media', 12, 'Analista de Datos', 3),
('tpl1004', 'svc10', 'Presentación de hallazgos', 'Elaborar reporte ejecutivo con conclusiones y recomendaciones', 'media', 14, 'Analista de Datos', 4),

-- svc11: Merchandising
('tpl1101', 'svc11', 'Análisis de punto de venta', 'Evaluar espacio, flujo de clientes y oportunidades de exhibición', 'alta', 3, 'Diseñador Gráfico', 1),
('tpl1102', 'svc11', 'Diseño de materiales', 'Crear diseño de displays, stands, POP y material promocional', 'alta', 7, 'Diseñador Gráfico', 2),
('tpl1103', 'svc11', 'Producción', 'Coordinar fabricación con proveedores y controlar calidad', 'media', 14, 'Diseñador Gráfico', 3),
('tpl1104', 'svc11', 'Implementación en tienda', 'Instalar materiales en punto de venta y verificar montaje', 'media', 18, 'Diseñador Gráfico', 4),

-- svc12: Imprenta Corporativa
('tpl1201', 'svc12', 'Diseño de piezas', 'Diseñar tarjetas, papelería, flyers y material impreso corporativo', 'alta', 3, 'Diseñador Gráfico', 1),
('tpl1202', 'svc12', 'Selección de materiales', 'Elegir papeles, acabados, tamaños y técnicas de impresión', 'alta', 5, 'Diseñador Gráfico', 2),
('tpl1203', 'svc12', 'Producción e impresión', 'Coordinar con imprenta, verificar pruebas de color y producción', 'media', 10, 'Diseñador Gráfico', 3),
('tpl1204', 'svc12', 'Control de calidad y entrega', 'Verificar calidad de impresión y coordinar entrega de materiales', 'media', 14, 'Diseñador Gráfico', 4),

-- svc13: Estructuras Publicitarias
('tpl1301', 'svc13', 'Diseño de estructura', 'Diseñar la estructura publicitaria según formato y ubicación', 'alta', 3, 'Diseñador Gráfico', 1),
('tpl1302', 'svc13', 'Permisos y gestión', 'Gestionar permisos municipales y normativas de publicidad exterior', 'alta', 7, 'Consultor Digital', 2),
('tpl1303', 'svc13', 'Producción e instalación', 'Fabricar e instalar la estructura en la ubicación aprobada', 'media', 14, 'Diseñador Gráfico', 3),
('tpl1304', 'svc13', 'Mantenimiento', 'Programar mantenimiento periódico y reposición de materiales', 'baja', 30, 'Diseñador Gráfico', 4),

-- svc14: Publicidad Móvil
('tpl1401', 'svc14', 'Planificación de ruta', 'Definir rutas, horarios y zonas de cobertura para la publicidad móvil', 'alta', 2, 'Media Planner', 1),
('tpl1402', 'svc14', 'Diseño del anuncio', 'Diseñar el material visual para la superficie del vehículo', 'alta', 5, 'Diseñador Gráfico', 2),
('tpl1403', 'svc14', 'Instalación en vehículos', 'Aplicar vinilos o pantallas en vehículos seleccionados', 'media', 8, 'Diseñador Gráfico', 3),
('tpl1404', 'svc14', 'Monitoreo y reporte', 'Rastrear cobertura, impacto y elaborar reporte de resultados', 'baja', 30, 'Media Planner', 4),

-- svc15: BTL y Activaciones
('tpl1501', 'svc15', 'Concepto creativo', 'Desarrollar concepto creativo y mecánica de la activación o evento BTL', 'alta', 3, 'Branding Strategist', 1),
('tpl1502', 'svc15', 'Logística y producción', 'Coordinar proveedores, materiales, permisos y logística del evento', 'alta', 7, 'Productor Audiovisual', 2),
('tpl1503', 'svc15', 'Ejecución de activación', 'Ejecutar la activación en punto de venta, evento o vía pública', 'alta', 10, 'Productor Audiovisual', 3),
('tpl1504', 'svc15', 'Reporte de resultados', 'Medir impacto, asistencia, interacciones y retorno de la activación', 'baja', 14, 'Community Manager', 4),

-- svc16: Material POP
('tpl1601', 'svc16', 'Diseño de material', 'Diseñar displays, exhibidores, colgantes y material punto de venta', 'alta', 3, 'Diseñador Gráfico', 1),
('tpl1602', 'svc16', 'Presupuesto y producción', 'Cotizar con proveedores y coordinar producción del material POP', 'alta', 7, 'Diseñador Gráfico', 2),
('tpl1603', 'svc16', 'Distribución en punto de venta', 'Distribuir e instalar material en los puntos de venta asignados', 'media', 12, 'Diseñador Gráfico', 3),
('tpl1604', 'svc16', 'Monitoreo de exhibición', 'Verificar correcta exhibición y estado del material en tienda', 'baja', 30, 'Community Manager', 4);
