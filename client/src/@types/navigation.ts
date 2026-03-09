import type { RouteMetadata } from "./api-route";

export type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

export interface NavigationTree {
    key: string;
    path: string;
    title: string;
    http?: HttpMethod;
    type: "group" | "collapse" | "item";
    subMenu: NavigationTree[];
}

export interface SourceNode {
    name: string;
    label: string;
    type: "GROUP" | "ITEM";
    api: RouteMetadata;
    items?: SourceNode[];
}
