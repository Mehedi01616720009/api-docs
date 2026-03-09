import {
    routeRegistry,
    MetadataKeys,
    HttpMethod,
} from "../registry/RouteRegistry";

/**
 * Create HTTP method decorator
 */
function createMethodDecorator(method: HttpMethod) {
    return function (path: string, summary?: string) {
        return function (
            target: any,
            propertyKey: string,
            descriptor: PropertyDescriptor,
        ) {
            // Get existing metadata or create new
            let metadata = routeRegistry.get(method, path);

            if (!metadata) {
                metadata = {
                    method,
                    path,
                    summary,
                };
            } else {
                metadata.method = method;
                metadata.path = path;
                if (summary) metadata.summary = summary;
            }

            // Store in Reflect metadata on the actual target and property
            const metadataKey = `${method.toUpperCase()}.${path}`;

            Reflect.defineMetadata(
                MetadataKeys.METHOD,
                method,
                target,
                propertyKey,
            );
            Reflect.defineMetadata(
                MetadataKeys.PATH,
                path,
                target,
                propertyKey,
            );
            if (summary) {
                Reflect.defineMetadata(
                    MetadataKeys.SUMMARY,
                    summary,
                    target,
                    propertyKey,
                );
            }

            // Register the route
            routeRegistry.register(metadata);

            return descriptor;
        };
    };
}

/**
 * GET decorator
 * @example
 * @Get('/users/:id', 'Get user by ID')
 */
export const Get = createMethodDecorator("get");

/**
 * POST decorator
 * @example
 * @Post('/users', 'Create new user')
 */
export const Post = createMethodDecorator("post");

/**
 * PUT decorator
 * @example
 * @Put('/users/:id', 'Update user')
 */
export const Put = createMethodDecorator("put");

/**
 * PATCH decorator
 * @example
 * @Patch('/users/:id', 'Partially update user')
 */
export const Patch = createMethodDecorator("patch");

/**
 * DELETE decorator
 * @example
 * @Delete('/users/:id', 'Delete user')
 */
export const Delete = createMethodDecorator("delete");

/**
 * Generic Route decorator (for custom methods or additional config)
 */
export function Route(config: {
    method: HttpMethod;
    path: string;
    summary?: string;
    description?: string;
}) {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor,
    ) {
        const { method, path, summary, description } = config;

        let metadata = routeRegistry.get(method, path);

        if (!metadata) {
            metadata = {
                method,
                path,
                summary,
                description,
            };
        } else {
            Object.assign(metadata, config);
        }

        // Store in metadata on the actual target and property
        Reflect.defineMetadata(
            MetadataKeys.METHOD,
            method,
            target,
            propertyKey,
        );
        Reflect.defineMetadata(MetadataKeys.PATH, path, target, propertyKey);
        if (summary)
            Reflect.defineMetadata(
                MetadataKeys.SUMMARY,
                summary,
                target,
                propertyKey,
            );
        if (description)
            Reflect.defineMetadata(
                MetadataKeys.DESCRIPTION,
                description,
                target,
                propertyKey,
            );

        routeRegistry.register(metadata);

        return descriptor;
    };
}
