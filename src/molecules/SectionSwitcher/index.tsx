import { useState,
         useEffect,
         memo,
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

import type { RefObject } from 'react'


interface SliderStyles {
    width: string;
    height: string;
    top: string;
    left?: string;
    right?: string
}

interface LogoGroupProps {
    firstSectionRef: RefObject<HTMLAnchorElement>;
    secondSectionRef: RefObject<HTMLAnchorElement>
}

interface SectionSwitcherViewProps extends LogoGroupProps {
    firstSectionPath: string;
    secondSectionPath: string;
    firstSectionTitle: string;
    secondSectionTitle: string;
    sectionMaxWidth: number
}


const LogoGroup = ({
    firstSectionRef,
    secondSectionRef
} : LogoGroupProps
) => {
    const navigate = useNavigate();
    const { isWishesSection,
            isInvitesSection,
            isItemsMode } = getLocationConfig();

    // SLIDER DEFAULT STYLES //
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

    // SLIDER ACTIVE STYLES //
    const firstElem = firstSectionRef.current;
    const secondElem = secondSectionRef.current;

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
    },[ firstElem?.innerHTML,
        secondElem?.innerHTML,
        isWishesSection,
        isInvitesSection,
        isItemsMode
    ]);

    // SLIDER DYNAMIC STYLING //
    const [leftSliderStyles, setLeftSliderStyles] = useState<SliderStyles | undefined>(slidersDefaultStyles('left'));
    const [rightSliderStyles, setRightSliderStyles] = useState<SliderStyles | undefined>(slidersDefaultStyles('right'));

    useEffect(() => {
        if(isWishesSection) {
            setLeftSliderStyles(slidersActiveStyles.left);
            setRightSliderStyles(slidersDefaultStyles('right'));
        }
        else if(isInvitesSection) {
            setLeftSliderStyles(slidersDefaultStyles('left'));
            setRightSliderStyles(slidersActiveStyles.right);
        } else {
            setLeftSliderStyles(slidersDefaultStyles('left'));
            setRightSliderStyles(slidersDefaultStyles('right'));
        }
    },[ isWishesSection,
        isInvitesSection,
        isItemsMode,
        firstElem?.innerHTML,
        secondElem?.innerHTML
    ]);

    // SETTING SHORT OR FULL LOGO //
    const breakpoint = 1000;
    const [ isShort, setIsShort ] = useState(false);
    function checkWidth() {
        setIsShort(window.innerWidth < breakpoint)
    };
    useEffect(() => {
        checkWidth();
        window.addEventListener('resize', checkWidth);
        return () => {
            window.removeEventListener('resize', checkWidth);
        }
    },[]);

    return (
        <button
            className='logo-button'
            onClick={ () => navigate('/my-wishes/items/actual') }
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
                <LogoBack {...{ isShort }}/>
                <Goo/>
            </div>
            <LogoIcon {...{ isShort }}/>
            <div className='beta'>Beta</div>
        </button>
    )
}


const SectionSwitcherView = ({
    firstSectionRef,
    secondSectionRef,
    firstSectionPath,
    secondSectionPath,
    firstSectionTitle,
    secondSectionTitle,
    sectionMaxWidth
} : SectionSwitcherViewProps
) => {
    const { isWishesSection,
            isInvitesSection } = getLocationConfig();
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

            <LogoGroup {...{ firstSectionRef, secondSectionRef }}/>
            
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
    )
};

export const SectionSwitcher = memo(() => {
    const { isWishesSection,
            isItemsMode,
            isInvitesSection } = getLocationConfig();
            
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
    },[ firstElem?.innerHTML,
        secondElem?.innerHTML
    ]);

    // define link paths and titles of sections:
    const lastMode = useAppSelector(state => state.history.anySectionLast.split('/')[2]);
    const myWishesItems = useAppSelector(state => state.history.myWishesSection.itemsModeLast);
    const myWishesLists = useAppSelector(state => state.history.myWishesSection.listsModeLast);
    const myInvitesItems = useAppSelector(state => state.history.myInvitesSection.itemsModeLast);
    const myInvitesLists = useAppSelector(state => state.history.myInvitesSection.listsModeLast);

    const firstSectionPath  = isWishesSection         ? (isItemsMode ? '/my-wishes/items/actual' : '/my-wishes/lists')
                            : (lastMode === 'items')  ? myWishesItems
                            : (lastMode === 'lists')  ? myWishesLists
                                                      : '/my-wishes/items/actual';
                                                
    const secondSectionPath = isInvitesSection        ? (isItemsMode ? '/my-invites/items/reserved' : '/my-invites/lists')
                            : (lastMode === 'items')  ? myInvitesItems
                            : (lastMode === 'lists')  ? myInvitesLists
                                                      : '/my-invites/items/reserved';

    const firstSectionTitle  = (lastMode === 'items') ? 'Мои желания'
                             : (lastMode === 'lists') ? 'Мои вишлисты' : '';
    const secondSectionTitle = (lastMode === 'items') ? 'Желания друзей'
                             : (lastMode === 'lists') ? 'Приглашения' : '';
              
    return (
        <SectionSwitcherView {...{
            firstSectionRef,
            secondSectionRef,
            firstSectionPath,
            secondSectionPath,
            firstSectionTitle,
            secondSectionTitle,
            sectionMaxWidth
        }}/>
    )
})
