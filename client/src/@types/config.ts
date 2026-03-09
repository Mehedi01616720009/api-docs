import type { CodeThemeValues } from "./code-block";
import type { SourceNode } from "./navigation";

export interface ApiDocConfig {
    // Basic info (required)
    title: string;
    version: string;

    // Optional info
    description?: string;
    baseUrl?: string;

    // Theme customization
    theme?: {
        primaryColor?: string;
        secondaryColor?: string;
        accentColor?: string;
        backgroundColor?: string;
        sidebarBackgroundColor?: string;
        codeTheme?: CodeThemeValues;
    };

    // Default authentication
    defaultAuth?: {
        type: "Bearer" | "Basic" | "ApiKey";
        bearerFormat?: string;
    };

    sections: SourceNode[];
}
