import {
    bundledLanguages,
    bundledThemes,
    createHighlighter,
    type ShikiTransformer,
} from "shiki";
import type { CodeLanguageValues, CodeThemeValues } from "../@types/code-block";

export const highlighter = await createHighlighter({
    themes: Object.keys(bundledThemes),
    langs: Object.keys(bundledLanguages),
});

const lineNumberTransformer: ShikiTransformer = {
    name: "line-numbers",
    line(node, line) {
        this.addClassToHast(node, "line");
        node.properties["data-line"] = line;
        node.children.unshift({
            type: "element",
            tagName: "span",
            properties: { className: "line-number" },
            children: [{ type: "text", value: String(line) }],
        });
    },
};

export function highlightCode(
    code: string,
    lang: CodeLanguageValues,
    theme: CodeThemeValues,
) {
    if (!code) return "";

    return highlighter.codeToHtml(code, {
        lang,
        theme,
    });
}

export function highlightCodeWithLines(
    code: string,
    lang: CodeLanguageValues,
    theme: CodeThemeValues,
) {
    if (!code) return "";

    return highlighter.codeToHtml(code, {
        lang,
        theme,
        transformers: [lineNumberTransformer],
    });
}
