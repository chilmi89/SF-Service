-- Mengaktifkan ekstensi untuk UUID otomatis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Table: auth_users 
CREATE TABLE public.auth_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);

-- 2. Table: roles
CREATE TABLE public.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL
);

-- 3. Table: permissions
CREATE TABLE public.permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL
);

-- 4. Table: role_permissions (Pivot Table)
CREATE TABLE public.role_permissions (
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 5. Table: tenants
CREATE TABLE public.tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true
);

-- 6. Table: profiles
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.auth_users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
    role_id UUID REFERENCES public.roles(id) ON DELETE SET NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20)
);

-- 7. Table: layanan
CREATE TABLE public.layanan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    nama_layanan VARCHAR(255),
    harga_dasar DECIMAL(12,2)
);

-- 8. Table: transactions
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50),
    total_bayar DECIMAL(12,2),
    status_pembayaran VARCHAR(50),
    created_at TIMESTAMP DEFAULT now()
);

-- 9. Table: orders
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
    layanan_id UUID REFERENCES public.layanan(id) ON DELETE SET NULL,
    customer_name VARCHAR(255),
    status_order VARCHAR(50),
    catatan TEXT,
    created_at TIMESTAMP DEFAULT now()
);

-- 10. Table: tasks
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    technician_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    nama_tugas VARCHAR(255),
    deskripsi TEXT,
    status_tugas VARCHAR(50),
    deadline TIMESTAMP
);
