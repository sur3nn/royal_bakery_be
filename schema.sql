CREATE DATABASE IF NOT EXISTS bakery_billing;
USE bakery_billing;

CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(150) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id BIGINT,
    status VARCHAR(20) DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE IF NOT EXISTS product_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category_id BIGINT,
    unit VARCHAR(20) NOT NULL,
    selling_price DECIMAL(12,2) NOT NULL,
    cost_price DECIMAL(12,2) NOT NULL,
    gst_percent DECIMAL(5,2) DEFAULT 0.00,
    current_stock DECIMAL(12,3) DEFAULT 0.000,
    min_stock_threshold DECIMAL(12,3) DEFAULT 5.000,
    image_url VARCHAR(500),
    is_popular BOOLEAN DEFAULT FALSE,
    shelf_life_days INT,
    status VARCHAR(20) DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES product_categories(id)
);

CREATE TABLE IF NOT EXISTS customers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(150),
    address TEXT,
    notes TEXT,
    outstanding_balance DECIMAL(12,2) DEFAULT 0.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id BIGINT NULL,
    sale_date DATE NOT NULL,
    sale_time TIME NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    gst_total DECIMAL(12,2) NOT NULL,
    cgst DECIMAL(12,2) NOT NULL,
    sgst DECIMAL(12,2) NOT NULL,
    discount DECIMAL(12,2) DEFAULT 0.00,
    discount_type VARCHAR(10) DEFAULT 'fixed',
    grand_total DECIMAL(12,2) NOT NULL,
    amount_paid DECIMAL(12,2) NOT NULL,
    balance_return DECIMAL(12,2) DEFAULT 0.00,
    payment_method VARCHAR(20) NOT NULL,
    cashier_id BIGINT NULL,
    status VARCHAR(20) DEFAULT 'Completed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (cashier_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS sale_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sale_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    product_name_snapshot VARCHAR(150) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    quantity DECIMAL(12,3) NOT NULL,
    price_per_unit DECIMAL(12,2) NOT NULL,
    gst_percent DECIMAL(5,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    gst_amount DECIMAL(12,2) NOT NULL,
    total DECIMAL(12,2) NOT NULL,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS inventory_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    type VARCHAR(20) NOT NULL,
    quantity DECIMAL(12,3) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    reference_type VARCHAR(30),
    reference_id BIGINT NULL,
    performed_by BIGINT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (performed_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS bulk_orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id BIGINT NULL,
    customer_name_snapshot VARCHAR(150) NOT NULL,
    phone_snapshot VARCHAR(20) NOT NULL,
    email_snapshot VARCHAR(150),
    delivery_date DATE NOT NULL,
    delivery_time TIME NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    advance_paid DECIMAL(12,2) DEFAULT 0.00,
    remaining_amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'Upcoming',
    occasion VARCHAR(150),
    special_instructions TEXT,
    created_by BIGINT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS bulk_order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    bulk_order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    product_name_snapshot VARCHAR(150) NOT NULL,
    quantity DECIMAL(12,3) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    rate DECIMAL(12,2) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    FOREIGN KEY (bulk_order_id) REFERENCES bulk_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS shop_settings (
    id BIGINT PRIMARY KEY DEFAULT 1,
    shop_name VARCHAR(150) NOT NULL,
    tagline VARCHAR(255),
    address TEXT,
    phone VARCHAR(100),
    email VARCHAR(150),
    gstin VARCHAR(30),
    fssai_license VARCHAR(50),
    currency_symbol VARCHAR(10) DEFAULT '₹',
    invoice_prefix VARCHAR(30) DEFAULT 'INV-',
    show_qr_code BOOLEAN DEFAULT TRUE,
    printer_width VARCHAR(20) DEFAULT '80mm',
    auto_print_receipt BOOLEAN DEFAULT FALSE,
    default_cgst_percent DECIMAL(5,2) DEFAULT 2.50,
    default_sgst_percent DECIMAL(5,2) DEFAULT 2.50,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
