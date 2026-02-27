import { useEffect } from 'react';

export const useFavicon = (href: string) => {
    useEffect(() => {
        let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
        }

        // Keep track of the previous favicon
        const previousHref = link.href;

        // Update to the new favicon
        link.href = href;

        // Revert back when the component using the hook unmounts
        return () => {
            link!.href = previousHref;
        };
    }, [href]);
};
