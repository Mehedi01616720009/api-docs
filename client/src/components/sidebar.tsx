import { PanelLeftClose } from "lucide-react";
import NavMenu from "./nav-menu";
import type { SourceNode } from "../@types/navigation";

type Props = {
    sections: SourceNode[];
    isSidebarOpen: boolean;
    setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const Sidebar = (props: Props) => {
    const { sections, isSidebarOpen, setIsSidebarOpen } = props;

    return (
        <div
            className={`w-75 xl:w-95 h-screen bg-white lg:bg-white p-5 pt-13 fixed top-0 z-30 transition-all overflow-auto ${isSidebarOpen ? "left-0 lg:-left-full" : "-left-75 lg:left-0"}`}
        >
            <PanelLeftClose
                className="size-5 lg:hidden cursor-pointer absolute top-4 right-4"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            />

            <NavMenu sections={sections} />
        </div>
    );
};

export default Sidebar;
