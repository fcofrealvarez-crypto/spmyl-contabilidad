-- ============================================================================
-- LIMPIEZA SIMPLE DE BASE DE DATOS
-- ============================================================================

-- Eliminar tablas en orden (por dependencias)
DROP TABLE IF EXISTS public.journal_entry_lines CASCADE;
DROP TABLE IF EXISTS public.journal_entries CASCADE;
DROP TABLE IF EXISTS public.purchase_book CASCADE;
DROP TABLE IF EXISTS public.sales_book CASCADE;
DROP TABLE IF EXISTS public.chart_of_accounts CASCADE;
DROP TABLE IF EXISTS public.company_members CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;
DROP TABLE IF EXISTS public.asientos_contables CASCADE;
DROP TABLE IF EXISTS public.cuentas CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.iva_records CASCADE;
DROP TABLE IF EXISTS public.obligations CASCADE;
DROP TABLE IF EXISTS public.soporte CASCADE;
DROP TABLE IF EXISTS public.usuarios CASCADE;

-- Eliminar funciones
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- ============================================================================
-- ✅ LIMPIEZA COMPLETADA
-- Siguiente: Ejecuta 00_MASTER_MIGRATION.sql
-- ============================================================================
