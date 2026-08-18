-- =====================================================
-- RHENNIE TASTY SHACK
-- PRODUCTION CONFIGURATION
-- =====================================================

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;

ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;

ALTER TABLE quotation_history ENABLE ROW LEVEL SECURITY;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CUSTOMERS
-- =====================================================

DROP POLICY IF EXISTS "Customers can view their profile"
ON customers;

CREATE POLICY "Customers can view their profile"
ON customers
FOR SELECT
USING (
    auth.uid() = auth_user_id
);

DROP POLICY IF EXISTS "Customers can update their profile"
ON customers;

CREATE POLICY "Customers can update their profile"
ON customers
FOR UPDATE
USING (
    auth.uid() = auth_user_id
);

-- =====================================================
-- CONSULTATIONS
-- =====================================================

DROP POLICY IF EXISTS "Customers can view own consultations"
ON consultations;

CREATE POLICY "Customers can view own consultations"
ON consultations
FOR SELECT
USING (
    customer_id IN (
        SELECT id
        FROM customers
        WHERE auth_user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Customers can create consultations"
ON consultations;

CREATE POLICY "Customers can create consultations"
ON consultations
FOR INSERT
WITH CHECK (
    customer_id IN (
        SELECT id
        FROM customers
        WHERE auth_user_id = auth.uid()
    )
);

-- =====================================================
-- QUOTATIONS
-- =====================================================

DROP POLICY IF EXISTS "Customers can view quotations"
ON quotations;

CREATE POLICY "Customers can view quotations"
ON quotations
FOR SELECT
USING (
    customer_id IN (
        SELECT id
        FROM customers
        WHERE auth_user_id = auth.uid()
    )
);

-- =====================================================
-- NOTIFICATIONS
-- =====================================================

DROP POLICY IF EXISTS "Customers can view notifications"
ON notifications;

CREATE POLICY "Customers can view notifications"
ON notifications
FOR SELECT
USING (
    customer_id IN (
        SELECT id
        FROM customers
        WHERE auth_user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Customers can update notifications"
ON notifications;

CREATE POLICY "Customers can update notifications"
ON notifications
FOR UPDATE
USING (
    customer_id IN (
        SELECT id
        FROM customers
        WHERE auth_user_id = auth.uid()
    )
);

-- =====================================================
-- ORDERS
-- =====================================================

DROP POLICY IF EXISTS "Customers can view orders"
ON orders;

CREATE POLICY "Customers can view orders"
ON orders
FOR SELECT
USING (
    customer_id IN (
        SELECT id
        FROM customers
        WHERE auth_user_id = auth.uid()
    )
);

-- =====================================================
-- PAYMENTS
-- =====================================================

DROP POLICY IF EXISTS "Customers can view payments"
ON payments;

CREATE POLICY "Customers can view payments"
ON payments
FOR SELECT
USING (
    customer_id IN (
        SELECT id
        FROM customers
        WHERE auth_user_id = auth.uid()
    )
);

-- =====================================================
-- AUTOMATIC CONSULTATION NUMBER
-- =====================================================

CREATE SEQUENCE IF NOT EXISTS consultation_number_seq;

CREATE OR REPLACE FUNCTION generate_consultation_number()
RETURNS TRIGGER AS
$$
BEGIN

    IF NEW.consultation_no IS NULL
       OR NEW.consultation_no = '' THEN

        NEW.consultation_no :=
            'RTS-' ||
            TO_CHAR(CURRENT_DATE, 'YYYY') ||
            '-' ||
            LPAD(nextval('consultation_number_seq')::TEXT, 6, '0');

    END IF;

    RETURN NEW;

END;
$$
LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS consultation_number_trigger
ON consultations;

CREATE TRIGGER consultation_number_trigger
BEFORE INSERT
ON consultations
FOR EACH ROW
EXECUTE FUNCTION generate_consultation_number();

-- =====================================================
-- AUTOMATIC QUOTATION NUMBER
-- =====================================================

CREATE SEQUENCE IF NOT EXISTS quotation_number_seq;

CREATE OR REPLACE FUNCTION generate_quotation_number()
RETURNS TRIGGER AS
$$
BEGIN

    IF NEW.quotation_no IS NULL
       OR NEW.quotation_no = '' THEN

        NEW.quotation_no :=
            'RTS-Q-' ||
            TO_CHAR(CURRENT_DATE, 'YYYY') ||
            '-' ||
            LPAD(nextval('quotation_number_seq')::TEXT, 6, '0');

    END IF;

    RETURN NEW;

END;
$$
LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS quotation_number_trigger
ON quotations;

CREATE TRIGGER quotation_number_trigger
BEFORE INSERT
ON quotations
FOR EACH ROW
EXECUTE FUNCTION generate_quotation_number();

-- =====================================================
-- END OF PRODUCTION CONFIGURATION
-- =====================================================