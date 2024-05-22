import { useEffect, useState } from 'react'
import { useEventListener } from './useEventListener'
import type { RefObject } from 'react';


export function useOverflowDetector(
    ref: RefObject<HTMLElement>
) {
    const [leftOverflow, setLeftOverflow] = useState(false);
    const [rightOverflow, setRightOverflow] = useState(false);

    const detectOverflow = () => {
        if(ref.current) {
            const overflow = ref.current.scrollWidth - ref.current.clientWidth;
            const scrollLeft = Math.ceil(ref.current.scrollLeft);
            setLeftOverflow( scrollLeft > 0 );
            setRightOverflow( scrollLeft < overflow );
        }
    };

    useEffect(() => {
        detectOverflow();
        ref.current?.addEventListener('scroll', detectOverflow);
        return () => ref.current?.removeEventListener('scroll', detectOverflow)
    },[ ref.current ])

    useEventListener('scroll', detectOverflow, ref.current);

    return [leftOverflow, rightOverflow] as const
}
