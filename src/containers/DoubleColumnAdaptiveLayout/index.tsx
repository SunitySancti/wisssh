import { useState,
         useEffect,
         useRef } from 'react'

import './styles.scss'

import type { ReactNode,
              RefObject } from 'react'


interface WidthLimits {
    min?: number;
    max?: number
}

interface ColumnStyles {
    minWidth: number;
    maxWidth: number
}

interface InterColumnGaps {
    landscape?: number;
    portrait?: number
}

interface DCALBaseProps {
    firstColumn: ReactNode | ReactNode[];
    secondColumn: ReactNode | ReactNode[];
    firstColumnProps?: object;
    secondColumnProps?: object
}

interface DCALViewProps extends DCALBaseProps {
    firstColumnStyles: ColumnStyles;
    secondColumnStyles: ColumnStyles;
    gap: number;
    isLandscape: boolean;
    layoutRef: RefObject<HTMLDivElement>
}

interface DCALProps extends DCALBaseProps {
    widthBreakpoint?: number;
    firstColumnLimits?: WidthLimits;
    secondColumnLimits?: WidthLimits;
    interColumnGaps?: InterColumnGaps
}


const DoubleColumnAdaptiveLayoutView = ({
    firstColumn,
    secondColumn,
    firstColumnProps,
    secondColumnProps,
    firstColumnStyles,
    secondColumnStyles,
    gap,
    isLandscape,
    layoutRef
} : DCALViewProps
) => (
    <div
        ref={ layoutRef }
        className={ 'double-column-layout' + (isLandscape ? ' landscape' : ' portrait') }
        style={{ gap }}
    >
        <div
            {...firstColumnProps}
            className='first column'
            children={ firstColumn }
            style={ firstColumnStyles }
        />
        { !isLandscape && (
            <div
                className='divider'
                style={ secondColumnStyles }
            />
        )}
        <div
            {...secondColumnProps}
            className='second column'
            children={ secondColumn }
            style={ secondColumnStyles }
        />
    </div>
)

export const DoubleColumnAdaptiveLayout = ({
    firstColumn,
    secondColumn,
    firstColumnProps,
    secondColumnProps,
    widthBreakpoint,
    firstColumnLimits,
    secondColumnLimits,
    interColumnGaps
} : DCALProps
) => {
    const [ isLandscape, setIsLandscape ] = useState(true);
    const layoutRef = useRef<HTMLDivElement>(null);
    
    const gap = isLandscape
        ? interColumnGaps?.landscape || 66
        : interColumnGaps?.portrait  || 22

    const firstColumnStyles = ({
        minWidth: firstColumnLimits?.min || 330,
        maxWidth: firstColumnLimits?.max || 440
    });

    const secondColumnStyles = ({
        minWidth: secondColumnLimits?.min || 330,
        maxWidth: secondColumnLimits?.max || 660
    });

    const breakpoint = (firstColumnStyles?.minWidth && secondColumnStyles?.minWidth)
        ? firstColumnStyles.minWidth + secondColumnStyles.minWidth + (interColumnGaps?.landscape || 66)
        : widthBreakpoint || 1040

    useEffect(() => {
        const setPageOrientation = () => {
            if(layoutRef.current) setIsLandscape(layoutRef.current?.offsetWidth > breakpoint)
        };
        setPageOrientation();
        window.addEventListener('resize', setPageOrientation)
        return () => window.removeEventListener('resize', setPageOrientation)
    },[ breakpoint ]);

    return (
        <DoubleColumnAdaptiveLayoutView {...{
            firstColumn,
            secondColumn,
            firstColumnProps,
            secondColumnProps,
            firstColumnStyles,
            secondColumnStyles,
            gap,
            layoutRef,
            isLandscape
        }}/>
    )
}
