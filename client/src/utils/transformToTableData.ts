const PARAMS_ORDER = [
    "name",
    "type",
    "required",
    "description",
    "enum",
    "default",
    "example",
    "pattern",
    "minimum",
    "maximum",
    "minLength",
    "maxLength",
];

export function transform(data: Record<string, unknown>[]) {
    if (!data.length) {
        return { headings: [], values: [] };
    }

    // Collect union of all keys from objects
    const unionKeys = new Set<string>();
    for (const obj of data) {
        Object.keys(obj).forEach((key) => unionKeys.add(key));
    }

    // Keep only keys that exist in union, but preserve fixed order
    const headings = PARAMS_ORDER.filter((key) => unionKeys.has(key));

    return { headings, values: data };
}

type FieldObject = Record<string, Record<string, unknown>>;

export function transformObject(data: FieldObject) {
    const items = Object.values(data);

    if (!items.length) {
        return { headings: [], values: [] };
    }

    // Collect union of all keys
    const unionKeys = new Set<string>();
    for (const obj of items) {
        Object.keys(obj).forEach((key) => unionKeys.add(key));
    }

    // Preserve predefined order
    const headings = PARAMS_ORDER.filter((key) => unionKeys.has(key));

    return { headings, values: items };
}
