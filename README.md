# Api-Docs

A simple and practical API documentation generator for Express.js.

`api-docs` lets you describe endpoints in code and serves a built-in documentation UI at `/api-docs`.

## Features

- Auto-hosted docs UI (`/api-docs`)
- Works with any Express project structure (single file, modular routes, MVC)
- Two metadata styles:
    - `doc()` function (functional/manual style)
    - TypeScript decorators (class-based style)
- Rich endpoint metadata:
    - summary, description, note, tags, deprecated
    - path params, query params, headers
    - request body schema + example
    - multiple response schemas + examples
    - authentication metadata
- Markdown support for descriptions
- Theme customization (colors + code theme)

## Installation

```bash
npm install hasancode-api-docs
```

If you use TypeScript decorators, enable these in your `tsconfig.json`:

```json
{
    "compilerOptions": {
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true
    }
}
```

## Quick Start

```ts
import express from "express";
import { ApiDoc, doc } from "api-docs";

const app = express();
app.use(express.json());

doc({
    method: "get",
    path: "/api/health",
    summary: "Health check",
    tags: ["System"],
    responses: {
        200: {
            description: "Service is healthy",
            example: { ok: true },
        },
    },
});

app.get("/api/health", (req, res) => {
    res.json({ ok: true });
});

const apiDocs = new ApiDoc({
    title: "My API",
    version: "1.0.0",
    baseUrl: "http://localhost:5000",
});

app.use(apiDocs.middleware());

app.listen(5000, () => {
    console.log("Server: http://localhost:5000");
    console.log("Docs:   http://localhost:5000/api-docs");
});
```

## Usage Method 1: Functional `doc()` (Simple)

This is the lightweight style (similar to `example/server.js`).

```ts
import { doc } from "api-docs";

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
    },
    responses: {
        200: {
            description: "Users retrieved successfully",
            example: {
                users: [{ id: 1, email: "user1@example.com" }],
                pagination: { page: 1, limit: 10, total: 1 },
            },
        },
    },
});
```

## Usage Method 2: Functional `doc()` (Full Schema)

This is the advanced object-schema style (similar to `example2/src/app.ts`).

```ts
import { doc } from "api-docs";

doc({
    method: "patch",
    path: "/api/users/:userId",
    summary: "Update user profile",
    description: "Updates profile fields. Only provided fields are modified.",
    note: "Requires authentication.",
    tags: ["User"],
    deprecated: false,
    auth: { required: true, type: "Bearer", scopes: ["user:write"] },
    params: {
        userId: {
            type: "string",
            required: true,
            description: "User identifier",
            pattern: "^usr_[a-zA-Z0-9]{12}$",
        },
    },
    query: {
        notify: {
            type: "boolean",
            required: false,
            default: true,
            description: "Send notification",
        },
    },
    headers: {
        Authorization: {
            type: "string",
            required: true,
            description: "Bearer token",
        },
    },
    body: {
        contentType: "application/json",
        required: true,
        description: "Profile fields to update",
        schema: {
            firstName: {
                type: "string",
                required: false,
                minLength: 1,
                maxLength: 50,
            },
            lastName: {
                type: "string",
                required: false,
                minLength: 1,
                maxLength: 50,
            },
            theme: {
                type: "string",
                required: false,
                enum: ["light", "dark", "auto"],
                default: "auto",
            },
        },
        example: {
            firstName: "John",
            theme: "dark",
        },
    },
    responses: {
        200: {
            description: "Profile updated successfully",
            schema: {
                success: { type: "boolean", example: true },
                message: { type: "string", example: "Profile updated" },
            },
            example: { success: true, message: "Profile updated" },
        },
        400: {
            description: "Validation error",
            example: { success: false, error: "Validation Error" },
        },
    },
});
```

## Usage Method 3: Class-Based Decorators

This style is for class/controller-based projects.

