# URL Shortener

A URL shortening service built with Express.js, PostgreSQL, and Drizzle ORM. This service allows users to create shortened URLs, manage them, and redirect to original URLs.

## Features

- 🔗 Create shortened URLs with custom or auto-generated codes
- 👤 User authentication with JWT
- 📊 Manage your shortened URLs (CRUD operations)
- 🔒 Secure password hashing with salt
- 🚀 Fast redirection to original URLs

## Tech Stack

- **Runtime**: Bun
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod
- **URL ID Generation**: NanoID

## Prerequisites

- [Bun](https://bun.sh/) installed on your system
- [Docker](https://www.docker.com/) and Docker Compose (for database)

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/ayushpatil0810/url-shortner
cd url-shortner
```

### 2. Install dependencies

```bash
bun install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
PORT=8000
DATABASE_URL=postgresql://postgres:mypassword@localhost:5432/postgres
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 4. Start the PostgreSQL database

```bash
docker-compose up -d
```

This will start a PostgreSQL database on port 5432.

### 5. Push database schema

```bash
bun run db:push
```

### 6. Start the development server

```bash
bun run dev
```

The server will start on `http://localhost:8000` (or the PORT specified in your .env file).

## Available Scripts

- `bun run dev` - Start the development server with hot reload
- `bun run db:push` - Push database schema changes to PostgreSQL
- `bun run db:studio` - Open Drizzle Studio for database management

---

## API Documentation

### Base URL

```
http://localhost:8000
```

### Authentication

Most endpoints require authentication using JWT tokens. Include the token in the request headers:

```
Authorization: Bearer <your-jwt-token>
```

---

## Endpoints

### Health Check

#### Get Server Status

```http
GET /
```

**Response:**

```json
{
  "status": "Server is up and running..."
}
```

---

### User Routes

#### 1. Sign Up

Create a new user account.

```http
POST /user/signup
```

**Request Body:**

```json
{
  "firstname": "John",
  "lastname": "Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

**Response:** `201 Created`

```json
{
  "data": {
    "userId": "user-id-here"
  }
}
```

**Error Response:** `400 Bad Request`

```json
{
  "error": "User with this email john.doe@example.com already exists!"
}
```

---

#### 2. Login

Authenticate and receive a JWT token.

```http
POST /user/login
```

**Request Body:**

```json
{
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

**Response:** `200 OK`

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

`404 Not Found`

```json
{
  "error": "User with email john.doe@example.com does not exists"
}
```

`400 Bad Request`

```json
{
  "error": "Invalid password"
}
```

---

### URL Routes

#### 3. Create Short URL

Create a new shortened URL. **Requires authentication.**

```http
POST /shorten
```

**Headers:**

```
Authorization: Bearer <your-jwt-token>
```

**Request Body:**

```json
{
  "targetURL": "https://www.example.com/very/long/url/path",
  "shortCode": "mycode"
}
```

**Note:** `shortCode` is optional. If not provided, a random code will be generated using NanoID.

**Response:** `201 Created`

```json
{
  "id": "url-id-here",
  "shortCode": "mycode",
  "targetURL": "https://www.example.com/very/long/url/path"
}
```

**Error Response:** `400 Bad Request`

```json
{
  "error": {
    // Zod validation errors
  }
}
```

---

#### 4. Get All Short URLs

Retrieve all shortened URLs created by the authenticated user. **Requires authentication.**

```http
GET /codes
```

**Headers:**

```
Authorization: Bearer <your-jwt-token>
```

**Response:** `200 OK`

```json
{
  "codes": [
    {
      "id": "url-id-1",
      "shortCode": "abc123",
      "targetURL": "https://www.example.com",
      "userId": "user-id",
      "createdAt": "2026-01-23T10:00:00Z"
    },
    {
      "id": "url-id-2",
      "shortCode": "xyz789",
      "targetURL": "https://www.google.com",
      "userId": "user-id",
      "createdAt": "2026-01-23T11:00:00Z"
    }
  ]
}
```

---

#### 5. Update Short URL

Update an existing shortened URL. **Requires authentication.**

```http
PATCH /:id
```

**Headers:**

```
Authorization: Bearer <your-jwt-token>
```

**URL Parameters:**

- `id` - The ID of the URL to update

**Request Body:**

```json
{
  "shortCode": "newcode",
  "targetURL": "https://www.newurl.com"
}
```

**Response:** `200 OK`

```json
{
  "updated": true
}
```

---

#### 6. Delete Short URL

Delete a shortened URL. **Requires authentication.**

```http
DELETE /:id
```

**Headers:**

```
Authorization: Bearer <your-jwt-token>
```

**URL Parameters:**

- `id` - The ID of the URL to delete

**Response:** `200 OK`

```json
{
  "deleted": true
}
```

---

#### 7. Redirect to Original URL

Redirect to the original URL using the short code. **No authentication required.**

```http
GET /:shortCode
```

**URL Parameters:**

- `shortCode` - The short code of the URL

**Example:**

```
GET /abc123
```

**Response:** `302 Redirect`

Redirects to the original URL associated with the short code.

**Error Response:** `404 Not Found`

```json
{
  "error": "Invalid URL"
}
```

---

## API Routes Summary

### User Routes

| Method | Endpoint       | Description             | Auth Required |
| ------ | -------------- | ----------------------- | ------------- |
| POST   | `/user/signup` | Register a new user     | ❌            |
| POST   | `/user/login`  | Login and receive token | ❌            |

### URL Routes

| Method | Endpoint      | Description                                | Auth Required |
| ------ | ------------- | ------------------------------------------ | ------------- |
| POST   | `/shorten`    | Create a short URL from a long one         | ✅            |
| GET    | `/codes`      | Get all URLs created by the logged-in user | ✅            |
| PATCH  | `/:id`        | Update a short URL (if it belongs to user) | ✅            |
| DELETE | `/:id`        | Delete a short URL (if it belongs to user) | ✅            |
| GET    | `/:shortCode` | Redirect to the original URL               | ❌            |

---

## Database Schema

### Users Table

- `id` - Unique user identifier
- `firstname` - User's first name
- `lastname` - User's last name
- `email` - User's email (unique)
- `password` - Hashed password
- `salt` - Salt used for password hashing

### URLs Table

- `id` - Unique URL identifier
- `shortCode` - The shortened code (unique)
- `targetURL` - The original URL
- `userId` - Reference to the user who created it
- `createdAt` - Timestamp of creation

---

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `302` - Redirect
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing or invalid token)
- `404` - Not Found
- `500` - Internal Server Error

---

## Development

### Database Management

To open Drizzle Studio and manage your database visually:

```bash
bun run db:studio
```

### Hot Reload

The development server (`bun run dev`) includes hot reload functionality, automatically restarting when you make changes to the code.

---

## Security Notes

- ⚠️ Always use a strong `JWT_SECRET` in production
- ⚠️ Change the default PostgreSQL password in `docker-compose.yml` for production
- ✅ Passwords are hashed using a salt before storage
- ✅ JWT tokens are used for stateless authentication
- ✅ User-specific URLs are protected by authentication middleware

---

## Example Usage

### 1. Create a user account

```bash
curl -X POST http://localhost:8000/user/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@example.com",
    "password": "mypassword"
  }'
```

### 2. Login to get a token

```bash
curl -X POST http://localhost:8000/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "mypassword"
  }'
```

### 3. Create a short URL

```bash
curl -X POST http://localhost:8000/shorten \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "targetURL": "https://www.example.com/very/long/url",
    "shortCode": "mylink"
  }'
```

### 4. Access the short URL

```bash
curl http://localhost:8000/mylink
```

---

