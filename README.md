# IntervAI

IntervAI is a full-stack AI interview practice platform. It helps users sign in with Google, upload a resume, generate role-based interview questions, answer timed questions, receive AI feedback, view interview reports, track interview history, and buy more credits through Razorpay.

The project is split into a React + Vite client and an Express + MongoDB server.

## Features

- Google authentication with Firebase on the client and JWT cookies on the server.
- Resume upload and AI-powered resume analysis.
- HR and Technical interview modes.
- AI-generated interview questions based on role, experience, skills, and resume content.
- Timed interview flow with answer submission.
- AI scoring for correctness, confidence, communication, feedback, and final score.
- Interview history and detailed report pages.
- Credit-based usage model.
- Razorpay payment flow for adding credits.

## Project Structure

```text
AI agent/
|-- client/
|   |-- public/
|   |   `-- logo.png
|   |-- src/
|   |   |-- assets/
|   |   |-- components/
|   |   |-- pages/
|   |   |-- redux/
|   |   |-- utils/
|   |   |-- App.jsx
|   |   |-- App.css
|   |   |-- index.css
|   |   `-- main.jsx
|   |-- index.html
|   |-- package.json
|   `-- vite.config.js
|-- server/
|   |-- config/
|   |-- controllers/
|   |-- middlewares/
|   |-- models/
|   |-- routes/
|   |-- services/
|   |-- index.js
|   `-- package.json
`-- README.md
```

## Tech Stack

### Client

- React
- Vite
- React Router
- Redux Toolkit
- Firebase Authentication
- Axios
- Tailwind CSS
- Motion
- Recharts
- jsPDF
- Razorpay Checkout

### Server

- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- Cookie Parser
- Multer
- PDF.js
- OpenRouter API
- Razorpay

## Prerequisites

Install these before running the project:

- Node.js
- npm
- MongoDB database connection string
- Firebase project with Google sign-in enabled
- OpenRouter API key
- Razorpay key ID and key secret

## Installation

Install dependencies for the client:

```bash
cd "AI agent/client"
npm install
```

Install dependencies for the server:

```bash
cd "../server"
npm install
```

## Environment Variables

Create a `.env` file inside `AI agent/server`:

```env
PORT=8000
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OPENROUTER_API_KEY=your_openrouter_api_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Create a `.env` file inside `AI agent/client`:

```env
VITE_FIREBASE_APIKEY=your_firebase_api_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

The client currently expects the API server at:

```js
http://localhost:8000
```

That value is defined in `client/src/App.jsx`.

## Run Locally

Start the backend server:

```bash
cd "AI agent/server"
npm run dev
```

Start the frontend in another terminal:

```bash
cd "AI agent/client"
npm run dev
```

Open the Vite URL shown in the terminal, usually:

```text
http://localhost:5173
```

## App Routes

Client routes:

- `/` - Home page
- `/auth` - Authentication page
- `/interview` - Interview setup and interview flow
- `/report/:id` - Interview report
- `/pricing` - Credit purchase page
- `/history` - Interview history

Server routes:

- `POST /api/auth/google` - Sign in or create a user from Google auth data.
- `GET /api/auth/logout` - Clear the auth cookie.
- `GET /api/user/current-user` - Get the currently authenticated user.
- `POST /api/interview/resume` - Upload and analyze a resume.
- `POST /api/interview/generate-questions` - Generate interview questions and create an interview record.
- `POST /api/interview/submit-answer` - Submit an answer and receive scoring feedback.
- `POST /api/interview/finish` - Finish an interview and calculate the final result.
- `GET /api/interview/get-interviews` - Get the current user's interview history.
- `GET /api/interview/report/:id` - Get a saved interview report.
- `POST /api/payment/order` - Create a Razorpay order.
- `POST /api/payment/verify` - Verify Razorpay payment and add credits.

## Core Workflow

1. The user signs in with Google.
2. The server creates or finds the user and stores a JWT in an HTTP cookie.
3. The user uploads a resume.
4. The backend extracts resume text and sends it to the AI service for structured analysis.
5. The user chooses interview details such as role, experience, and mode.
6. The backend generates interview questions through OpenRouter and stores the interview in MongoDB.
7. The user answers each question in the interview flow.
8. The backend evaluates answers and stores feedback and scores.
9. The interview is finalized and shown in a report.
10. The user can review previous interviews or purchase more credits.

## Important Notes

- Protected API routes require the auth cookie, so Axios requests must use `withCredentials: true`.
- The server CORS origin is configured for `http://localhost:5173`.
- The backend default port is `6000`, but the client is configured for `8000`; set `PORT=8000` in `server/.env`.
- The OpenRouter service currently uses the `openai/gpt-4o-mini` model.
- Payment verification depends on `RAZORPAY_KEY_SECRET`; keep it only in the server `.env`.
- Client-side Vite environment variables must start with `VITE_`.

## Troubleshooting

If the client cannot reach the server, check that:

- The backend is running.
- `PORT=8000` is set in `server/.env`.
- The client is running at `http://localhost:5173`.
- Browser requests include credentials.

If login fails, check that:

- Firebase Google authentication is enabled.
- `VITE_FIREBASE_APIKEY` is set.
- The backend `/api/auth/google` route is reachable.

If AI generation fails, check that:

- `OPENROUTER_API_KEY` is valid.
- The server has internet access.
- The uploaded resume is a readable PDF.

If payments fail, check that:

- `VITE_RAZORPAY_KEY_ID` matches the Razorpay key used by the server.
- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are set in `server/.env`.
- Razorpay checkout response data is being sent to `/api/payment/verify`.
