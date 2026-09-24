# VECTOR v2

Production-oriented AI workspace foundation for VECTOR.

Includes Express 5 backend, Supabase/PostgreSQL schema, auth, persistent conversations, projects, memory, assistants, agent planning, web search, file uploads, image-provider adapter, Paystack initialization, API-key foundation, admin overview, rate limiting, responsive web UI and legal/help pages.

Run:

    npm install
    cp .env.example .env
    npm start

Then open http://localhost:3000.

Run database/schema.sql in Supabase SQL Editor. Configure AI_API_URL/AI_API_KEY/AI_MODEL for an OpenAI-compatible AI endpoint. Configure IMAGE_API_URL/IMAGE_API_KEY for image generation and Paystack variables for payments.

Important: provider-specific PDF/DOCX/XLSX extraction, streaming, object storage, email verification, payment webhook verification, subscription lifecycle, embeddings/RAG, native Android features and final legal text still require production integration/testing.
