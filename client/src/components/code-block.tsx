import { Check, Copy } from "lucide-react";
import type { CodeLanguageValues, CodeThemeValues } from "../@types/code-block";
import { CODE_THEMES } from "../constants/code-block.constant";
import { highlightCode, highlightCodeWithLines } from "../theme/shiki";
import { useState } from "react";
import { copyText } from "../utils/copyText";
import { sleep } from "../utils/sleep";
import type { ApiDocConfig } from "../@types/config";

type Props = {
    lang: CodeLanguageValues;
    code: string;
    theme: CodeThemeValues;
};

export const CodeBlock = (props: Props) => {
    const { lang, code, theme = CODE_THEMES.VITESSE_BLACK } = props;
    const [copied, setCopied] = useState<boolean>(false);

    const html = highlightCode(code, lang, theme);

    const handleCopyCode = async (text: string) => {
        await copyText(text);
        setCopied(true);
        await sleep(1000);
        setCopied(false);
    };

    return (
        <div className="max-w-full w-full overflow-auto no-scrollbar">
            <div className="w-max md:min-w-165 xl:w-full rounded-lg overflow-hidden mb-6">
                <div className="bg-[#18181B] text-white/60 px-4.5 py-3 shadow-[inset_0_-1px_0_#000] flex justify-between items-center">
                    <div className="code__title">{lang}</div>
                    <div>
                        {copied ? (
                            <div className="flex items-center gap-1">
                                <div>Copied!</div>
                                <Check className="size-4 text-green-500" />
                            </div>
                        ) : (
                            <Copy
                                className="size-4 cursor-pointer hover:text-white/80"
                                onClick={() => handleCopyCode(code)}
                            />
                        )}
                    </div>
                </div>
                <div
                    dangerouslySetInnerHTML={{
                        __html: html,
                    }}
                />
            </div>
        </div>
    );
};

export const CodeBlockWithLines = (props: Props) => {
    const { lang, code, theme = CODE_THEMES.VITESSE_BLACK } = props;
    const [copied, setCopied] = useState<boolean>(false);

    const html = highlightCodeWithLines(code, lang, theme);

    const handleCopyCode = async (text: string) => {
        await copyText(text);
        setCopied(true);
        await sleep(1000);
        setCopied(false);
    };

    return (
        <div className="max-w-full w-full overflow-auto no-scrollbar">
            <div className="w-max md:min-w-165 xl:w-full rounded-lg overflow-hidden mb-6">
                <div className="bg-[#18181B] text-white/60 px-4.5 py-3 shadow-[inset_0_-1px_0_#000] flex justify-between items-center">
                    <div className="code__title">{lang}</div>
                    <div>
                        {copied ? (
                            <div className="flex items-center gap-1">
                                <div>Copied!</div>
                                <Check className="size-4 text-green-500" />
                            </div>
                        ) : (
                            <Copy
                                className="size-4 cursor-pointer hover:text-white/80"
                                onClick={() => handleCopyCode(code)}
                            />
                        )}
                    </div>
                </div>
                <div
                    dangerouslySetInnerHTML={{
                        __html: html,
                    }}
                />
            </div>
        </div>
    );
};

export const CodeBlockForAuth = (props: Props) => {
    const { lang, code, theme = CODE_THEMES.VITESSE_BLACK } = props;
    const html = highlightCode(code, lang, theme);

    return (
        <div className="max-w-full w-full overflow-auto no-scrollbar">
            <div className="w-max md:min-w-165 xl:w-full rounded-lg overflow-hidden mb-6">
                <div
                    dangerouslySetInnerHTML={{
                        __html: html,
                    }}
                />
            </div>
        </div>
    );
};

export const ApiPathBlock = (props: {
    method: string;
    text: string;
    config: ApiDocConfig;
}) => {
    const { method, text, config } = props;
    const [copied, setCopied] = useState<boolean>(false);

    const handleCopyCode = async (baseUrl: string, text: string) => {
        await copyText(baseUrl + text);
        setCopied(true);
        await sleep(1000);
        setCopied(false);
    };

    return (
        <div className="max-w-full w-full overflow-auto no-scrollbar">
            <div className="w-max md:min-w-165 xl:w-full rounded-lg overflow-hidden mb-6 relative">
                <div className="api__path bg-[#101010] p-4">
                    <span
                        className={`italic font-semibold ${method === "POST" ? "text-sky-500" : method === "PUT" ? "text-orange-500" : method === "PATCH" ? "text-purple-500" : method === "DELETE" ? "text-rose-500" : "text-lime-500"}`}
                    >
                        {method}
                    </span>
                    <span className="text-yellow-300 font-semibold">
                        {" -> "}
                    </span>
                    <span className="text-[#f3fbf9]">{text}</span>
                </div>
                <div className="absolute top-4 right-4 text-white/60">
                    {copied ? (
                        <div className="flex items-center gap-1">
                            <div>Copied!</div>
                            <Check className="size-4 text-green-500" />
                        </div>
                    ) : (
                        <Copy
                            className="size-4 cursor-pointer hover:text-white/80"
                            onClick={() =>
                                handleCopyCode(
                                    config?.baseUrl || "http://localhost:5000",
                                    text,
                                )
                            }
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export const Marked = (props: { text: string }) => {
    const { text } = props;

    return (
        <code className="text-sm px-[5.5px] py-[2.75px] bg-[#656c7635] rounded-md mx-1">
            {text}
        </code>
    );
};
