type NavNode = {
    name: string;
    label: string;
    type: "GROUP" | "ITEM";
    items?: NavNode[];
    api?: {
        method?: string;
        path?: string;
    };
};

type SidebarGroup = {
    label: string;
    items: {
        name: string;
        label: string;
        method?: string;
        path?: string;
    }[];
};

function formatLabel(label: string): string {
    return (
        label
            .toLowerCase()
            .split(" ")[1]
            ?.split("/")
            .filter(Boolean)
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ") ?? label
    );
}

export function minimizeSections(data: NavNode[]): SidebarGroup[] {
    return data
        .filter((group) => group.type === "GROUP")
        .map((group) => ({
            label: group.label.toUpperCase(),
            items: (group.items ?? [])
                .filter((item) => item.type === "ITEM" && item.api)
                .map((item) => ({
                    name: item.name,
                    label: formatLabel(item.label),
                    method: item.api?.method,
                    path: item.api?.path,
                })),
        }))
        .filter((group) => group.items.length > 0);
}
