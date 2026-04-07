-- Biclaw-server: Website Analysis SaaS Platform
-- Multi-tenant schema with organizations, websites, audit reports, and subscriptions

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Organizations (multi-tenant)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Organization members
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member', -- 'owner', 'admin', 'member'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(organization_id, user_id)
);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  plan_tier VARCHAR(50) DEFAULT 'starter', -- 'starter', 'pro', 'enterprise'
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'past_due', 'canceled', 'trialing'
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Websites to audit
CREATE TABLE websites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  url VARCHAR(2048) NOT NULL,
  domain VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  description TEXT,
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'archived'
  last_audited_at TIMESTAMP,
  audit_frequency VARCHAR(50) DEFAULT 'monthly', -- 'weekly', 'monthly', 'quarterly'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(organization_id, domain)
);

-- Competitor websites for benchmarking
CREATE TABLE competitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  competitor_url VARCHAR(2048) NOT NULL,
  competitor_domain VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(website_id, competitor_domain)
);

-- Audit reports
CREATE TABLE audit_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  audit_type VARCHAR(100) NOT NULL, -- 'seo', 'performance', 'security', 'design', 'content', 'competitor'
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed'
  overall_score INTEGER, -- 0-100
  data JSONB, -- Flexible storage for audit-specific data
  recommendations JSONB, -- Array of actionable recommendations
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit details (SEO)
CREATE TABLE audit_seo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES audit_reports(id) ON DELETE CASCADE,
  meta_title VARCHAR(255),
  meta_description VARCHAR(500),
  h1_tags TEXT[],
  h2_tags TEXT[],
  keyword_density JSONB,
  internal_links INTEGER,
  external_links INTEGER,
  broken_links INTEGER,
  mobile_friendly BOOLEAN,
  sitemap_present BOOLEAN,
  robots_txt_present BOOLEAN,
  schema_markup BOOLEAN,
  page_speed_score INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit details (Performance)
CREATE TABLE audit_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES audit_reports(id) ON DELETE CASCADE,
  page_load_time_ms INTEGER,
  time_to_first_byte_ms INTEGER,
  core_web_vitals JSONB, -- { largest_contentful_paint, first_input_delay, cumulative_layout_shift }
  total_page_size_kb DECIMAL(10,2),
  number_of_requests INTEGER,
  uncompressed_size_kb DECIMAL(10,2),
  unused_css_kb DECIMAL(10,2),
  unused_js_kb DECIMAL(10,2),
  lighthouse_score INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit details (Security)
CREATE TABLE audit_security (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES audit_reports(id) ON DELETE CASCADE,
  ssl_certificate_valid BOOLEAN,
  ssl_grade VARCHAR(10),
  has_csp BOOLEAN,
  has_x_frame_options BOOLEAN,
  has_x_content_type_options BOOLEAN,
  gdpr_compliant BOOLEAN,
  ccpa_compliant BOOLEAN,
  vulnerabilities INTEGER,
  security_headers JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit details (Content Analysis)
CREATE TABLE audit_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES audit_reports(id) ON DELETE CASCADE,
  total_word_count INTEGER,
  readability_score INTEGER,
  average_sentence_length DECIMAL(5,2),
  tone_analysis JSONB,
  keyword_optimization JSONB,
  duplicate_content_detected BOOLEAN,
  grammar_issues INTEGER,
  spelling_issues INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit details (Design/UX)
CREATE TABLE audit_design (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES audit_reports(id) ON DELETE CASCADE,
  color_palette JSONB,
  font_families TEXT[],
  accessibility_score INTEGER,
  wcag_compliance VARCHAR(10),
  contrast_issues INTEGER,
  missing_alt_text INTEGER,
  responsive_design BOOLEAN,
  mobile_usability_score INTEGER,
  cta_clarity_score INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Competitor comparison data
CREATE TABLE competitor_audit_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competitor_id UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
  metric_name VARCHAR(255),
  metric_value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_organizations_user_id ON organizations(user_id);
CREATE INDEX idx_organization_members_org_id ON organization_members(organization_id);
CREATE INDEX idx_organization_members_user_id ON organization_members(user_id);
CREATE INDEX idx_subscriptions_organization_id ON subscriptions(organization_id);
CREATE INDEX idx_websites_organization_id ON websites(organization_id);
CREATE INDEX idx_competitors_website_id ON competitors(website_id);
CREATE INDEX idx_audit_reports_website_id ON audit_reports(website_id);
CREATE INDEX idx_audit_reports_created_at ON audit_reports(created_at);
CREATE INDEX idx_audit_seo_report_id ON audit_seo(report_id);
CREATE INDEX idx_audit_performance_report_id ON audit_performance(report_id);
CREATE INDEX idx_audit_security_report_id ON audit_security(report_id);
CREATE INDEX idx_audit_content_report_id ON audit_content(report_id);
CREATE INDEX idx_audit_design_report_id ON audit_design(report_id);
CREATE INDEX idx_competitor_audit_data_competitor_id ON competitor_audit_data(competitor_id);
