import { useEffect,
         memo,
         useState, 
         useRef, 
         useCallback } from 'react'
import { NavLink,
         Link } from 'react-router-dom'

import './styles.scss'
import { Icon } from 'atoms/Icon'
import { Button } from 'atoms/Button'
import { NavbarEllipsis } from 'atoms/Preloaders'
import { WithTooltip } from 'atoms/WithTooltip'
import { WishMenu } from 'molecules/WishStuff'
import { WishlistMenu } from 'molecules/WishlistStuff'

import { getCurrentUser,
         getWishlistById,
         getWishById,
         getLoadingStatus,
         getLocationConfig } from 'store/getters'
import { useOverflowDetector } from 'hooks/useOverflowDetector'

import type { Wish,
              Wishlist } from 'typings'
import type { WithSubmitRef } from 'organisms/NavBarLayout'
import type { ReactNode } from 'react'

const __DEV_MODE__ = import.meta.env.DEV


interface SliderProps {
    location: string;
    currentTab: HTMLAnchorElement;
}

interface TabCoords {
    offsetLeft: number;
    offsetWidth: number
}

interface SliderStyles {
    left?: number;
    width?: number;
    display?: string
}

interface LinkOption {
    to: string;
    text: string
}

interface CrumbProps {
    to: string;
    children: ReactNode;
    isMobile: boolean;
}

interface EditCrumbProps {
    location: string;
    title?: string;
    isMobile: boolean;
}

interface PlusProps {
    isMobile: boolean;
    isWishCreating?: boolean
}

interface BreadCrumbsProps extends WithSubmitRef {
    isMobile: boolean;
    shouldDropShadow?: boolean;
    isAbleToSumbit: boolean
}

interface TabsProps {
    wishTitle?: string;
    isMobile: boolean;
}

interface CrumbsProps {
    awaitingWishlists: boolean;
    awaitingWishes: boolean;
    isMobile: boolean;
    wishlist?: Wishlist;
    wish?: Wish;
    leftOverflow?: boolean;
    rightOverflow?: boolean;
    userName?: string;
}


const Slider = memo(({ location, currentTab }: SliderProps) => {
    const sliderPadding = 0;
    const [sliderStyles, setSliderStyles] = useState<SliderStyles | undefined>(undefined);
    const [lastActiveTab, setLastActiveTab] = useState<TabCoords | undefined>(undefined);

    const startSliderMove = () => {
        const slider = document.querySelector<HTMLDivElement>('.bc-slider');
        const activeTab = document.querySelector<HTMLSpanElement>('.nav-elem.option.active span');
        if(!slider || !activeTab || !lastActiveTab) {
            setSliderStyles({ display: 'none' })
            return
        };

        slider.classList.add('animated');
        const lastLeft = lastActiveTab.offsetLeft;
        const lastWidth = lastActiveTab.offsetWidth;
        const nextLeft = activeTab.offsetLeft;
        const nextWidth = activeTab.offsetWidth;
        if(nextLeft === lastLeft && nextWidth === lastWidth) return;

        if(nextLeft > lastLeft) {
            setSliderStyles({
                ...sliderStyles,
                display: 'block',
                width: (nextLeft - lastLeft) + nextWidth - 2 * sliderPadding
            })
        } else if(nextLeft < lastLeft) {
            setSliderStyles({
                display: 'block',
                left: nextLeft + sliderPadding,
                width: lastWidth + (lastLeft - nextLeft) - 2 * sliderPadding
            })
        } else return
    }
    
    const finishSliderMove = () => {
        const activeTab = document.querySelector<HTMLSpanElement>('.nav-elem.option.active span');
        const container = document.querySelector<HTMLAnchorElement>('.nav-elem.option.active');
        if(!activeTab) return;

        setSliderStyles({
            display: 'block',
            left: activeTab.offsetLeft + sliderPadding,
            width: container?.offsetWidth
                ? Math.min(activeTab.offsetWidth, container.offsetWidth) - 2 * sliderPadding
                : activeTab.offsetWidth - 2 * sliderPadding
        });
        setLastActiveTab({
            offsetLeft: activeTab.offsetLeft,
            offsetWidth: activeTab.offsetWidth
        });
        setTimeout(() => {
            document.querySelector<HTMLDivElement>('.bc-slider')?.classList.remove('animated')
        }, 300);
    }

    useEffect(() => {
        startSliderMove();
        setTimeout(finishSliderMove, 300);
    },[ location, currentTab?.innerHTML ]);

    return <div className='bc-slider' style={ sliderStyles }/>
});

