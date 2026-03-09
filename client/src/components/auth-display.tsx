import type { AuthMetadata } from "../@types/api-route";
import type { CodeThemeValues } from "../@types/code-block";
import { CODE_LANGS, CODE_THEMES } from "../constants/code-block.constant";
import { CodeBlockForAuth } from "./code-block";

type AuthDisplayProps = {
    auth: boolean | AuthMetadata;
    codeTheme: CodeThemeValues;
};

const AuthDisplay = ({ auth, codeTheme }: AuthDisplayProps) => {
    if (!auth) {
        return (
            <CodeBlockForAuth
                lang={CODE_LANGS.BASH}
                code="🔓 Public - No authentication required"
                theme={codeTheme || CODE_THEMES.VITESSE_BLACK}
            />
        );
    }

    const authMeta = auth as AuthMetadata;

    return (
        <CodeBlockForAuth
            lang={CODE_LANGS.BASH}
            code={`🗝️ ${authMeta.type?.toLocaleUpperCase()} Authentication required\n📌 Scopes - ${(authMeta?.scopes || []).join(", ")}`}
            theme={codeTheme || CODE_THEMES.VITESSE_BLACK}
        />
    );
};

export default AuthDisplay;
