import { Router, Request, Response, static as expressStatic } from "express";
import * as path from "path";
import * as fs from "fs";
import { marked } from "marked";
import { routeRegistry, RouteMetadata } from "../registry/RouteRegistry";
import { CODE_THEMES, CodeThemeValues } from "../code-theme";

/**
 * API Documentation configuration
 */
export interface ApiDocConfig {
    // Basic info (required)
    title: string;
    version: string;

    // Optional info
    description?: string;
    baseUrl?: string;

    // Theme customization
    theme?: {
        primaryColor?: string;
        secondaryColor?: string;
        accentColor?: string;
        backgroundColor?: string;
        sidebarBackgroundColor?: string;
        codeTheme?: CodeThemeValues;
    };

    // Default authentication
    defaultAuth?: {
        type: "Bearer" | "Basic" | "ApiKey";
        bearerFormat?: string;
    };
}

/**
 * Main API Documentation class
 */
export class ApiDoc {
    private config: ApiDocConfig;
    private clientPath: string;
    private readonly DOCS_PATH = "/api-docs"; // Fixed path
    private configReady: void;

    constructor(config: ApiDocConfig) {
        this.clientPath = this.resolveClientPath();
        this.config = config; // Set initial config
        this.configReady = this.normalizeConfig(config);
    }

    /**
     * Normalize configuration with defaults
     */
    private normalizeConfig(config: ApiDocConfig): void {
        // Convert description to HTML if it exists
        if (config?.description) {
            const html = marked.parse(config.description.toString());
            config.description = '<div class="md__code">' + html + "</div>";
        }

        this.config = {
            ...config,
            baseUrl: config.baseUrl || "http://localhost:5000",
            theme: {
                primaryColor: "#3b82f6",
                secondaryColor: "#8b5cf6",
                accentColor: "#10b981",
                backgroundColor: "#ffffff",
                sidebarBackgroundColor: "#1f2937",
                codeTheme: CODE_THEMES.VITESSE_BLACK,
                ...config.theme,
            },
        };
    }

    /**
     * Resolve client path
     */
    private resolveClientPath(): string {
        const possiblePaths = [
            path.join(__dirname, "../../client/dist"),
            path.join(__dirname, "../client/dist"),
            path.join(__dirname, "../../../client/dist"),
            // Fallback for some npm structures
            path.join(process.cwd(), "node_modules/hasancode-api-docs/client/dist"),
        ];

        for (const testPath of possiblePaths) {
            if (
                fs.existsSync(testPath) &&
                fs.existsSync(path.join(testPath, "index.html"))
            ) {
                return testPath;
            }
        }

        return path.join(__dirname, "../../client/dist");
    }

    /**
     * Convert route metadata to API documentation format
     */
    private convertRoutesToSections(): any[] {
        const routes = routeRegistry.getAll();
        const sections: any[] = [];

        // Group routes by tags
        const grouped = new Map<string, RouteMetadata[]>();
        const untagged: RouteMetadata[] = [];

        for (const route of routes) {
            if (route.tags && route.tags.length > 0) {
                for (const tag of route.tags) {
                    if (!grouped.has(tag)) {
                        grouped.set(tag, []);
                    }
                    grouped.get(tag)!.push(route);
                }
            } else {
                untagged.push(route);
            }
        }

        // Create sections for each tag
        for (const [tag, tagRoutes] of grouped.entries()) {
            sections.push({
                name: tag.toLowerCase().replace(/\s+/g, "-"),
                label: tag,
                type: "GROUP",
                items: tagRoutes.map((route) =>
                    this.convertRouteToSection(route),
                ),
            });
        }

        // Add untagged routes
        if (untagged.length > 0) {
            sections.push({
                name: "other",
                label: "Other Endpoints",
                type: "GROUP",
                items: untagged.map((route) =>
                    this.convertRouteToSection(route),
                ),
            });
        }

        return sections;
    }

