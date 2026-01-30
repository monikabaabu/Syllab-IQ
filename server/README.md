# Server

Backend server for the codeothon project.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env` file

3. Start the development server:
```bash
npm run dev
```

## Directory Structure

```
server/
├── config/          # Configuration files (database, etc.)
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # Data models
├── routes/          # API routes
├── index.js         # Entry point
├── .env             # Environment variables
└── package.json     # Dependencies
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

## TODO
- Set up database (MongoDB/PostgreSQL/MySQL)
- Implement JWT authentication
- Add input validation
- Add error handling middleware
- Set up logging
