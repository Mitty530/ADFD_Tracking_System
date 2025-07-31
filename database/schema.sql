-- ADFD Tracking System Database Schema
-- This file contains the complete database schema for the ADFD tracking system
-- Run this in Supabase SQL Editor to set up the database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'archive_team', 'loan_administrator', 'head_of_operations', 'operations_team', 'core_banking', 'observer')),
    department TEXT NOT NULL,
    region TEXT CHECK (region IN ('north_africa', 'central_africa', 'south_east_asia', 'central_asia', 'global')),
    regional_countries TEXT[],
    can_create_requests BOOLEAN DEFAULT FALSE,
    can_approve_reject BOOLEAN DEFAULT FALSE,
    can_disburse BOOLEAN DEFAULT FALSE,
    view_only_access BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    avatar_url TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Withdrawal Requests Table
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
    id BIGSERIAL PRIMARY KEY,
    project_number TEXT UNIQUE NOT NULL,
    country TEXT NOT NULL,
    region TEXT NOT NULL,
    ref_number TEXT UNIQUE NOT NULL,
    beneficiary_name TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    currency TEXT DEFAULT 'USD' NOT NULL,
    value_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'disbursed', 'cancelled')),
    current_stage TEXT NOT NULL CHECK (current_stage IN ('initial_review', 'technical_review', 'core_banking', 'disbursed')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to UUID REFERENCES auth.users(id),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    beneficiary_bank TEXT,
    bank_account TEXT,
    iban TEXT,
    swift_code TEXT,
    agreement_date DATE,
    processing_days INTEGER DEFAULT 0,
    sla_deadline TIMESTAMP WITH TIME ZONE,
    is_overdue BOOLEAN DEFAULT FALSE,
    requires_extension BOOLEAN DEFAULT FALSE,
    total_pending_amount DECIMAL(15,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Documents Table for file storage
CREATE TABLE IF NOT EXISTS public.documents (
    id BIGSERIAL PRIMARY KEY,
    request_id BIGINT REFERENCES withdrawal_requests(id),
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    file_path TEXT NOT NULL, -- Supabase Storage path
    storage_bucket TEXT DEFAULT 'withdrawal-documents',
    uploaded_by UUID NOT NULL REFERENCES auth.users(id),
    document_type TEXT DEFAULT 'withdrawal_request' CHECK (document_type IN ('withdrawal_request', 'supporting_document', 'invoice', 'receipt', 'other')),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);



-- Enhanced Withdrawal Requests Table
ALTER TABLE public.withdrawal_requests ADD COLUMN IF NOT EXISTS withdrawal_request_no TEXT;
ALTER TABLE public.withdrawal_requests ADD COLUMN IF NOT EXISTS request_date DATE;
ALTER TABLE public.withdrawal_requests ADD COLUMN IF NOT EXISTS project_description TEXT;
ALTER TABLE public.withdrawal_requests ADD COLUMN IF NOT EXISTS additional_project_details TEXT;
ALTER TABLE public.withdrawal_requests ADD COLUMN IF NOT EXISTS agreement_reference TEXT;
ALTER TABLE public.withdrawal_requests ADD COLUMN IF NOT EXISTS agreement_party TEXT;
ALTER TABLE public.withdrawal_requests ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(15,2);
ALTER TABLE public.withdrawal_requests ADD COLUMN IF NOT EXISTS beneficiary_address TEXT;
ALTER TABLE public.withdrawal_requests ADD COLUMN IF NOT EXISTS beneficiary_bank_name TEXT;
ALTER TABLE public.withdrawal_requests ADD COLUMN IF NOT EXISTS beneficiary_bank_address TEXT;
ALTER TABLE public.withdrawal_requests ADD COLUMN IF NOT EXISTS beneficiary_bank_account TEXT;
ALTER TABLE public.withdrawal_requests ADD COLUMN IF NOT EXISTS beneficiary_bank_iban TEXT;
ALTER TABLE public.withdrawal_requests ADD COLUMN IF NOT EXISTS beneficiary_bank_swift_code TEXT;
ALTER TABLE public.withdrawal_requests ADD COLUMN IF NOT EXISTS correspondence_bank_name TEXT;
ALTER TABLE public.withdrawal_requests ADD COLUMN IF NOT EXISTS correspondence_bank_swift_code TEXT;
ALTER TABLE public.withdrawal_requests ADD COLUMN IF NOT EXISTS correspondence_bank_address TEXT;
ALTER TABLE public.withdrawal_requests ADD COLUMN IF NOT EXISTS authorized_representative_1 TEXT;
ALTER TABLE public.withdrawal_requests ADD COLUMN IF NOT EXISTS authorized_representative_2 TEXT;
ALTER TABLE public.withdrawal_requests ADD COLUMN IF NOT EXISTS additional_notes TEXT;


-- Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id BIGSERIAL PRIMARY KEY,
    request_id BIGINT REFERENCES withdrawal_requests(id),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    action_type TEXT NOT NULL CHECK (action_type IN ('create', 'approve', 'reject', 'disburse', 'comment', 'assign', 'login', 'logout', 'view', 'navigate', 'update', 'document_upload')),
    action_details TEXT NOT NULL,
    previous_stage TEXT,
    new_stage TEXT,
    previous_status TEXT,
    new_status TEXT,
    amount_involved DECIMAL(15,2),
    regional_context TEXT,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id TEXT,
    page_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processing_context JSONB
);

-- User Sessions Table
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    logout_at TIMESTAMP WITH TIME ZONE,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    remember_me BOOLEAN DEFAULT FALSE
);

