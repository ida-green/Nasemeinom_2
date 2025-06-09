import { useState } from 'react';

const usePulsate = (duration = 600) => {
    const [isPulsing, setIsPulsing] = useState(false);

    const handleClick = () => {
        setIsPulsing(true);
        setTimeout(() => {
            setIsPulsing(false);
        }, duration);
    };

    return [isPulsing, handleClick];
};

export default usePulsate;
