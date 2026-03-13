# Founder

A Tinder-meets-LinkedIn platform for university students to find hackathon teammates and startup co-founders. Swipe on people by skills, scroll a project FYP like Instagram, get matched, reach out via AI-drafted email.

**Aesthetic:** Drop-out SF founder energy.

## Tech Stack

- **Frontend:** React + Vite + TailwindCSS (AWS Amplify)
- **Auth:** AWS Cognito (email/password + Google OAuth)
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

### Local API (optional)

Run the API locally with `sam local start-api` (requires Docker). Lambdas connect to your deployed AWS resources (DynamoDB, Cognito, etc.):

```bash
cd backend
sam build
sam local start-api --parameter-overrides Stage=dev
```

Set `VITE_API_URL` to `http://127.0.0.1:3000` when using local API.

## Project Structure

```
founder/
├── frontend/     # React + Vite app
├── backend/      # SAM template + Lambda functions
└── README.md
```
