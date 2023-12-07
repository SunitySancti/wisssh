import { useState,
         useEffect,
         useMemo,
         useRef } from 'react'
import { Link,
         useNavigate } from 'react-router-dom'

import './styles.scss'
import { LogoBack,
         LogoIcon,
         Goo } from 'atoms/Icon'

import { useAppSelector } from 'store'
import { getLocationConfig } from 'store/getters'

import { __API_URL__ } from 'environment'
const __DEV_MODE__ = import.meta.env.DEV


interface SliderStyles {
    width: string;
    height: string;
    top: string;
    left?: string;
    right?: string
}

interface SectionSwitcherProps {
    isShort: boolean
}

const slidersDefaultStyles = (side: 'left' | 'right') => {
    let styles: SliderStyles = {
        width: '4rem',
        height: '4rem',
        top: '1rem',
    };
    styles[side] = '1rem';
    return styles
};
const sidePadding = 6;

export const SectionSwitcher = ({ isShort }: SectionSwitcherProps) => {
    // handle click on logo
    const state = useAppSelector(state => state);
    const navigate = useNavigate();
    const handleLogoClick = __DEV_MODE__
        ? async () => {
            // await fetch(__API_URL__ + '/consistency/update')
            console.log(state)
        }
        : () => navigate('/my-wishes/items/actual')

    // take refs of sections:
    const firstSectionRef = useRef<HTMLAnchorElement>(null);
    const secondSectionRef = useRef<HTMLAnchorElement>(null);
    const firstElem = firstSectionRef.current;
    const secondElem = secondSectionRef.current;

    // equalize widths of sections:
    const sectionMaxWidth = useMemo(() => {
        if(!firstElem || !secondElem) return 180;

        const firstSectionWidth  =  firstElem?.offsetWidth;
        const secondSectionWidth = secondElem?.offsetWidth;
        if(!firstSectionWidth || !secondSectionWidth) return 180;

        return firstSectionWidth > secondSectionWidth
             ? firstSectionWidth : secondSectionWidth
    },[ firstElem?.innerHTML, secondElem?.innerHTML ]);

    // actualize current section:
    const { section,
            mode,
            isWishesSection,
            isInvitesSection } = getLocationConfig();

    // calculate slider active styles depends on text content:
    const slidersActiveStyles = useMemo(() => {
        const firstWidth = firstElem?.offsetWidth;
        const secondWidth = secondElem?.offsetWidth;
        return {
            left: firstWidth
                ? {
                    width: firstWidth - (sidePadding * 2) + 'px',
                    height: '8px',
                    left: - (firstWidth + 11 - sidePadding) + 'px',
                    top: '3.5rem',
                }
                : undefined,
            right: secondWidth
                ? {
                    width: secondWidth - (sidePadding * 2) + 'px',
                    height: '8px',
                    right: - (secondWidth + 11 - sidePadding) + 'px',
                    top: '3.5rem',
                }
                : undefined
        }
    },[firstElem?.innerHTML, secondElem?.innerHTML]);

    // assigning styles to sliders according to current section:
    const [leftSliderStyles, setLeftSliderStyles] = useState<SliderStyles | undefined>(slidersDefaultStyles('left'));
    const [rightSliderStyles, setRightSliderStyles] = useState<SliderStyles | undefined>(slidersDefaultStyles('right'));

    useEffect(() => {
        if(section === 'my-wishes') {
            setLeftSliderStyles(slidersActiveStyles.left);
            setRightSliderStyles(slidersDefaultStyles('right'));
        }
        else if(section === 'my-invites') {
            setLeftSliderStyles(slidersDefaultStyles('left'));
            setRightSliderStyles(slidersActiveStyles.right);
        } else {
            setLeftSliderStyles(slidersDefaultStyles('left'));
            setRightSliderStyles(slidersDefaultStyles('right'));
        }
    },[section, firstElem?.innerHTML, secondElem?.innerHTML]);

    // define link paths and titles of sections:
    const lastMode = useAppSelector(state => state.history.anySectionLast.split('/')[2]);
    const myWishesSection = useAppSelector(state => state.history.myWishesSection);
    const myInvitesSection = useAppSelector(state => state.history.myInvitesSection);

    const index = lastMode === 'items' ? 'itemsModeLast'
                : lastMode === 'lists' ? 'listsModeLast'
                : undefined

    let firstSectionPath = index ? myWishesSection[index] : '/my-wishes/items/actual';
    let secondSectionPath = index ? myInvitesSection[index] : '/my-invites/items/reserved';
    const locationCase = section + '/' + mode;
    
    switch(locationCase) {
        case 'my-wishes/items':
            firstSectionPath = '/my-wishes/items/actual'
            break
        case 'my-wishes/lists':
            firstSectionPath = '/my-wishes/lists'
            break
        case 'my-invites/items':
            secondSectionPath = '/my-invites/items/reserved'
            break
        case 'my-invites/lists':
            secondSectionPath = '/my-invites/lists'
    }

    const firstSectionTitle  = (lastMode === 'items') ? 'Мои желания'
                             : (lastMode === 'lists') ? 'Мои вишлисты' : '';
    const secondSectionTitle = (lastMode === 'items') ? 'Желания друзей'
                             : (lastMode === 'lists') ? 'Приглашения' : '';


    return (
        <div className='section-switcher'>
            <div
                className='section-container'
                style={{ width: sectionMaxWidth }}
            >
                <div className='space'/>
                <Link
                    ref={ firstSectionRef }
                    to={ firstSectionPath }
                    className={ 'section my-wishes' + (isWishesSection ? ' active' : '') }
                    children={ firstSectionTitle }
                />
            </div>

            <button
                className='logo-button'
                onClick={ handleLogoClick }
            >
                <div className='sliders-container'>
                    <div
                        className='ss-slider'
                        style={ leftSliderStyles }
                    />
                    <div
                        className='ss-slider'
                        style={ rightSliderStyles }
                    />
                    <LogoBack isShort={ isShort }/>
                    <Goo/>
                </div>
                <LogoIcon isShort={ isShort }/>
                <div className='beta'>Beta</div>
            </button>
            
            <div
                className='section-container'
                style={{ width: sectionMaxWidth }}
            >
                <Link
                    ref={ secondSectionRef }
                    to={ secondSectionPath }
                    className={ 'section my-invites' + (isInvitesSection ? ' active' : '') }
                    children={ secondSectionTitle }
                />
                <div className='space'/>
            </div>
        </div>
    );
}
