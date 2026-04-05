import { useEffect, useState } from "react";
import Container from "./components/container";
import Sidebar from "./components/sidebar";
import { Navigate, useParams } from "react-router-dom";
import type { ApiDocConfig } from "./@types/config";
import Overview from "./components/overview";
import { RefreshCw } from "lucide-react";
import type { SourceNode } from "./@types/navigation";
import ApiRoute from "./components/api-route";
import ShortHand from "./components/short-hand";

export default function App() {
    const { key } = useParams();
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
    const [config, setConfig] = useState<ApiDocConfig | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchConfig = async () => {
            const response = await fetch("/api-docs/config.json");
            if (!response.ok) {
                throw new Error("Failed to load configuration");
            }
            const data = await response.json();
            setConfig(data.config);
            setLoading(false);
        };

        fetchConfig();
    }, []);

    if (!key) {
        return <Navigate to={"/api-docs/overview"} replace />;
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center">
                <RefreshCw className="size-20 animate-spin mb-6" />
                <h2 className="text-center text-2xl font-semibold loading">
                    Loading...
                </h2>
            </div>
        );
    }

    return (
        <div>
            <Sidebar
                sections={config?.sections as SourceNode[]}
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
            />

            <Container
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
            >
                <div className="main__content pt-3">
                    {key === "overview" ? (
                        <Overview config={config as ApiDocConfig} />
                    ) : key === "short-hand" ? (
                        <ShortHand config={config as ApiDocConfig} />
                    ) : (
                        <ApiRoute
                            routeKey={key}
                            config={config as ApiDocConfig}
                        />
                    )}
                </div>
            </Container>
        </div>
    );
}
