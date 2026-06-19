# 🤖 AI SQL Analyst Assistant

The **AI SQL Analyst Assistant** is an intelligent web application designed to translate natural language questions into database-ready SQL, generate step-by-step query explanations, extract business intelligence insights, and construct interactive dashboard visualizations from mock output tables.

*   **Live Demo:** [https://ai-sql-analyst-assistant-567449380471.asia-southeast1.run.app](https://ai-sql-analyst-assistant-567449380471.asia-southeast1.run.app)
*   **Course Day:** Day 1: Introduction to Agents & Agentic Workflows

---

## ✨ Features

*   **Natural Language to SQL:** Converts simple or complex business questions into optimized, dialect-specific SQL.
*   **Database Dialect Selector:** Supports PostgreSQL, MySQL, BigQuery, Snowflake, SQLite, Spark SQL, and Microsoft SQL Server.
*   **Step-by-Step Explanation:** Explains exactly what each part of the SQL query does so developers and database administrators can verify the logic.
*   **Business Insights Synthesis:** Analyzes the objective of the query to outline what decision it supports, what KPI it measures, and the business implications.
*   **Interactive Dashboard Chart Preview:** Dynamically recommends the best chart type (Bar, Line, Area, or Pie) and populates it with a realistic mock dataset matching the query's schema.
*   **Assumptions & Limitations Log:** Documents schema ambiguities, indexing recommendations, or missing details transparently.

---

## 🛠️ Tech Stack

*   **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Motion (for transitions/animations), Lucide React (for iconography)
*   **Backend:** Express, Node.js, `dotenv` for env variables
*   **AI Engine:** Google GenAI SDK (`@google/genai`) using the **`gemini-3.5-flash`** model with Structured JSON outputs for API schema enforcement.

---

## 🚀 Setup & Installation

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (version 18+ recommended).

### 1. Install Dependencies
Navigate to this folder and run:
```bash
npm install
```

### 2. Configure Environment Variables
Create a local `.env` file from the example template:
```bash
cp .env.example .env
```
Open the `.env` file and configure your API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
> Get a Gemini API key at [Google AI Studio](https://aistudio.google.com/).

### 3. Run the Development Server
```bash
npm run dev
```
The server will start, and Vite will serve the React frontend client. Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
To build the application for deployment (compiles the React frontend into static assets and bundles the Express server):
```bash
npm run build
npm start
```

---

> [!IMPORTANT]
> **Security Note:** Never commit your `.env` file containing the real `GEMINI_API_KEY` to public repositories. This folder has a local `.gitignore` that ignores `.env` and `.env.*` to keep keys private.
