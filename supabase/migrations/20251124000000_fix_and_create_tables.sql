-- ============================================================================
-- SPMYL Contabilidad - Migración Corregida
-- Creado: 2025-11-24
-- Descripción: Migración compatible con el esquema existente
-- ============================================================================

-- ============================================================================
-- PASO 1: Modificar tabla usuarios existente para agregar columnas faltantes
-- ============================================================================

-- Agregar columnas a la tabla usuarios si no existen
DO $$ 
BEGIN
  -- Agregar user_id si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'usuarios' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.usuarios ADD COLUMN user_id UUID REFERENCES auth.users ON DELETE CASCADE;
  END IF;

  -- Agregar empresa si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'usuarios' 
    AND column_name = 'empresa'
  ) THEN
    ALTER TABLE public.usuarios ADD COLUMN empresa TEXT;
  END IF;

  -- Agregar rut si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'usuarios' 
    AND column_name = 'rut'
  ) THEN
    ALTER TABLE public.usuarios ADD COLUMN rut TEXT;
  END IF;

  -- Agregar telefono si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'usuarios' 
    AND column_name = 'telefono'
  ) THEN
    ALTER TABLE public.usuarios ADD COLUMN telefono TEXT;
  END IF;

  -- Agregar direccion si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'usuarios' 
    AND column_name = 'direccion'
  ) THEN
    ALTER TABLE public.usuarios ADD COLUMN direccion TEXT;
  END IF;

  -- Agregar created_at si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'usuarios' 
    AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.usuarios ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
  END IF;

  -- Agregar updated_at si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'usuarios' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.usuarios ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
  END IF;
END $$;

-- ============================================================================
-- PASO 2: Crear nuevas tablas
-- ============================================================================

-- 🔹 Tabla: transactions
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('Ingreso', 'Gasto')),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  date DATE NOT NULL,
  document TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 🔹 Tabla: iva_records
CREATE TABLE IF NOT EXISTS public.iva_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  periodo TEXT NOT NULL,
  ventas_netas DECIMAL(15, 2) DEFAULT 0,
  iva_ventas DECIMAL(15, 2) DEFAULT 0,
  compras_netas DECIMAL(15, 2) DEFAULT 0,
  iva_compras DECIMAL(15, 2) DEFAULT 0,
  credito_fiscal DECIMAL(15, 2) DEFAULT 0,
  debito_fiscal DECIMAL(15, 2) DEFAULT 0,
  pagar DECIMAL(15, 2) DEFAULT 0,
  favor DECIMAL(15, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(usuario_id, periodo)
);

-- 🔹 Tabla: obligations
CREATE TABLE IF NOT EXISTS public.obligations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(15, 2),
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 🔹 Tabla: soporte
CREATE TABLE IF NOT EXISTS public.soporte (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================================================
-- PASO 3: Función para actualizar timestamps
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PASO 4: Habilitar RLS en todas las tablas
-- ============================================================================

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iva_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obligations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soporte ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PASO 5: Crear políticas de seguridad
-- ============================================================================

-- 🔐 Políticas para transactions
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'transactions' 
    AND policyname = 'Users can view their own transactions'
  ) THEN
    CREATE POLICY "Users can view their own transactions"
    ON public.transactions FOR SELECT
    TO authenticated
    USING (auth.uid() = usuario_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'transactions' 
    AND policyname = 'Users can create their own transactions'
  ) THEN
    CREATE POLICY "Users can create their own transactions"
    ON public.transactions FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = usuario_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'transactions' 
    AND policyname = 'Users can update their own transactions'
  ) THEN
    CREATE POLICY "Users can update their own transactions"
    ON public.transactions FOR UPDATE
    TO authenticated
    USING (auth.uid() = usuario_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'transactions' 
    AND policyname = 'Users can delete their own transactions'
  ) THEN
    CREATE POLICY "Users can delete their own transactions"
    ON public.transactions FOR DELETE
    TO authenticated
    USING (auth.uid() = usuario_id);
  END IF;
END $$;

-- 🔐 Políticas para iva_records
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'iva_records' 
    AND policyname = 'Users can view their own IVA records'
  ) THEN
    CREATE POLICY "Users can view their own IVA records"
    ON public.iva_records FOR SELECT
    TO authenticated
    USING (auth.uid() = usuario_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'iva_records' 
    AND policyname = 'Users can create their own IVA records'
  ) THEN
    CREATE POLICY "Users can create their own IVA records"
    ON public.iva_records FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = usuario_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'iva_records' 
    AND policyname = 'Users can update their own IVA records'
  ) THEN
    CREATE POLICY "Users can update their own IVA records"
    ON public.iva_records FOR UPDATE
    TO authenticated
    USING (auth.uid() = usuario_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'iva_records' 
    AND policyname = 'Users can delete their own IVA records'
  ) THEN
    CREATE POLICY "Users can delete their own IVA records"
    ON public.iva_records FOR DELETE
    TO authenticated
    USING (auth.uid() = usuario_id);
  END IF;
