import { SchemaPreset } from "./types";

export const SCHEMA_PRESETS: SchemaPreset[] = [
  {
    id: "ecommerce",
    name: "E-Commerce Market Analysis",
    description: "Multi-table relational schema containing customer personas, order records, catalog products, and line items.",
    dbType: "PostgreSQL",
    schema: `CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  city VARCHAR(50),
  country VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  loyalty_tier VARCHAR(20) DEFAULT 'Standard' -- 'Standard', 'Silver', 'Gold', 'Platinum'
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  sku VARCHAR(30) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'Electronics', 'Apparel', 'Home', 'Beauty', etc.
  price DECIMAL(10, 2) NOT NULL,
  cost DECIMAL(10, 2) NOT NULL,
  stock_quantity INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  order_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) NOT NULL, -- 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'
  shipping_fee DECIMAL(8, 2) DEFAULT 0.00,
  tax_amount DECIMAL(8, 2) DEFAULT 0.00,
  total_amount DECIMAL(10, 2) NOT NULL
);

CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id),
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0.00
);`,
    sampleQuestions: [
      {
        question: "Calculate the total revenue, total cost, and gross profit margin percentage by product category, ordered by gross profit descending.",
        description: "Analyze profitability dynamics across the storefront inventory categories."
      },
      {
        question: "Identify the top 5 customers with the highest cumulative purchase amount who have ordered at least 3 times. Include their full name, country, loyalty tier, and total order count.",
        description: "Surface and profile your most valuable repeat shoppers."
      },
      {
        question: "Find the monthly customer retention rate. Specifically, for users who placed their first order in a given month, what percentage placed a subsequent order in the following calendar month?",
        description: "Advanced cohorts logic using window functions to calculate user retention."
      }
    ]
  },
  {
    id: "saas",
    name: "SaaS Subscription Analytics",
    description: "Database model of accounts, recurring packages, usage meters, invoicing, and support cycles.",
    dbType: "Snowflake",
    schema: `CREATE TABLE organizations (
  org_id VARCHAR(50) PRIMARY KEY,
  company_name VARCHAR(100) NOT NULL,
  industry VARCHAR(50),
  country VARCHAR(50),
  join_date DATE NOT NULL
);

CREATE TABLE subscription_plans (
  plan_code VARCHAR(30) PRIMARY KEY, -- 'LAUNCH', 'GROWTH', 'ENTERPRISE'
  plan_name VARCHAR(50) NOT NULL,
  monthly_price DECIMAL(10, 2) NOT NULL,
  user_limit INT NOT NULL,
  api_credit_limit BIGINT NOT NULL
);

CREATE TABLE organization_subscriptions (
  subscription_id VARCHAR(50) PRIMARY KEY,
  org_id VARCHAR(50) REFERENCES organizations(org_id),
  plan_code VARCHAR(30) REFERENCES subscription_plans(plan_code),
  status VARCHAR(20) NOT NULL, -- 'active', 'paused', 'canceled', 'past_due'
  start_date DATE NOT NULL,
  end_date DATE,
  auto_renew BOOLEAN DEFAULT TRUE
);

CREATE TABLE usage_logs (
  log_id BIGINT PRIMARY KEY,
  org_id VARCHAR(50) REFERENCES organizations(org_id),
  recorded_at TIMESTAMP NOT NULL,
  api_requests_count INT NOT NULL,
  storage_bytes_used BIGINT NOT NULL,
  active_users_count INT NOT NULL
);

CREATE TABLE invoices (
  invoice_id VARCHAR(50) PRIMARY KEY,
  org_id VARCHAR(50) REFERENCES organizations(org_id),
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  amount_due DECIMAL(10, 2) NOT NULL,
  amount_paid DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) NOT NULL -- 'paid', 'unpaid', 'voided', 'refunded'
);`,
    sampleQuestions: [
      {
        question: "Calculate Monthly Recurring Revenue (MRR) for currently active organizations, grouped by plan tier, indicating count of subscriptions in each tier.",
        description: "Understand continuous incoming SaaS revenue stream components."
      },
      {
        question: "List organizations that have exceeded 90% of their subscription plan's API credit limit based on cumulative usage logs from the last 30 days. Show org name, plan limit, combined usages, and percentage overrun.",
        description: "Detect expansion upsell opportunities or customer success flags."
      },
      {
        question: "Calculate the average days from invoice issue to payment for paid invoices, segmented by industry.",
        description: "Reveal cash flow efficiency trends across different accounts verticals."
      }
    ]
  },
  {
    id: "rideshare",
    name: "Rideshare Platform Metrics",
    description: "Analytical schemas mapping riders, available driver states, point-to-point trips, surging rates, and ratings.",
    dbType: "BigQuery",
    schema: `-- BigQuery Schema representing ride-hailing interactions
CREATE TABLE riders (
  rider_id STRING,
  signup_timestamp TIMESTAMP,
  vip_status STRING, -- 'Tier_1', 'Tier_2', 'None'
  preferred_payment_type STRING
);

CREATE TABLE drivers (
  driver_id STRING,
  vehicle_type STRING, -- 'Standard', 'XL', 'Lux'
  joining_date DATE,
  rating_average FLOAT64,
  is_active_flag BOOLEAN
);

CREATE TABLE trips (
  trip_id STRING,
  rider_id STRING,
  driver_id STRING,
  pickup_timestamp TIMESTAMP,
  dropoff_timestamp TIMESTAMP,
  distance_miles FLOAT64,
  duration_minutes FLOAT64,
  pickup_city STRING,
  fare_amount NUMERIC,
  surge_multiplier NUMERIC,
  payment_status STRING
);

CREATE TABLE driver_ratings (
  rating_id STRING,
  trip_id STRING,
  rating_score INT64, -- 1 to 5 stars
  feedback_category STRING -- 'Cleanliness', 'Navigation', 'Politeness', 'Safety', etc.
);`,
    sampleQuestions: [
      {
        question: "Find the average hourly fare amount, trip distance in miles, and total number of trips completed in 'New York City' during peak weekend hours (Friday & Saturday between 6 PM and 11:59 PM).",
        description: "Formulate surge rate profiles during prime travel hours."
      },
      {
        question: "Analyze driver performance: Rank drivers by completed rides within ('Standard' vehicle_type) who maintain an average ride distance >= 3 miles, including their average rating score and total fare generated.",
        description: "Optimize driver incentives or recognition programs based on high service volume."
      }
    ]
  },
  {
    id: "hospital",
    name: "Healthcare Operations",
    description: "Standard clinical operational tables containing patient demographic details, consultant assignments, and bill status.",
    dbType: "SQL Server",
    schema: `CREATE TABLE Patients (
  PatientID INT PRIMARY KEY IDENTITY(1,1),
  FirstName NVARCHAR(50) NOT NULL,
  LastName NVARCHAR(50) NOT NULL,
  Gender NCHAR(1) CHECK (Gender IN ('M', 'F', 'O')),
  BirthDate DATE NOT NULL,
  InsuranceProvider NVARCHAR(100),
  DateAdded DATETIME DEFAULT GETDATE()
);

CREATE TABLE Doctors (
  DoctorID INT PRIMARY KEY IDENTITY(1,1),
  FirstName NVARCHAR(50) NOT NULL,
  LastName NVARCHAR(50) NOT NULL,
  Specialty NVARCHAR(100) NOT NULL, -- 'Cardiology', 'Pediatrics', 'Neurology', etc.
  DirectPhone NVARCHAR(20)
);

CREATE TABLE Appointments (
  AppointmentID INT PRIMARY KEY IDENTITY(1,1),
  PatientID INT FOREIGN KEY REFERENCES Patients(PatientID),
  DoctorID INT FOREIGN KEY REFERENCES Doctors(DoctorID),
  AppointmentDateTime DATETIME NOT NULL,
  Status NVARCHAR(20) NOT NULL DEFAULT 'Scheduled', -- 'Scheduled', 'Completed', 'Cancelled', 'No-Show'
  DiagnosisNotes NVARCHAR(MAX),
  CoPayAmount DECIMAL(6,2) DEFAULT 0.00
);

CREATE TABLE BillingRecords (
  BillID INT PRIMARY KEY IDENTITY(1,1),
  PatientID INT FOREIGN KEY REFERENCES Patients(PatientID),
  AppointmentID INT FOREIGN KEY REFERENCES Appointments(AppointmentID),
  InvoiceAmount DECIMAL(10,2) NOT NULL,
  InsurancePaid DECIMAL(10,2) DEFAULT 0.00,
  PatientPaid DECIMAL(10,2) DEFAULT 0.00,
  DueDate DATE NOT NULL,
  IsSettled BIT DEFAULT 0 -- 0: Unsettled, 1: Settled
);`,
    sampleQuestions: [
      {
        question: "Identify appointments count and appointment completion rates (Completed vs total scheduled) per clinical Specialty, ordered by completion rate descending.",
        description: "Examine scheduling efficiency and department attendance."
      },
      {
        question: "Summarize total outstanding billing amount (InvoiceAmount - InsurancePaid - PatientPaid) grouped by patient age cohorts: 'Under 18', '18-35', '36-60', '61+'. Include settled vs unsettled counts.",
        description: "Assess financial collection targets across patient demographic segments."
      }
    ]
  }
];
