import React from 'react'
import { Outlet } from 'react-router'

import './styles.scss'
import { BreadCrumbs } from 'molecules/BreadCrumbs'
import { ModeToggle } from 'molecules/ModeToggle'
import { ScrollBox } from 'containers/ScrollBox'

export const NavBar = () => {
    const putShadowOnContent = () => {
        const contentWasScrolled = document.querySelector('.work-space').scrollTop;
        const nav = document.querySelector('.navbar .content');
        if(contentWasScrolled) nav.classList.add('with-shadow');
        else nav.classList.remove('with-shadow');
    }
    
    return (
        <>
            <div className='navbar'>
                <ScrollBox>
                    <ModeToggle/>
                    <BreadCrumbs/>
                </ScrollBox>
            </div>
            <div
                className='work-space'
                onScroll={ putShadowOnContent }
                children={ <Outlet/> }
            />
        </>
    );
}