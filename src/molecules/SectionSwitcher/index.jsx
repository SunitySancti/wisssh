import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

import './styles.scss'
import { LogoBack, LogoIcon, Goo } from 'atoms/Icon'

const slidersDefaultStyles = (side) => {
    let common = {
        width: '4rem',
        height: '4rem',
        top: '1rem',
    };
    common[side] = '1rem';
    return common
};
const sidePadding = 6;

export const SectionSwitcher = ({ isShort, onLogoClick }) => {
    // take refs of sections:
    const firstSectionRef = useRef(null);
    const secondSectionRef = useRef(null);
    const firstElem = firstSectionRef.current;
    const secondElem = secondSectionRef.current;

    // actualize current section:
    const location = useLocation().pathname;
    const currentSection = location.split('/').at(1);
    const isMyWishes = currentSection === 'my-wishes';
    const isMyInvites = currentSection === 'my-invites';

    // calculate slider active styles depends on text content:
    
    const slidersActiveStyles = useMemo(() => {
        const firstWidth = firstElem?.offsetWidth;
        const secondWidth = secondElem?.offsetWidth;
        return {
            left: {
                width: firstWidth - (sidePadding * 2) + 'px',
                height: '8px',
                left: - (firstWidth + 11 - sidePadding) + 'px',
                top: '3.5rem',
            },
            right: {
                width: secondWidth - (sidePadding * 2) + 'px',
                height: '8px',
                right: - (secondWidth + 11 - sidePadding) + 'px',
                top: '3.5rem',
            }
        }
    },[firstElem?.innerHTML, secondElem?.innerHTML]);

    // assigning styles to sliders depending on current section:

    const [leftSliderStyles, setLeftSliderStyles] = useState(slidersDefaultStyles('left'));
    const [rightSliderStyles, setRightSliderStyles] = useState(slidersDefaultStyles('right'));

    useEffect(() => {
        if(currentSection === 'my-wishes') {
            setLeftSliderStyles(slidersActiveStyles.left);
            setRightSliderStyles(slidersDefaultStyles('right'));
        }
        else if(currentSection === 'my-invites') {
            setLeftSliderStyles(slidersDefaultStyles('left'));
            setRightSliderStyles(slidersActiveStyles.right);
        } else {
            setLeftSliderStyles(slidersDefaultStyles('left'));
            setRightSliderStyles(slidersDefaultStyles('right'));
        }
    },[currentSection, firstElem?.innerHTML, secondElem?.innerHTML]);

    // define link paths and titles of sections:

    const lastMode = useSelector(state => state.history.anySectionLast?.split('/').at(2));
    const myWishesSection = useSelector(state => state.history.myWishesSection);
    const myInvitesSection = useSelector(state => state.history.myInvitesSection);

    const firstSectionPath  =  myWishesSection[`${lastMode}ModeLast`] || '';
    const secondSectionPath =  myInvitesSection[`${lastMode}ModeLast`] || '';

    const firstSectionTitle  = (lastMode === 'items') ? 'Мои желания'
                             : (lastMode === 'lists') ? 'Мои вишлисты' : '';
    const secondSectionTitle = (lastMode === 'items') ? 'Желания друзей'
                             : (lastMode === 'lists') ? 'Вишлисты друзей' : '';

    return (
        <div>
            <Link
                ref={firstSectionRef}
                to={firstSectionPath}
                className={isMyWishes ? 'section my-wishes active' : 'section my-wishes'}
                children={firstSectionTitle}
            />

            <button
                className='logo-button'
                onClick={ onLogoClick }
            >
                <div className='sliders-container'>
                    <div
                        className='ss-slider'
                        style={leftSliderStyles}
                    />
                    <div
                        className='ss-slider'
                        style={rightSliderStyles}
                    />
                    <LogoBack isShort={isShort}/>
                    <Goo/>
                </div>
                <LogoIcon isShort={isShort}/>
            </button>
            
            <Link
                ref={secondSectionRef}
                to={ secondSectionPath }
                className={isMyInvites ? 'section my-invites active' : 'section my-invites'}
                children={secondSectionTitle}
            />
        </div>
    )
}