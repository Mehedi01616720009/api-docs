import express, { Application, Request, Response } from "express";
import router from "./routes";
import { ApiDoc, CODE_THEMES, doc } from "../../dist";

// initialize express application
const app: Application = express();

// express parser
app.use(express.json());

// initial route
app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        status: 200,
        success: true,
        message: "Server is running successfully",
        data: new Date(new Date().getTime() + 6 * 60 * 60 * 1000),
    });
});

doc({
    method: "get",
    path: "/api",
    summary: "Main endpoint lorem ipsum dolor sem",
    responses: {
        200: {
            description: "Server successfully running",
            example: {
                status: 200,
                message: "Server running",
                data: null,
            },
        },
    },
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

doc({
    method: "post",
    path: "/api/users",
    summary: "Create user",
    tags: ["User"],
    body: {
        contentType: "application/json",
        required: true,
        schema: {
            name: {
                type: "string",
                required: true,
                description: "Name of user",
            },
            email: {
                type: "string",
                required: true,
                description: "Email of user",
            },
            phone: {
                type: "string",
                required: true,
                description: "Phone of user",
            },
            age: {
                type: "number",
                required: false,
                description: "Age of user",
            },
        },
        example: {
            name: "John Doe",
            email: "john.doe@example.com",
            phone: "+8801617219047",
        },
    },
    responses: {
        201: {
            description: "Users created successfully",
            example: {
                status: 201,
                success: true,
                message: "Users created successfully",
                data: {
                    id: 1,
                    name: "John Doe",
                    email: "john.doe@example.com",
                    phone: "+8801617219047",
                    age: null,
                    isDeleted: false,
                    createdAt: "2026-02-15T14:15:23.398Z",
                    updatedAt: "2026-02-15T14:15:23.398Z",
                },
            },
        },
        409: {
            description: "User exist",
            example: {
                status: 409,
                success: false,
                message: "User exist",
                errorMessages: [
                    {
                        path: "",
                        message: "User exist",
                    },
                ],
                stack: null,
            },
        },
    },
});

/**
 * COMPREHENSIVE EXAMPLE — Using EVERY feature of doc()
 *
 * This single route demonstrates all available options:
 * - method, path
 * - summary, description, note
 * - tags, deprecated, auth
 * - params (path parameters)
 * - query (query string parameters)
 * - headers (request headers)
 * - body (request body with schema)
 * - responses (multiple status codes with schemas and examples)
 */

// ══════════════════════════════════════════════════════════════
// PATCH /users/:userId/update-user
// ══════════════════════════════════════════════════════════════

doc({
    // ── HTTP Method & Path ────────────────────────────────────
    method: "patch",
    path: "/users/:userId/update-user",

    // ── Basic Metadata ────────────────────────────────────────
    summary: "Update user profile",
    description: `Updates a user's profile information. Supports partial updates.
Only provided fields will be updated.

**Note:** Email changes require email verification.`,
    note: `### Important Notes:
- This endpoint requires authentication
- Only the user themselves or admins can update a profile
- Profile photo must be uploaded separately via /upload endpoint`,

    // ── Grouping & Status ─────────────────────────────────────
    tags: ["User"],
    deprecated: true,

    // ── Authentication ────────────────────────────────────────
    auth: {
        required: true,
        type: "Bearer",
        scopes: ["user:write", "profile:update"],
    },

    // ── Path Parameters (:userId) ─────────────────────────────
    params: {
        userId: {
            required: true,
            type: "string",
            description: "The unique identifier of the user",
            pattern: "^usr_[a-zA-Z0-9]{12}$",
            enum: ["2738", "2748"],
        },
        orderId: {
            type: "string",
            required: true,
            description: "The unique identifier of the order",
            example: "ord_1a2b3c4d5e6f",
            pattern: "^ord_[a-zA-Z0-9]{12}$",
        },
    },

    // ── Query Parameters (?notify=true&sendEmail=false) ──────
    query: {
        notify: {
            type: "boolean",
            required: false,
            default: true,
            description: "Send push notification about profile update",
            example: true,
        },
        sendEmail: {
            type: "boolean",
            required: false,
            default: false,
            description: "Send email confirmation of changes",
            example: false,
        },
        auditLog: {
            type: "boolean",
            required: false,
            default: true,
            description: "Log this action in audit trail",
        },
        returnFullProfile: {
            type: "boolean",
            required: false,
            default: false,
            description:
                "Return complete user profile in response (otherwise just updated fields)",
        },
    },

    // ── Headers ───────────────────────────────────────────────
    headers: {
        Authorization: {
            type: "string",
            required: true,
            description: "Bearer token for authentication",
            example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            pattern:
                "^Bearer [A-Za-z0-9-_=]+\\.[A-Za-z0-9-_=]+\\.?[A-Za-z0-9-_.+/=]*$",
        },
        "X-Client-Version": {
            type: "string",
            required: false,
            description: "Client app version for compatibility checks",
            example: "2.5.1",
            pattern: "^\\d+\\.\\d+\\.\\d+$",
        },
        "X-Request-ID": {
            type: "string",
            required: false,
            description: "Unique request identifier for tracing",
            example: "req_9f8e7d6c5b4a",
        },
    },

    // ── Request Body ──────────────────────────────────────────
    body: {
        contentType: "application/json",
        required: true,
        description:
            "User profile fields to update. All fields are optional (partial update).",

        schema: {
            // ── Basic Info ────────────────────────────────────
            firstName: {
                type: "string",
                required: false,
                description: "User's first name",
                example: "John",
                minLength: 1,
                maxLength: 50,
            },
            lastName: {
                type: "string",
                required: false,
                description: "User's last name",
                example: "Doe",
                minLength: 1,
                maxLength: 50,
            },
            email: {
                type: "string",
                required: false,
                description: "New email address (requires verification)",
                example: "john.doe@example.com",
                pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
            },
            phoneNumber: {
                type: "string",
                required: false,
                description: "Phone number with country code",
                example: "+1234567890",
                pattern: "^\\+[1-9]\\d{1,14}$",
            },

            // ── Profile Details ───────────────────────────────
            dateOfBirth: {
                type: "string",
                required: false,
                description: "Date of birth in ISO 8601 format",
                example: "1990-05-15",
                pattern: "^\\d{4}-\\d{2}-\\d{2}$",
            },
            gender: {
                type: "string",
                required: false,
                description: "User's gender",
                example: "male",
                enum: ["male", "female", "non-binary", "prefer-not-to-say"],
            },
            bio: {
                type: "string",
                required: false,
                description: "Short biography or description",
                example:
                    "Software engineer passionate about TypeScript and API design.",
                maxLength: 500,
            },

            // ── Address ───────────────────────────────────────
            address: {
                type: "object",
                required: false,
                description: "Physical address",
                example: {
                    street: "123 Main St",
                    city: "San Francisco",
                    state: "CA",
                    zipCode: "94102",
                    country: "USA",
                },
            },

            // ── Preferences ───────────────────────────────────
            language: {
                type: "string",
                required: false,
                description: "Preferred language (ISO 639-1 code)",
                example: "en",
                enum: ["en", "es", "fr", "de", "ja", "zh", "ar"],
                minLength: 2,
                maxLength: 2,
            },
            timezone: {
                type: "string",
                required: false,
                description: "User's timezone (IANA timezone)",
                example: "America/Los_Angeles",
            },
            theme: {
                type: "string",
                required: false,
                description: "UI theme preference",
                example: "dark",
                enum: ["light", "dark", "auto"],
                default: "auto",
            },

            // ── Settings ──────────────────────────────────────
            emailNotifications: {
                type: "boolean",
                required: false,
                description: "Enable email notifications",
                example: true,
                default: true,
            },
            pushNotifications: {
                type: "boolean",
                required: false,
                description: "Enable push notifications",
                example: true,
                default: true,
            },
            marketingEmails: {
                type: "boolean",
                required: false,
                description: "Opt-in for marketing communications",
                example: false,
                default: false,
            },

            // ── Social Links ──────────────────────────────────
            socialLinks: {
                type: "object",
                required: false,
                description: "Social media profile links",
                example: {
                    twitter: "https://twitter.com/johndoe",
                    linkedin: "https://linkedin.com/in/johndoe",
                    github: "https://github.com/johndoe",
                },
            },

            // ── Metadata ──────────────────────────────────────
            customFields: {
                type: "object",
                required: false,
                description: "Additional custom fields (key-value pairs)",
                example: {
                    department: "Engineering",
                    employeeId: "EMP-12345",
                },
            },
        },

        // ── Complete Body Example ─────────────────────────────
        example: {
            firstName: "John",
            lastName: "Doe",
            email: "john.doe.updated@example.com",
            phoneNumber: "+14155551234",
            dateOfBirth: "1990-05-15",
            gender: "male",
            bio: "Senior TypeScript developer and API enthusiast.",
            address: {
                street: "456 Oak Avenue",
                city: "San Francisco",
                state: "CA",
                zipCode: "94110",
                country: "USA",
            },
            language: "en",
            timezone: "America/Los_Angeles",
            theme: "dark",
            emailNotifications: true,
            pushNotifications: true,
            marketingEmails: false,
            socialLinks: {
                twitter: "https://twitter.com/johndoe",
                github: "https://github.com/johndoe",
            },
            customFields: {
                department: "Engineering",
                role: "Tech Lead",
            },
        },
    },

    // ── Responses ─────────────────────────────────────────────
    responses: {
        // ── 200 Success ───────────────────────────────────────
        200: {
            description: "User profile updated successfully",
            contentType: "application/json",
            schema: {
                success: {
                    type: "boolean",
                    example: true,
                },
                message: {
                    type: "string",
                    example: "Profile updated successfully",
                },
                data: {
                    type: "object",
                    description: "Updated user profile",
                },
                updatedFields: {
                    type: "array",
                    description: "List of fields that were updated",
                    example: ["firstName", "email", "bio"],
                },
                warnings: {
                    type: "array",
                    description:
                        "Non-critical warnings (e.g., email verification needed)",
                },
            },
            example: {
                success: true,
                message: "Profile updated successfully",
                data: {
                    userId: "usr_1a2b3c4d5e6f",
                    firstName: "John",
                    lastName: "Doe",
                    email: "john.doe.updated@example.com",
                    emailVerified: false,
                    phoneNumber: "+14155551234",
                    dateOfBirth: "1990-05-15",
                    gender: "male",
                    bio: "Senior TypeScript developer and API enthusiast.",
                    profilePicture:
                        "https://cdn.example.com/avatars/usr_1a2b3c4d5e6f.jpg",
                    address: {
                        street: "456 Oak Avenue",
                        city: "San Francisco",
                        state: "CA",
                        zipCode: "94110",
                        country: "USA",
                    },
                    language: "en",
                    timezone: "America/Los_Angeles",
                    theme: "dark",
                    emailNotifications: true,
                    pushNotifications: true,
                    marketingEmails: false,
                    socialLinks: {
                        twitter: "https://twitter.com/johndoe",
                        github: "https://github.com/johndoe",
                    },
                    customFields: {
                        department: "Engineering",
                        role: "Tech Lead",
                    },
                    createdAt: "2024-01-15T10:30:00Z",
                    updatedAt: "2024-02-19T14:25:30Z",
                },
                updatedFields: [
                    "firstName",
                    "email",
                    "bio",
                    "theme",
                    "socialLinks",
                ],
                warnings: [
                    {
                        field: "email",
                        message:
                            "Email verification required. Check your inbox.",
                    },
                ],
            },
        },

        // ── 400 Bad Request ───────────────────────────────────
        400: {
            description: "Validation error or invalid request data",
            contentType: "application/json",
            schema: {
                success: {
                    type: "boolean",
                    example: false,
                },
                error: {
                    type: "string",
                    example: "Validation Error",
                },
                details: {
                    type: "array",
                    description: "Detailed validation errors",
                },
            },
            example: {
                success: false,
                error: "Validation Error",
                details: [
                    {
                        field: "email",
                        message: "Invalid email format",
                        value: "not-an-email",
                    },
                    {
                        field: "phoneNumber",
                        message: "Phone number must include country code",
                        value: "5551234",
                    },
                ],
            },
        },

        // ── 401 Unauthorized ──────────────────────────────────
        401: {
            description: "Missing or invalid authentication token",
            contentType: "application/json",
            example: {
                success: false,
                error: "Unauthorized",
                message: "Invalid or expired authentication token",
            },
        },

        // ── 403 Forbidden ─────────────────────────────────────
        403: {
            description: "User does not have permission to update this profile",
            contentType: "application/json",
            example: {
                success: false,
                error: "Forbidden",
                message:
                    "You do not have permission to update this user profile",
            },
        },

        // ── 404 Not Found ─────────────────────────────────────
        404: {
            description: "User not found",
            contentType: "application/json",
            example: {
                success: false,
                error: "Not Found",
                message: "User with ID usr_1a2b3c4d5e6f not found",
            },
        },

        // ── 409 Conflict ──────────────────────────────────────
        409: {
            description: "Email or phone number already in use by another user",
            contentType: "application/json",
            schema: {
                success: {
                    type: "boolean",
                    example: false,
                },
                error: {
                    type: "string",
                    example: "Conflict",
                },
                message: {
                    type: "string",
                },
                conflictingField: {
                    type: "string",
                    example: "email",
                },
            },
            example: {
                success: false,
                error: "Conflict",
                message: "Email address already in use",
                conflictingField: "email",
            },
        },

        // ── 422 Unprocessable Entity ──────────────────────────
        422: {
            description: "Validation passed but business logic rules violated",
            contentType: "application/json",
            example: {
                success: false,
                error: "Unprocessable Entity",
                message: "User must be at least 13 years old",
                field: "dateOfBirth",
            },
        },

        // ── 429 Too Many Requests ─────────────────────────────
        429: {
            description: "Rate limit exceeded",
            contentType: "application/json",
            schema: {
                success: {
                    type: "boolean",
                    example: false,
                },
                error: {
                    type: "string",
                    example: "Too Many Requests",
                },
                message: {
                    type: "string",
                },
                retryAfter: {
                    type: "number",
                    description: "Seconds until rate limit resets",
                },
            },
            example: {
                success: false,
                error: "Too Many Requests",
                message: "Rate limit exceeded. Try again in 60 seconds.",
                retryAfter: 60,
            },
        },

        // ── 500 Internal Server Error ─────────────────────────
        500: {
            description: "Internal server error",
            contentType: "application/json",
            example: {
                success: false,
                error: "Internal Server Error",
                message:
                    "An unexpected error occurred. Please try again later.",
                requestId: "req_9f8e7d6c5b4a",
            },
        },

        // ── 503 Service Unavailable ───────────────────────────
        503: {
            description: "Service temporarily unavailable (maintenance)",
            contentType: "application/json",
            example: {
                success: false,
                error: "Service Unavailable",
                message:
                    "System maintenance in progress. Please try again in 30 minutes.",
                estimatedDowntime: "30 minutes",
            },
        },
    },
});

const apiDocs = new ApiDoc({
    title: "My Awesome API",
    version: "1.0.0",
    description: `# GitHub-Style API Documentation

**Version:** 1.0.0  
**Base URL:** \`https://api.yourdomain.com/v1\`  
**Last Updated:** February 10, 2026

### Base Requirements

- **Protocol:** HTTPS only
- **Content-Type:** \`application/json\`
- **Character Encoding:** UTF-8

---

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
| \`INTERNAL_ERROR\`      | Server error                      |`,

    // IMPORTANT: Set the baseUrl to your actual API base URL
    baseUrl: `http://localhost:5000`,

    theme: {
        codeTheme: CODE_THEMES.GITHUB_DARK_HIGH_CONTRAST,
    },

    // Default authentication
    defaultAuth: {
        type: "Bearer",
        bearerFormat: "JWT",
    },
});

app.use(apiDocs.middleware());

// application routes
app.use("/api", router);

export default app;
