-- ============================================================================
-- SPMYL CONTABILIDAD - MIGRACIÓN MAESTRA COMPLETA
-- ============================================================================
-- Este archivo ejecuta TODAS las migraciones necesarias en el orden correcto
-- y configura tu empresa con los datos reales
-- ============================================================================

-- PASO 1: Crear función helper para timestamps (se usa en todas las migraciones)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- MIGRACIÓN 1: Tablas Básicas de Contabilidad
-- ============================================================================

-- Tabla: cuentas
CREATE TABLE IF NOT EXISTS public.cuentas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  descripcion TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('1 - Act', '2 - Pas', '3 - Pat', '4 - Ing', '5 - Cto', '6 - Gto', '7 - Gto')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla: asientos_contables
CREATE TABLE IF NOT EXISTS public.asientos_contables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  numero_comprobante TEXT,
  tipo_comprobante TEXT NOT NULL CHECK (tipo_comprobante IN ('TRASPASO', 'EGRESO', 'INGRESO')),
  fecha DATE NOT NULL,
  mes INTEGER,
  codigo_cuenta TEXT NOT NULL,
  cuenta_descripcion TEXT NOT NULL,
  glosa TEXT,
  debe DECIMAL(15, 2) DEFAULT 0,
  haber DECIMAL(15, 2) DEFAULT 0,
  control DECIMAL(15, 2),
  compensacion DECIMAL(15, 2),
  tipo_documento TEXT,
  numero_documento TEXT,
  rut TEXT,
  nombre TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS para tabla cuentas
ALTER TABLE public.cuentas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Las cuentas son visibles para usuarios autenticados" ON public.cuentas;
CREATE POLICY "Las cuentas son visibles para usuarios autenticados" ON public.cuentas FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Solo usuarios autenticados pueden crear cuentas" ON public.cuentas;
CREATE POLICY "Solo usuarios autenticados pueden crear cuentas" ON public.cuentas FOR INSERT TO authenticated WITH CHECK (true);

-- RLS para asientos_contables
ALTER TABLE public.asientos_contables ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Los usuarios pueden ver sus propios asientos" ON public.asientos_contables;
CREATE POLICY "Los usuarios pueden ver sus propios asientos" ON public.asientos_contables FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Los usuarios pueden crear sus propios asientos" ON public.asientos_contables;
CREATE POLICY "Los usuarios pueden crear sus propios asientos" ON public.asientos_contables FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Trigger para timestamps
DROP TRIGGER IF EXISTS update_asientos_contables_updated_at ON public.asientos_contables;
CREATE TRIGGER update_asientos_contables_updated_at BEFORE UPDATE ON public.asientos_contables FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Índices
CREATE INDEX IF NOT EXISTS idx_asientos_fecha ON public.asientos_contables(fecha);
CREATE INDEX IF NOT EXISTS idx_asientos_user_id ON public.asientos_contables(user_id);
CREATE INDEX IF NOT EXISTS idx_cuentas_codigo ON public.cuentas(codigo);

-- ============================================================================
-- MIGRACIÓN 2: Tablas Complementarias
-- ============================================================================

-- Tabla: transactions
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('Ingreso', 'Gasto')),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  date DATE NOT NULL,
  document TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla: iva_records
CREATE TABLE IF NOT EXISTS public.iva_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  periodo TEXT NOT NULL,
  ventas_netas DECIMAL(15, 2) DEFAULT 0,
  iva_ventas DECIMAL(15, 2) DEFAULT 0,
  compras_netas DECIMAL(15, 2) DEFAULT 0,
  iva_compras DECIMAL(15, 2) DEFAULT 0,
  credito_fiscal DECIMAL(15, 2) DEFAULT 0,
  debito_fiscal DECIMAL(15, 2) DEFAULT 0,
  pagar DECIMAL(15, 2) DEFAULT 0,
  favor DECIMAL(15, 2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, periodo)
);

