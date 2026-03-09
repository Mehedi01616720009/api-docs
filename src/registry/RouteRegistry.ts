import "reflect-metadata";

/**
 * Metadata keys for decorator information
 */
export const MetadataKeys = {
    ROUTE: "api:route",
    METHOD: "api:method",
    PATH: "api:path",
    SUMMARY: "api:summary",
    DESCRIPTION: "api:description",
    TAGS: "api:tags",
    DEPRECATED: "api:deprecated",
    PARAMS: "api:params",
    QUERY: "api:query",
    BODY: "api:body",
    HEADERS: "api:headers",
    RESPONSES: "api:responses",
    AUTH: "api:auth",
};

export type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

/**
 * Route metadata structure
 */
export interface RouteMetadata {
    method: HttpMethod;
    path: string;
    summary?: string;
    note?: string;
    description?: string;
    tags?: string[];
    deprecated?: boolean;
    params?: ParamMetadata[];
    query?: ParamMetadata[];
    body?: BodyMetadata;
    headers?: ParamMetadata[];
    responses?: ResponseMetadata[];
    auth?: boolean | AuthMetadata;
}

export interface ParamMetadata {
    name: string;
    type: "string" | "number" | "boolean" | "object" | "array";
    required?: boolean;
    description?: string;
    example?: any;
    default?: any;
    enum?: any[];
    pattern?: string;
    minimum?: number;
    maximum?: number;
    minLength?: number;
    maxLength?: number;
}

export interface BodyMetadata {
    contentType?: string;
    required?: boolean;
    description?: string;
    schema: Record<string, ParamMetadata>;
    example?: any;
}

export interface ResponseMetadata {
    statusCode: number;
    description: string;
    contentType?: string;
    schema?: Record<string, ParamMetadata>;
    example?: any;
}

export interface AuthMetadata {
    required: boolean;
    type?: "Bearer" | "Basic" | "ApiKey";
    scopes?: string[];
}

/**
 * Global route registry
 */
class RouteRegistry {
    private routes: Map<string, RouteMetadata> = new Map();

    /**
     * Generate unique key using method + path
     */
    private generateKey(metadata: RouteMetadata): string {
        return `${metadata.method.toUpperCase()}.${metadata.path}`;
    }

    /**
     * Register a route
     */
    register(metadata: RouteMetadata): void {
        const key = this.generateKey(metadata);
        this.routes.set(key, metadata);
    }

    /**
     * Get a specific route
     */
    get(method: HttpMethod, path: string): RouteMetadata | undefined {
        const key = `${method.toUpperCase()}.${path}`;
        return this.routes.get(key);
    }

    /**
     * Get all registered routes
     */
    getAll(): RouteMetadata[] {
        return Array.from(this.routes.values());
    }

    /**
     * Clear all routes (useful for testing)
     */
    clear(): void {
        this.routes.clear();
    }

    /**
     * Get routes by tag
     */
    getByTag(tag: string): RouteMetadata[] {
        return this.getAll().filter(
            (route) => route.tags && route.tags.includes(tag),
        );
    }
}

// Singleton instance
export const routeRegistry = new RouteRegistry();
