import { Router, Request, Response, static as expressStatic } from "express";
import * as path from "path";
import * as fs from "fs";
import { marked } from "marked";
import { routeRegistry, RouteMetadata } from "../registry/RouteRegistry";
import { CODE_THEMES, CodeThemeValues } from "../code-theme";

export interface ApiDocConfig {
    title: string;
    version: string;
    description?: string;
    baseUrl?: string;
    theme?: {
        primaryColor?: string;
        secondaryColor?: string;
        accentColor?: string;
        backgroundColor?: string;
        sidebarBackgroundColor?: string;
        codeTheme?: CodeThemeValues;
    };
    defaultAuth?: {
        type: "Bearer" | "Basic" | "ApiKey";
        bearerFormat?: string;
    };
}

export class ApiDoc {
    private config: ApiDocConfig;
    private clientPath: string;
    private readonly DOCS_PATH = "/api-docs";
    private configReady: Promise<void>;

    constructor(config: ApiDocConfig) {
        this.clientPath = this.resolveClientPath();
        this.config = config;
        this.configReady = this.normalizeConfig(config);
    }

    private async normalizeConfig(config: ApiDocConfig): Promise<void> {
        // Convert description to HTML if it exists
        if (config?.description) {
            const html = await marked.parse(config.description.toString());
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

    private resolveClientPath(): string {
        const possiblePaths = [
            path.join(__dirname, "../../client/dist"),
            path.join(__dirname, "../client/dist"),
            path.join(__dirname, "../../../client/dist"),
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

    private async convertRoutesToSections(): Promise<any[]> {
        const routes = routeRegistry.getAll();
        const sections: any[] = [];
        const grouped = new Map<string, RouteMetadata[]>();
        const untagged: RouteMetadata[] = [];

        for (const route of routes) {
            if (route.tags && route.tags.length > 0) {
                for (const tag of route.tags) {
                    if (!grouped.has(tag)) grouped.set(tag, []);
                    grouped.get(tag)!.push(route);
                }
            } else {
                untagged.push(route);
            }
        }

        for (const [tag, tagRoutes] of grouped.entries()) {
            const items = await Promise.all(
                tagRoutes.map((route) => this.convertRouteToSection(route)),
            );
            sections.push({
                name: tag.toLowerCase().replace(/\s+/g, "-"),
                label: tag,
                type: "GROUP",
                items,
            });
        }

        if (untagged.length > 0) {
            const items = await Promise.all(
                untagged.map((route) => this.convertRouteToSection(route)),
            );
            sections.push({
                name: "other",
                label: "Other Endpoints",
                type: "GROUP",
                items,
            });
        }

        return sections;
    }

    private async convertRouteToSection(route: RouteMetadata): Promise<any> {
        if (route?.description) {
            const parsed = await marked.parse(route.description.toString());
            route.description = '<div class="md__code">' + parsed + "</div>";
        }

        if (route?.summary) {
            const parsed = await marked.parse(route.summary.toString());
            route.summary = '<div class="md__code">' + parsed + "</div>";
        }

        if (route?.note) {
            const parsed = await marked.parse(route.note.toString());
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

        if (route.params?.length) section.api.params = route.params;
        if (route.query?.length) section.api.query = route.query;
        if (route.headers?.length) section.api.headers = route.headers;

        if (route.body) {
            section.api.body = {
                contentType: route.body.contentType,
                required: route.body.required,
                description: route.body.description,
                schema: route.body.schema,
                example: route.body.example,
            };
        }

        if (route.responses?.length) {
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

    // ══════════════════════════════════════════════════════════════
    // FIXED: Static file serving with correct MIME types
    // ══════════════════════════════════════════════════════════════
    middleware(): Router {
        const router = Router();

        // ── 1. Serve config.json (MUST come before static assets) ────
        router.get(
            `${this.DOCS_PATH}/config.json`,
            this.serveConfig.bind(this),
        );

        // ── 2. Serve static assets (CSS, JS, etc.) ───────────────────
        // CRITICAL: Use absolute path match to prevent wildcard route from catching it
        router.use(
            `${this.DOCS_PATH}/assets`,
            (req: Request, res: Response, next) => {
                // Manually set correct MIME types before expressStatic processes
                const ext = path.extname(req.path).toLowerCase();
                if (ext === ".js") {
                    res.setHeader(
                        "Content-Type",
                        "application/javascript; charset=utf-8",
                    );
                } else if (ext === ".css") {
                    res.setHeader("Content-Type", "text/css; charset=utf-8");
                } else if (ext === ".map") {
                    res.setHeader(
                        "Content-Type",
                        "application/json; charset=utf-8",
                    );
                }
                next();
            },
            expressStatic(path.join(this.clientPath, "assets"), {
                maxAge: "1d",
                etag: true,
                index: false, // Don't serve index.html from assets
                fallthrough: false, // Return 404 if file not found
            }),
        );

        // ── 3. Serve React app (catch-all, MUST come last) ───────────
        // router.get(`${this.DOCS_PATH}*`, this.serveApp.bind(this));
        router.use(this.serveApp.bind(this));

        return router;
    }

    private async serveConfig(req: Request, res: Response): Promise<void> {
        await this.configReady;
        const sections = await this.convertRoutesToSections();

        res.json({
            config: {
                ...this.config,
                sections,
            },
            basePath: this.DOCS_PATH,
        });
    }

    private serveApp(req: Request, res: Response): void {
        const indexPath = path.join(this.clientPath, "index.html");

        if (fs.existsSync(indexPath)) {
            let html = fs.readFileSync(indexPath, "utf-8");
            const baseTag = `<base href="${this.DOCS_PATH}/">`;

            if (html.includes("<base")) {
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
                        code { background: #f7fafc; padding: 2px 6px; border-radius: 4px; }
                    </style>
                </head>
                <body>
                    <h1>⚠️ Client Not Built</h1>
                    <p>Run <code>npm run build</code> first.</p>
                    <small>Looking at: ${this.clientPath}</small>
                </body>
                </html>
            `);
        }
    }

    getRoutes(): RouteMetadata[] {
        return routeRegistry.getAll();
    }
    clearRoutes(): void {
        routeRegistry.clear();
    }
    getDocsPath(): string {
        return this.DOCS_PATH;
    }
}
