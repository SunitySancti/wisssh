import { useState,
         useEffect,
         useRef } from 'react'

import './styles.scss'
import { Portal } from 'containers/Portal'

import { delay } from 'utils'

import type { ReactNode,
              RefObject } from 'react'


interface Coords {
    left?: number;
    right?: number;
    top: number;
}

interface WithTooltipProps {
    trigger: ReactNode;
    text: string
}

interface WithTooltipViewProps extends WithTooltipProps {
    triggerRef: RefObject<HTMLDivElement>;
    tooltipRef: RefObject<HTMLDivElement>;
    showTooltip(): void;
    hideTooltip(): void;
    isVisible: boolean;
    coords?: Coords
}


const WithTooltipView = ({
    trigger,
    text,
    triggerRef,
    tooltipRef,
    showTooltip,
    hideTooltip,
    isVisible,
    coords
} : WithTooltipViewProps
) => (
    <>
        <div
            ref={ triggerRef }
            className='tooltip-trigger'
            children={ trigger }
            onMouseEnter={ showTooltip }
            onMouseLeave={ hideTooltip }
        />
        { isVisible &&
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
)

export const WithTooltip = (props : WithTooltipProps) => {
    const [ isVisible, setIsVisible ] = useState(false);
    const [ coords, setCoords ] = useState<Coords | undefined>(undefined);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const minPadding = 11;

    const showTooltip = () => {
        alignTooltip();
        tooltipRef.current?.classList.remove('hidden');
        setIsVisible(true)
    }

    const hideTooltip = async () => {
        Promise.resolve()
            .then(() => delay(300))
            .then(() => tooltipRef.current?.classList?.add('hidden'))
            .then(() => delay(300))
            .then(() => setIsVisible(false));
    };

    const alignTooltip = () => {
        const rect = triggerRef.current?.getBoundingClientRect();

        if(rect) {
            setCoords({
                left: Math.max(rect.left, minPadding),
                top: rect?.bottom
            })
        }
    }

    useEffect(() => {
        window.addEventListener('resize', alignTooltip);
        return () => {
            window.removeEventListener('resize', alignTooltip);
        }
    },[ tooltipRef.current ]);

    return (
        <WithTooltipView {...{
            ...props,
            triggerRef,
            tooltipRef,
            showTooltip,
            hideTooltip,
            coords,
            isVisible
        }}/>
    )
}
