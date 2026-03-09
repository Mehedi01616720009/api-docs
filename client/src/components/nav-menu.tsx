import type {
    HttpMethod,
    NavigationTree,
    SourceNode,
} from "../@types/navigation";
import { BASE_URL } from "../constants/app.constant";
import { NAVIGATIONS } from "../configs/navigation.config";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { buildNavigationTree } from "../utils/buildNavigationTree";
import Badge from "./badge";

type MenuItemProps = {
    item: NavigationTree;
};

const MenuItem = (props: MenuItemProps) => {
    const { item } = props;

    return (
        <NavLink
            to={BASE_URL + item.path}
            className={({ isActive }) =>
                isActive
                    ? "w-full block bg-black/80 text-white px-4 py-2 rounded-md transition-all outline-none truncate mb-1"
                    : "w-full block hover:bg-gray-100 px-4 py-2 rounded-md transition-all outline-none truncate mb-1"
            }
            title={item.title}
        >
            {item?.http && <Badge method={item.http as HttpMethod} />}
            <span>
                {["GET", "POST", "PUT", "PATCH", "DELETE"].some((method) =>
                    item.title.startsWith(method),
                )
                    ? item.title.split(" ")[1]
                    : item.title}
            </span>
        </NavLink>
    );
};

const MenuCollapseItem = (props: MenuItemProps) => {
    const { item } = props;

    return (
        <NavLink
            to={BASE_URL + item.path}
            className={({ isActive }) =>
                isActive
                    ? "w-full block bg-gray-300 px-4 pl-10 py-2 rounded-md transition-all relative before:content-[''] before:absolute before:w-0.5 before:h-[90%] before:bg-black/80 before:top-[5%] before:left-5 before:z-50 outline-none truncate"
                    : "w-full block hover:bg-gray-200 px-4 pl-10 py-2 rounded-md transition-all relative hover:before:content-[''] hover:before:absolute hover:before:w-0.5 hover:before:h-[90%] hover:before:bg-black/60 hover:before:top-[5%] hover:before:left-5 hover:before:z-50 outline-none truncate"
            }
            title={item.title}
        >
            {item?.http && <Badge method={item.http as HttpMethod} />}
            <span>
                {["GET", "POST", "PUT", "PATCH", "DELETE"].some((method) =>
                    item.title.startsWith(method),
                )
                    ? item.title.split(" ")[1]
                    : item.title}
            </span>
        </NavLink>
    );
};

const MenuCollapse = (props: MenuItemProps) => {
    const { item } = props;
    const location = useLocation();

    const [isCollapsed, setIsCollapsed] = useState<boolean>(true);

    const isChildActive = item.subMenu.some(
        (sub) => location.pathname === BASE_URL + sub.path,
    );

    const isOpen = !isCollapsed || isChildActive;

    return (
        <div>
            <div
                className="flex justify-between items-center hover:bg-gray-100 px-4 py-2 rounded-md transition-all cursor-pointer truncate"
                title={item.title.toLocaleUpperCase()}
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                <span>{item.title.toLocaleUpperCase()}</span>
                <ChevronRight
                    className={`transition-all ${isOpen ? "rotate-0" : "-rotate-90"}`}
                />
            </div>
            <div
                className={`relative before:content-[''] before:absolute before:w-0.5 before:h-[90%] before:bg-black/20 before:top-[5%] before:left-5 before:z-40 overflow-hidden transition-all ${isOpen ? "h-0" : "h-max"}`}
            >
                {item.subMenu.map((item) => {
                    if (item.type === "item") {
                        return <MenuCollapseItem key={item.key} item={item} />;
                    }
                })}
            </div>
        </div>
    );
};

const MenuGroup = (props: MenuItemProps) => {
    const { item } = props;

    return (
        <div className="mb-6">
            <h5
                className="text-sm font-semibold px-4 mb-2 truncate"
                title={item.title}
            >
                {item.title}
            </h5>

            {item.subMenu.map((item) => {
                if (item.type === "item") {
                    return <MenuItem key={item.key} item={item} />;
                }

                if (item.type === "collapse") {
                    return <MenuCollapse key={item.key} item={item} />;
                }
            })}
        </div>
    );
};

const NavMenu = (props: { sections: SourceNode[] }) => {
    const { sections } = props;

    const RenderableNav: NavigationTree[] = useMemo(() => {
        const modifiedNav = buildNavigationTree(sections);

        return [
            ...NAVIGATIONS,
            {
                key: "endpoints",
                path: "",
                type: "group",
                title: "Endpoints",
                subMenu: [...modifiedNav],
            },
        ];
    }, [sections]);

    return (
        <div className="xl:pl-6 pt-3">
            {RenderableNav.map((item) => {
                if (item.type === "item") {
                    return <MenuItem key={item.key} item={item} />;
                }

                if (item.type === "collapse") {
                    return <MenuCollapse key={item.key} item={item} />;
                }

                if (item.type === "group") {
                    return <MenuGroup key={item.key} item={item} />;
                }
            })}
        </div>
    );
};

export default NavMenu;
