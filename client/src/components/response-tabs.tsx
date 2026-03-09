import { useState } from "react";
import { CodeBlock } from "./code-block";
import { CODE_LANGS, CODE_THEMES } from "../constants/code-block.constant";
import type { CodeThemeValues } from "../@types/code-block";
import type { BodyMetadata } from "../@types/api-route";

type Props = {
    codeTheme: CodeThemeValues;
    responses: Record<string, BodyMetadata>;
};

const getStatusColor = (code: string) => {
    if (code.startsWith("2")) return "bg-green-600 text-white";
    if (code.startsWith("4")) return "bg-red-600 text-white";
    if (code.startsWith("5")) return "bg-orange-600 text-white";
    return "bg-zinc-600 text-white";
};

const ResponsesTabs = ({ responses, codeTheme }: Props) => {
    const statusCodes = Object.keys(responses || {});
    const [active, setActive] = useState(statusCodes[0]);

    if (!statusCodes.length) return null;

    return (
        <div>
            <h5 className="mb-4 font-semibold">Responses</h5>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-4">
                {statusCodes.map((code) => {
                    const isActive = active === code;

                    return (
                        <button
                            key={code}
                            onClick={() => setActive(code)}
                            className={`
                                px-4 py-2 text-sm font-medium rounded-md
                                transition-all duration-200
                                ${
                                    isActive
                                        ? getStatusColor(code)
                                        : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300"
                                }
                            `}
                        >
                            {code}
                        </button>
                    );
                })}
            </div>

            {/* Code Block */}
            <CodeBlock
                code={JSON.stringify(responses[active]?.example, null, 4)}
                lang={CODE_LANGS.JSON}
                theme={codeTheme || CODE_THEMES.VITESSE_BLACK}
            />
        </div>
    );
};

export default ResponsesTabs;
