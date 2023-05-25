import React, { useState, useEffect, useRef } from 'react'

import './styles.scss'
import { Button } from 'atoms/Button'

export const ScrollBox = ({ children }) => {
    const [scrollPosition, setScrollPosition] = useState(0);
    const [leftOverflow, setLeftOverflow] = useState(false);
    const [rightOverflow, setRightOverflow] = useState(false);

    const contentRef = useRef(null);
    const scrollStep = 200;

    const detectOverflow = () => {
        setLeftOverflow( scrollPosition > 0 );
        setRightOverflow( scrollPosition < contentRef.current?.scrollWidth - contentRef.current?.clientWidth );
    };

    // scrolling by button:
    
    const scrollLeft = () => {
        let newPosition = contentRef.current?.scrollLeft - scrollStep;
        if (newPosition < 0) { newPosition = 0 }
        setScrollPosition( newPosition );
    }
    const scrollRight = () => {
        const rightLimit = contentRef.current?.scrollWidth - contentRef.current?.clientWidth;
        let newPosition = contentRef.current?.scrollLeft + scrollStep;
        if (newPosition > rightLimit) { newPosition = rightLimit }
        setScrollPosition( newPosition );
    }

    // scrolling by wheel:

    const scrollByWheel = (e) => {
        e.preventDefault();
        const rightLimit = contentRef.current?.scrollWidth - contentRef.current?.clientWidth;
        let newPosition = contentRef.current?.scrollLeft + scrollStep * e.deltaY / 100;
        if (newPosition < 0) newPosition = 0;
        if (newPosition > rightLimit) newPosition = rightLimit;
        setScrollPosition( newPosition );
    }

    
    useEffect(() => {
        detectOverflow();
        window.addEventListener('resize', detectOverflow);
        return () => window.removeEventListener('resize', detectOverflow);
    },[])
    
    useEffect(() => {
        contentRef.current?.addEventListener('wheel', scrollByWheel);
        return (() => {
            contentRef.current?.removeEventListener('wheel', scrollByWheel);
        })
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
            />
            <div
                className={ rightOverflow ? 'right field masked' : 'right field' }
            >
                { (leftOverflow || rightOverflow) && (
                    <Button
                        icon='arrowRight'
                        onClick={ scrollRight }
                        disabled={ scrollPosition >= contentRef.current?.scrollWidth - contentRef.current?.clientWidth }
                    />
                )}
            </div>
        </div>
    );
}