-- Tabla: obligations
CREATE TABLE IF NOT EXISTS public.obligations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(15, 2),
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla: soporte
CREATE TABLE IF NOT EXISTS public.soporte (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla: usuarios (perfil extendido)
CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE UNIQUE,
  email TEXT NOT NULL,
  nombre TEXT,
  empresa TEXT,
  rut TEXT,
  telefono TEXT,
  direccion TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS y Políticas
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iva_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obligations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soporte ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
CREATE POLICY "Users can view their own transactions" ON public.transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create their own transactions" ON public.transactions;
CREATE POLICY "Users can create their own transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own profile" ON public.usuarios;
CREATE POLICY "Users can view their own profile" ON public.usuarios FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create their own profile" ON public.usuarios;
CREATE POLICY "Users can create their own profile" ON public.usuarios FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Triggers
DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.transactions;
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Función para crear perfil automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (user_id, email) VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Índices
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_user_id ON public.usuarios(user_id);

-- ============================================================================
-- MIGRACIÓN 3: Sistema Multi-Empresa (Companies)
-- ============================================================================

-- Tabla: companies
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  rut TEXT UNIQUE,
  address TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla: company_members (relación usuarios-empresas)
CREATE TABLE IF NOT EXISTS public.company_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'accountant', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, user_id)
);

-- RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view companies they belong to" ON public.companies;
CREATE POLICY "Users can view companies they belong to" ON public.companies FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.company_members WHERE company_members.company_id = companies.id AND company_members.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can view their company memberships" ON public.company_members;
CREATE POLICY "Users can view their company memberships" ON public.company_members FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Triggers
DROP TRIGGER IF EXISTS update_companies_updated_at ON public.companies;
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Índices
CREATE INDEX IF NOT EXISTS idx_company_members_company_id ON public.company_members(company_id);
CREATE INDEX IF NOT EXISTS idx_company_members_user_id ON public.company_members(user_id);

-- ============================================================================
-- MIGRACIÓN 4: Tablas de Contabilidad Real (ERP)
-- ============================================================================

-- Tabla: chart_of_accounts (Plan de Cuentas)
CREATE TABLE IF NOT EXISTS public.chart_of_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('ACTIVO', 'PASIVO', 'PATRIMONIO', 'INGRESO', 'EGRESO', 'RESULTADO')),
  parent_code TEXT,
  level INTEGER NOT NULL DEFAULT 1,
  is_detail BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Tabla: journal_entries (Asientos Contables - Cabecera)
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies ON DELETE CASCADE,
  entry_number TEXT NOT NULL,
  entry_type TEXT NOT NULL,
  entry_date DATE NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  description TEXT,
  gloss TEXT,
  document_type TEXT,
  document_number TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'POSTED', 'VOID')),
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, entry_number)
);

-- Tabla: journal_entry_lines (Líneas de Asientos)
CREATE TABLE IF NOT EXISTS public.journal_entry_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id UUID NOT NULL REFERENCES public.journal_entries ON DELETE CASCADE,
  account_code TEXT NOT NULL,
  account_name TEXT NOT NULL,
  debit DECIMAL(15,2) NOT NULL DEFAULT 0 CHECK (debit >= 0),
  credit DECIMAL(15,2) NOT NULL DEFAULT 0 CHECK (credit >= 0),
  control DECIMAL(15,2),
  compensation DECIMAL(15,2),
  third_party_rut TEXT,
  third_party_name TEXT,
  line_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT debit_or_credit_check CHECK ((debit > 0 AND credit = 0) OR (credit > 0 AND debit = 0))
);

-- Tabla: purchase_book (Libro de Compras)
CREATE TABLE IF NOT EXISTS public.purchase_book (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  line_number INTEGER NOT NULL,
  document_type TEXT NOT NULL,
  purchase_type TEXT NOT NULL,
  supplier_rut TEXT NOT NULL,
  supplier_name TEXT NOT NULL,
  folio TEXT NOT NULL,
  document_date DATE NOT NULL,
  reception_date DATE,
  acknowledgment_date DATE,
  exempt_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  net_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  iva_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  fixed_asset_amount DECIMAL(15,2) DEFAULT 0,
  non_recoverable_iva DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, year, month, line_number)
);

-- Tabla: sales_book (Libro de Ventas)
CREATE TABLE IF NOT EXISTS public.sales_book (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  line_number INTEGER NOT NULL,
  document_type TEXT NOT NULL,
  sale_type TEXT NOT NULL,
  customer_rut TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  folio TEXT NOT NULL,
  issue_date DATE NOT NULL,
  exempt_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  net_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  iva_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, year, month, line_number)
);

