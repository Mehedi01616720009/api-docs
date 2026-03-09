import type { HttpMethod } from "./navigation";

export interface RouteMetadata {
    method: HttpMethod;
    path: string;
    summary?: string;
    note?: string;
    description?: string;
    tags?: string[];
    deprecated?: boolean;
    params?: Record<string, unknown>[];
    query?: Record<string, unknown>[];
    body?: BodyMetadata;
    headers?: Record<string, unknown>[];
    responses?: Record<string, BodyMetadata>;
    auth?: boolean | AuthMetadata;
}

export interface ParamMetadata {
    name: string;
    type: "string" | "number" | "boolean" | "object" | "array";
    required?: boolean;
    description?: string;
    example?: Record<string, unknown> | string | number | boolean | string[];
    default?: string;
    enum?: string[];
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
    schema: Record<string, Record<string, unknown>>;
    example?: Record<string, unknown> | string | number | boolean | string[];
}

export interface ResponseMetadata {
    statusCode: number;
    description: string;
    contentType?: string;
    schema?: Record<string, ParamMetadata>;
    example?: Record<string, unknown> | string | number | boolean | string[];
}

export interface AuthMetadata {
    required: boolean;
    type?: "Bearer" | "Basic" | "ApiKey";
    scopes?: string[];
}
