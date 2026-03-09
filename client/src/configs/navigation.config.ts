import type { NavigationTree } from "../@types/navigation";

export const NAVIGATIONS: NavigationTree[] = [
    {
        key: "get_start",
        path: "",
        type: "group",
        title: "Get Started",
        subMenu: [
            {
                key: "get_start.overview",
                path: "/overview",
                type: "item",
                title: "Overview",
                subMenu: [],
            },
            {
                key: "get_start.shorthand",
                path: "/short-hand",
                type: "item",
                title: "Short Hand",
                subMenu: [],
            },
        ],
    },
];
