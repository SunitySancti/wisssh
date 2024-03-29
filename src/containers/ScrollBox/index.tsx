import { useState,
         useEffect,
         useRef } from 'react'

import './styles.scss'
import { Button } from 'atoms/Button'

import type { ReactNode,
              WheelEvent } from 'react'


interface ScrollBoxProps {
    children: ReactNode | ReactNode[]
}


export const ScrollBox = ({ children }: ScrollBoxProps) => {
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
        e.preventDefault();
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
    },[scrollPosition]);


    return (
        <div className='scroll-box'>
            <div
                className={ leftOverflow ? 'left field masked' : 'left field' }
            >
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
                className='content'
                children={ children }
                onWheel={ scrollByWheel }
            />
            <div
                className={ rightOverflow ? 'right field masked' : 'right field' }
            >
                { (leftOverflow || rightOverflow) && (
                    <Button
                        icon='arrowRight'
                        onClick={ scrollRight }
                        disabled={ scrollPosition >= (contentRef.current?.scrollWidth || Infinity) - (contentRef.current?.clientWidth || 0) }
                    />
                )}
            </div>
        </div>
    );
}
