import { useEffect, useState, type FC } from "react";

export const App: FC = () => {
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const el = document.getElementById('gas-json-data');
        if (el) {
            try {
                setData(JSON.parse(el.textContent?.trim() ?? '{}'));
            } catch (e) {
                console.error('初期データのパース失敗', e);
            }
        }
    }, []);

    return (
        <div>
            {JSON.stringify(data)}
        </div>
    );
};