END $$;

-- 🔐 Políticas para obligations
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'obligations' 
    AND policyname = 'Users can view their own obligations'
  ) THEN
    CREATE POLICY "Users can view their own obligations"
    ON public.obligations FOR SELECT
    TO authenticated
    USING (auth.uid() = usuario_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'obligations' 
    AND policyname = 'Users can create their own obligations'
  ) THEN
    CREATE POLICY "Users can create their own obligations"
    ON public.obligations FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = usuario_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'obligations' 
    AND policyname = 'Users can update their own obligations'
  ) THEN
    CREATE POLICY "Users can update their own obligations"
    ON public.obligations FOR UPDATE
    TO authenticated
    USING (auth.uid() = usuario_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'obligations' 
    AND policyname = 'Users can delete their own obligations'
  ) THEN
    CREATE POLICY "Users can delete their own obligations"
    ON public.obligations FOR DELETE
    TO authenticated
    USING (auth.uid() = usuario_id);
  END IF;
END $$;

-- 🔐 Políticas para soporte
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'soporte' 
    AND policyname = 'Users can view their own support tickets'
  ) THEN
    CREATE POLICY "Users can view their own support tickets"
    ON public.soporte FOR SELECT
    TO authenticated
    USING (auth.uid() = usuario_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'soporte' 
    AND policyname = 'Users can create their own support tickets'
  ) THEN
    CREATE POLICY "Users can create their own support tickets"
    ON public.soporte FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = usuario_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'soporte' 
    AND policyname = 'Users can update their own support tickets'
  ) THEN
    CREATE POLICY "Users can update their own support tickets"
    ON public.soporte FOR UPDATE
    TO authenticated
    USING (auth.uid() = usuario_id);
  END IF;
END $$;

-- 🔐 Políticas para usuarios
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'usuarios' 
    AND policyname = 'Users can view their own profile'
  ) THEN
    CREATE POLICY "Users can view their own profile"
    ON public.usuarios FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR auth.uid()::text = id::text);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'usuarios' 
    AND policyname = 'Users can create their own profile'
  ) THEN
    CREATE POLICY "Users can create their own profile"
    ON public.usuarios FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id OR auth.uid()::text = id::text);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'usuarios' 
    AND policyname = 'Users can update their own profile'
  ) THEN
    CREATE POLICY "Users can update their own profile"
    ON public.usuarios FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id OR auth.uid()::text = id::text);
  END IF;
END $$;

-- ============================================================================
-- PASO 6: Crear triggers para actualizar timestamps
-- ============================================================================

DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.transactions;
CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_iva_records_updated_at ON public.iva_records;
CREATE TRIGGER update_iva_records_updated_at
BEFORE UPDATE ON public.iva_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_obligations_updated_at ON public.obligations;
CREATE TRIGGER update_obligations_updated_at
BEFORE UPDATE ON public.obligations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_soporte_updated_at ON public.soporte;
CREATE TRIGGER update_soporte_updated_at
BEFORE UPDATE ON public.soporte
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_usuarios_updated_at ON public.usuarios;
CREATE TRIGGER update_usuarios_updated_at
BEFORE UPDATE ON public.usuarios
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- PASO 7: Crear índices para mejorar rendimiento
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_transactions_usuario_id ON public.transactions(usuario_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category);

CREATE INDEX IF NOT EXISTS idx_iva_records_usuario_id ON public.iva_records(usuario_id);
CREATE INDEX IF NOT EXISTS idx_iva_records_periodo ON public.iva_records(periodo DESC);

CREATE INDEX IF NOT EXISTS idx_obligations_usuario_id ON public.obligations(usuario_id);
CREATE INDEX IF NOT EXISTS idx_obligations_due_date ON public.obligations(due_date);
CREATE INDEX IF NOT EXISTS idx_obligations_status ON public.obligations(status);

CREATE INDEX IF NOT EXISTS idx_soporte_usuario_id ON public.soporte(usuario_id);
CREATE INDEX IF NOT EXISTS idx_soporte_status ON public.soporte(status);

CREATE INDEX IF NOT EXISTS idx_usuarios_user_id ON public.usuarios(user_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON public.usuarios(email);

-- ============================================================================
-- PASO 8: Función para crear perfil de usuario automáticamente
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (user_id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Crear trigger solo si no existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
