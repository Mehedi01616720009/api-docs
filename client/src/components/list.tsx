import type { ListStyleValues, ListTypeValues } from "../@types/common";

type Props = {
    item: {
        title?: string;
        description?: string;
        type: ListTypeValues;
        style: ListStyleValues;
        items: string[];
    };
};

const OrderList = (props: { style: ListTypeValues; items: string[] }) => {
    const { style, items } = props;

    return (
        <ol style={{ listStyleType: style }}>
            {items.map((p, i) => (
                <li key={i}>{p}</li>
            ))}
        </ol>
    );
};

const UnorderList = (props: { style: ListTypeValues; items: string[] }) => {
    const { style, items } = props;

    return (
        <ul style={{ listStyleType: style }}>
            {items.map((p, i) => (
                <li key={i}>{p}</li>
            ))}
        </ul>
    );
};

const ListItems = (props: Props) => {
    const { title, description, type, style, items } = props.item;

    return (
        <div className="mb-5">
            {title && <h4>{title}</h4>}
            {description && <div className="mb-1.5">{description}</div>}

            {type === "order" ? (
                <OrderList style={style} items={items} />
            ) : (
                <UnorderList style={style} items={items} />
            )}
        </div>
    );
};

export default ListItems;
