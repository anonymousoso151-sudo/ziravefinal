-- ZİRAVE Platform - Database Schema Application
-- Run this file in Supabase Dashboard > SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('FARMER', 'SUPPLIER', 'DRIVER', 'ENGINEER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE shipment_status AS ENUM ('pending', 'active', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE bid_status AS ENUM ('pending', 'accepted', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE message_type AS ENUM ('text', 'image', 'file');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    role user_role NOT NULL DEFAULT 'FARMER',
    phone TEXT UNIQUE,
    avatar_url TEXT,
    bio TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
    id SERIAL PRIMARY KEY,
    supplier_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    image_url TEXT,
    category TEXT NOT NULL,
    stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_1_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    participant_2_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(participant_1_id, participant_2_id),
    CHECK (participant_1_id != participant_2_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type message_type DEFAULT 'text',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shipment_requests table
CREATE TABLE IF NOT EXISTS public.shipment_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    pickup_location TEXT NOT NULL,
    delivery_location TEXT NOT NULL,
    cargo_type TEXT,
    weight DECIMAL(10,2),
    dimensions TEXT,
    status shipment_status DEFAULT 'pending',
    budget DECIMAL(10,2),
    pickup_date DATE,
    delivery_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shipment_bids table
CREATE TABLE IF NOT EXISTS public.shipment_bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_request_id UUID NOT NULL REFERENCES public.shipment_requests(id) ON DELETE CASCADE,
    bidder_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    message TEXT,
    status bid_status DEFAULT 'pending',
    estimated_delivery_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create diagnosis_results table
CREATE TABLE IF NOT EXISTS public.diagnosis_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plant_type TEXT,
    detected_issues JSONB,
    recommendations JSONB,
    confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
    image_url TEXT,
    diagnosis_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    related_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_products_supplier_id ON public.products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations(participant_1_id, participant_2_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_shipment_requests_requester_id ON public.shipment_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_shipment_requests_status ON public.shipment_requests(status);
CREATE INDEX IF NOT EXISTS idx_shipment_bids_shipment_request_id ON public.shipment_bids(shipment_request_id);
CREATE INDEX IF NOT EXISTS idx_shipment_bids_bidder_id ON public.shipment_bids(bidder_id);
CREATE INDEX IF NOT EXISTS idx_diagnosis_results_user_id ON public.diagnosis_results(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnosis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Profiles policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view all profiles" ON public.profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Products policies
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
CREATE POLICY "Anyone can view active products" ON public.products
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Suppliers can manage their own products" ON public.products;
CREATE POLICY "Suppliers can manage their own products" ON public.products
    FOR ALL USING (auth.uid() = supplier_id);

-- Conversations policies
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON public.conversations;
CREATE POLICY "Users can view conversations they participate in" ON public.conversations
    FOR SELECT USING (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

DROP POLICY IF EXISTS "Users can insert conversations they participate in" ON public.conversations;
CREATE POLICY "Users can insert conversations they participate in" ON public.conversations
    FOR INSERT WITH CHECK (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

DROP POLICY IF EXISTS "Users can update conversations they participate in" ON public.conversations;
CREATE POLICY "Users can update conversations they participate in" ON public.conversations
    FOR UPDATE USING (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

-- Messages policies
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
CREATE POLICY "Users can view messages in their conversations" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversations
            WHERE id = conversation_id
            AND (participant_1_id = auth.uid() OR participant_2_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON public.messages;
CREATE POLICY "Users can insert messages in their conversations" ON public.messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.conversations
            WHERE id = conversation_id
            AND (participant_1_id = auth.uid() OR participant_2_id = auth.uid())
        )
    );

-- Shipment requests policies
DROP POLICY IF EXISTS "Users can view all active shipment requests" ON public.shipment_requests;
CREATE POLICY "Users can view all active shipment requests" ON public.shipment_requests
    FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Users can view their own shipment requests" ON public.shipment_requests;
CREATE POLICY "Users can view their own shipment requests" ON public.shipment_requests
    FOR SELECT USING (auth.uid() = requester_id);

DROP POLICY IF EXISTS "Users can manage their own shipment requests" ON public.shipment_requests;
CREATE POLICY "Users can manage their own shipment requests" ON public.shipment_requests
    FOR ALL USING (auth.uid() = requester_id);

-- Shipment bids policies
DROP POLICY IF EXISTS "Users can view bids on their shipment requests" ON public.shipment_bids;
CREATE POLICY "Users can view bids on their shipment requests" ON public.shipment_bids
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.shipment_requests
            WHERE id = shipment_request_id
            AND requester_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can view their own bids" ON public.shipment_bids;
CREATE POLICY "Users can view their own bids" ON public.shipment_bids
    FOR SELECT USING (auth.uid() = bidder_id);

DROP POLICY IF EXISTS "Users can manage their own bids" ON public.shipment_bids;
CREATE POLICY "Users can manage their own bids" ON public.shipment_bids
    FOR ALL USING (auth.uid() = bidder_id);

-- Diagnosis results policies
DROP POLICY IF EXISTS "Users can view their own diagnosis results" ON public.diagnosis_results;
CREATE POLICY "Users can view their own diagnosis results" ON public.diagnosis_results
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own diagnosis results" ON public.diagnosis_results;
CREATE POLICY "Users can insert their own diagnosis results" ON public.diagnosis_results
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notifications policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own notifications" ON public.notifications;
CREATE POLICY "Users can insert their own notifications" ON public.notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_conversations_updated_at ON public.conversations;
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shipment_requests_updated_at ON public.shipment_requests;
CREATE TRIGGER update_shipment_requests_updated_at BEFORE UPDATE ON public.shipment_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shipment_bids_updated_at ON public.shipment_bids;
CREATE TRIGGER update_shipment_bids_updated_at BEFORE UPDATE ON public.shipment_bids
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', 'FARMER');
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update conversation last message
CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations
    SET last_message = NEW.content,
        last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating conversation last message
DROP TRIGGER IF EXISTS update_conversation_on_message ON public.messages;
CREATE TRIGGER update_conversation_on_message
    AFTER INSERT ON public.messages
    FOR EACH ROW EXECUTE FUNCTION public.update_conversation_last_message();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Insert sample data for testing
INSERT INTO public.profiles (id, full_name, role, phone) VALUES
    ('00000000-0000-0000-0000-000000000001', 'Ahmet Yılmaz', 'FARMER', '+905551234567'),
    ('00000000-0000-0000-0000-000000000002', 'Fatma Demir', 'SUPPLIER', '+905559876543'),
    ('00000000-0000-0000-0000-000000000003', 'Mehmet Kaya', 'DRIVER', '+905553456789'),
    ('00000000-0000-0000-0000-000000000004', 'Ayşe Özkan', 'ENGINEER', '+905554567890')
ON CONFLICT (id) DO NOTHING;

-- Insert sample products
INSERT INTO public.products (supplier_id, name, description, price, category, stock_quantity) VALUES
    ('00000000-0000-0000-0000-000000000002', 'Organik Domates', 'Taze organik domates, 1 kg', 25.50, 'Sebzeler', 100),
    ('00000000-0000-0000-0000-000000000002', 'Elma Amasya', 'Amasya elması, 1 kg', 15.75, 'Meyveler', 50),
    ('00000000-0000-0000-0000-000000000002', 'Organik Salatalık', 'Taze salatalık, 1 kg', 12.00, 'Sebzeler', 75)
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'ZİRAVE Database Schema applied successfully!' as status;
