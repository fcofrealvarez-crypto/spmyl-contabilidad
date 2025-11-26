-- ============================================================================
-- ERP Core Tables Migration
-- Created: 2025-11-25
-- Description: Creates tables for Partners (CRM/Purchasing) and Products (Inventory)
-- ============================================================================

-- 🔹 Tabla: partners (Clientes y Proveedores unificados)
CREATE TABLE IF NOT EXISTS public.partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('client', 'supplier', 'both')),
  rut TEXT, -- Identificador fiscal
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 🔹 Tabla: categories (Categorías de productos)
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 🔹 Tabla: products (Inventario)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT, -- Stock Keeping Unit
  barcode TEXT,
  price DECIMAL(15, 2) NOT NULL DEFAULT 0, -- Precio de venta
  cost DECIMAL(15, 2) NOT NULL DEFAULT 0, -- Costo de adquisición
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER DEFAULT 5, -- Alerta de stock bajo
  unit TEXT DEFAULT 'un', -- Unidad de medida (un, kg, lt, etc.)
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================================================
-- RLS Policies (Row Level Security)
-- ============================================================================

ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 🔐 Políticas para partners
CREATE POLICY "Users can view their own partners" ON public.partners FOR SELECT TO authenticated USING (auth.uid() = usuario_id);
CREATE POLICY "Users can create their own partners" ON public.partners FOR INSERT TO authenticated WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Users can update their own partners" ON public.partners FOR UPDATE TO authenticated USING (auth.uid() = usuario_id);
CREATE POLICY "Users can delete their own partners" ON public.partners FOR DELETE TO authenticated USING (auth.uid() = usuario_id);

-- 🔐 Políticas para categories
CREATE POLICY "Users can view their own categories" ON public.categories FOR SELECT TO authenticated USING (auth.uid() = usuario_id);
CREATE POLICY "Users can create their own categories" ON public.categories FOR INSERT TO authenticated WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Users can update their own categories" ON public.categories FOR UPDATE TO authenticated USING (auth.uid() = usuario_id);
CREATE POLICY "Users can delete their own categories" ON public.categories FOR DELETE TO authenticated USING (auth.uid() = usuario_id);

-- 🔐 Políticas para products
CREATE POLICY "Users can view their own products" ON public.products FOR SELECT TO authenticated USING (auth.uid() = usuario_id);
CREATE POLICY "Users can create their own products" ON public.products FOR INSERT TO authenticated WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Users can update their own products" ON public.products FOR UPDATE TO authenticated USING (auth.uid() = usuario_id);
CREATE POLICY "Users can delete their own products" ON public.products FOR DELETE TO authenticated USING (auth.uid() = usuario_id);

-- ============================================================================
-- Triggers for updated_at
-- ============================================================================

CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON public.partners FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_partners_usuario_id ON public.partners(usuario_id);
CREATE INDEX IF NOT EXISTS idx_partners_type ON public.partners(type);
CREATE INDEX IF NOT EXISTS idx_products_usuario_id ON public.products(usuario_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