const ScrollContainer = ({ children }: { children: ReactNode }) => {
    const ref = useRef(null);
    const [leftOverflow, rightOverflow] = useOverflowDetector(ref);

    return <>
        <div className={ 'left overflow-mask' + (leftOverflow ? '' : ' hidden')}/>
            <div {...{
                ref,
                style: {
                    margin: '0 1px',
                    overflow: 'scroll'
                }
            }}>
                { children }
            </div>
        <div style={{

        }}/>
        <div className={ 'right overflow-mask' + (rightOverflow ? '' : ' hidden')}/>
    </>
}

const Crumb = ({ to, children, isMobile }: CrumbProps) => (
    <NavLink
        className='nav-elem option'
        end
        {...{ to }}
    >
        { isMobile 
            ? <ScrollContainer {...{ children }}/>
            : children
        }
    </NavLink>
);

const EditCrumb = memo(({ title, location, isMobile }: EditCrumbProps) => {
    return title
        ?   <Crumb
                to={ location }
                children={ <span>{ 'Редактирование: ' + title }</span> }
                isMobile={ isMobile }
            />
        : null
});

const Plus = memo(({ isWishCreating, isMobile }: PlusProps) => {
    const element = (
        <Link
            className={ 'icon-link right'}
            to={ `/my-wishes/${ isWishCreating ? 'items' : 'lists' }/new` }
            children={ <Icon name='plus'/> }
        />
    );
    return isMobile
        ? element
        : <WithTooltip
            trigger={ element }
            text={ isWishCreating ? 'Новое желание' : 'Новый вишлист' }
        />
});


const Tabs = memo(({
    isMobile,
    wishTitle
} : TabsProps
) => {
    const { location,
            wishId,
            isWishesSection,
            isInvitesSection,
            isNewWish,
            isNewWishlist,
            isEditWish } = getLocationConfig();

    const options: LinkOption[] = [];

    if(isWishesSection) {
        options.push({
            to: '/my-wishes/items/actual',
            text: 'Актуальные'
        }, {
            to: '/my-wishes/items/completed',
            text: 'Исполненные'
        }, {
            to: '/my-wishes/items/all',
            text: 'Все'
        });

        if(isNewWish) {
            options.push({
                to: `/my-wishes/items/new`,
                text: 'Новое желание'
            })
        }
    } else if(isInvitesSection) {
        options.push({
            to: '/my-invites/items/reserved',
            text: isMobile ? 'Исполняется' : 'Зарезервировано мной'
        }, {
            to: '/my-invites/items/completed',
            text: 'Подарено'
        }, {
            to: '/my-invites/items/all',
            text: 'Все'
        });
    }
    return  <>
        { options.map((option, index) =>
            <NavLink
                key={ 'tab' + index }
                className='nav-elem option'
                to={ option.to }
                children={ <span>{ option.text }</span> }
                end={ isEditWish }
            />
        )}
        
        { isWishesSection && !(isNewWish || isNewWishlist) &&
            <Plus isWishCreating {...{ isMobile }}/>
        }
    
        { wishId && isEditWish &&
            <EditCrumb {...{ location, title: wishTitle, isMobile }}/>
        }
    </>
});

const Crumbs = memo(({
    isMobile,
    awaitingWishlists,
    awaitingWishes,
    wishlist,
    wish,
    userName
} : CrumbsProps
) => {
    const { location,
            section,
            wishId,
            wishlistId,
            isWishesSection,
            isNewWish,
            isNewWishlist,
            isEditWish,
            isEditWishlist,
            isProfileSection } = getLocationConfig();

    const Slash = memo(() => <div className='nav-elem'>/</div>);
    
    const RootCrumb = memo(() => (
        <Crumb
            to={ `/${ section }/lists` }
            children={ <span>{ section === 'my-invites' ? 'Все приглашения' : 'Все вишлисты' }</span> }
            isMobile={ isMobile }
        />
    ));
    
    const WishlistCrumb = memo(() => (
        <Crumb to={ `/${ section }/lists/${ wishlistId }` } isMobile={ isMobile }>
            <span>{ wishlist?.title }</span>
        </Crumb>
    ));
    
    const WishCrumb = memo(() => (
        <Crumb to={ location } isMobile={ isMobile }>
            <span>{ wish?.title }</span>
        </Crumb>
    ));

    const NewWishCrumb = memo(() => (
        <Crumb
            to={ location }
            children={ <span>Новое желание</span> }
            isMobile={ isMobile }
        />
    ));

    const NewWishlistCrumb = memo(() => <>
        { !isMobile && <Slash/> }
        <Crumb
            to='/my-wishes/lists/new'
            children={ <span>Новый вишлист</span> }
            isMobile={ isMobile }
        />
    </>);

    const ProfileCrumb = memo(({ userName }: { userName?: string }) => <>
        <Crumb
            to='/profile'
            children={ <span>Профиль пользователя <b>{ userName || '' }</b></span> }
            isMobile={ isMobile }
        />
    </>)
    
    return isProfileSection
        ? <ProfileCrumb {...{ userName }}/>
        : <>
            <RootCrumb/>
            
            { wishlistId && // We're in a /lists/ mode and on a whether <WishlistPage> or <SingleWishPage>
                <>
                    <Slash/>
                    { awaitingWishlists
                        ? <NavbarEllipsis/>
                    : isEditWishlist
                        ? <EditCrumb {...{ location, title: wishlist?.title, isMobile }}/>
                        : <WishlistCrumb/>
                    }
                </>
            }
            
            { wishlistId && wishId && // We're still in a /lists/ mode and on a <SingleWishPage>
                <>
                    <Slash/>
                    { awaitingWishes
                        ? <NavbarEllipsis/>
                        : isEditWish
                        ? <EditCrumb {...{ location, title: wish?.title, isMobile }}/>
                        : <WishCrumb/>
                    }
                </>
            }

            { !wishlistId && wishId && // We're in /items/ mode now. In mobile version of Wish page and Wish edit page
                    <>
                        <Slash/>
                        { awaitingWishes
                            ? <NavbarEllipsis/>
                        : isEditWish
                            ? <EditCrumb {...{ location, title: wish?.title, isMobile }}/>
                            : <WishCrumb/>
                        }
                    </>
                }

            { isNewWish
                ? <>
                    { wishlistId && <Slash/> }
                    <NewWishCrumb/>
                  </>
            : isNewWishlist
                ? <NewWishlistCrumb/>
            : !wishlistId && !wishId && isWishesSection && !isMobile &&
                  <Plus isMobile={ isMobile }/>
            }
    </>
});