-- RLS para tablas ERP
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entry_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_book ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_book ENABLE ROW LEVEL SECURITY;

-- Políticas simplificadas (pueden ver miembros de la empresa)
DROP POLICY IF EXISTS "Users can view chart of accounts for their companies" ON public.chart_of_accounts;
CREATE POLICY "Users can view chart of accounts for their companies" ON public.chart_of_accounts FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.company_members WHERE company_members.company_id = chart_of_accounts.company_id AND company_members.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can view purchase book for their companies" ON public.purchase_book;
CREATE POLICY "Users can view purchase book for their companies" ON public.purchase_book FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.company_members WHERE company_members.company_id = purchase_book.company_id AND company_members.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can view sales book for their companies" ON public.sales_book;
CREATE POLICY "Users can view sales book for their companies" ON public.sales_book FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.company_members WHERE company_members.company_id = sales_book.company_id AND company_members.user_id = auth.uid())
);

-- Triggers
DROP TRIGGER IF EXISTS update_chart_of_accounts_updated_at ON public.chart_of_accounts;
CREATE TRIGGER update_chart_of_accounts_updated_at BEFORE UPDATE ON public.chart_of_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_purchase_book_updated_at ON public.purchase_book;
CREATE TRIGGER update_purchase_book_updated_at BEFORE UPDATE ON public.purchase_book FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_sales_book_updated_at ON public.sales_book;
CREATE TRIGGER update_sales_book_updated_at BEFORE UPDATE ON public.sales_book FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Índices
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_company_id ON public.chart_of_accounts(company_id);
CREATE INDEX IF NOT EXISTS idx_purchase_book_company_id ON public.purchase_book(company_id);
CREATE INDEX IF NOT EXISTS idx_purchase_book_date ON public.purchase_book(document_date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_book_company_id ON public.sales_book(company_id);
CREATE INDEX IF NOT EXISTS idx_sales_book_date ON public.sales_book(issue_date DESC);

-- ============================================================================
-- CONFIGURACIÓN INICIAL: Crear Empresa y Vincular Usuario
-- ============================================================================

-- Paso 1: Buscar el usuario por email
DO $$
DECLARE
  v_user_id UUID;
  v_company_id UUID;
  v_existing_company_id UUID;
BEGIN
  -- Buscar usuario
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'fcofrealvarez@gmail.com' LIMIT 1;
  
  IF v_user_id IS NULL THEN
    RAISE NOTICE 'Usuario no encontrado. Debes registrarte primero en la aplicación.';
  ELSE
    -- Verificar si ya tiene una empresa
    SELECT cm.company_id INTO v_existing_company_id 
    FROM public.company_members cm
    WHERE cm.user_id = v_user_id 
    LIMIT 1;
    
    IF v_existing_company_id IS NOT NULL THEN
      RAISE NOTICE 'El usuario ya tiene una empresa con ID: %', v_existing_company_id;
      RAISE NOTICE 'Usa este ID para reemplazar {{COMPANY_ID}} en el archivo de datos';
    ELSE
      -- Crear empresa nueva
      INSERT INTO public.companies (name, rut, email)
      VALUES ('MI EMPRESA', NULL, 'fcofrealvarez@gmail.com')
      RETURNING id INTO v_company_id;
      
      -- Vincular usuario como owner
      INSERT INTO public.company_members (company_id, user_id, role)
      VALUES (v_company_id, v_user_id, 'owner');
      
      RAISE NOTICE 'Empresa creada con ID: %', v_company_id;
      RAISE NOTICE 'Usuario vinculado como OWNER';
    END IF;
  END IF;
END $$;

-- ============================================================================
-- FINALIZADO
-- ============================================================================
-- ✅ Todas las migraciones ejecutadas
-- ✅ Empresa creada y vinculada a fcofrealvarez@gmail.com
-- 
-- SIGUIENTE PASO:
-- 1. Obtén el company_id ejecutando: SELECT id FROM companies;
-- 2. Reemplaza {{COMPANY_ID}} en el archivo de datos
-- 3. Ejecuta el archivo: 20251126000001_import_real_data.sql
-- ============================================================================