    /**
     * Convert single route to section format
     */
    private convertRouteToSection(route: RouteMetadata): Promise<any> {
        if (route?.description) {
            const parsed = marked.parse(route.description.toString());
            route.description = '<div class="md__code">' + parsed + "</div>";
        }

        if (route?.summary) {
            const parsed = marked.parse(route.summary.toString());
            route.summary = '<div class="md__code">' + parsed + "</div>";
        }

        if (route?.note) {
            const parsed = marked.parse(route.note.toString());
            route.note = '<div class="md__code">' + parsed + "</div>";
        }

        const section: any = {
            name: `${route.method}${route.path}`
                .replace(/[/:]/g, "-")
                .replace("--", "-"),
            label: `${route.method.toUpperCase()} ${route.path}`,
            type: "ITEM",
            content: route.description,
            api: {
                method: route.method,
                path: route.path,
                summary: route.summary,
                description: route.description,
                deprecated: route.deprecated,
                note: route.note,
                tags: route.tags,
                auth: route.auth,
            },
        };

        if (route.params && route.params.length > 0) {
            section.api.params = route.params;
        }

        if (route.query && route.query.length > 0) {
            section.api.query = route.query;
        }

        if (route.headers && route.headers.length > 0) {
            section.api.headers = route.headers;
        }

        if (route.body) {
            section.api.body = {
                contentType: route.body.contentType,
                required: route.body.required,
                description: route.body.description,
                schema: route.body.schema,
                example: route.body.example,
            };
        }

        if (route.responses && route.responses.length > 0) {
            section.api.responses = {};
            for (const response of route.responses) {
                section.api.responses[response.statusCode] = {
                    description: response.description,
                    contentType: response.contentType,
                    schema: response.schema,
                    example: response.example,
                };
            }
        }

        return section;
    }

    /**
     * Get Express middleware - automatically mounts at /api-docs
     * Usage: app.use(apiDoc.middleware())
     */
    middleware(): Router {
        const router = Router();

        // 1. Serve config.json
        router.get(
            `${this.DOCS_PATH}/config.json`,
            this.serveConfig.bind(this),
        );

        // 2. Serve static assets with explicit MIME types
        router.use(
            `${this.DOCS_PATH}/assets`,
            (req, res, next) => {
                const ext = path.extname(req.path).toLowerCase();
                if (ext === ".js") {
                    res.setHeader("Content-Type", "application/javascript; charset=utf-8");
                } else if (ext === ".css") {
                    res.setHeader("Content-Type", "text/css; charset=utf-8");
                }
                next();
            },
            expressStatic(path.join(this.clientPath, "assets"), {
                maxAge: "1d",
                etag: true,
                index: false,
                fallthrough: false,
            }),
        );

        // 3. Serve the React app
        router.use(this.serveApp.bind(this));

        return router;
    }

    /**
     * Serve configuration
     */
    private async serveConfig(req: Request, res: Response): Promise<void> {
        // Wait for config to be ready
        await this.configReady;

        // Auto-generate sections from decorated routes
        const sections = this.convertRoutesToSections();

        const runtimeConfig = {
            config: {
                ...this.config,
                sections,
            },
            basePath: this.DOCS_PATH,
        };

        res.json(runtimeConfig);
    }

    /**
     * Serve the React app
     */
    private serveApp(req: Request, res: Response): void {
        const indexPath = path.join(this.clientPath, "index.html");

        if (fs.existsSync(indexPath)) {
            let html = fs.readFileSync(indexPath, "utf-8");

            // Use relative base tag so it works when mounted at any prefix
            const baseTag = `<base href="./">`;

            // Insert or replace base tag
            if (html.includes("<base ")) {
                html = html.replace(/<base[^>]*>/i, baseTag);
            } else {
                html = html.replace(/<head>/i, `<head>${baseTag}`);
            }

            res.setHeader("Content-Type", "text/html; charset=utf-8");
            res.setHeader(
                "Cache-Control",
                "no-cache, no-store, must-revalidate",
            );
            res.send(html);
        } else {
            res.status(404).send(`
        <html>
          <head>
            <title>API Docs - Not Built</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-width: 600px;
                margin: 100px auto;
                padding: 20px;
                text-align: center;
              }
              h1 { color: #e53e3e; }
              code {
                background: #f7fafc;
                padding: 2px 6px;
                border-radius: 4px;
              }
            </style>
          </head>
          <body>
            <h1>⚠️ Client Not Built</h1>
            <p>Please run <code>npm run build</code> first.</p>
            <p><small>Looking at: ${this.clientPath}</small></p>
          </body>
        </html>
      `);
        }
    }

    /**
     * Get all registered routes
     */
    getRoutes(): RouteMetadata[] {
        return routeRegistry.getAll();
    }

    /**
     * Clear all routes (useful for testing)
     */
    clearRoutes(): void {
        routeRegistry.clear();
    }

    /**
     * Get the documentation path
     */
    getDocsPath(): string {
        return this.DOCS_PATH;
    }
}
