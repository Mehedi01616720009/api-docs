const express = require("express");
const { ApiDoc, doc } = require("../dist/index");

const app = express();

const SERVER_PORT = process.env.PORT || 5000;
const API_BASE_URL = `http://localhost:${SERVER_PORT}/api/v1`;

app.use(express.json());

app.post("/api/v1/auth/login", (req, res) => {
    const { email, password } = req.body;

    if (email === "john@example.com" && password === "secret123") {
        res.json({
            token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            user: {
                id: "123",
                email: "john@example.com",
                name: "John Doe",
            },
        });
    } else {
        res.status(401).json({ error: "Invalid email or password" });
    }
});

app.post("/api/v1/auth/register", (req, res) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    res.status(201).json({
        id: "124",
        email,
        name,
    });
});

doc({
    method: "get",
    path: "/api/users",
    summary: "List all users",
    tags: ["User"],
    query: {
        page: {
            type: "number",
            required: false,
            default: 1,
            description: "Page number",
        },
        limit: {
            type: "number",
            required: false,
            default: 10,
            description: "Items per page",
        },
        search: {
            type: "string",
            required: false,
            description: "Search query",
        },
    },
    responses: {
        200: {
            description: "Users retrieved successfully",
            example: {
                users: [
                    { id: 1, email: "user1@example.com" },
                    { id: 2, email: "user2@example.com" },
                ],
                pagination: {
                    page: 1,
                    limit: 10,
                    total: 50,
                },
            },
        },
    },
});

app.get("/api/users", (req, res) => {
    res.json({
        data: [
            {
                id: "123",
                email: "john@example.com",
                name: "John Doe",
                createdAt: "2024-01-15T10:30:00Z",
            },
        ],
        pagination: {
            page: 1,
            limit: 10,
            total: 1,
        },
    });
});

app.get("/api/v1/users/:id", (req, res) => {
    res.json({
        id: req.params.id,
        email: "john@example.com",
        name: "John Doe",
        bio: "Software developer",
        createdAt: "2024-01-15T10:30:00Z",
    });
});

