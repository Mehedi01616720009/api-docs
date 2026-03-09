import { PanelLeftDashed } from "lucide-react";

type Props = {
    isSidebarOpen: boolean;
    setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const Topbar = (props: Props) => {
    const { isSidebarOpen, setIsSidebarOpen } = props;

    return (
        <div className="py-4 sticky top-0 right-0 bg-white">
            <PanelLeftDashed
                className="size-5 cursor-pointer"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            />
        </div>
    );
};

export default Topbar;
