-- =============================================================================
-- MIGRACIÓN: Estructura de Contabilidad Real
-- Basada en: Libro Mayor, Libro de Compras, Libro de Ventas, Plan de Cuentas
-- =============================================================================

-- ============================================================
-- 1. PLAN DE CUENTAS (Chart of Accounts)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    account_type TEXT NOT NULL CHECK (account_type IN (
        'ACTIVO',
        'PASIVO', 
        'PATRIMONIO',
        'INGRESO',
        'EGRESO',
        'RESULTADO'
    )),
    parent_code TEXT,
    level INTEGER NOT NULL DEFAULT 1,
    is_detail BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    UNIQUE(company_id, code)
);

CREATE INDEX idx_chart_accounts_company ON public.chart_of_accounts(company_id);
CREATE INDEX idx_chart_accounts_code ON public.chart_of_accounts(code);
CREATE INDEX idx_chart_accounts_parent ON public.chart_of_accounts(parent_code);
CREATE INDEX idx_chart_accounts_type ON public.chart_of_accounts(account_type);

-- ============================================================
-- 2. ASIENTOS CONTABLES - CABECERA (Journal Entries)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    entry_number TEXT NOT NULL,
    entry_type TEXT NOT NULL, -- 1-Act, 2-Pag, etc.
    entry_date DATE NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL,
    description TEXT,
    gloss TEXT,
    document_type TEXT,
    document_number TEXT,
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'POSTED', 'VOID')),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    UNIQUE(company_id, entry_number, year)
);

CREATE INDEX idx_journal_entries_company ON public.journal_entries(company_id);
CREATE INDEX idx_journal_entries_date ON public.journal_entries(entry_date);
CREATE INDEX idx_journal_entries_number ON public.journal_entries(entry_number);
CREATE INDEX idx_journal_entries_type ON public.journal_entries(entry_type);
CREATE INDEX idx_journal_entries_status ON public.journal_entries(status);

-- ============================================================
-- 3. LÍNEAS DE ASIENTOS CONTABLES (Journal Entry Lines)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.journal_entry_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_entry_id UUID NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
    account_code TEXT NOT NULL,
    account_name TEXT NOT NULL,
    debit DECIMAL(18,2) NOT NULL DEFAULT 0,
    credit DECIMAL(18,2) NOT NULL DEFAULT 0,
    control DECIMAL(18,2),
    compensation DECIMAL(18,2),
    third_party_rut TEXT,
    third_party_name TEXT,
    line_order INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT check_debit_credit CHECK (
        (debit > 0 AND credit = 0) OR 
        (credit > 0 AND debit = 0) OR 
        (debit = 0 AND credit = 0)
    )
);

CREATE INDEX idx_journal_lines_entry ON public.journal_entry_lines(journal_entry_id);
CREATE INDEX idx_journal_lines_account ON public.journal_entry_lines(account_code);
CREATE INDEX idx_journal_lines_rut ON public.journal_entry_lines(third_party_rut);

