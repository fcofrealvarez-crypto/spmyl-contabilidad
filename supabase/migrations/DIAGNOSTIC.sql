-- ============================================================================
-- DIAGNÓSTICO: Verificar Políticas RLS y Datos
-- ============================================================================

-- 1. Verificar si las tablas existen
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('purchase_book', 'sales_book', 'companies', 'company_members')
ORDER BY table_name;

-- 2. Verificar políticas RLS activas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('purchase_book', 'sales_book')
ORDER BY tablename, policyname;

-- 3. Verificar si RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('purchase_book', 'sales_book');

-- 4. Verificar empresa y membresía
SELECT 
  c.id as company_id,
  c.name as company_name,
  cm.user_id,
  cm.role
FROM companies c
LEFT JOIN company_members cm ON c.id = cm.company_id;

-- 5. Intentar contar filas SIN filtros de RLS (como superusuario)
-- Esta query solo funciona si ejecutas como admin
SELECT 
  (SELECT COUNT(*) FROM purchase_book) as purchase_count,
  (SELECT COUNT(*) FROM sales_book) as sales_count;
