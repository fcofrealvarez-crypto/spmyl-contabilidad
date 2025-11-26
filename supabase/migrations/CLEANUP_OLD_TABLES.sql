-- ============================================================================
-- LIMPIEZA DE TABLAS OBSOLETAS
-- ============================================================================
-- Este script elimina tablas viejas que ya no se usan
-- Mantiene solo las tablas actuales del sistema de contabilidad
-- ============================================================================

-- Eliminar tablas obsoletas (en orden para evitar errores de dependencias)
DROP TABLE IF EXISTS public.asientos_contables CASCADE;
DROP TABLE IF EXISTS public.cuentas CASCADE;
DROP TABLE IF EXISTS public.clientes CASCADE;
DROP TABLE IF EXISTS public.iva_records CASCADE;
DROP TABLE IF EXISTS public.libro_compras CASCADE;
DROP TABLE IF EXISTS public.libro_contable CASCADE;
DROP TABLE IF EXISTS public.libro_ventas CASCADE;
DROP TABLE IF EXISTS public.movimientos CASCADE;
DROP TABLE IF EXISTS public.obligations CASCADE;
DROP TABLE IF EXISTS public.resumen CASCADE;
DROP TABLE IF EXISTS public.resumen_contable CASCADE;
DROP TABLE IF EXISTS public.soporte CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.usuarios CASCADE;

-- ============================================================================
-- ✅ TABLAS QUE SE MANTIENEN (NO SE TOCAN):
-- ============================================================================
-- ✓ companies                - Empresas del sistema (multi-tenant)
-- ✓ company_members          - Miembros de cada empresa
-- ✓ chart_of_accounts        - Plan de cuentas contables
-- ✓ journal_entries          - Asientos contables (cabecera)
-- ✓ journal_entry_lines      - Líneas de asientos contables
-- ✓ purchase_book            - Libro de compras (103 registros)
-- ✓ sales_book               - Libro de ventas (20 registros)
-- ============================================================================

-- Verificar tablas restantes
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================================================
-- LIMPIEZA COMPLETADA
-- ============================================================================
-- Las tablas obsoletas han sido eliminadas
-- El sistema ahora está más limpio y organizado
-- ============================================================================
