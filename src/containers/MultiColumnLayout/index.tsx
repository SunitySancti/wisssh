import { useEffect,
         useState,
         useRef,
         memo } from 'react'
import { useLocation } from 'react-router'

import { findOutMobile } from 'store/responsivenessSlice'

import type { FC } from 'react'
import type { Wish } from 'typings'


interface MultiColumnLayoutProps {
    Card: FC<{ data: Wish }>;
    data: Wish[]
    [cardProp: string]: any
}


export const MultiColumnLayout = memo(({
    Card,
    data,
    ...cardProps
} : MultiColumnLayoutProps
) => {
    // STATE //
    const layoutRef = useRef<HTMLDivElement>(null);
    const location = useLocation().pathname;

    const [ items, setItems ] = useState<Wish[]>([]);
    const [ columnsQty, setColumnsQty ] = useState(0);
    const [ itemsRest, setItemsRest ] = useState<Wish[]>([]);
    const [ columnedData, setColumnedData ] = useState<Wish[][]>([]);
    const [ opacity, setOpacity ] = useState(0.5);

    // RESPONSIVENESS //
    const isMobile = findOutMobile();
    const isOneColumn = isMobile && data.length <= 2;
    const isTwoColumns = isMobile && !isOneColumn;

    // STYLES //
    const gap = isMobile ? 2 : 22;
    const layoutMinWidth = isMobile ? undefined : 440;
    const cardMinWidth = 270;
    const defaultMaxWidth = 400;
    const [ maxWidth, setMaxWidth ] = useState<number | undefined>(defaultMaxWidth);

    const containerStyles = {
        display: 'flex',
        flexFlow: 'row nowrap',
        width: '100%',
        minWidth: layoutMinWidth,
        gap: `${ gap }px`,
        padding: isMobile ? `${gap}px ${gap}px 1rem ${gap}px` : '0 0 2rem 0'
    };
    const columnStyles = {
        display: 'flex',
        flexFlow: 'column nowrap',
        width: '100%',
        height: 'fit-content',
        gap: `${ gap }px`,
        maxWidth: maxWidth,
        opacity: opacity,
        transition: 'opacity 0.25s ease-in',
    }
    
    // METHODS //
    const resetState = () => {
        setItems(data);
        setColumnsQty(0);
        setItemsRest([]);
        setColumnedData([]);
        setOpacity(0.5);
    }

    const updateColumnsQty = () => {
        if(isOneColumn) {
            setColumnsQty(1)
        } else if(isTwoColumns) {
            setColumnsQty(2)
        } else {
            const layoutWidth = layoutRef.current?.clientWidth;
            if(layoutWidth) {
                const columnsQtyLimit = Math.floor((layoutWidth + gap + 1) / (cardMinWidth + gap));
                setColumnsQty(Math.min(columnsQtyLimit, items?.length))
            }
        }
    }

    const initColumns = () => {
        let firstCards = [];
        for (let i=0; i<columnsQty; i++) {
            firstCards.push([ items[i] ]);
        }
        setColumnedData(firstCards);
        setItemsRest([...items].slice(columnsQty));
    }

    const pushItemToShortColumn =  () => {
        if(itemsRest?.length === items?.length) return;
        if(!itemsRest?.length) { setOpacity(1); return };

        const columns = layoutRef.current ? [...layoutRef.current.childNodes as unknown as HTMLDivElement[]] : []
        if(!columns?.length) return;
        
        const columnHeights = columns.map(col => col.clientHeight);
        const shortColumnId = columnHeights?.indexOf(Math.min(...columnHeights));
        const result = columnedData?.slice();
        result[ shortColumnId ]?.push(itemsRest[0]);
 
        setColumnedData(result);
        setItemsRest([...itemsRest].slice(1));
    }

    // LIFE CYCLE //
    useEffect(() => {
        resetState();
    },[ location, data ]);

    useEffect(() => {
        updateColumnsQty(); 
        window.addEventListener('resize', updateColumnsQty);
        return () => {
            window.removeEventListener('resize', updateColumnsQty);
            setOpacity(0);
        }
    },[ items ]);

    useEffect(() => {
        columnsQty && !!items?.length && initColumns();
    },[ columnsQty ]);

    useEffect(() => {
        pushItemToShortColumn()
    },[ itemsRest ]);

    useEffect(() => {
        if(items?.length > columnsQty) {
            if(!isMobile) {
                setMaxWidth(undefined)
            }
        } else {
            setMaxWidth(defaultMaxWidth)
        }
    },[ columnedData ]);

    return (
        <div
            style={containerStyles}
            ref={layoutRef}
        >
            { columnedData && !!columnedData?.length && columnedData.map( (column, index) =>
                <div
                    style={columnStyles}
                    key={index}
                    className='column'
                >
                    { column.map( (item, index) =>
                        <Card
                            key={index}
                            data={item}
                            {...cardProps}
                        />
                    )}
                </div>
            )}
        </div>
    );
})
