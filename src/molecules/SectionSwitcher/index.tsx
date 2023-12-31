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

import type { RefObject } from 'react'


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

interface LogoGroupProps extends SectionSwitcherProps {
    firstSectionRef: RefObject<HTMLAnchorElement>;
    secondSectionRef: RefObject<HTMLAnchorElement>;
    isWishesSection: boolean;
    isInvitesSection: boolean
}

interface SectionSwitcherViewProps extends LogoGroupProps {
    firstSectionPath: string;
    firstSectionTitle: string;
    secondSectionPath: string;
    secondSectionTitle: string;
    sectionMaxWidth: number
}


const LogoGroup = ({
    firstSectionRef,
    secondSectionRef,
    isWishesSection,
    isInvitesSection,
    isShort
} : LogoGroupProps
) => {
    // handle click on logo
    const state = useAppSelector(state => state);
    const navigate = useNavigate();
    const handleLogoClick = __DEV_MODE__
        ? async () => {
            // await fetch(__API_URL__ + '/consistency/update')
            console.log(state)
        }
        : () => navigate('/my-wishes/items/actual')

    // slider default styles
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

    // calculate slider active styles depends on text content:
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
    },[ firstElem?.innerHTML, secondElem?.innerHTML ]);

    // assigning styles to sliders according to current section:
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
    },[ isWishesSection, isInvitesSection, firstElem?.innerHTML, secondElem?.innerHTML]);

    return (
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
    )
}


const SectionSwitcherView = ({
    firstSectionRef,
    firstSectionPath,
    firstSectionTitle,
    secondSectionRef,
    secondSectionPath,
    secondSectionTitle,
    sectionMaxWidth,
    isWishesSection,
    isInvitesSection,
    isShort
} : SectionSwitcherViewProps
) => (
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

        <LogoGroup {...{ firstSectionRef, secondSectionRef, isWishesSection, isInvitesSection, isShort }}/>
        
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

export const SectionSwitcher = ({ isShort }: SectionSwitcherProps) => {
    const { section,
            mode,
            isWishesSection,
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
    },[ firstElem?.innerHTML, secondElem?.innerHTML ]);

    // define link paths and titles of sections:
    const lastMode = useAppSelector(state => state.history.anySectionLast.split('/')[2]);
    const myWishesItems = useAppSelector(state => state.history.myWishesSection.itemsModeLast);
    const myWishesLists = useAppSelector(state => state.history.myWishesSection.listsModeLast);
    const myInvitesItems = useAppSelector(state => state.history.myInvitesSection.itemsModeLast);
    const myInvitesLists = useAppSelector(state => state.history.myInvitesSection.listsModeLast);

    const firstSectionPath  = isWishesSection         ? section + '/' + mode
                            : (lastMode === 'items')  ? myWishesItems
                            : (lastMode === 'lists')  ? myWishesLists
                                                      : '/my-wishes/items/actual';
                                                
    const secondSectionPath = isInvitesSection        ? section + '/' + mode
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
            firstSectionPath,
            firstSectionTitle,
            secondSectionRef,
            secondSectionPath,
            secondSectionTitle,
            sectionMaxWidth,
            isWishesSection,
            isInvitesSection,
            isShort
        }}/>
    )
}
