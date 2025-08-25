-- ZİRAVE Database Setup Script
-- This script creates the necessary tables for the ZİRAVE platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(20) NOT NULL DEFAULT 'FARMER' CHECK (role IN ('FARMER', 'SUPPLIER', 'WORKER', 'ENGINEER')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    supplier_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    image_url TEXT,
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
    UNIQUE(participant_1_id, participant_2_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shipment_requests table
CREATE TABLE IF NOT EXISTS public.shipment_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    pickup_location TEXT NOT NULL,
    delivery_location TEXT NOT NULL,
    cargo_type VARCHAR(100),
    weight DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
    budget DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shipment_bids table
CREATE TABLE IF NOT EXISTS public.shipment_bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_request_id UUID NOT NULL REFERENCES public.shipment_requests(id) ON DELETE CASCADE,
    bidder_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create diagnosis_results table
CREATE TABLE IF NOT EXISTS public.diagnosis_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plant_type VARCHAR(255),
    detected_issues JSONB,
    recommendations JSONB,
    confidence DECIMAL(3,2),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_products_supplier_id ON public.products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations(participant_1_id, participant_2_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_shipment_requests_requester_id ON public.shipment_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_shipment_requests_status ON public.shipment_requests(status);
CREATE INDEX IF NOT EXISTS idx_shipment_bids_shipment_request_id ON public.shipment_bids(shipment_request_id);
CREATE INDEX IF NOT EXISTS idx_diagnosis_results_user_id ON public.diagnosis_results(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnosis_results ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Products policies
CREATE POLICY "Anyone can view active products" ON public.products
    FOR SELECT USING (is_active = true);

CREATE POLICY "Suppliers can manage their own products" ON public.products
    FOR ALL USING (auth.uid() = supplier_id);

-- Conversations policies
CREATE POLICY "Users can view conversations they participate in" ON public.conversations
    FOR SELECT USING (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

CREATE POLICY "Users can insert conversations they participate in" ON public.conversations
    FOR INSERT WITH CHECK (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

-- Messages policies
CREATE POLICY "Users can view messages in their conversations" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversations
            WHERE id = conversation_id
            AND (participant_1_id = auth.uid() OR participant_2_id = auth.uid())
        )
    );

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
CREATE POLICY "Users can view all active shipment requests" ON public.shipment_requests
    FOR SELECT USING (status = 'active');

CREATE POLICY "Users can manage their own shipment requests" ON public.shipment_requests
    FOR ALL USING (auth.uid() = requester_id);

-- Shipment bids policies
CREATE POLICY "Users can view bids on their shipment requests" ON public.shipment_bids
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.shipment_requests
            WHERE id = shipment_request_id
            AND requester_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their own bids" ON public.shipment_bids
    FOR ALL USING (auth.uid() = bidder_id);

-- Diagnosis results policies
CREATE POLICY "Users can view their own diagnosis results" ON public.diagnosis_results
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own diagnosis results" ON public.diagnosis_results
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
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipment_requests_updated_at BEFORE UPDATE ON public.shipment_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipment_bids_updated_at BEFORE UPDATE ON public.shipment_bids
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional)
INSERT INTO public.profiles (phone, full_name, role) VALUES
    ('+905551234567', 'Ahmet Yılmaz', 'FARMER'),
    ('+905559876543', 'Fatma Demir', 'SUPPLIER'),
    ('+905553456789', 'Mehmet Kaya', 'WORKER')
ON CONFLICT (phone) DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
