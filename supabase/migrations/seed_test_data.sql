-- ============================================================================
-- SPMYL Contabilidad - Datos de Prueba
-- Creado: 2025-11-24
-- Descripción: Script para poblar la base de datos con datos de prueba realistas
-- ============================================================================

-- NOTA: Este script asume que ya tienes un usuario autenticado
-- Reemplaza 'YOUR_USER_ID' con el ID de tu usuario de Supabase

-- Obtener el ID del usuario actual (fcofrealvarez@gmail.com)
-- Ejecuta primero esta consulta para obtener tu user_id:
-- SELECT id FROM auth.users WHERE email = 'fcofrealvarez@gmail.com';

-- Para este ejemplo, vamos a usar una variable
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Obtener el ID del usuario
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE email = 'fcofrealvarez@gmail.com';

  -- Si no se encuentra el usuario, salir
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no encontrado. Asegúrate de que fcofrealvarez@gmail.com existe en auth.users';
  END IF;

  -- ============================================================================
  -- TRANSACCIONES DE PRUEBA
  -- ============================================================================
  
  -- Ingresos del mes actual
  INSERT INTO public.transactions (usuario_id, type, category, description, amount, date, document) VALUES
  (v_user_id, 'Ingreso', 'Ventas', 'Venta de servicios de consultoría - Cliente A', 1500000.00, CURRENT_DATE - INTERVAL '5 days', 'FAC-001'),
  (v_user_id, 'Ingreso', 'Ventas', 'Venta de productos - Cliente B', 850000.00, CURRENT_DATE - INTERVAL '10 days', 'FAC-002'),
  (v_user_id, 'Ingreso', 'Ventas', 'Servicios de desarrollo web', 2300000.00, CURRENT_DATE - INTERVAL '15 days', 'FAC-003'),
  (v_user_id, 'Ingreso', 'Ventas', 'Mantenimiento mensual - Cliente C', 450000.00, CURRENT_DATE - INTERVAL '3 days', 'FAC-004'),
  (v_user_id, 'Ingreso', 'Otros Ingresos', 'Intereses bancarios', 25000.00, CURRENT_DATE - INTERVAL '1 day', NULL);

  -- Gastos del mes actual
  INSERT INTO public.transactions (usuario_id, type, category, description, amount, date, document) VALUES
  (v_user_id, 'Gasto', 'Servicios', 'Hosting y dominio web', 45000.00, CURRENT_DATE - INTERVAL '7 days', 'COMP-001'),
  (v_user_id, 'Gasto', 'Servicios', 'Internet y telefonía', 35000.00, CURRENT_DATE - INTERVAL '12 days', 'COMP-002'),
  (v_user_id, 'Gasto', 'Suministros', 'Material de oficina', 78000.00, CURRENT_DATE - INTERVAL '8 days', 'COMP-003'),
  (v_user_id, 'Gasto', 'Servicios', 'Servicios contables', 150000.00, CURRENT_DATE - INTERVAL '4 days', 'COMP-004'),
  (v_user_id, 'Gasto', 'Arriendo', 'Arriendo oficina', 500000.00, CURRENT_DATE - INTERVAL '2 days', 'COMP-005'),
  (v_user_id, 'Gasto', 'Sueldos', 'Sueldo empleado 1', 650000.00, CURRENT_DATE - INTERVAL '1 day', NULL),
  (v_user_id, 'Gasto', 'Sueldos', 'Sueldo empleado 2', 550000.00, CURRENT_DATE - INTERVAL '1 day', NULL),
  (v_user_id, 'Gasto', 'Servicios', 'Electricidad', 85000.00, CURRENT_DATE - INTERVAL '6 days', 'COMP-006');

  -- Transacciones del mes anterior
  INSERT INTO public.transactions (usuario_id, type, category, description, amount, date, document) VALUES
  (v_user_id, 'Ingreso', 'Ventas', 'Venta de servicios - Cliente D', 1200000.00, CURRENT_DATE - INTERVAL '35 days', 'FAC-005'),
  (v_user_id, 'Ingreso', 'Ventas', 'Proyecto especial', 3500000.00, CURRENT_DATE - INTERVAL '40 days', 'FAC-006'),
  (v_user_id, 'Gasto', 'Servicios', 'Publicidad en redes sociales', 250000.00, CURRENT_DATE - INTERVAL '38 days', 'COMP-007'),
  (v_user_id, 'Gasto', 'Arriendo', 'Arriendo oficina', 500000.00, CURRENT_DATE - INTERVAL '32 days', 'COMP-008');

  -- ============================================================================
  -- REGISTROS DE IVA
  -- ============================================================================
  
  -- IVA del mes actual
  INSERT INTO public.iva_records (
    usuario_id, 
    periodo, 
    ventas_netas, 
    iva_ventas, 
    compras_netas, 
    iva_compras, 
    credito_fiscal, 
    debito_fiscal, 
    pagar, 
    favor
  ) VALUES (
    v_user_id,
    TO_CHAR(CURRENT_DATE, 'YYYY-MM'),
    5125000.00,  -- Total ventas netas
    973750.00,   -- IVA ventas (19%)
    2093000.00,  -- Total compras netas
    397670.00,   -- IVA compras (19%)
    397670.00,   -- Crédito fiscal
    973750.00,   -- Débito fiscal
    576080.00,   -- A pagar (débito - crédito)
    0.00         -- A favor
  );

  -- IVA del mes anterior
  INSERT INTO public.iva_records (
    usuario_id, 
    periodo, 
    ventas_netas, 
    iva_ventas, 
    compras_netas, 
    iva_compras, 
    credito_fiscal, 
    debito_fiscal, 
    pagar, 
    favor
  ) VALUES (
    v_user_id,
    TO_CHAR(CURRENT_DATE - INTERVAL '1 month', 'YYYY-MM'),
    4700000.00,
    893000.00,
    750000.00,
    142500.00,
    142500.00,
    893000.00,
    750500.00,
    0.00
  );

  -- ============================================================================
  -- OBLIGACIONES TRIBUTARIAS
  -- ============================================================================
  
  -- Obligaciones pendientes
  INSERT INTO public.obligations (usuario_id, title, description, amount, due_date, status, priority, category) VALUES
  (v_user_id, 'Declaración IVA Noviembre 2025', 'Declaración mensual de IVA correspondiente a noviembre', 576080.00, CURRENT_DATE + INTERVAL '10 days', 'pending', 'high', 'IVA'),
  (v_user_id, 'Pago Patente Municipal', 'Pago anual de patente municipal', 350000.00, CURRENT_DATE + INTERVAL '15 days', 'pending', 'medium', 'Patente'),
  (v_user_id, 'F29 - Retenciones', 'Declaración de retenciones de honorarios', 125000.00, CURRENT_DATE + INTERVAL '5 days', 'pending', 'high', 'Retenciones'),
  (v_user_id, 'Declaración Renta Anual', 'Declaración de renta año tributario 2025', NULL, CURRENT_DATE + INTERVAL '120 days', 'pending', 'medium', 'Renta');

  -- Obligaciones completadas
  INSERT INTO public.obligations (usuario_id, title, description, amount, due_date, status, priority, category) VALUES
  (v_user_id, 'Declaración IVA Octubre 2025', 'Declaración mensual de IVA correspondiente a octubre', 750500.00, CURRENT_DATE - INTERVAL '10 days', 'completed', 'high', 'IVA'),
  (v_user_id, 'Pago Previsión Empleados', 'Pago de AFP y salud empleados', 450000.00, CURRENT_DATE - INTERVAL '5 days', 'completed', 'high', 'Previsión');

  -- Obligaciones vencidas (para testing)
  INSERT INTO public.obligations (usuario_id, title, description, amount, due_date, status, priority, category) VALUES
  (v_user_id, 'Multa SII', 'Multa por declaración fuera de plazo', 50000.00, CURRENT_DATE - INTERVAL '3 days', 'overdue', 'high', 'Multas');

  -- ============================================================================
  -- TICKETS DE SOPORTE (OPCIONAL)
  -- ============================================================================
  
  INSERT INTO public.soporte (usuario_id, subject, message, status, priority) VALUES
  (v_user_id, 'Consulta sobre cálculo de IVA', 'Tengo dudas sobre cómo calcular el IVA para servicios exportados. ¿Podrían ayudarme?', 'open', 'medium'),
  (v_user_id, 'Error al generar reporte', 'Al intentar generar el reporte de transacciones del mes pasado, la aplicación se queda cargando.', 'in_progress', 'high'),
  (v_user_id, 'Solicitud de nueva funcionalidad', 'Sería útil poder exportar los reportes en formato Excel además de PDF.', 'open', 'low');

  RAISE NOTICE 'Datos de prueba insertados exitosamente para el usuario: %', v_user_id;
