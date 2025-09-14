import * as React from 'react';

export function useMediaQuery(query: string) {
    const [value, setValue] = React.useState(false);

    React.useEffect(() => {
        function onChange(event: MediaQueryListEvent) {
            setValue(event.matches);
        }
        // This result is constantly checking to see if the screen size meets requirements (i.e. query)
        const result = matchMedia(query);
        // This change only event only fires when matches goes from true to false or vice versa
        result.addEventListener('change', onChange);
        // result.matches is a boolean
        setValue(result.matches);
        return () => result.removeEventListener('change', onChange);
    }, [query]);

    return value;
}