-- Comments Table
CREATE TABLE IF NOT EXISTS public.request_comments (
    id BIGSERIAL PRIMARY KEY,
    request_id BIGINT NOT NULL REFERENCES withdrawal_requests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    comment_text TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document Attachments Table
CREATE TABLE IF NOT EXISTS public.request_documents (
    id BIGSERIAL PRIMARY KEY,
    request_id BIGINT NOT NULL REFERENCES withdrawal_requests(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES auth.users(id),
    file_name TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_type TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    document_type TEXT CHECK (document_type IN ('agreement', 'invoice', 'receipt', 'bank_statement', 'other')),
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    request_id BIGINT REFERENCES withdrawal_requests(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('request_assigned', 'status_change', 'deadline_approaching', 'overdue', 'comment_added')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_region ON public.user_profiles(region);

CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON public.withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_stage ON public.withdrawal_requests(current_stage);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_assigned_to ON public.withdrawal_requests(assigned_to);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_created_by ON public.withdrawal_requests(created_by);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_region ON public.withdrawal_requests(region);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_priority ON public.withdrawal_requests(priority);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_created_at ON public.withdrawal_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_project_number ON public.withdrawal_requests(project_number);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_withdrawal_request_no ON public.withdrawal_requests(withdrawal_request_no);

-- Document indexes
CREATE INDEX IF NOT EXISTS idx_documents_request_id ON public.documents(request_id);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON public.documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_document_type ON public.documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at);



CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_request_id ON public.audit_logs(request_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON public.audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_session_id ON public.audit_logs(session_id);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON public.user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity ON public.user_sessions(last_activity);

CREATE INDEX IF NOT EXISTS idx_request_comments_request_id ON public.request_comments(request_id);
CREATE INDEX IF NOT EXISTS idx_request_comments_user_id ON public.request_comments(user_id);

CREATE INDEX IF NOT EXISTS idx_request_documents_request_id ON public.request_documents(request_id);
CREATE INDEX IF NOT EXISTS idx_request_documents_uploaded_by ON public.request_documents(uploaded_by);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_withdrawal_requests_updated_at BEFORE UPDATE ON public.withdrawal_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_request_comments_updated_at BEFORE UPDATE ON public.request_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;


-- User Profiles RLS Policies
CREATE POLICY "Users can view their own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.user_profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Withdrawal Requests RLS Policies
CREATE POLICY "Users can view requests based on role" ON public.withdrawal_requests FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles up 
        WHERE up.id = auth.uid() 
        AND (
            up.role = 'admin' OR
            up.role = 'loan_administrator' OR
            (up.role = 'archive_team' AND created_by = auth.uid()) OR
            (up.role = 'operations_team' AND assigned_to = auth.uid()) OR
            (up.role = 'core_banking' AND current_stage = 'core_banking')
        )
    )
);

-- Audit Logs RLS Policies
CREATE POLICY "Users can view their own audit logs" ON public.audit_logs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can view all audit logs" ON public.audit_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- User Sessions RLS Policies
CREATE POLICY "Users can view their own sessions" ON public.user_sessions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update their own sessions" ON public.user_sessions FOR UPDATE USING (user_id = auth.uid());

-- Comments RLS Policies
CREATE POLICY "Users can view comments on accessible requests" ON public.request_comments FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.withdrawal_requests wr
        JOIN public.user_profiles up ON up.id = auth.uid()
        WHERE wr.id = request_id
        AND (
            up.role = 'admin' OR
            up.role = 'loan_administrator' OR
            (up.role = 'archive_team' AND wr.created_by = auth.uid()) OR
            (up.role = 'operations_team' AND wr.assigned_to = auth.uid()) OR
            (up.role = 'core_banking' AND wr.current_stage = 'core_banking')
        )
    )
);

-- Documents RLS Policies
CREATE POLICY "Users can view documents on accessible requests" ON public.request_documents FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.withdrawal_requests wr
        JOIN public.user_profiles up ON up.id = auth.uid()
        WHERE wr.id = request_id
        AND (
            up.role = 'admin' OR
            up.role = 'loan_administrator' OR
            (up.role = 'archive_team' AND wr.created_by = auth.uid()) OR
            (up.role = 'operations_team' AND wr.assigned_to = auth.uid()) OR
            (up.role = 'core_banking' AND wr.current_stage = 'core_banking')
        )
    )
);

-- Notifications RLS Policies
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());

-- Documents RLS Policies
CREATE POLICY "Users can view documents on accessible requests" ON public.documents FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.withdrawal_requests wr
        JOIN public.user_profiles up ON up.id = auth.uid()
        WHERE wr.id = request_id
        AND (
            up.role = 'admin' OR
            up.can_create_requests = true OR
            up.can_approve_reject = true OR
            up.can_disburse = true OR
            wr.created_by = auth.uid() OR
            wr.assigned_to = auth.uid()
        )
    )
);

CREATE POLICY "Archive team can upload documents" ON public.documents FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid()
        AND (role = 'admin' OR can_create_requests = true)
    )
);


