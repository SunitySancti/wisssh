import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router'

import './styles.scss'
import { SectionSwitcher } from 'molecules/SectionSwitcher'
import { CreationGroup } from 'molecules/CreationGroup'
import { UserGroup } from 'molecules/UserGroup'


export const AppHeader = ({ onLogoClick }) => {
    const breakpointWidth = 1000;
    const [isShort, setIsShort] = useState(false);
    const checkWidth = () => setIsShort(window.innerWidth < breakpointWidth);

    const scrollStep = 200;
    const scrollContainer = document.querySelector('.scroll-container');
    const handleScroll = (e) => {
        e.preventDefault();
        const step = scrollContainer?.scrollLeft + scrollStep * e.deltaY / 100;
        scrollContainer?.scroll({
            left: step,
            behavior: 'auto'
        });
    }

    useEffect(() => {
        checkWidth();
        window.addEventListener('resize', checkWidth);
        scrollContainer?.addEventListener('wheel', handleScroll);
        return () => {
            window.removeEventListener('resize', checkWidth);
            scrollContainer?.addEventListener('wheel', handleScroll);
        }
    },[]);


    return (
        <div className='app-layout'>
            <div className='scroll-container'>
                <div className='app-header'>
                    <CreationGroup isShort={isShort} />
                    <SectionSwitcher isShort={isShort} onLogoClick={ onLogoClick }/>
                    <UserGroup isShort={isShort}/>
                </div>
            </div>
            
            <Outlet/>
        </div>
    );
}