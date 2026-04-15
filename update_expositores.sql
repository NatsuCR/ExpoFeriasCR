-- Actualización de la tabla de expositores
-- Cambiar rubro por tipo_expositor y establecer 'Administración' como valor por defecto
ALTER TABLE expositores CHANGE rubro tipo_expositor VARCHAR(50) DEFAULT 'Administración';

-- Migrar datos existentes
UPDATE expositores SET tipo_expositor = 'Administración' WHERE tipo_expositor IS NULL OR tipo_expositor = '';

-- Actualización de la tabla de eventos
-- Agregar color personalizado para el buscador de expositores
ALTER TABLE eventos ADD COLUMN color_buscador_expositores VARCHAR(7) DEFAULT '#ffffff';
