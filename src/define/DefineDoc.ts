import { marked } from "marked";
import {
    RouteMetadata,
    routeRegistry,
    ParamMetadata,
} from "../registry/RouteRegistry";

/**
 * Input type for doc() function - allows flexible input format
 */
export interface DocInput {
    method: RouteMetadata["method"];
    path: string;
    summary?: string;
    note?: string;
    description?: string;
    tags?: string[];
    deprecated?: boolean;

    // Flexible params - can be object or array
    params?: Record<string, Omit<ParamMetadata, "name">> | ParamMetadata[];
    query?: Record<string, Omit<ParamMetadata, "name">> | ParamMetadata[];
    headers?: Record<string, Omit<ParamMetadata, "name">> | ParamMetadata[];

    // Body can have schema as object
    body?: {
        contentType?: string;
        required?: boolean;
        description?: string;
        schema: Record<string, Omit<ParamMetadata, "name">>;
        example?: any;
    };

    // Responses as object with status codes as keys
    responses?: Record<
        number,
        {
            description: string;
            contentType?: string;
            schema?: Record<string, Omit<ParamMetadata, "name">>;
            example?: any;
        }
    >;

    auth?:
        | boolean
        | {
              required: boolean;
              type?: "Bearer" | "Basic" | "ApiKey";
              scopes?: string[];
          };
}

/**
 * Helper to convert object params to array format
 */
function convertParamsToArray(
    params:
        | Record<string, Omit<ParamMetadata, "name">>
        | ParamMetadata[]
        | undefined,
): ParamMetadata[] | undefined {
    if (!params) return undefined;

    // If already array, return as is
    if (Array.isArray(params)) return params;

    // Convert object to array
    return Object.entries(params).map(([name, config]) => ({
        name,
        ...config,
    }));
}

/**
 * Helper to convert body schema to proper format
 */
function convertBodySchema(
    body: DocInput["body"] | undefined,
): RouteMetadata["body"] | undefined {
    if (!body) return undefined;

    const schema: Record<string, ParamMetadata> = {};
    for (const [name, config] of Object.entries(body.schema)) {
        schema[name] = {
            name,
            ...config,
        };
    }

    if (body?.description) {
        const parsed = marked.parse(body.description.toString());
        body.description = '<div class="md__code">' + parsed + "</div>";
    }

    return {
        contentType: body.contentType || "application/json",
        required: body.required !== false,
        description: body.description,
        schema,
        example: body.example,
    };
}

/**
 * Helper to convert responses object to array format
 */
function convertResponsesToArray(
    responses: DocInput["responses"] | undefined,
): RouteMetadata["responses"] | undefined {
    if (!responses) return undefined;

    return Object.entries(responses).map(([statusCode, config]) => {
        let responseSchema: Record<string, ParamMetadata> | undefined;

        if (config.schema) {
            responseSchema = {};
            for (const [name, paramConfig] of Object.entries(config.schema)) {
                responseSchema[name] = {
                    name,
                    ...paramConfig,
                };
            }
        }

        let description = config.description;

        if (description) {
            const parsed = marked.parse(description.toString());
            description = `<div class="md__code">${parsed}</div>`;
        }

        return {
            statusCode: parseInt(statusCode),
            description,
            contentType: config.contentType || "application/json",
            schema: responseSchema,
            example: config.example,
        };
    });
}

/**
 * doc() — Register API documentation for ANY route.
 * Works with modular, functional, MVC, raw Express — any structure.
 */
export function doc(docInput: DocInput): void {
    // Convert input format to RouteMetadata format
    const metadata: RouteMetadata = {
        method: docInput.method,
        path: docInput.path,
        summary: docInput.summary,
        note: docInput.note,
        description: docInput.description,
        tags: docInput.tags,
        deprecated: docInput.deprecated,
        params: convertParamsToArray(docInput.params),
        query: convertParamsToArray(docInput.query),
        headers: convertParamsToArray(docInput.headers),
        body: convertBodySchema(docInput.body),
        responses: convertResponsesToArray(docInput.responses),
        auth: docInput.auth,
    };

    routeRegistry.register(metadata);
}
