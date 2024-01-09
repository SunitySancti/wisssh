import { useState,
         useEffect,
         useRef } from 'react'

import './styles.scss'
import { Button } from 'atoms/Button'

import type { ReactNode,
              RefObject,
              WheelEvent } from 'react'


interface ScrollBoxProps {
    children: ReactNode | ReactNode[]
    shouldDropShadow?: boolean;
}

interface ScrollBoxViewProps extends ScrollBoxProps {
    contentRef: RefObject<HTMLDivElement>;
    scrollPosition: number;
    leftOverflow: boolean;
    rightOverflow: boolean;
    scrollLeft(): void;
    scrollRight(): void;
    scrollByWheel(e: WheelEvent<HTMLDivElement>): void
}


const ScrollBoxView = ({
    children,
    shouldDropShadow,
    contentRef,
    scrollPosition,
    leftOverflow,
    rightOverflow,
    scrollLeft,
    scrollRight,
    scrollByWheel
} : ScrollBoxViewProps
) => (
    <div className='scroll-box'>
        <div  className={ leftOverflow ? 'left field masked' : 'left field' }>

            { (leftOverflow || rightOverflow) && (
                <Button
                    icon='arrowLeft'
                    onClick={ scrollLeft }
                    disabled={ scrollPosition === 0 }
                />
            )}
        </div>
        <div
            ref={ contentRef }
            className={ 'content' + (shouldDropShadow ? ' with-shadow' : '') }
            children={ children }
            onWheel={ scrollByWheel }
        />
        <div
            className={ rightOverflow ? 'right field masked' : 'right field' }
        >
            { (leftOverflow || rightOverflow) &&
                <Button
                    icon='arrowRight'
                    onClick={ scrollRight }
                    disabled={ scrollPosition >= (contentRef.current?.scrollWidth || Infinity) - (contentRef.current?.clientWidth || 0) }
                />
            }
        </div>
    </div>
);


export const ScrollBox = ({
    shouldDropShadow,
    children
}: ScrollBoxProps) => {
    const [scrollPosition, setScrollPosition] = useState(0);
    const [leftOverflow, setLeftOverflow] = useState(false);
    const [rightOverflow, setRightOverflow] = useState(false);

    const contentRef = useRef<HTMLDivElement>(null);
    const scrollStep = 200;

    const detectOverflow = () => {
        const ref = contentRef.current;
        if(ref) {
            setLeftOverflow( scrollPosition > 0 );
            setRightOverflow( scrollPosition < ref.scrollWidth - ref.clientWidth );
        }
    };

    // scrolling by button:
    
    const scrollLeft = () => {
        const ref = contentRef.current;
        if(ref) {
            const newPosition = ref.scrollLeft - scrollStep;
            setScrollPosition( newPosition > 0 ? newPosition : 0 );
        }
    }
    const scrollRight = () => {
        const ref = contentRef.current;
        if(ref) {
            const rightLimit = ref.scrollWidth - ref.clientWidth;
            const newPosition = ref.scrollLeft + scrollStep;
            setScrollPosition( newPosition < rightLimit ? newPosition : rightLimit );
        }
    }

    // scrolling by wheel:

    const scrollByWheel = (e: WheelEvent<HTMLDivElement>) => {
        const ref = contentRef.current;
        if(ref) {
            const rightLimit = ref.scrollWidth - ref.clientWidth;
            const newPosition = ref.scrollLeft + scrollStep * e.deltaY / 100;
            setScrollPosition( newPosition > 0 ? (newPosition < rightLimit ? newPosition : rightLimit) : 0 );
        }
    }

    
    useEffect(() => {
        detectOverflow();
        window.addEventListener('resize', detectOverflow);
        return () => window.removeEventListener('resize', detectOverflow);
    },[]);

    useEffect(() => {
        contentRef.current?.scroll({
            left: scrollPosition,
            behavior: 'smooth'
        });
        detectOverflow();
    },[ scrollPosition ]);


    return (
        <ScrollBoxView {...{
            children,
            shouldDropShadow,
            contentRef,
            scrollPosition,
            leftOverflow,
            rightOverflow,
            scrollLeft,
            scrollRight,
            scrollByWheel
        }}/>
    )
}
