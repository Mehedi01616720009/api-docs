import type { ApiDocConfig } from "../@types/config";
import { CODE_LANGS, CODE_THEMES } from "../constants/code-block.constant";
import { transform, transformObject } from "../utils/transformToTableData";
import AuthDisplay from "./auth-display";
import { ApiPathBlock, CodeBlock, Marked } from "./code-block";
import { MarkdownRenderer } from "./markdown-renderer";
import Table from "./table";
import NoteDisplay from "./note";
import ResponsesTabs from "./response-tabs";

type Props = {
    routeKey: string;
    config: ApiDocConfig;
};

const ApiRoute = (props: Props) => {
    const { routeKey, config } = props;
    const sectionItems = config.sections.map((s) => s.items).flat();
    const section = sectionItems.find((i) => routeKey === i?.name);

    const params = section?.api?.params ? transform(section.api.params) : null;

    const query = section?.api?.query ? transform(section.api.query) : null;

    const body = section?.api?.body
        ? transformObject(section.api.body.schema)
        : null;

    const headers = section?.api?.headers
        ? transform(section.api.headers)
        : null;

    const auth = section?.api?.auth ? section.api.auth : false;

    const success = section?.api?.responses
        ? transformObject(
              section.api.responses[200]?.schema ||
                  section.api.responses[201]?.schema ||
                  {},
          )
        : null;

    return (
        <div>
            <h4>{section?.label}</h4>
            <div className="mb-10"></div>

            {section?.api?.deprecated && (
                <div className="note p-4 rounded-lg bg-orange-50 border border-orange-200 text-orange-700 mb-6 italic font-semibold">
                    This route is deprecated.
                </div>
            )}

            {section?.api?.description && (
                <MarkdownRenderer
                    content={section.api.description || ""}
                    codeTheme={
                        config.theme?.codeTheme || CODE_THEMES.VITESSE_BLACK
                    }
                />
            )}

            <ApiPathBlock
                method={(section?.api.method || "get").toLocaleUpperCase()}
                text={section?.api.path || "/"}
                config={config}
            />

            {params && <h4 className="mb-1.5">Params</h4>}
            {params && (
                <Table
                    item={{
                        heading: params.headings,
                        data: params.values,
                    }}
                    codeTheme={
                        config.theme?.codeTheme || CODE_THEMES.VITESSE_BLACK
                    }
                />
            )}

            {query && <h4 className="mb-1.5">Query</h4>}
            {query && (
                <Table
                    item={{
                        heading: query.headings,
                        data: query.values,
                    }}
                    codeTheme={
                        config.theme?.codeTheme || CODE_THEMES.VITESSE_BLACK
                    }
                />
            )}

            {body && <h4 className="mb-1.5">Body</h4>}
            {body && (
                <div className="mb-1.5">
                    <div>
                        <b>Content-Type:</b>{" "}
                        <Marked
                            text={String(section?.api?.body?.contentType)}
                        />
                    </div>
                    <MarkdownRenderer
                        content={section?.api?.body?.description || ""}
                        codeTheme={
                            config.theme?.codeTheme || CODE_THEMES.VITESSE_BLACK
                        }
                    />
                </div>
            )}
            {body && (
                <Table
                    item={{
                        heading: body.headings,
                        data: body.values,
                    }}
                    codeTheme={
                        config.theme?.codeTheme || CODE_THEMES.VITESSE_BLACK
                    }
                />
            )}

            {headers && <h4 className="mb-1.5">Headers</h4>}
            {headers && (
                <Table
                    item={{
                        heading: headers.headings,
                        data: headers.values,
                    }}
                    codeTheme={
                        config.theme?.codeTheme || CODE_THEMES.VITESSE_BLACK
                    }
                />
            )}

            <h4 className="mb-1.5">Auth</h4>
            <AuthDisplay
                auth={auth}
                codeTheme={config.theme?.codeTheme || CODE_THEMES.VITESSE_BLACK}
            />

            {success && section?.api?.responses && (
                <h4 className="mb-1.5">Response</h4>
            )}
            {success && section?.api?.responses && (
                <div className="mb-1.5">
                    <div>
                        <b>Content-Type:</b>{" "}
                        <Marked
                            text={String(
                                section?.api?.responses?.[200]?.contentType ||
                                    section?.api?.responses?.[201]?.contentType,
                            )}
                        />
                    </div>
                    <MarkdownRenderer
                        content={
                            section?.api?.responses?.[200]?.description ||
                            section?.api?.responses?.[201]?.description ||
                            ""
                        }
                        codeTheme={
                            config.theme?.codeTheme || CODE_THEMES.VITESSE_BLACK
                        }
                    />
                </div>
            )}
            {success &&
                section?.api?.responses &&
                success.headings.length > 0 && (
                    <Table
                        item={{
                            heading: success.headings,
                            data: success.values,
                        }}
                        codeTheme={
                            config.theme?.codeTheme || CODE_THEMES.VITESSE_BLACK
                        }
                    />
                )}

            {section?.api?.summary && <h4 className="mb-1.5">Summary</h4>}
            {section?.api?.summary && (
                <MarkdownRenderer
                    content={section.api.summary || ""}
                    codeTheme={
                        config.theme?.codeTheme || CODE_THEMES.VITESSE_BLACK
                    }
                />
            )}

            <h4 className="mb-1.5">Example</h4>
            {body && (
                <div>
                    <h5>Request</h5>
                    <CodeBlock
                        code={JSON.stringify(
                            section?.api?.body?.example,
                            null,
                            4,
                        )}
                        lang={CODE_LANGS.JSON}
                        theme={
                            config.theme?.codeTheme || CODE_THEMES.VITESSE_BLACK
                        }
                    />
                </div>
            )}

            {section?.api?.responses && (
                <ResponsesTabs
                    responses={section.api.responses}
                    codeTheme={
                        config.theme?.codeTheme || CODE_THEMES.VITESSE_BLACK
                    }
                />
            )}

            {section?.api?.note && <NoteDisplay note={section.api.note} />}
        </div>
    );
};

export default ApiRoute;
