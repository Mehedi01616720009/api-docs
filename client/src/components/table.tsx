import type { CodeThemeValues } from "../@types/code-block";
import { MarkdownRenderer } from "./markdown-renderer";
import { type ReactNode } from "react";
import { Marked } from "./code-block";
import { TrueFalse } from "./badge";
import { CODE_THEMES } from "../constants/code-block.constant";

type Props = {
    item: {
        heading: string[];
        data: Record<string, unknown>[];
    };
    codeTheme: CodeThemeValues;
};

type MarkProps = {
    item: {
        heading: string[];
        data: string[][];
    };
    codeTheme: CodeThemeValues;
};

export const Td = (props: { children: ReactNode }) => {
    return (
        <td className="px-3.25 py-1.5 border border-[#e2e2e3]">
            {props.children}
        </td>
    );
};

const Table = (props: Props) => {
    const { codeTheme } = props;
    const { heading, data } = props.item;

    return (
        <div className="mb-5">
            <div className="max-w-full overflow-auto no-scrollbar">
                <table className="w-max">
                    <thead>
                        <tr>
                            {heading.map((p, i) => (
                                <th
                                    key={i}
                                    className="px-3.25 py-1.5 border border-[#e2e2e3] font-semibold capitalize"
                                >
                                    {p}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((val, idx) => (
                            <tr key={idx} className="odd:bg-[#e2e2e345]">
                                {heading.map((head, headIdx) => {
                                    if (head === "name") {
                                        return (
                                            <Td key={headIdx}>
                                                {val?.name ? (
                                                    <Marked
                                                        text={String(val.name)}
                                                    />
                                                ) : (
                                                    "--"
                                                )}
                                            </Td>
                                        );
                                    }

                                    if (head === "type") {
                                        return (
                                            <Td key={headIdx}>
                                                {val?.type ? (
                                                    <p className="capitalize">
                                                        {String(val.type)}
                                                    </p>
                                                ) : (
                                                    "--"
                                                )}
                                            </Td>
                                        );
                                    }

                                    if (head === "required") {
                                        return (
                                            <Td key={headIdx}>
                                                {val?.required !== undefined ? (
                                                    <TrueFalse
                                                        value={Boolean(
                                                            val.required,
                                                        )}
                                                    />
                                                ) : (
                                                    "--"
                                                )}
                                            </Td>
                                        );
                                    }

                                    if (head === "description") {
                                        return (
                                            <Td key={headIdx}>
                                                {val?.description ? (
                                                    <MarkdownRenderer
                                                        content={String(
                                                            val.description,
                                                        )}
                                                        codeTheme={
                                                            codeTheme ||
                                                            CODE_THEMES.VITESSE_BLACK
                                                        }
                                                    />
                                                ) : (
                                                    "--"
                                                )}
                                            </Td>
                                        );
                                    }

                                    if (head === "enum") {
                                        return (
                                            <Td key={headIdx}>
                                                {val?.enum ? (
                                                    <p>
                                                        {(
                                                            val.enum as string[]
                                                        ).map((v, i, arr) => (
                                                            <span key={i}>
                                                                <Marked
                                                                    text={v}
                                                                />
                                                                {i <
                                                                    arr.length -
                                                                        1 &&
                                                                    ", "}
                                                            </span>
                                                        ))}
                                                    </p>
                                                ) : (
                                                    "--"
                                                )}
                                            </Td>
                                        );
                                    }

                                    if (head === "default") {
                                        return (
                                            <Td key={headIdx}>
                                                {val?.default ? (
                                                    <p>{String(val.default)}</p>
                                                ) : (
                                                    "--"
                                                )}
                                            </Td>
                                        );
                                    }

                                    if (head === "example") {
                                        return (
                                            <Td key={headIdx}>
                                                {val?.example ? (
                                                    <Marked
                                                        text={JSON.stringify(
                                                            val.example,
                                                        )}
                                                    />
                                                ) : (
                                                    "--"
                                                )}
                                            </Td>
                                        );
                                    }

                                    if (head === "pattern") {
                                        return (
                                            <Td key={headIdx}>
                                                {val?.pattern ? (
                                                    <Marked
                                                        text={String(
                                                            val.pattern,
                                                        )}
                                                    />
                                                ) : (
                                                    "--"
                                                )}
                                            </Td>
                                        );
                                    }

                                    if (head === "minimum") {
                                        return (
                                            <Td key={headIdx}>
                                                <p>
                                                    {val?.minimum
                                                        ? String(val.minimum)
                                                        : "--"}
                                                </p>
                                            </Td>
                                        );
                                    }

                                    if (head === "maximum") {
                                        return (
                                            <Td key={headIdx}>
                                                <p>
                                                    {val?.maximum
                                                        ? String(val.maximum)
                                                        : "--"}
                                                </p>
                                            </Td>
                                        );
                                    }

                                    if (head === "minLength") {
                                        return (
                                            <Td key={headIdx}>
                                                <p>
                                                    {val?.minLength
                                                        ? String(val.minLength)
                                                        : "--"}
                                                </p>
                                            </Td>
                                        );
                                    }

                                    if (head === "maxLength") {
                                        return (
                                            <Td key={headIdx}>
                                                <p>
                                                    {val?.maxLength
                                                        ? String(val.maxLength)
                                                        : "--"}
                                                </p>
                                            </Td>
                                        );
                                    }
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const TableMark = (props: MarkProps) => {
    const { codeTheme } = props;
    const { heading, data } = props.item;

    return (
        <div className="mb-5">
            <div className="max-w-full overflow-auto no-scrollbar">
                <table className="w-max">
                    <thead>
                        <tr>
                            {heading.map((p, i) => (
                                <th
                                    key={i}
                                    className="px-3.25 py-1.5 border border-[#e2e2e3] font-semibold capitalize"
                                >
                                    {p}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, i) => (
                            <tr key={i}>
                                {row.map((p, j) => (
                                    <Td key={j}>
                                        <MarkdownRenderer
                                            content={p}
                                            codeTheme={
                                                codeTheme ||
                                                CODE_THEMES.VITESSE_BLACK
                                            }
                                        />
                                    </Td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const TableBlock = (props: {
    item: {
        heading: string[];
    };
    children: ReactNode;
}) => {
    const { children } = props;
    const { heading } = props.item;

    return (
        <div className="mb-5">
            <div className="max-w-full overflow-auto no-scrollbar">
                <table className="w-max">
                    <thead>
                        <tr>
                            {heading.map((p, i) => (
                                <th
                                    key={i}
                                    className="px-3.25 py-1.5 border border-[#e2e2e3] font-semibold capitalize"
                                >
                                    {p}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>{children}</tbody>
                </table>
            </div>
        </div>
    );
};

export default Table;
