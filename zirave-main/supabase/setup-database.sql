-- ZİRAVE Database Setup - Fresh Start
-- This file sets up the complete database schema from scratch

-- Step 1: Clean up existing data
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS product_categories CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop custom types
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS message_type CASCADE;

-- Drop functions and triggers
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;

-- Step 2: Create custom types
CREATE TYPE user_role AS ENUM ('FARMER', 'SUPPLIER', 'WORKER', 'ENGINEER');
CREATE TYPE message_type AS ENUM ('text', 'image', 'file');

-- Step 3: Create tables
-- Profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone text UNIQUE,
  full_name text,
  role user_role DEFAULT 'FARMER',
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Product categories table
CREATE TABLE product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Products table
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL DEFAULT 0,
  category text REFERENCES product_categories(name),
  supplier_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  image_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Conversations table
CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  participant_2_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  last_message text,
  last_message_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(participant_1_id, participant_2_id)
);

-- Messages table
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  message_type message_type DEFAULT 'text',
  created_at timestamptz DEFAULT now()
);

-- Step 4: Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Step 5: Create security policies
-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can read other profiles"
  ON profiles FOR SELECT TO authenticated
  USING (true);

-- Product categories policies
CREATE POLICY "Anyone can read product categories"
  ON product_categories FOR SELECT TO authenticated
  USING (true);

-- Products policies
CREATE POLICY "Anyone can read active products"
  ON products FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "Suppliers can manage own products"
  ON products FOR ALL TO authenticated
  USING (auth.uid() = supplier_id);

-- Conversations policies
CREATE POLICY "Users can read own conversations"
  ON conversations FOR SELECT TO authenticated
  USING (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

-- Messages policies
CREATE POLICY "Users can read messages in their conversations"
  ON messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.participant_1_id = auth.uid() OR conversations.participant_2_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their conversations"
  ON messages FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.participant_1_id = auth.uid() OR conversations.participant_2_id = auth.uid())
    )
  );

-- Step 6: Create functions and triggers
-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, phone, full_name)
  VALUES (new.id, new.phone, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create triggers
-- Trigger to call the function on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Triggers for updated_at
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Step 8: Create indexes for performance
CREATE INDEX IF NOT EXISTS profiles_phone_idx ON profiles(phone);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);
CREATE INDEX IF NOT EXISTS products_category_idx ON products(category);
CREATE INDEX IF NOT EXISTS products_supplier_idx ON products(supplier_id);
CREATE INDEX IF NOT EXISTS products_active_idx ON products(is_active);
CREATE INDEX IF NOT EXISTS conversations_participants_idx ON conversations(participant_1_id, participant_2_id);
CREATE INDEX IF NOT EXISTS messages_conversation_idx ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages(created_at);

-- Step 9: Insert initial data
-- Product categories
INSERT INTO product_categories (name, description) VALUES
('Sebze', 'Taze sebzeler ve yeşillikler'),
('Meyve', 'Mevsim meyveleri'),
('Tahıl', 'Buğday, arpa, mısır ve diğer tahıllar'),
('Baklagil', 'Fasulye, nohut, mercimek'),
('Süt Ürünleri', 'Süt, peynir, yoğurt'),
('Et Ürünleri', 'Kırmızı et, beyaz et'),
('Tohum', 'Ekim için tohumlar'),
('Gübre', 'Organik ve kimyasal gübreler'),
('İlaç', 'Tarımsal ilaçlar ve koruyucular'),
('Makine', 'Tarım makineleri ve ekipmanları')
ON CONFLICT (name) DO NOTHING;

-- Sample products (placeholder supplier_id)
INSERT INTO products (name, description, price, category, supplier_id, is_active) VALUES
('Organik Domates', 'Sera yetiştiriciliği, pestisitsiz', 15.50, 'Sebze', '00000000-0000-0000-0000-000000000000', true),
('Taze Salatalık', 'Günlük hasat, crispy', 8.00, 'Sebze', '00000000-0000-0000-0000-000000000000', true),
('Kırmızı Elma', 'Amasya elması, doğal', 12.00, 'Meyve', '00000000-0000-0000-0000-000000000000', true),
('Buğday', '1. kalite buğday, temiz', 2.50, 'Tahıl', '00000000-0000-0000-0000-000000000000', true),
('Organik Gübre', 'Hayvan gübresi, kompost', 45.00, 'Gübre', '00000000-0000-0000-0000-000000000000', true)
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'ZİRAVE Database setup completed successfully!' as status;



