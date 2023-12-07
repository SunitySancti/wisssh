import { useState,
         useEffect,
         useMemo,
         useRef } from 'react'

import './styles.scss'

import type { ReactNode } from 'react'


interface WidthLimits {
    min?: number;
    max?: number
}

interface InterColumnGaps {
    landscape?: number;
    portrait?: number
}

interface DoubleColumnAdaptiveLayoutProps {
    firstColumn: ReactNode | ReactNode[],
    secondColumn: ReactNode | ReactNode[],
    firstColumnProps?: object,
    secondColumnProps?: object,
    firstColumnLimits?: WidthLimits,
    secondColumnLimits?: WidthLimits,
    widthBreakpoint?: number,
    interColumnGaps?: InterColumnGaps
}


export const DoubleColumnAdaptiveLayout = ({
    firstColumn,
    secondColumn,
    firstColumnProps,
    secondColumnProps,
    widthBreakpoint,
    firstColumnLimits,
    secondColumnLimits,
    interColumnGaps
} : DoubleColumnAdaptiveLayoutProps
) => {
    const [ isLandscape, setIsLandscape ] = useState(true);
    const layoutRef = useRef<HTMLDivElement>(null);

    const Gaps = useMemo(() => ({
        landscape: interColumnGaps?.landscape || 66,
        portrait: interColumnGaps?.portrait || 22
    }),[ interColumnGaps?.landscape, interColumnGaps?.portrait ]);

    const firstColumnStyles = useMemo(() => ({
        minWidth: firstColumnLimits?.min || 330,
        maxWidth: firstColumnLimits?.max || 440
    }),[ firstColumnLimits?.min, firstColumnLimits?.max ]);

    const secondColumnStyles = useMemo(() => ({
        minWidth: secondColumnLimits?.min || 330,
        maxWidth: secondColumnLimits?.max || 660
    }),[ secondColumnLimits?.min, secondColumnLimits?.max ]);

    const breakpoint = useMemo(() => {
        if(firstColumnStyles?.minWidth && secondColumnStyles?.minWidth && Gaps?.landscape) {
            return firstColumnStyles.minWidth + secondColumnStyles.minWidth + Gaps.landscape
        } else return widthBreakpoint || 1040
    },[ firstColumnStyles?.minWidth, secondColumnStyles?.minWidth, Gaps?.landscape ]);
    

    useEffect(() => {
        const setPageOrientation = () => {
            if(layoutRef.current) setIsLandscape(layoutRef.current?.offsetWidth > breakpoint)
        };
        setPageOrientation();
        window.addEventListener('resize', setPageOrientation)
        return () => window.removeEventListener('resize', setPageOrientation)
    },[ breakpoint ]);

    return (
        <div
            ref={ layoutRef }
            className={ 'double-column-layout' + (isLandscape ? ' landscape' : ' portrait') }
            style={{ gap: isLandscape ? Gaps.landscape : Gaps.portrait }}
        >
            <div
                className='first column'
                children={ firstColumn }
                style={ firstColumnStyles }
                {...firstColumnProps}
            />
            { !isLandscape && (
                <div
                    className='divider'
                    style={ secondColumnStyles }
                />
            )}
            <div
                className='second column'
                children={ secondColumn }
                style={ secondColumnStyles }
                {...secondColumnProps}
            />
        </div>
    )
}
