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
-- FIN DE MIGRACIONES
-- ============================================
