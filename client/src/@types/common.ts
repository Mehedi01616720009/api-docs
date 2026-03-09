import type { LIST_STYLES, LIST_TYPES } from "../constants/common.constant";

export type ListTypeKeys = keyof typeof LIST_TYPES;
export type ListTypeValues = (typeof LIST_TYPES)[ListTypeKeys];

export type ListStyleKeys = keyof typeof LIST_STYLES;
export type ListStyleValues = (typeof LIST_STYLES)[ListStyleKeys];
