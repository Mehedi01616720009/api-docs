import "reflect-metadata";

// Code theme type and constant
export { CODE_THEMES, CodeThemeValues } from "./code-theme";

// Main class
export { ApiDoc, type ApiDocConfig } from "./middleware/ApiDoc";

// HTTP Method decorators
export {
    Get,
    Post,
    Put,
    Patch,
    Delete,
    Route,
} from "./decorators/MethodDecorators";

// Parameter decorators
export { Param, Query, Header, Body } from "./decorators/ParameterDecorators";

// Metadata decorators
export {
    Response,
    Summary,
    Description,
    Tags,
    Deprecated,
    Auth,
} from "./decorators/MetadataDecorators";

// ── For modular / functional / raw Express ────
// doc() is an Express middleware — sits inline in router.get/post/put/delete
// method & path are inferred automatically from the router
export { doc } from "./define/DefineDoc";

// Types
export {
    type RouteMetadata,
    type ParamMetadata,
    type BodyMetadata,
    type ResponseMetadata,
    type AuthMetadata,
} from "./registry/RouteRegistry";
