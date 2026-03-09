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
 * Path parameter decorator
 * @example
 * @Param('id', { type: 'string', required: true, description: 'User ID' })
 */
export function Param(name: string, config: Omit<ParamMetadata, "name">) {
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
                params: [],
            };
        }

        if (!metadata.params) {
            metadata.params = [];
        }

        // Convert description to HTML if it exists
        if (config?.description) {
            const paramData = {
                name,
                ...config,
                description:
                    '<div class="md__code">' +
                    marked.parse(config.description.toString()) +
                    "</div>",
            };

            metadata!.params!.push(paramData);
            routeRegistry.register(metadata!);
        } else {
            metadata.params.push({
                name,
                ...config,
            });
            routeRegistry.register(metadata);
        }

        return descriptor;
    };
}

/**
 * Query parameter decorator
 * @example
 * @Query('page', { type: 'number', default: 1, description: 'Page number' })
 */
export function Query(name: string, config: Omit<ParamMetadata, "name">) {
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
                query: [],
            };
        }

        if (!metadata.query) {
            metadata.query = [];
        }

        // Convert description to HTML if it exists
        if (config?.description) {
            const queryData = {
                name,
                ...config,
                description:
                    '<div class="md__code">' +
                    marked.parse(config.description.toString()) +
                    "</div>",
            };

            metadata!.query!.push(queryData);
            routeRegistry.register(metadata!);
        } else {
            metadata.query.push({
                name,
                ...config,
            });
            routeRegistry.register(metadata);
        }

        return descriptor;
    };
}

/**
 * Header decorator
 * @example
 * @Header('Authorization', { type: 'string', required: true })
 */
export function Header(name: string, config: Omit<ParamMetadata, "name">) {
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
                headers: [],
            };
        }

        if (!metadata.headers) {
            metadata.headers = [];
        }

        metadata.headers.push({
            name,
            ...config,
        });

        routeRegistry.register(metadata);

        return descriptor;
    };
}

/**
 * Request body decorator
 * @example
 * @Body({
 *   email: { type: 'string', required: true },
 *   password: { type: 'string', required: true }
 * })
 */
export function Body(
    schema: Record<string, Omit<ParamMetadata, "name">>,
    options?: {
        contentType?: string;
        required?: boolean;
        description?: string;
        example?: any;
    },
) {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor,
    ) {
        const { method, path } = getOrCreateMetadata(
            target,
            propertyKey,
            "post",
        );
        let metadata = routeRegistry.get(method, path);

        if (!metadata) {
            metadata = {
                method,
                path,
            };
        }

        // Convert schema to proper format and handle descriptions
        const processSchema = () => {
            const bodySchema: Record<string, ParamMetadata> = {};

            for (const [name, config] of Object.entries(schema)) {
                if (config?.description) {
                    const html = marked.parse(config.description);
                    bodySchema[name] = {
                        name,
                        ...config,
                        description: '<div class="md__code">' + html + "</div>",
                    };
                } else {
                    bodySchema[name] = {
                        name,
                        ...config,
                    };
                }
            }

            let bodyDescription = options?.description;
            if (options?.description) {
                const parsed = marked.parse(options.description.toString());
                bodyDescription = '<div class="md__code">' + parsed + "</div>";
            }

            metadata!.body = {
                contentType: options?.contentType || "application/json",
                required: options?.required !== false,
                description: bodyDescription,
                schema: bodySchema,
                example: options?.example,
            };

            routeRegistry.register(metadata!);
        };

        processSchema();

        return descriptor;
    };
}
