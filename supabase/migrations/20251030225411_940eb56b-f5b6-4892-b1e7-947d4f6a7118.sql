-- Crear tabla para cuentas contables
CREATE TABLE public.cuentas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  descripcion TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('1 - Act', '2 - Pas', '3 - Pat', '4 - Ing', '5 - Cto', '6 - Gto', '7 - Gto')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para asientos contables
CREATE TABLE public.asientos_contables (
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
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.cuentas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asientos_contables ENABLE ROW LEVEL SECURITY;

-- Políticas para cuentas (compartidas entre usuarios pero solo lectura para la mayoría)
CREATE POLICY "Las cuentas son visibles para usuarios autenticados"
ON public.cuentas
FOR SELECT
TO authenticated
USING (true);

-- Solo permitir INSERT/UPDATE/DELETE a usuarios específicos (admin)
-- Por ahora permitimos a todos los autenticados, pero en producción
-- deberías crear un rol de admin y restringir esto
CREATE POLICY "Solo usuarios autenticados pueden crear cuentas"
ON public.cuentas
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Solo usuarios autenticados pueden actualizar cuentas"
ON public.cuentas
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Políticas para asientos contables (usuarios solo ven sus propios asientos)
CREATE POLICY "Los usuarios pueden ver sus propios asientos"
ON public.asientos_contables
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden crear sus propios asientos"
ON public.asientos_contables
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios asientos"
ON public.asientos_contables
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propios asientos"
ON public.asientos_contables
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Crear función para actualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Crear trigger para actualizar timestamps
CREATE TRIGGER update_asientos_contables_updated_at
BEFORE UPDATE ON public.asientos_contables
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_asientos_fecha ON public.asientos_contables(fecha);
CREATE INDEX idx_asientos_user_id ON public.asientos_contables(user_id);
CREATE INDEX idx_asientos_codigo_cuenta ON public.asientos_contables(codigo_cuenta);
CREATE INDEX idx_asientos_rut ON public.asientos_contables(rut);
CREATE INDEX idx_cuentas_codigo ON public.cuentas(codigo);