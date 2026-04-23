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
INSERT INTO "TaskTemplate" ("id", "serviceId", "title", "description", "priority", "deadlineDays", "role", "order") VALUES
-- svc01: Community Management
('tpl0101', 'svc01', 'Investigación de audiencia', 'Analizar público objetivo, competencia y tendencias del sector', 'alta', 2, 'Community Manager', 1),
('tpl0102', 'svc01', 'Calendario editorial', 'Planificar contenido mensual para redes sociales', 'alta', 3, 'Community Manager', 2),
('tpl0103', 'svc01', 'Diseño de piezas gráficas', 'Crear imágenes y videos para publicaciones', 'media', 5, 'Diseñador Gráfico', 3),
('tpl0104', 'svc01', 'Publicación y programación', 'Programar y publicar contenido en redes', 'media', 7, 'Community Manager', 4),
('tpl0105', 'svc01', 'Reporte mensual', 'Elaborar reporte de métricas y resultados', 'baja', 30, 'Community Manager', 5),

-- svc02: Diseño Gráfico
('tpl0201', 'svc02', 'Brief creativo', 'Recopilar requerimientos y referencias del cliente', 'alta', 1, 'Diseñador Gráfico', 1),
('tpl0202', 'svc02', 'Propuestas de diseño', 'Crear 2-3 propuestas de diseño inicial', 'alta', 5, 'Diseñador Gráfico', 2),
('tpl0203', 'svc02', 'Revisiones y ajustes', 'Aplicar correcciones del cliente', 'media', 8, 'Diseñador Gráfico', 3),
('tpl0204', 'svc02', 'Entrega final de archivos', 'Preparar archivos finales en todos los formatos', 'media', 10, 'Diseñador Gráfico', 4),

-- svc03: Desarrollo Web
('tpl0301', 'svc03', 'Wireframes y estructura', 'Definir arquitectura y wireframes del sitio', 'alta', 3, 'Desarrollador Web', 1),
('tpl0302', 'svc03', 'Diseño UI/UX', 'Diseñar la interfaz visual del sitio', 'alta', 7, 'Diseñador UI/UX', 2),
('tpl0303', 'svc03', 'Desarrollo frontend', 'Codificar el frontend del sitio web', 'alta', 14, 'Desarrollador Web', 3),
('tpl0304', 'svc03', 'Desarrollo backend', 'Implementar funcionalidades del lado del servidor', 'alta', 18, 'Desarrollador Web', 4),
('tpl0305', 'svc03', 'Pruebas y lanzamiento', 'Testing, optimización y despliegue', 'media', 21, 'Desarrollador Web', 5),

-- svc04: Producción Audiovisual
('tpl0401', 'svc04', 'Guion y storyboard', 'Desarrollar guion y storyboard del video', 'alta', 3, 'Productor Audiovisual', 1),
('tpl0402', 'svc04', 'Planificación de grabación', 'Coordinar locación, talentos y equipo', 'alta', 5, 'Productor Audiovisual', 2),
('tpl0403', 'svc04', 'Grabación', 'Sesión de grabación del contenido audiovisual', 'alta', 8, 'Productor Audiovisual', 3),
('tpl0404', 'svc04', 'Edición y postproducción', 'Editar el material y agregar efectos', 'media', 14, 'Editor de Video', 4),
('tpl0405', 'svc04', 'Entrega final', 'Exportar en formatos requeridos y entregar', 'baja', 16, 'Productor Audiovisual', 5),

-- svc05: SEO
('tpl0501', 'svc05', 'Auditoría SEO inicial', 'Análisis completo del sitio actual', 'alta', 3, 'Especialista SEO', 1),
('tpl0502', 'svc05', 'Investigación de keywords', 'Identificar palabras clave objetivo', 'alta', 5, 'Especialista SEO', 2),
('tpl0503', 'svc05', 'Optimización on-page', 'Aplicar mejoras en meta tags, contenido y estructura', 'media', 10, 'Especialista SEO', 3),
('tpl0504', 'svc05', 'Estrategia de contenidos SEO', 'Planificar contenido optimizado para posicionamiento', 'media', 14, 'Especialista SEO', 4),

-- svc06: Campañas Publicitarias
('tpl0601', 'svc06', 'Estrategia de campaña', 'Definir objetivos, público y presupuesto', 'alta', 2, 'Media Planner', 1),
('tpl0602', 'svc06', 'Creación de anuncios', 'Diseñar y redactar los anuncios', 'alta', 5, 'Diseñador Gráfico', 2),
('tpl0603', 'svc06', 'Configuración de plataformas', 'Configurar campañas en Meta Ads, Google Ads', 'alta', 6, 'Media Planner', 3),
('tpl0604', 'svc06', 'Monitoreo y optimización', 'Supervisar rendimiento y optimizar', 'media', 30, 'Media Planner', 4),

-- svc07: Branding
('tpl0701', 'svc07', 'Investigación de marca', 'Analizar mercado, competencia y posicionamiento', 'alta', 3, 'Branding Strategist', 1),
('tpl0702', 'svc07', 'Identidad visual', 'Desarrollar logo, paleta de colores, tipografía', 'alta', 7, 'Diseñador Gráfico', 2),
('tpl0703', 'svc07', 'Manual de marca', 'Crear brandbook con normas de uso', 'media', 12, 'Branding Strategist', 3),
('tpl0704', 'svc07', 'Aplicaciones de marca', 'Diseñar aplicaciones en papelería y digital', 'media', 15, 'Diseñador Gráfico', 4),