export const BreadCrumbs = memo(({
    isMobile,
    shouldDropShadow,
    submitRef,
    isAbleToSumbit
} : BreadCrumbsProps
) => {
    const { location,
            isListsMode,
            isItemsMode,
            wishId,
            wishlistId,
            isNewWish,
            isNewWishlist,
            isEditWish,
            isEditWishlist,
            isProfileSection } = getLocationConfig()

    const   wish = getWishById(wishId);
    const   wishlist = getWishlistById(wishlistId);
    const { awaitingWishes,
            awaitingWishlists } = getLoadingStatus();
    const { user } = getCurrentUser();

    const isCrumbs = isListsMode || isProfileSection || isMobile && (wishId || isNewWish || isProfileSection);

    const Back = memo(() => {
        const isRoot = location === '/my-wishes/lists' || location === '/my-invites/lists' || isProfileSection;
        return <Link
            className={ 'icon-link' + (isRoot ? ' invisible' : '')}
            to={ location.split('/').slice(0,-1).join('/') }
            children={ <Icon name='back' size={ 66 }/> }
        />
    });

    const handleSubmit = useCallback(() => {
        if((isNewWish || isEditWish) && submitRef.current?.submitWish) {
            submitRef.current.submitWish()
        } else if((isNewWishlist || isEditWishlist) && submitRef.current?.submitWishlist) {
            submitRef.current.submitWishlist()
        } else if(isProfileSection && submitRef.current?.submitProfile){
            submitRef.current.submitProfile()
        } else if(__DEV_MODE__) {
            console.log('missed submit function')
        }
    },[ isNewWish,
        isEditWish,
        isNewWishlist,
        isEditWishlist,
        isProfileSection
    ]);

    const currentTab = document.querySelector<HTMLAnchorElement>('.nav-elem.option.active');

    return (
        <div className={ 'bread-crumbs ' + (isCrumbs ? 'crumbs' : 'tabs') + (shouldDropShadow ? ' with-shadow' : '')}>
            
            { isMobile && isCrumbs && <Back/> }

            <div className='bread-box'>
                { currentTab &&
                    <Slider {...{ location, currentTab }}/>
                }
                { isCrumbs // true in /lists/ mode and in mobile version of wish pages and wish edit pages
                    ? <Crumbs {...{
                        isMobile,
                        awaitingWishlists,
                        awaitingWishes,
                        wishlist,
                        wish,
                        userName: user ? '@' + user.name : '',
                    }}/>
                    : <Tabs {...{
                        isMobile,
                        wishTitle: wish?.title
                    }}/>
                }
            </div>
            
            { isMobile && wishlistId && wishlist && !wishId &&
                <>{ !isEditWishlist &&
                        <WishlistMenu {...{ wishlist }}/>
                }</>
            }
            { isMobile && (isItemsMode || wishlist) && wish &&
                <>{ !isEditWish &&
                        <WishMenu {...{ wish }}/>
                }</>
            }
            { isMobile && (location === '/my-wishes/lists') &&
                <Plus isMobile/>
            }
            { isMobile && (isNewWish || isEditWish || isNewWishlist || isEditWishlist || isProfileSection) &&
                <Button
                    onClick={ handleSubmit }
                    disabled={ !isAbleToSumbit }
                    icon='save'
                    size={ 6 }
                />
            }
        </div>
    )
});
