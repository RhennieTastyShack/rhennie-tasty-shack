-- =====================================================
-- RHENNIE TASTY SHACK
-- MENU MODULE
-- =====================================================

-- ===========================
-- MENU CATEGORIES
-- ===========================

CREATE TABLE IF NOT EXISTS menu_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name TEXT NOT NULL UNIQUE,

    slug TEXT NOT NULL UNIQUE,

    description TEXT,

    display_order INTEGER DEFAULT 0,

    active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================
-- MENU ITEMS
-- ===========================

CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    category_id UUID
        REFERENCES menu_categories(id)
        ON DELETE CASCADE,

    name TEXT NOT NULL,

    slug TEXT UNIQUE,

    description TEXT,

    price NUMERIC(10,2),

    image_url TEXT,

    available BOOLEAN DEFAULT TRUE,

    featured BOOLEAN DEFAULT FALSE,

    display_order INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================
-- PACKAGE ITEMS
-- ===========================

CREATE TABLE IF NOT EXISTS package_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    package_id UUID
        REFERENCES menu_items(id)
        ON DELETE CASCADE,

    item_name TEXT NOT NULL,

    quantity TEXT,

    display_order INTEGER DEFAULT 0
);

-- ===========================
-- INDEXES
-- ===========================

CREATE INDEX IF NOT EXISTS idx_menu_category
ON menu_items(category_id);

CREATE INDEX IF NOT EXISTS idx_menu_featured
ON menu_items(featured);

CREATE INDEX IF NOT EXISTS idx_menu_order
ON menu_items(display_order);

CREATE INDEX IF NOT EXISTS idx_package_order
ON package_items(display_order);

-- ===========================
-- UPDATED_AT TRIGGERS
-- ===========================

CREATE TRIGGER update_menu_categories_updated_at
BEFORE UPDATE ON menu_categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at
BEFORE UPDATE ON menu_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_package_items_updated_at
BEFORE UPDATE ON package_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();