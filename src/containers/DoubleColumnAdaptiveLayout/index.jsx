import   React,
       { useState,
         useEffect,
         useMemo,
         useRef } from 'react'

import './styles.scss'


export const DoubleColumnAdaptiveLayout = ({
    firstColumn,
    secondColumn,
    firstColumnProps,
    secondColumnProps,
    widthBreakpoint,
    firstColumnLimits,
    secondColumnLimits,
    interColumnGaps
}) => {
    const [ isLandscape, setIsLandscape ] = useState(true);
    const layoutRef = useRef(null);

    const Gaps = useMemo(() => {
        let gaps = { landscape: 66, portrait: 22 };
        if(interColumnGaps) {
            const { landscape, portrait } = interColumnGaps;
            if(landscape) gaps.landscape = landscape;
            if(portrait) gaps.portrait = portrait;
        }

        return gaps
    },[ interColumnGaps?.landscape, interColumnGaps?.portrait ]);

    const firstColumnStyles = useMemo(() => {
        let styles = { minWidth: 330, maxWidth: 440 };
        if(firstColumnLimits) {
            const { min, max } = firstColumnLimits;
            if(min) styles.minWidth = min;
            if(max) styles.maxWidth = max;
        }

        return styles
    },[ firstColumnLimits?.min, firstColumnLimits?.max ]);

    const secondColumnStyles = useMemo(() => {
        let styles = { minWidth: 330, maxWidth: 660 };
        if(secondColumnLimits) {
            const { min, max } = secondColumnLimits;
            if(min) styles.minWidth = min;
            if(max) styles.maxWidth = max;
        }

        return styles
    },[ secondColumnLimits?.min, secondColumnLimits?.max ]);

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
            className={ isLandscape
                ? 'double-column-layout landscape'
                : 'double-column-layout portrait'
            }
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