const apiDocs = new ApiDoc({
    title: "My Awesome API",
    version: "1.0.0",
    description: `# GitHub-Style API Documentation

**Version:** 1.0.0  
**Base URL:** \`https://api.yourdomain.com/v1\`  
**Last Updated:** February 10, 2026

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [Error Handling](#error-handling)
- [API Endpoints](#api-endpoints)
    - [Authentication](#authentication-endpoints)
    - [Users](#user-endpoints)
    - [Posts](#post-endpoints)
- [Data Models](#data-models)
- [Status Codes](#status-codes)

---

## Overview

This API provides programmatic access to a GitHub-style platform, allowing developers to integrate authentication, user management, and post functionalities into their applications.

### Key Features

- RESTful architecture
- JSON request/response format
- Token-based authentication (JWT)
- Comprehensive error messages
- Pagination support for list endpoints

### Base Requirements

- **Protocol:** HTTPS only
- **Content-Type:** \`application/json\`
- **Character Encoding:** UTF-8

---

## Authentication

All API requests (except registration and login) require authentication using JSON Web Tokens (JWT).

### Obtaining a Token

Send a POST request to \`/auth/login\` with valid credentials. The response will include an access token and refresh token.

### Using the Token

Include the access token in the Authorization header of your requests:

\`\`\`http
Authorization: Bearer YOUR_ACCESS_TOKEN
\`\`\`

### Token Expiration

- **Access Token:** Expires in 1 hour
- **Refresh Token:** Expires in 30 days

Use the \`/auth/refresh\` endpoint to obtain a new access token using your refresh token.

---

## Rate Limiting

API requests are rate-limited to ensure fair usage and system stability.

- **Authenticated requests:** 5000 requests per hour
- **Unauthenticated requests:** 60 requests per hour

### Rate Limit Headers

Each API response includes the following headers:

\`\`\`http
X-RateLimit-Limit: 5000
X-RateLimit-Remaining: 4999
X-RateLimit-Reset: 1612345678
\`\`\`

---

## Error Handling

### Error Response Format

\`\`\`json
{
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "The request could not be processed due to validation errors",
        "details": [
            {
                "field": "email",
                "message": "Email is required"
            }
        ],
        "timestamp": "2026-02-10T10:30:00Z"
    }
}
\`\`\`

### Common Error Codes

| Code                  | Description                       |
| --------------------- | --------------------------------- |
| \`VALIDATION_ERROR\`    | Request validation failed         |
| \`UNAUTHORIZED\`        | Authentication required or failed |
| \`FORBIDDEN\`           | Insufficient permissions          |
| \`NOT_FOUND\`           | Resource not found                |
| \`CONFLICT\`            | Resource already exists           |
| \`RATE_LIMIT_EXCEEDED\` | Too many requests                 |
| \`INTERNAL_ERROR\`      | Server error                      |

---

## API Endpoints

### Authentication Endpoints

#### Register User

Create a new user account.

**Endpoint:** \`POST /auth/register\`

**Request Body:**

\`\`\`json
{
    "username": "johndoe",
    "email": "john.doe@example.com",
    "password": "SecureP@ssw0rd123",
    "full_name": "John Doe"
}
\`\`\`

**Response:** \`201 Created\`

\`\`\`json
{
    "data": {
        "user": {
            "id": 1,
            "username": "johndoe",
            "email": "john.doe@example.com",
            "full_name": "John Doe",
            "avatar_url": null,
            "created_at": "2026-02-10T10:30:00Z"
        },
        "tokens": {
            "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "token_type": "Bearer",
            "expires_in": 3600
        }
    }
}
\`\`\`

**Validation Rules:**

- \`username\`: Required, 3-30 characters, alphanumeric and underscores only, unique
- \`email\`: Required, valid email format, unique
- \`password\`: Required, minimum 8 characters, must contain uppercase, lowercase, number, and special character
- \`full_name\`: Required, 2-100 characters

---

#### Login

Authenticate a user and receive access tokens.

**Endpoint:** \`POST /auth/login\`

**Request Body:**

\`\`\`json
{
    "email": "john.doe@example.com",
    "password": "SecureP@ssw0rd123"
}
\`\`\`

**Response:** \`200 OK\`

\`\`\`json
{
    "data": {
        "user": {
            "id": 1,
            "username": "johndoe",
            "email": "john.doe@example.com",
            "full_name": "John Doe",
            "avatar_url": "https://api.yourdomain.com/avatars/johndoe.jpg",
            "bio": "Software developer",
            "created_at": "2026-02-10T10:30:00Z"
        },
        "tokens": {
            "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "token_type": "Bearer",
            "expires_in": 3600
        }
    }
}
\`\`\`

---

#### Refresh Token

Obtain a new access token using a refresh token.

**Endpoint:** \`POST /auth/refresh\`

**Request Body:**

\`\`\`json
{
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
\`\`\`

**Response:** \`200 OK\`

\`\`\`json
{
    "data": {
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "token_type": "Bearer",
        "expires_in": 3600
    }
}
\`\`\`

---

#### Logout

Invalidate the current refresh token.

**Endpoint:** \`POST /auth/logout\`

**Headers:**

\`\`\`http
Authorization: Bearer YOUR_ACCESS_TOKEN
\`\`\`

**Request Body:**

\`\`\`json
{
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
\`\`\`

**Response:** \`200 OK\`

\`\`\`json
{
    "data": {
        "message": "Successfully logged out"
    }
}
\`\`\`

---

#### Change Password

Change the current user's password.

**Endpoint:** \`PUT /auth/password\`

**Headers:**

\`\`\`http
Authorization: Bearer YOUR_ACCESS_TOKEN
\`\`\`

**Request Body:**

\`\`\`json
{
    "current_password": "SecureP@ssw0rd123",
    "new_password": "NewSecureP@ssw0rd456"
}
\`\`\`

**Response:** \`200 OK\`

\`\`\`json
{
    "data": {
        "message": "Password successfully updated"
    }
}
\`\`\`

---

#### Request Password Reset

Request a password reset token to be sent via email.

**Endpoint:** \`POST /auth/password/reset-request\`

**Request Body:**

\`\`\`json
{
    "email": "john.doe@example.com"
}
\`\`\`

**Response:** \`200 OK\`

\`\`\`json
{
    "data": {
        "message": "Password reset instructions have been sent to your email"
    }
}
\`\`\`

---

#### Reset Password

Reset password using the token received via email.

**Endpoint:** \`POST /auth/password/reset\`

**Request Body:**

\`\`\`json
{
    "token": "a1b2c3d4e5f6g7h8i9j0",
    "new_password": "NewSecureP@ssw0rd456"
}
\`\`\`

**Response:** \`200 OK\`

\`\`\`json
{
    "data": {
        "message": "Password successfully reset"
    }
}
\`\`\`

---`,

    // IMPORTANT: Set the baseUrl to your actual API base URL
    baseUrl: API_BASE_URL,

    // Default authentication
    defaultAuth: {
        type: "Bearer",
        bearerFormat: "JWT",
    },
});

