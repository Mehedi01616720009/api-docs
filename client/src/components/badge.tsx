import type { HttpMethod } from "../@types/navigation";

export const TrueFalse = (props: { value: boolean }) => {
    if (props.value === true) {
        return (
            <span className="badge bg-sky-200 text-sky-800 text-xs font-semibold px-2 py-0.75 rounded-md mr-1">
                {String(props.value).toLocaleUpperCase()}
            </span>
        );
    }

    return (
        <span className="badge bg-rose-200 text-rose-800 text-xs font-semibold px-2 py-0.75 rounded-md mr-1">
            {String(props.value).toLocaleUpperCase()}
        </span>
    );
};

const Badge = (props: { method: HttpMethod }) => {
    if (props.method === "post") {
        return (
            <span className="badge bg-sky-200 text-sky-800 text-[9px] font-semibold px-2 py-0.75 rounded-md mr-1">
                {String(props.method).toLocaleUpperCase()}
            </span>
        );
    }

    if (props.method === "put") {
        return (
            <span className="badge bg-orange-200 text-orange-800 text-[9px] font-semibold px-2 py-0.75 rounded-md mr-1">
                {String(props.method).toLocaleUpperCase()}
            </span>
        );
    }

    if (props.method === "patch") {
        return (
            <span className="badge bg-purple-200 text-purple-800 text-[9px] font-semibold px-2 py-0.75 rounded-md mr-1">
                {String(props.method).toLocaleUpperCase()}
            </span>
        );
    }

    if (props.method === "delete") {
        return (
            <span className="badge bg-rose-200 text-rose-800 text-[9px] font-semibold px-2 py-0.75 rounded-md mr-1">
                {String(props.method).toLocaleUpperCase()}
            </span>
        );
    }

    return (
        <span className="badge bg-emerald-200 text-emerald-800 text-[9px] font-semibold px-2 py-0.75 rounded-md mr-1">
            {String(props.method).toLocaleUpperCase()}
        </span>
    );
};

export default Badge;
