import { useState,
         useEffect,
         useRef } from 'react'

import './styles.scss'
import { Portal } from 'containers/Portal'

import type { ReactNode } from 'react'


interface WithTooltipProps {
    trigger: ReactNode;
    text: string
}
    

function delay(duration: number) {
    return new Promise((resolve) => setTimeout(resolve, duration));
}

export const WithTooltip = ({
    trigger,
    text
} : WithTooltipProps
) => {
    const [ isPlaced, setIsPlaced ] = useState(false);
    const [ coords, setCoords ] = useState({});
    const tooltipRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const minPadding = 11;

    const showTooltip = () => {
        alignTooltip();
        tooltipRef.current?.classList?.remove('hidden');
        setIsPlaced(true)
    }

    const hideTooltip = async () => {
        Promise.resolve()
            .then(() => delay(300))
            .then(() => tooltipRef.current?.classList?.add('hidden'))
            .then(() => delay(300))
            .then(() => setIsPlaced(false));
    };

    const alignTooltip = () => {
        const rect = triggerRef.current?.getBoundingClientRect();

        let left = rect?.left
            ? Math.max(rect.left, minPadding)
            : null;

        if(left && left < minPadding) {
            left = minPadding
        }

        setCoords({ left, top: rect?.bottom })
    }

    useEffect(() => {
        window.addEventListener('resize', alignTooltip);
        return () => {
            window.removeEventListener('resize', alignTooltip);
        }
    },[ tooltipRef.current ]);

    return <>
        <div
            ref={ triggerRef }
            className='tooltip-trigger'
            children={ trigger }
            onMouseEnter={ showTooltip }
            onMouseLeave={ hideTooltip }
        />
        { isPlaced &&
            <Portal layer='tooltip'>
                <div
                    ref={ tooltipRef }
                    className='tooltip'
                    style={ coords }
                    children={ text }
                />
            </Portal>
        }
    </>
}