app.use(apiDocs.middleware());

app.get("/", (req, res) => {
    res.send(`
    <html>
      <head>
        <title>API Docs Example</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            line-height: 1.6;
          }
          h1 { color: #3b82f6; }
          a {
            display: inline-block;
            margin: 10px 0;
            padding: 12px 24px;
            background: #3b82f6;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 500;
          }
          a:hover { background: #2563eb; }
          code {
            background: #f3f4f6;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
          }
          .section {
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .config {
            background: #e0f2fe;
            padding: 15px;
            border-left: 4px solid #0284c7;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <h1>🚀 API Docs Express Example</h1>
        <p>Welcome to the API Docs Express example server!</p>
        
        <a href="/api-docs">View API Documentation →</a>
        
        <div class="config">
          <h3>Current Configuration:</h3>
          <ul>
            <li><strong>Server Port:</strong> ${SERVER_PORT}</li>
            <li><strong>API Base URL:</strong> ${API_BASE_URL}</li>
          </ul>
          <p><small>💡 You can change these values at the top of <code>example/server.js</code></small></p>
        </div>
        
        <div class="section">
          <h2>Available Endpoints:</h2>
          <ul>
            <li><code>GET /</code> - This page</li>
            <li><code>POST /api/v1/auth/login</code> - Login endpoint</li>
            <li><code>POST /api/v1/auth/register</code> - Registration endpoint</li>
            <li><code>GET /api/v1/users</code> - Get all users</li>
            <li><code>GET /api/v1/users/:id</code> - Get user by ID</li>
          </ul>
        </div>
        
        <div class="section">
          <h2>Quick Test:</h2>
          <p>Try logging in with:</p>
          <pre>
curl -X POST http://localhost:${SERVER_PORT}/api/v1/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"john@example.com","password":"secret123"}'
          </pre>
        </div>
        
        <div class="section">
          <h2>Customize Port & Path:</h2>
          <p>Edit <code>example/server.js</code> and change:</p>
          <pre>
const SERVER_PORT = 5000;
const DOCS_PATH = '/api-docs';
          </pre>
          <p>Then restart the server!</p>
        </div>
        
        <p><small>Server running on port ${SERVER_PORT}</small></p>
      </body>
    </html>
  `);
});

app.listen(SERVER_PORT, () => {
    console.log(`
🚀 Server is running!

📚 API Documentation: http://localhost:${SERVER_PORT}/api-docs
🏠 Home Page: http://localhost:${SERVER_PORT}

✨ Features enabled:
   - Interactive API testing
   - Search functionality
   - Code examples
   - Custom theme

💡 Configuration:
   - Server Port: ${SERVER_PORT}
   - API Base URL: ${API_BASE_URL}

🔧 To customize:
   - Edit SERVER_PORT to change the port
   - Edit API_BASE_URL to match your API
  `);
});
