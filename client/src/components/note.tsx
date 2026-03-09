const NoteDisplay = ({ note }: { note: string }) => {
    return (
        <div className="note p-4 lg:p-6 rounded-lg bg-sky-50 border border-sky-200 text-sky-700">
            <div
                dangerouslySetInnerHTML={{
                    __html: note,
                }}
            />
        </div>
    );
};

export default NoteDisplay;
