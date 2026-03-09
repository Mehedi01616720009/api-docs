import type { NavigationTree, SourceNode } from "../@types/navigation";

export function buildNavigationTree(data: SourceNode[]): NavigationTree[] {
    const result: NavigationTree[] = [];

    data.forEach((node) => {
        if (node.type === "GROUP" && node.name === "other" && node.items) {
            const flattened = buildNavigationTree(node.items);
            result.push(...flattened);
            return;
        }

        const isGroup = node.type === "GROUP";

        result.push({
            key: node.name,
            path: isGroup ? "" : `/${node.name}`,
            title: node.label,
            type: isGroup ? "collapse" : "item",
            http: node?.api?.method || "get",
            subMenu:
                isGroup && node.items ? buildNavigationTree(node.items) : [],
        });
    });

    return result;
}
