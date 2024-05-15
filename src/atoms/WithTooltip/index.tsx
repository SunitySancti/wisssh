import { useState,
         useRef,
         memo,
         useCallback } from 'react'

import './styles.scss'
import { Portal } from 'containers/Portal'

import { delay } from 'utils'

import type { ReactNode,
              RefObject } from 'react'


interface WithTooltipProps {
    text: string;
    trigger: ReactNode
}

interface WithTooltipViewProps extends WithTooltipProps {
    triggerRef: RefObject<HTMLDivElement>;
    showTooltip(): void;
    hideTooltip(): void;
    left?: number;
    top?: number;
    isVisible: boolean;
    isTransparent: boolean
}


const WithTooltipView = memo(({
    text,
    trigger,
    triggerRef,
    showTooltip,
    hideTooltip,
    left,
    top,
    isVisible,
    isTransparent
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
                    className={ 'tooltip' + (isTransparent ? ' hidden' : '') }
                    style={{ left, top }}
                    children={ text }
                />
            </Portal>
        }
    </>
));

export const WithTooltip = memo((props : WithTooltipProps) => {
    const [ isVisible, setIsVisible ] = useState(false);
    const [ isTransparent, setIsTransparent ] = useState(true);
    const [ left, setLeft ] = useState<number | undefined>(undefined);
    const [ top, setTop ] = useState<number | undefined>(undefined);
    const triggerRef = useRef<HTMLDivElement>(null);
    const minPadding = 11;

    const showTooltip = useCallback(() => {
        alignTooltip();
        setIsTransparent(false);
        setIsVisible(true)
    },[]);

    const hideTooltip = useCallback(async () => {
        Promise.resolve()
            .then(() => delay(300))
            .then(() => setIsTransparent(true))
            .then(() => delay(300))
            .then(() => setIsVisible(false));
    },[]);

    const alignTooltip = useCallback(() => {
        const rect = triggerRef.current?.getBoundingClientRect();

        if(rect) {
            setLeft(Math.max(rect.left, minPadding));
            setTop(rect?.bottom)
        }
    },[]);

    return (
        <WithTooltipView {...{
            ...props,
            triggerRef,
            showTooltip,
            hideTooltip,
            left,
            top,
            isTransparent,
            isVisible
        }}/>
    )
})
