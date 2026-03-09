import React, { useMemo } from "react";
import { parseMarkdownContent } from "../utils/parseMarkdown";
import { CodeBlock, CodeBlockWithLines, Marked } from "./code-block";
import type { CodeLanguageValues, CodeThemeValues } from "../@types/code-block";
import { TableMark } from "./table";

interface MarkdownRendererProps {
    content: string;
    codeTheme: CodeThemeValues;
    className?: string;
}

/**
 * Renders markdown content with custom code block handling
 *
 * - Inline code (no language class) → Marked component
 * - Block code with programming language → CodeBlockWithLines
 * - Block code with json/bash/shell/etc → CodeBlock
 *
 * - Table
 */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
    content,
    codeTheme,
    className = "",
}) => {
    const { html, codeBlocks, tables } = useMemo(
        () => parseMarkdownContent(content),
        [content],
    );

    // Split HTML by code block placeholders and render appropriately
    const renderContent = () => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const elements: React.ReactNode[] = [];
        let key = 0;

        const processNode = (node: Node): React.ReactNode[] => {
            const results: React.ReactNode[] = [];

            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent || "";
                if (text.trim()) {
                    results.push(
                        <React.Fragment key={`text-${key++}`}>
                            {text}
                        </React.Fragment>,
                    );
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as Element;

                // Check if this is a code block placeholder
                if (element.hasAttribute("data-code-id")) {
                    const codeId = element.getAttribute("data-code-id")!;
                    const codeData = codeBlocks.get(codeId);

                    if (codeData) {
                        if (codeData.type === "inline") {
                            results.push(
                                <Marked key={codeId} text={codeData.code} />,
                            );
                        } else if (codeData.type === "block-programming") {
                            results.push(
                                <CodeBlockWithLines
                                    key={codeId}
                                    lang={
                                        (codeData.lang ||
                                            "ts") as CodeLanguageValues
                                    }
                                    code={codeData.code.substring(
                                        0,
                                        codeData.code.length - 1,
                                    )}
                                    theme={codeTheme}
                                />,
                            );
                        } else {
                            results.push(
                                <CodeBlock
                                    key={codeId}
                                    lang={
                                        (codeData.lang ||
                                            "bash") as CodeLanguageValues
                                    }
                                    code={codeData.code.substring(
                                        0,
                                        codeData.code.length - 1,
                                    )}
                                    theme={codeTheme}
                                />,
                            );
                        }
                    }
                } else if (element.hasAttribute("data-table-id")) {
                    const tableId = element.getAttribute("data-table-id")!;
                    const tableData = tables.get(tableId);

                    if (tableData) {
                        results.push(
                            <TableMark
                                key={tableId}
                                item={{
                                    heading: tableData.heading,
                                    data: tableData.data,
                                }}
                                codeTheme={codeTheme}
                            />,
                        );
                    }
                } else {
                    // Recreate regular HTML element
                    const tagName = element.tagName.toLowerCase();
                    const attrs: Record<string, unknown> = {};

                    // Copy attributes
                    Array.from(element.attributes).forEach((attr) => {
                        if (attr.name === "class") {
                            attrs.className = attr.value;
                        } else if (attr.name === "style") {
                            attrs.style = attr.value;
                        } else {
                            attrs[attr.name] = attr.value;
                        }
                    });

                    // Process children
                    const children: React.ReactNode[] = [];
                    element.childNodes.forEach((child) => {
                        children.push(...processNode(child));
                    });

                    results.push(
                        React.createElement(
                            tagName,
                            { ...attrs, key: `elem-${key++}` },
                            children.length > 0 ? children : null,
                        ),
                    );
                }
            }

            return results;
        };

        // Process all body children
        doc.body.childNodes.forEach((node) => {
            elements.push(...processNode(node));
        });

        return elements;
    };

    return <div className={className}>{renderContent()}</div>;
};