-- ============================================================
-- 4. LIBRO DE COMPRAS (Purchase Book)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.purchase_book (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL,
    line_number INTEGER NOT NULL,
    document_type TEXT NOT NULL, -- Factura, Boleta, etc.
    purchase_type TEXT NOT NULL, -- Mercado Pais, Importacion, etc.
    supplier_rut TEXT NOT NULL,
    supplier_name TEXT NOT NULL,
    folio TEXT,
    document_date DATE,
    reception_date DATE,
    acknowledgment_date DATE,
    exempt_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
    net_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
    iva_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
    fixed_asset_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
    non_recoverable_iva DECIMAL(18,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    UNIQUE(company_id, year, month, line_number)
);

CREATE INDEX idx_purchase_book_company ON public.purchase_book(company_id);
CREATE INDEX idx_purchase_book_date ON public.purchase_book(document_date);
CREATE INDEX idx_purchase_book_supplier ON public.purchase_book(supplier_rut);
CREATE INDEX idx_purchase_book_period ON public.purchase_book(year, month);

-- ============================================================
-- 5. LIBRO DE VENTAS (Sales Book)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.sales_book (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL,
    line_number INTEGER NOT NULL,
    document_type TEXT NOT NULL, -- Factura, Boleta, etc.
    sale_type TEXT NOT NULL,
    customer_rut TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    folio TEXT,
    issue_date DATE,
    exempt_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
    net_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
    iva_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    UNIQUE(company_id, year, month, line_number)
);

CREATE INDEX idx_sales_book_company ON public.sales_book(company_id);
CREATE INDEX idx_sales_book_date ON public.sales_book(issue_date);
CREATE INDEX idx_sales_book_customer ON public.sales_book(customer_rut);
CREATE INDEX idx_sales_book_period ON public.sales_book(year, month);

-- ============================================================
-- TRIGGERS PARA UPDATED_AT
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_chart_of_accounts_updated_at
    BEFORE UPDATE ON public.chart_of_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at
    BEFORE UPDATE ON public.journal_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_book_updated_at
    BEFORE UPDATE ON public.purchase_book
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_book_updated_at
    BEFORE UPDATE ON public.sales_book
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Chart of Accounts
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view chart of accounts for their companies"
    ON public.chart_of_accounts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.company_members
            WHERE company_members.company_id = chart_of_accounts.company_id
            AND company_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can insert chart of accounts"
    ON public.chart_of_accounts FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.company_members
            WHERE company_members.company_id = chart_of_accounts.company_id
            AND company_members.user_id = auth.uid()
            AND company_members.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Admins can update chart of accounts"
    ON public.chart_of_accounts FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.company_members
            WHERE company_members.company_id = chart_of_accounts.company_id
            AND company_members.user_id = auth.uid()
            AND company_members.role IN ('owner', 'admin')
        )
    );

-- Journal Entries
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view journal entries for their companies"
    ON public.journal_entries FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.company_members
            WHERE company_members.company_id = journal_entries.company_id
            AND company_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert journal entries"
    ON public.journal_entries FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.company_members
            WHERE company_members.company_id = journal_entries.company_id
            AND company_members.user_id = auth.uid()
            AND company_members.role IN ('owner', 'admin', 'accountant')
        )
    );

CREATE POLICY "Users can update their draft journal entries"
    ON public.journal_entries FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.company_members
            WHERE company_members.company_id = journal_entries.company_id
            AND company_members.user_id = auth.uid()
            AND company_members.role IN ('owner', 'admin', 'accountant')
        )
    );

-- Journal Entry Lines
ALTER TABLE public.journal_entry_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view journal entry lines"
    ON public.journal_entry_lines FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.journal_entries je
            JOIN public.company_members cm ON cm.company_id = je.company_id
            WHERE je.id = journal_entry_lines.journal_entry_id
            AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert journal entry lines"
    ON public.journal_entry_lines FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.journal_entries je
            JOIN public.company_members cm ON cm.company_id = je.company_id
            WHERE je.id = journal_entry_lines.journal_entry_id
            AND cm.user_id = auth.uid()
            AND cm.role IN ('owner', 'admin', 'accountant')
        )
    );

-- Purchase Book
ALTER TABLE public.purchase_book ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view purchase book for their companies"
    ON public.purchase_book FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.company_members
            WHERE company_members.company_id = purchase_book.company_id
            AND company_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert purchase book entries"
    ON public.purchase_book FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.company_members
            WHERE company_members.company_id = purchase_book.company_id
            AND company_members.user_id = auth.uid()
            AND company_members.role IN ('owner', 'admin', 'accountant')
        )
    );

-- Sales Book
ALTER TABLE public.sales_book ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sales book for their companies"
    ON public.sales_book FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.company_members
            WHERE company_members.company_id = sales_book.company_id
            AND company_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert sales book entries"
    ON public.sales_book FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.company_members
            WHERE company_members.company_id = sales_book.company_id
            AND company_members.user_id = auth.uid()
            AND company_members.role IN ('owner', 'admin', 'accountant')
        )
    );

-- ============================================================
-- COMENTARIOS
-- ============================================================
COMMENT ON TABLE public.chart_of_accounts IS 'Plan de cuentas contables de la empresa';
COMMENT ON TABLE public.journal_entries IS 'Cabecera de asientos contables (Libro Mayor)';
COMMENT ON TABLE public.journal_entry_lines IS 'Líneas de detalle de asientos contables';
COMMENT ON TABLE public.purchase_book IS 'Libro de compras con registro de IVA';
COMMENT ON TABLE public.sales_book IS 'Libro de ventas con registro de IVA';