END $$;

-- ============================================================================
-- VERIFICACIÓN DE DATOS INSERTADOS
-- ============================================================================

-- Contar transacciones
SELECT 'Transacciones insertadas:' as tipo, COUNT(*) as cantidad 
FROM public.transactions 
WHERE usuario_id IN (SELECT id FROM auth.users WHERE email = 'fcofrealvarez@gmail.com');

-- Contar registros de IVA
SELECT 'Registros de IVA insertados:' as tipo, COUNT(*) as cantidad 
FROM public.iva_records 
WHERE usuario_id IN (SELECT id FROM auth.users WHERE email = 'fcofrealvarez@gmail.com');

-- Contar obligaciones
SELECT 'Obligaciones insertadas:' as tipo, COUNT(*) as cantidad 
FROM public.obligations 
WHERE usuario_id IN (SELECT id FROM auth.users WHERE email = 'fcofrealvarez@gmail.com');

-- Contar tickets de soporte
SELECT 'Tickets de soporte insertados:' as tipo, COUNT(*) as cantidad 
FROM public.soporte 
WHERE usuario_id IN (SELECT id FROM auth.users WHERE email = 'fcofrealvarez@gmail.com');

-- ============================================================================
-- RESUMEN FINANCIERO
-- ============================================================================

SELECT 
  'Resumen del mes actual' as descripcion,
  SUM(CASE WHEN type = 'Ingreso' THEN amount ELSE 0 END) as total_ingresos,
  SUM(CASE WHEN type = 'Gasto' THEN amount ELSE 0 END) as total_gastos,
  SUM(CASE WHEN type = 'Ingreso' THEN amount ELSE -amount END) as utilidad_neta
FROM public.transactions
WHERE usuario_id IN (SELECT id FROM auth.users WHERE email = 'fcofrealvarez@gmail.com')
  AND date >= DATE_TRUNC('month', CURRENT_DATE);
