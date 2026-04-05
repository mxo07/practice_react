import { useEffect, useState } from "react";

const cache = {};

export const useOgp = (url) => {
    const [ogp, setOgp] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);


    useEffect(() => {
        if (!url) return;

        if (cache[url]) {
            setOgp(cache[url]);
            return;
        }

        const fetchOgp = async () => {
            setLoading(true);
            setError(false);

            try {
                const res = await fetch(
                    `https://api.linkpreview.net/?key=701fa170341ed3ab76ee3fe53b3a3f95&q=${encodeURIComponent(url)}`
                );

                if (!res.ok) throw new Error();

                const data = await res.json();

                if (!data.title) throw new Error();

                const result = {
                    title: data.title,
                    description: data.description,
                    image: data.image,
                    url: url
                };

                cache[url] = result;
                setOgp(result);
        } catch {
            setError(true);
            setOgp(null);
        } finally {
            setLoading(false);
        }
    };

    fetchOgp();
}, [url]);

return { ogp, loading, error };
};