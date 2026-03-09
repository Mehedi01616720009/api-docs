import { marked } from "marked";
import {
    routeRegistry,
    ParamMetadata,
    HttpMethod,
} from "../registry/RouteRegistry";

/**
 * Helper to get or create metadata for a route based on the decorator context
 */
function getOrCreateMetadata(
    target: any,
    propertyKey: string,
    defaultMethod: HttpMethod = "get",
    defaultPath: string = "/",
): { method: HttpMethod; path: string } {
    // Try to get method and path from existing metadata
    const method =
        (Reflect.getMetadata(
            "api:method",
            target,
            propertyKey,
        ) as HttpMethod) || defaultMethod;
    const path =
        (Reflect.getMetadata("api:path", target, propertyKey) as string) ||
        defaultPath;

    return { method, path };
}

/**
 * Response decorator
 * @example
 * @Response(200, {
 *   description: 'Success',
 *   example: { id: '1', email: 'user@example.com' }
 * })
 */
export function Response(
    statusCode: number,
    config: {
        description: string;
        contentType?: string;
        schema?: Record<string, Omit<ParamMetadata, "name">>;
        example?: any;
    },
) {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor,
    ) {
        const { method, path } = getOrCreateMetadata(target, propertyKey);
        let metadata = routeRegistry.get(method, path);

        if (!metadata) {
            metadata = {
                method,
                path,
                responses: [],
            };
        }

        if (!metadata.responses) {
            metadata.responses = [];
        }

        // Convert schema if provided
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

        metadata.responses.push({
            statusCode,
            description:
                '<div class="md__code">' +
                marked.parse(config.description.toString()) +
                "</div>",
            contentType: config.contentType || "application/json",
            schema: responseSchema,
            example: config.example,
        });

        routeRegistry.register(metadata);

        return descriptor;
    };
}

/**
 * Summary decorator
 * @example
 * @Summary('Get user by ID')
 */
export function Summary(text: string) {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor,
    ) {
        const { method, path } = getOrCreateMetadata(target, propertyKey);
        let metadata = routeRegistry.get(method, path);

        if (!metadata) {
            metadata = {
                method,
                path,
            };
        }

        metadata!.summary =
            '<div class="md__code">' + marked.parse(text.toString()) + "</div>";
        routeRegistry.register(metadata!);

        return descriptor;
    };
}

/**
 * Note decorator
 * @example
 * @Note('Follow this note')
 */
export function Note(text: string) {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor,
    ) {
        const { method, path } = getOrCreateMetadata(target, propertyKey);
        let metadata = routeRegistry.get(method, path);

        if (!metadata) {
            metadata = {
                method,
                path,
            };
        }

        metadata!.note =
            '<div class="md__code">' + marked.parse(text.toString()) + "</div>";
        routeRegistry.register(metadata!);

        return descriptor;
    };
}

/**
 * Description decorator
 * @example
 * @Description('Retrieves detailed information about a specific user')
 */
export function Description(text: string) {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor,
    ) {
        const { method, path } = getOrCreateMetadata(target, propertyKey);
        let metadata = routeRegistry.get(method, path);

        if (!metadata) {
            metadata = {
                method,
                path,
            };
        }

        metadata!.description =
            '<div class="md__code">' + marked.parse(text.toString()) + "</div>";
        routeRegistry.register(metadata!);

        return descriptor;
    };
}

/**
 * Tags decorator (for grouping)
 * @example
 * @Tags('Users', 'Authentication')
 */
export function Tags(...tags: string[]) {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor,
    ) {
        const { method, path } = getOrCreateMetadata(target, propertyKey);
        let metadata = routeRegistry.get(method, path);

        if (!metadata) {
            metadata = {
                method,
                path,
            };
        }

        metadata.tags = tags;
        routeRegistry.register(metadata);

        return descriptor;
    };
}

/**
 * Deprecated decorator
 * @example
 * @Deprecated()
 */
export function Deprecated(reason?: string) {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor,
    ) {
        const { method, path } = getOrCreateMetadata(target, propertyKey);
        let metadata = routeRegistry.get(method, path);

        if (!metadata) {
            metadata = {
                method,
                path,
            };
        }

        metadata.deprecated = true;
        if (reason && !metadata.description) {
            metadata.description = `Deprecated: ${reason}`;
        }

        routeRegistry.register(metadata);

        return descriptor;
    };
}

/**
 * Auth decorator
 * @example
 * @Auth(true)
 * @Auth({ required: true, type: 'Bearer' })
 */
export function Auth(
    config:
        | boolean
        | {
              required: boolean;
              type?: "Bearer" | "Basic" | "ApiKey";
              scopes?: string[];
          } = true,
) {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor,
    ) {
        const { method, path } = getOrCreateMetadata(target, propertyKey);
        let metadata = routeRegistry.get(method, path);

        if (!metadata) {
            metadata = {
                method,
                path,
            };
        }

        if (typeof config === "boolean") {
            metadata.auth = config;
        } else {
            metadata.auth = config;
        }

        routeRegistry.register(metadata);

        return descriptor;
    };
}
