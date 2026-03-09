import type { ApiDocConfig } from "../@types/config";
import { minimizeSections } from "../utils/minimizeSections";
import { ApiPathBlock } from "./code-block";

type Props = {
    config: ApiDocConfig;
};

const ShortHand = (props: Props) => {
    const { config } = props;

    const sections = minimizeSections(config.sections);

    return (
        <div>
            <h5>Short Hand</h5>
            <div className="mb-8"></div>

            {sections.map((section) => (
                <div key={section.label} className="mb-6">
                    <h6>{section.label}</h6>
                    <div className="mb-4"></div>
                    {section.items.map((item) => (
                        <ApiPathBlock
                            method={(item.method || "get").toLocaleUpperCase()}
                            text={item.path || "/"}
                            config={config}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
};

export default ShortHand;
