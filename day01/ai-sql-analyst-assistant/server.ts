import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Parse incoming JSON body
  app.use(express.json());

  // Safe lazy initializer for Gemini API client
  let ai: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI {
    if (!ai) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is not defined. Please set it in your environment.");
      }
      ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return ai;
  }

  // SQL analyst API processing endpoint
  app.post("/api/sql-analyze", async (req, res) => {
    try {
      const { dbType, schema, question } = req.body;

      if (!dbType || !schema || !question) {
        return res.status(400).json({
          error: "Missing required parameters. Please provide 'dbType', 'schema', and 'question'.",
        });
      }

      const client = getGeminiClient();

      const systemInstruction = `You are an expert Data Analyst, SQL Engineer, and Business Intelligence Consultant.
Your mission is to help users convert business questions into accurate, production-quality SQL queries and actionable business insights.

Understand the business objective. Analyze the schema carefully. Never invent tables or columns that do not exist.
Generate correct dialect-specific SQL (such as PostgreSQL, MySQL, BigQuery, Snowflake, SQLite, Spark SQL, SQL Server, Oracle, databases, etc.).
Recommend the most suitable chart and mock up the exact realistic output dataset to render a preview dashboard chart.

Your response MUST comply strictly with the JSON schema requested.`;

      const prompt = `Database Type Dialect: ${dbType}
Database Schema:
${schema}

Business Question:
${question}

Please perform the query generation, step-by-step SQL explanation, business insights synthesis, visualization mapping, and list any schema limitations or assumptions. Provide realistic numbers/rows in the mock visualization dataset.`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sql: {
                type: Type.STRING,
                description: "The pure SQL query, correctly formatted and adhering to the specified database type dialect.",
              },
              explanation: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Step-by-step list explaining exactly how the SQL works.",
              },
              insights: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Business implications, core KPI interpretation, and what decision this query helps support.",
              },
              visualization: {
                type: Type.OBJECT,
                description: "Chart visualization styling and realistic mock dataset mapping the query outcome.",
                properties: {
                  chartType: {
                    type: Type.STRING,
                    description: "Strictly one of: 'bar' (categories), 'line' (trends over time), 'pie' (contribution/shares), 'area' (cumulative trends).",
                  },
                  title: {
                    type: Type.STRING,
                    description: "Headline title for the visual dashboard card.",
                  },
                  labelKey: {
                    type: Type.STRING,
                    description: "Label key name to represent on the categorical axis (e.g., 'category', 'month', 'cohort').",
                  },
                  valueKey: {
                    type: Type.STRING,
                    description: "Value key name representing the metric field on the numeric axis (e.g., 'revenue', 'orders_count', 'conversion_rate').",
                  },
                  data: {
                    type: Type.ARRAY,
                    description: "A neat array of 5-8 realistic objects portraying simulated database output records. Each object must contain keys for both the labelKey and valueKey.",
                    items: {
                      type: Type.OBJECT,
                    },
                  },
                },
                required: ["chartType", "title", "labelKey", "valueKey", "data"],
              },
              assumptions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Assumptions made regarding missing schemas, columns, index recommendations, or data types.",
              },
            },
            required: ["sql", "explanation", "insights", "visualization", "assumptions"],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response text returned from the Gemini API.");
      }

      const result = JSON.parse(responseText);
      res.json(result);
    } catch (error: any) {
      console.error("SQL Analysis generation failed:", error);
      res.status(500).json({
        error: error?.message || "An unexpected error occurred during SQL generation.",
      });
    }
  });

  // Serve static UI / Dev middleware orchestration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI SQL Analyst Assistant running on port ${PORT}`);
  });
}

startServer();