```ts
import express, { Request, Response } from "express";
import {
    ApiDoc,
    Get,
    Post,
    Param,
    Query,
    Header,
    Body,
    Response as ApiResponse,
    Summary,
    Description,
    Tags,
    Auth,
} from "api-docs";

class UserController {
    @Tags("Users")
    @Summary("Get a user by ID")
    @Description("Returns one user record.")
    @Auth({ required: true, type: "Bearer" })
    @Header("Authorization", {
        type: "string",
        required: true,
        description: "Bearer token",
    })
    @Param("id", {
        type: "string",
        required: true,
        description: "User ID",
    })
    @Query("includePosts", {
        type: "boolean",
        required: false,
        default: false,
        description: "Include user posts",
    })
    @ApiResponse(200, {
        description: "User found",
        example: { id: "u_123", name: "John Doe" },
    })
    @Get("/api/users/:id")
    getById(req: Request, res: Response) {
        res.json({ id: req.params.id, name: "John Doe" });
    }

    @Tags("Users")
    @Summary("Create a user")
    @Body(
        {
            name: { type: "string", required: true, description: "Full name" },
            email: {
                type: "string",
                required: true,
                description: "Email address",
            },
        },
        {
            contentType: "application/json",
            required: true,
            description: "New user payload",
            example: { name: "John Doe", email: "john@example.com" },
        },
    )
    @ApiResponse(201, {
        description: "User created",
        example: { id: "u_124", name: "John Doe", email: "john@example.com" },
    })
    @Post("/api/users")
    create(req: Request, res: Response) {
        res.status(201).json({ id: "u_124", ...req.body });
    }
}

const app = express();
app.use(express.json());

const userController = new UserController();
app.get("/api/users/:id", userController.getById.bind(userController));
app.post("/api/users", userController.create.bind(userController));

const apiDocs = new ApiDoc({
    title: "Class-Based API",
    version: "1.0.0",
    baseUrl: "http://localhost:5000",
});

app.use(apiDocs.middleware());
app.listen(5000);
```

Decorator note:

- Keep the HTTP method decorator (`@Get`, `@Post`, etc.) closest to the method (last decorator before method definition). This ensures other decorators attach to the same route metadata.

## `ApiDoc` Configuration

```ts
new ApiDoc({
    title: "My Awesome API", // required
    version: "1.0.0", // required
    description: "# Markdown supported", // optional
    baseUrl: "http://localhost:5000", // optional
    theme: {
        primaryColor: "#3b82f6",
        secondaryColor: "#8b5cf6",
        accentColor: "#10b981",
        backgroundColor: "#ffffff",
        sidebarBackgroundColor: "#1f2937",
        codeTheme: "github-dark", // or CODE_THEMES.GITHUB_DARK
    },
    defaultAuth: {
        type: "Bearer", // Bearer | Basic | ApiKey
        bearerFormat: "JWT",
    },
});
```

## Supported Decorators and Helpers

### Method decorators

- `@Get(path, summary?)`
- `@Post(path, summary?)`
- `@Put(path, summary?)`
- `@Patch(path, summary?)`
- `@Delete(path, summary?)`
- `@Route({ method, path, summary?, description? })`

### Parameter decorators

- `@Param(name, config)`
- `@Query(name, config)`
- `@Header(name, config)`
- `@Body(schema, options?)`

### Metadata decorators

- `@Response(statusCode, config)`
- `@Summary(text)`
- `@Description(text)`
- `@Tags(...tags)`
- `@Deprecated(reason?)`
- `@Auth(true | false | { required, type?, scopes? })`

### Functional helper

- `doc({...})`

## Available Code Themes

Import and use `CODE_THEMES`:

```ts
import { CODE_THEMES } from "api-docs";

const apiDocs = new ApiDoc({
    title: "My API",
    version: "1.0.0",
    theme: {
        codeTheme: CODE_THEMES.GITHUB_DARK_HIGH_CONTRAST,
    },
});
```

A few common choices:

- `CODE_THEMES.GITHUB_DARK`
- `CODE_THEMES.GITHUB_LIGHT`
- `CODE_THEMES.DRACULA`
- `CODE_THEMES.MONOKAI`
- `CODE_THEMES.NIGHT_OWL`
- `CODE_THEMES.VITESSE_BLACK`

## How It Works

- Route metadata is stored in an in-memory registry (`method + path` key).
- `ApiDoc.middleware()` serves:
    - `GET /api-docs/config.json`
    - static docs assets under `/api-docs/assets`
    - the docs app at `/api-docs`
- Routes are grouped by `tags`; untagged routes appear under `Other Endpoints`.

## Troubleshooting

- Docs page shows “Client Not Built”:
    - Run your build so `client/dist` is available in the package.
- Decorator metadata missing:
    - Ensure `experimentalDecorators` and `emitDecoratorMetadata` are enabled.
    - Ensure method decorators (`@Get`, `@Post`, etc.) are closest to the method.
- Duplicate docs entry overwritten:
    - The registry key is `METHOD + PATH`; keep each pair unique.

## License

MIT
