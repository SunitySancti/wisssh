import   React,
       { useState,
         useEffect,
         useRef } from 'react'

import './styles.scss'
import { Portal } from 'containers/Portal'


export const WithTooltip = ({
    trigger,
    text
}) => {
    const [ isPlaced, setIsPlaced ] = useState(false);
    const [ coords, setCoords ] = useState({});
    const tooltipRef = useRef(null);
    const triggerRef = useRef(null);
    const minPadding = 11;

    const showTooltip = e => {
        alignTooltip();
        tooltipRef.current?.classList?.remove('hidden');
        setIsPlaced(true)
    }

    const hideTooltip = async e => {
        tooltipRef.current?.classList?.add('hidden');
        const timeout = setTimeout(() => setIsPlaced(false), 300)
    };

    const alignTooltip = () => {
        const rect = triggerRef.current?.getBoundingClientRect();

        let left = rect?.left
            ? Math.max(rect.left, minPadding)
            : null;
        // let right = dropToRight ? null : window.innerWidth - rect?.right || null;

        if(left && left < minPadding) {
            left = minPadding
        }
        // if(right && right < minPadding) {
        //     right = minPadding
        // }

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
