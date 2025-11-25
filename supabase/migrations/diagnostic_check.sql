-- ============================================================================
-- Script de Diagnóstico - Verificar estructura de tablas existentes
-- ============================================================================

-- Ver todas las tablas en el esquema public
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Ver columnas de la tabla transactions (si existe)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'transactions'
ORDER BY ordinal_position;

-- Ver columnas de la tabla iva_records (si existe)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'iva_records'
ORDER BY ordinal_position;

-- Ver columnas de la tabla obligations (si existe)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'obligations'
ORDER BY ordinal_position;

-- Ver columnas de la tabla soporte (si existe)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'soporte'
ORDER BY ordinal_position;

-- Ver columnas de la tabla usuarios (si existe)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'usuarios'
ORDER BY ordinal_position;
