import type { CodeThemeValues } from "../@types/code-block";
import type { ApiDocConfig } from "../@types/config";
import { MarkdownRenderer } from "./markdown-renderer";

type Props = {
    config: ApiDocConfig;
};

const Overview = (props: Props) => {
    const { config } = props;

    return (
        <div>
            <h5>Overview</h5>

            <div className="mb-6">
                <h2>{config.title}</h2>
                <h6>v{config.version}</h6>
            </div>

            <div className="mb-6">
                <MarkdownRenderer
                    content={String(config.description)}
                    codeTheme={config?.theme?.codeTheme as CodeThemeValues}
                />
            </div>
        </div>
    );
};

export default Overview;
