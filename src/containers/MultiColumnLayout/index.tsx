import { useEffect,
         useState,
         useRef } from 'react'
import { useLocation } from 'react-router'

import type { FC } from 'react'
import type { Wish } from 'typings'


interface MultiColumnLayoutProps {
    Card: FC<{ data: Wish }>;
    data: Wish[]
    [cardProp: string]: any
}


export const MultiColumnLayout = ({
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

    // STYLES //
    const gap = 22;
    const minWidth = 270;
    const defaultMaxWidth = 400;
    const [ maxWidth, setMaxWidth ] = useState<number | undefined>(defaultMaxWidth);

    const containerStyles = {
        display: 'flex',
        flexFlow: 'row nowrap',
        width: '100%',
        gap: `${ gap }px`,
        paddingBottom: '1rem'
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
        const layoutWidth = layoutRef.current?.clientWidth;
        if(layoutWidth) {
            const columnsQtyLimit = Math.floor((layoutWidth - 2 * gap) / (minWidth + gap));
            setColumnsQty(Math.min(columnsQtyLimit, items?.length));
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
            setMaxWidth(undefined)
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
}
