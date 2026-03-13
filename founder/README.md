# Founder

A Tinder-meets-LinkedIn platform for university students to find hackathon teammates and startup co-founders. Swipe on people by skills, scroll a project FYP like Instagram, get matched, reach out via AI-drafted email.

**Aesthetic:** Drop-out SF founder energy.

## Tech Stack

- **Frontend:** React + Vite + TailwindCSS
- **Auth:** Mock auth (x-mock-user-id header) — real auth (e.g. Cognito) not yet implemented
- **API:** AWS API Gateway REST + AWS Lambda (Node.js 20.x)
- **Storage:** AWS S3 (avatars, resume PDFs)
- **Database:** AWS DynamoDB (Users, Projects, Swipes)
- **AI:** AWS Bedrock (Claude Sonnet 4) — resume parsing, email drafting, skill matching
- **Resume OCR:** AWS Textract
- **Notifications:** AWS SNS (match alerts)
- **IaC:** AWS SAM

## Quick Start

### Backend

```bash
cd backend
npm install
sam build
sam deploy --config-env dev
```

No SenderEmail or SES setup required.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Set `VITE_API_URL` to your API Gateway invoke URL.

### Local API (localhost)

Run the full stack locally:

```bash
# Terminal 1: Backend (requires Docker for DynamoDB Local / sam local)
cd backend
sam build
sam local start-api --parameter-overrides Stage=dev
```

```bash
# Terminal 2: Frontend
cd frontend
cp .env.example .env   # or set VITE_API_URL=http://127.0.0.1:3000
npm run dev
```

With mock auth, sign in with any email/password to get started. The API uses the `x-mock-user-id` header.

### Seed demo data

After deploying (or running `sam local` against a deployed stack), seed 20 UofT profiles and 10 projects:

```bash
cd backend
npm install
FOUNDER_STAGE=dev node scripts/seed.js
```

## Project Structure

```
founder/
├── frontend/     # React + Vite app
├── backend/      # SAM template + Lambda functions
└── README.md
```
