-- ==========================================
-- MIGRACIONES - AUTENTICACIÓN Y EVENTOS DE USUARIO
-- Creado: 2026-04-12
-- Actualizado: 2026-04-13 (Workflow de edición para eventos aprobados)
-- ==========================================

-- ============================================
-- 1. MODIFICAR TABLA EVENTOS
-- ============================================

ALTER TABLE `eventos` ADD COLUMN `usuario_id` INT DEFAULT NULL AFTER `id`;
ALTER TABLE `eventos` ADD COLUMN `estado` VARCHAR(20) DEFAULT 'aprobado' AFTER `usuario_id`;
ALTER TABLE `eventos` ADD COLUMN `razon_rechazo` TEXT DEFAULT NULL AFTER `estado`;
ALTER TABLE `eventos` ADD COLUMN `fecha_envio_revision` DATETIME DEFAULT NULL AFTER `razon_rechazo`;
ALTER TABLE `eventos` ADD CONSTRAINT `fk_eventos_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

-- Crear coluna de token confirmacion email
ALTER TABLE `usuarios` ADD COLUMN `email_verificado` TINYINT(1) DEFAULT 0 AFTER `activo`;
ALTER TABLE `usuarios` ADD COLUMN `token_verificacion` VARCHAR(255) DEFAULT NULL AFTER `email_verificado`;
ALTER TABLE `usuarios` MODIFY `rol` VARCHAR(20) DEFAULT 'user';

-- ============================================
-- 2. CREAR TABLA PASSWORD_RESETS
-- ============================================

CREATE TABLE IF NOT EXISTS `password_resets` (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `usuario_id` INT(11) NOT NULL,
  `codigo_reset` VARCHAR(6) NOT NULL,
  `expira_en` DATETIME NOT NULL,
  `usado` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  KEY `idx_usuario_codigo` (`usuario_id`, `codigo_reset`),
  KEY `idx_expira` (`expira_en`)
);

-- ============================================
-- 3. ACTUALIZAR EVENTOS EXISTENTES
-- ============================================

-- Marcar eventos existentes como aprobados (creados por admin = NULL en usuario_id)
UPDATE `eventos` SET `estado` = 'aprobado', `activo` = 1 WHERE `usuario_id` IS NULL;

-- ============================================
-- 4. ÍNDICES ADICIONALES
-- ============================================

ALTER TABLE `eventos` ADD KEY `idx_usuario_estado` (`usuario_id`, `estado`);
ALTER TABLE `eventos` ADD KEY `idx_estado_activo` (`estado`, `activo`);
ALTER TABLE `eventos` ADD KEY `idx_fecha_envio_revision` (`fecha_envio_revision`);
ALTER TABLE `usuarios` ADD KEY `idx_rol` (`rol`);
ALTER TABLE `usuarios` ADD KEY `idx_email_verificado` (`email`, `email_verificado`);

-- ============================================
-- 5. AGREGAR COLUMNAS DE COLORES ADICIONALES
-- ============================================

-- Agregar nuevos campos de color a la tabla eventos (updateado 2026-04-14)
-- Usando IF NOT EXISTS para evitar errores si ya existen
ALTER TABLE `eventos` ADD COLUMN IF NOT EXISTS `color_texto` VARCHAR(7) DEFAULT '#2c1a0e' AFTER `color_fondo`;
ALTER TABLE `eventos` ADD COLUMN IF NOT EXISTS `color_hero_overlay` VARCHAR(50) DEFAULT 'rgba(62,42,31,0.7)' AFTER `color_texto`;
ALTER TABLE `eventos` ADD COLUMN IF NOT EXISTS `color_titulo_seccion` VARCHAR(7) DEFAULT '#2c1a0e' AFTER `color_hero_overlay`;
ALTER TABLE `eventos` ADD COLUMN IF NOT EXISTS `color_fondo_fechas` VARCHAR(7) DEFAULT '#d4a373' AFTER `color_descripcion_hero`;
ALTER TABLE `eventos` ADD COLUMN IF NOT EXISTS `color_texto_fechas` VARCHAR(7) DEFAULT '#8b5a2b' AFTER `color_fondo_fechas`;
ALTER TABLE `eventos` ADD COLUMN IF NOT EXISTS `color_menu_fondo` VARCHAR(7) DEFAULT '#ffffff' AFTER `color_texto_fechas`;
ALTER TABLE `eventos` ADD COLUMN IF NOT EXISTS `color_menu_texto` VARCHAR(7) DEFAULT '#ffffff' AFTER `color_menu_fondo`;
ALTER TABLE `eventos` ADD COLUMN IF NOT EXISTS `color_menu_fondo_hover` VARCHAR(7) DEFAULT '' AFTER `color_menu_texto`;
ALTER TABLE `eventos` ADD COLUMN IF NOT EXISTS `color_menu_texto_hover` VARCHAR(7) DEFAULT '' AFTER `color_menu_fondo_hover`;
ALTER TABLE `eventos` ADD COLUMN IF NOT EXISTS `color_titulo_h3` VARCHAR(7) DEFAULT '#2c1a0e' AFTER `color_menu_texto_hover`;
ALTER TABLE `eventos` ADD COLUMN IF NOT EXISTS `color_fondo_contacto` VARCHAR(7) DEFAULT '#f4e4c1' AFTER `color_titulo_h3`;
ALTER TABLE `eventos` ADD COLUMN IF NOT EXISTS `color_texto_contacto` VARCHAR(7) DEFAULT '#2c1a0e' AFTER `color_fondo_contacto`;
ALTER TABLE `eventos` ADD COLUMN IF NOT EXISTS `color_enlace_contacto` VARCHAR(7) DEFAULT '#8b5a2b' AFTER `color_texto_contacto`;
ALTER TABLE `eventos` ADD COLUMN IF NOT EXISTS `color_texto_footer` VARCHAR(7) DEFAULT '#ffffff' AFTER `color_fondo_footer`;

-- ============================================
-- FIN DE MIGRACIONES
-- ============================================
