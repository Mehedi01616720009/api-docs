import type { ReactNode } from "react";
import Topbar from "./topbar";

type Props = {
    children: ReactNode;
    isSidebarOpen: boolean;
    setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const Container = (props: Props) => {
    const { children, isSidebarOpen, setIsSidebarOpen } = props;

    return (
        <div
            className={`max-w-full w-full min-h-screen flex justify-center px-5 lg:px-8 pb-6 relative transition-all ${isSidebarOpen ? "lg:pl-8" : "lg:pl-83 xl:pl-103"}`}
        >
            <div className={"xl:max-w-262 w-full"}>
                <Topbar
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                />

                <div className="w-full">{children}</div>
            </div>
        </div>
    );
};

export default Container;
