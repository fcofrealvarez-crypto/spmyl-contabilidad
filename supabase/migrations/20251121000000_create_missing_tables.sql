-- ============================================================================
-- SPMYL Contabilidad - Tablas Faltantes
-- Creado: 2025-11-21
-- Descripción: Migración para crear todas las tablas referenciadas en el código
-- ============================================================================

-- 🔹 Tabla: transactions
-- Almacena todas las transacciones de ingresos y gastos
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
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
-- Almacena registros de cálculos de IVA
CREATE TABLE IF NOT EXISTS public.iva_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  periodo TEXT NOT NULL, -- Ejemplo: "2025-11"
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
  UNIQUE(user_id, periodo)
);

-- 🔹 Tabla: obligations
-- Almacena obligaciones tributarias y fechas de vencimiento
CREATE TABLE IF NOT EXISTS public.obligations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(15, 2),
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  category TEXT, -- Ejemplo: "IVA", "Renta", "Patente"
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 🔹 Tabla: soporte
-- Almacena tickets de soporte técnico
CREATE TABLE IF NOT EXISTS public.soporte (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 🔹 Tabla: usuarios (perfil extendido)
-- Almacena información adicional de usuarios más allá de auth.users
CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE UNIQUE,
  email TEXT NOT NULL,
  nombre TEXT,
  empresa TEXT,
  rut TEXT,
  telefono TEXT,
  direccion TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================================================
-- POLÍTICAS DE SEGURIDAD (Row Level Security)
-- ============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iva_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obligations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soporte ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- 🔐 Políticas para transactions
CREATE POLICY "Users can view their own transactions"
ON public.transactions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions"
ON public.transactions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
ON public.transactions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
ON public.transactions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 🔐 Políticas para iva_records
CREATE POLICY "Users can view their own IVA records"
ON public.iva_records FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own IVA records"
ON public.iva_records FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own IVA records"
ON public.iva_records FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own IVA records"
ON public.iva_records FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 🔐 Políticas para obligations
CREATE POLICY "Users can view their own obligations"
ON public.obligations FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own obligations"
ON public.obligations FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own obligations"
ON public.obligations FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own obligations"
ON public.obligations FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 🔐 Políticas para soporte
CREATE POLICY "Users can view their own support tickets"
ON public.soporte FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own support tickets"
ON public.soporte FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own support tickets"
ON public.soporte FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- 🔐 Políticas para usuarios
CREATE POLICY "Users can view their own profile"
ON public.usuarios FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile"
ON public.usuarios FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.usuarios FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCIÓN PARA ACTUALIZAR TIMESTAMPS
-- ============================================================================

-- Función que actualiza automáticamente el campo updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS PARA ACTUALIZAR TIMESTAMPS
-- ============================================================================

CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_iva_records_updated_at
BEFORE UPDATE ON public.iva_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_obligations_updated_at
BEFORE UPDATE ON public.obligations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_soporte_updated_at
BEFORE UPDATE ON public.soporte
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_usuarios_updated_at
BEFORE UPDATE ON public.usuarios
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- ÍNDICES PARA MEJORAR RENDIMIENTO
-- ============================================================================

-- Índices para transactions
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_date ON public.transactions(date DESC);
CREATE INDEX idx_transactions_type ON public.transactions(type);
CREATE INDEX idx_transactions_category ON public.transactions(category);

-- Índices para iva_records
CREATE INDEX idx_iva_records_user_id ON public.iva_records(user_id);
CREATE INDEX idx_iva_records_periodo ON public.iva_records(periodo DESC);

-- Índices para obligations
CREATE INDEX idx_obligations_user_id ON public.obligations(user_id);
CREATE INDEX idx_obligations_due_date ON public.obligations(due_date);
CREATE INDEX idx_obligations_status ON public.obligations(status);

-- Índices para soporte
CREATE INDEX idx_soporte_user_id ON public.soporte(user_id);
CREATE INDEX idx_soporte_status ON public.soporte(status);

-- Índices para usuarios
CREATE INDEX idx_usuarios_user_id ON public.usuarios(user_id);
CREATE INDEX idx_usuarios_email ON public.usuarios(email);

-- ============================================================================
-- FUNCIÓN PARA CREAR PERFIL DE USUARIO AUTOMÁTICAMENTE
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (user_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para crear perfil automáticamente al registrarse
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- COMENTARIOS EN TABLAS (Documentación)
-- ============================================================================

COMMENT ON TABLE public.transactions IS 'Almacena todas las transacciones financieras de ingresos y gastos';
COMMENT ON TABLE public.iva_records IS 'Registros de cálculos de IVA por periodo';
COMMENT ON TABLE public.obligations IS 'Obligaciones tributarias y fechas de vencimiento';
COMMENT ON TABLE public.soporte IS 'Tickets de soporte técnico';
COMMENT ON TABLE public.usuarios IS 'Perfiles extendidos de usuarios';