-- svc08: Email Marketing
('tpl0801', 'svc08', 'Estrategia de email', 'Definir segmentación y flujo de emails', 'alta', 2, 'Email Marketing Specialist', 1),
('tpl0802', 'svc08', 'Diseño de plantillas', 'Crear plantillas de email responsivas', 'alta', 5, 'Diseñador Gráfico', 2),
('tpl0803', 'svc08', 'Redacción de contenido', 'Escribir copys para cada email', 'media', 7, 'Copywriter', 3),
('tpl0804', 'svc08', 'Configuración y envío', 'Configurar automatizaciones y envíos', 'media', 10, 'Email Marketing Specialist', 4),

-- svc09: Fotografía
('tpl0901', 'svc09', 'Brief fotográfico', 'Definir estilo, locaciones y productos a fotografiar', 'alta', 2, 'Fotógrafo', 1),
('tpl0902', 'svc09', 'Sesión fotográfica', 'Realizar la sesión de fotos', 'alta', 5, 'Fotógrafo', 2),
('tpl0903', 'svc09', 'Selección y edición', 'Seleccionar las mejores tomas y editar', 'media', 8, 'Fotógrafo', 3),
('tpl0904', 'svc09', 'Entrega de galería', 'Preparar galería final y entregar archivos', 'baja', 10, 'Fotógrafo', 4),

-- svc10: Gestión de Influencers
('tpl1001', 'svc10', 'Identificación de influencers', 'Buscar y evaluar influencers afines a la marca', 'alta', 3, 'Influencer Manager', 1),
('tpl1002', 'svc10', 'Negociación y contratos', 'Coordinar términos y contratos con influencers', 'alta', 7, 'Influencer Manager', 2),
('tpl1003', 'svc10', 'Seguimiento de contenido', 'Supervisar creación y publicación de contenido', 'media', 14, 'Influencer Manager', 3),
('tpl1004', 'svc10', 'Reporte de resultados', 'Medir impacto y ROI de las colaboraciones', 'baja', 30, 'Influencer Manager', 4),

-- svc11: Marketing de Contenidos
('tpl1101', 'svc11', 'Estrategia de contenidos', 'Definir pillar content y calendario', 'alta', 3, 'Content Strategist', 1),
('tpl1102', 'svc11', 'Redacción de artículos', 'Escribir artículos y posts del blog', 'alta', 7, 'Copywriter', 2),
('tpl1103', 'svc11', 'Diseño de piezas', 'Crear infografías y recursos visuales', 'media', 10, 'Diseñador Gráfico', 3),
('tpl1104', 'svc11', 'Distribución y promoción', 'Publicar y promover contenido en canales', 'media', 12, 'Community Manager', 4),

-- svc12: Analytics y Reporting
('tpl1201', 'svc12', 'Configuración de herramientas', 'Set up Google Analytics, Tag Manager, etc.', 'alta', 2, 'Analista de Datos', 1),
('tpl1202', 'svc12', 'Definición de KPIs', 'Establecer métricas clave del negocio', 'alta', 4, 'Analista de Datos', 2),
('tpl1203', 'svc12', 'Dashboard de métricas', 'Crear dashboard con datos en tiempo real', 'media', 7, 'Analista de Datos', 3),
('tpl1204', 'svc12', 'Reporte de insights', 'Elaborar reporte con hallazgos y recomendaciones', 'baja', 30, 'Analista de Datos', 4),

-- svc13: Gestión de Redes Sociales
('tpl1301', 'svc13', 'Auditoría de redes', 'Analizar presencia actual en redes sociales', 'alta', 2, 'Community Manager', 1),
('tpl1302', 'svc13', 'Estrategia social media', 'Definir tono, frecuencia y tipo de contenido', 'alta', 4, 'Community Manager', 2),
('tpl1303', 'svc13', 'Producción de contenido', 'Crear y diseñar publicaciones', 'media', 7, 'Diseñador Gráfico', 3),
('tpl1304', 'svc13', 'Gestión de comunidad', 'Responder comentarios y mensajes', 'media', 30, 'Community Manager', 4),

-- svc14: Consultoría Digital
('tpl1401', 'svc14', 'Diagnóstico digital', 'Evaluar presencia digital actual del negocio', 'alta', 2, 'Consultor Digital', 1),
('tpl1402', 'svc14', 'Plan de acción', 'Desarrollar estrategia y roadmap digital', 'alta', 5, 'Consultor Digital', 2),
('tpl1403', 'svc14', 'Sesiones de seguimiento', 'Monitorear avances y ajustar estrategia', 'media', 30, 'Consultor Digital', 3),

-- svc15: Gestión de Google Business
('tpl1501', 'svc15', 'Configuración del perfil', 'Crear/optimizar perfil de Google My Business', 'alta', 2, 'Especialista SEO', 1),
('tpl1502', 'svc15', 'Optimización de ficha', 'Completar toda la información y fotos', 'alta', 4, 'Especialista SEO', 2),
('tpl1503', 'svc15', 'Gestión de reseñas', 'Estrategia para obtener y responder reseñas', 'media', 14, 'Community Manager', 3),

-- svc16: E-commerce
('tpl1601', 'svc16', 'Configuración de plataforma', 'Set up tienda online (Shopify/WooCommerce)', 'alta', 3, 'Desarrollador Web', 1),
('tpl1602', 'svc16', 'Carga de productos', 'Ingresar catálogo de productos con fotos', 'alta', 7, 'Desarrollador Web', 2),
('tpl1603', 'svc16', 'Pasarela de pagos', 'Configurar métodos de pago', 'alta', 10, 'Desarrollador Web', 3),
('tpl1604', 'svc16', 'Diseño de tienda', 'Personalizar tema y experiencia de compra', 'media', 12, 'Diseñador UI/UX', 4),
('tpl1605', 'svc16', 'Pruebas y lanzamiento', 'Testear flujo de compra completo', 'media', 14, 'Desarrollador Web', 5);
