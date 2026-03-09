export interface CodeBlockData {
    type: "inline" | "block-programming" | "block-other";
    lang?: string;
    code: string;
    id: string;
}

export interface TableData {
    heading: string[];
    data: string[][];
    id: string;
}

export interface ParsedContent {
    html: string;
    codeBlocks: Map<string, CodeBlockData>;
    tables: Map<string, TableData>;
}

// Programming languages that should use CodeBlockWithLines
const PROGRAMMING_LANGUAGES = new Set([
    "javascript",
    "js",
    "typescript",
    "ts",
    "jsx",
    "tsx",
    "python",
    "py",
    "java",
    "cpp",
    "c",
    "csharp",
    "cs",
    "go",
    "rust",
    "ruby",
    "php",
    "swift",
    "kotlin",
    "html",
    "css",
    "scss",
    "sass",
    "less",
    "sql",
    "graphql",
    "xml",
    "yaml",
    "yml",
    "dart",
    "scala",
    "perl",
    "r",
    "lua",
    "objective-c",
    "objectivec",
    "matlab",
]);

// Non-programming languages that should use CodeBlock (simple)
const SIMPLE_CODE_LANGUAGES = new Set([
    "json",
    "bash",
    "shell",
    "sh",
    "zsh",
    "cmd",
    "powershell",
    "terminal",
    "console",
    "text",
    "plaintext",
    "txt",
]);

/**
 * Extract language from class attribute
 * Classes are typically in format: "language-javascript" or "lang-python"
 */
function extractLanguage(className: string): string | null {
    if (!className) return null;

    const matches = className.match(/(?:language-|lang-)(\w+)/);
    return matches ? matches[1].toLowerCase() : null;
}

/**
 * Determine code block type based on language
 */
function getCodeBlockType(lang: string | null): CodeBlockData["type"] {
    if (!lang) return "inline";

    if (PROGRAMMING_LANGUAGES.has(lang)) {
        return "block-programming";
    }

    if (SIMPLE_CODE_LANGUAGES.has(lang)) {
        return "block-other";
    }

    // Default to simple block for unknown languages
    return "block-other";
}

/**
 * Extract table data from HTML table element
 */
function extractTableData(tableEl: Element): TableData | null {
    const thead = tableEl.querySelector("thead");
    const tbody = tableEl.querySelector("tbody");

    if (!thead && !tbody) return null;

    // Extract headings
    const headings: string[] = [];
    if (thead) {
        const headerRow = thead.querySelector("tr");
        if (headerRow) {
            const thElements = headerRow.querySelectorAll("th");
            thElements.forEach((th) => {
                headings.push(th.innerHTML.trim());
            });
        }
    }

    // If no thead, check first row of tbody
    if (headings.length === 0 && tbody) {
        const firstRow = tbody.querySelector("tr");
        if (firstRow) {
            const cells = firstRow.querySelectorAll("th");
            if (cells.length > 0) {
                cells.forEach((cell) => {
                    headings.push(cell.innerHTML.trim());
                });
            } else {
                // Use first row as headers if all th
                const tdCells = firstRow.querySelectorAll("td");
                tdCells.forEach((cell) => {
                    headings.push(cell.innerHTML.trim());
                });
            }
        }
    }

    // Extract data rows
    const data: string[][] = [];
    if (tbody) {
        const rows = tbody.querySelectorAll("tr");
        rows.forEach((row) => {
            const cells = row.querySelectorAll("td, th");
            if (cells.length > 0) {
                const rowData: string[] = [];
                cells.forEach((cell) => {
                    rowData.push(cell.innerHTML.trim());
                });
                data.push(rowData);
            }
        });
    }

    // If no tbody, use all rows after first (if we used first as header)
    if (data.length === 0 && !tbody) {
        const allRows = tableEl.querySelectorAll("tr");
        const startIdx = headings.length > 0 ? 1 : 0;

        for (let i = startIdx; i < allRows.length; i++) {
            const cells = allRows[i].querySelectorAll("td, th");
            const rowData: string[] = [];
            cells.forEach((cell) => {
                rowData.push(cell.innerHTML.trim());
            });
            if (rowData.length > 0) {
                data.push(rowData);
            }
        }
    }

    if (headings.length === 0 && data.length === 0) return null;

    return {
        heading: headings,
        data: data,
        id: "", // Will be set later
    };
}

/**
 * Parse HTML content and extract code blocks and tables
 * Replaces them with placeholder divs that have unique IDs
 */
export function parseMarkdownContent(htmlContent: string): ParsedContent {
    const codeBlocks = new Map<string, CodeBlockData>();
    const tables = new Map<string, TableData>();
    let codeBlockCounter = 0;
    let tableCounter = 0;

    // Create a temporary DOM to parse HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");

    // Extract tables first (before code blocks, in case tables contain code)
    const tableElements = doc.querySelectorAll("table");
    tableElements.forEach((tableEl) => {
        const tableData = extractTableData(tableEl);
        if (!tableData) return;

        const id = `table-${tableCounter++}`;
        tableData.id = id;
        tables.set(id, tableData);

        // Replace table with placeholder
        const placeholder = doc.createElement("div");
        placeholder.setAttribute("data-table-id", id);
        placeholder.className = "table-placeholder";
        tableEl.replaceWith(placeholder);
    });

    // Find all <code> elements
    const codeElements = doc.querySelectorAll("code");

    codeElements.forEach((codeEl) => {
        const parentIsPre = codeEl.parentElement?.tagName === "PRE";
        const className = codeEl.className || "";
        const code = codeEl.textContent || "";

        // Skip empty code blocks
        if (!code.trim()) return;

        const lang = extractLanguage(className);

        // Inline code (no class, or has class but parent is not <pre>)
        if (!parentIsPre) {
            const id = `code-inline-${codeBlockCounter++}`;
            codeBlocks.set(id, {
                type: "inline",
                code: code,
                id,
            });

            // Replace with placeholder
            const placeholder = doc.createElement("span");
            placeholder.setAttribute("data-code-id", id);
            placeholder.className = "code-block-placeholder";
            codeEl.replaceWith(placeholder);
            return;
        }

        // Block code (parent is <pre>)
        const type = getCodeBlockType(lang);
        const id = `code-block-${codeBlockCounter++}`;

        codeBlocks.set(id, {
            type,
            lang: lang || "text",
            code: code,
            id,
        });

        // Replace <pre><code>...</code></pre> with placeholder
        const placeholder = doc.createElement("div");
        placeholder.setAttribute("data-code-id", id);
        placeholder.className = "code-block-placeholder";
        codeEl.parentElement?.replaceWith(placeholder);
    });

    // Sanitize the modified HTML
    const modifiedHtml = doc.body.innerHTML;

    return {
        html: modifiedHtml,
        codeBlocks,
        tables,
    };
}

/**
 * Helper to get all code block IDs in order from HTML
 */
export function extractCodeBlockIds(html: string): string[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const placeholders = doc.querySelectorAll("[data-code-id]");

    return Array.from(placeholders).map(
        (el) => el.getAttribute("data-code-id")!,
    );
}

/**
 * Helper to get all table IDs in order from HTML
 */
export function extractTableIds(html: string): string[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const placeholders = doc.querySelectorAll("[data-table-id]");

    return Array.from(placeholders).map(
        (el) => el.getAttribute("data-table-id")!,
    );
}
