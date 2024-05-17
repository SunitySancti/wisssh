import { useEffect,
         useMemo,
         memo,
         useState } from 'react'
import { NavLink,
         Link } from 'react-router-dom'

import './styles.scss'
import { Icon } from 'atoms/Icon'
import { NavbarEllipsis } from 'atoms/Preloaders'
import { WithTooltip } from 'atoms/WithTooltip'
import { WishMenu } from 'molecules/WishStuff'
import { WishlistMenu } from 'molecules/WishlistStuff'

import { getWishlistById,
         getWishById,
         getLoadingStatus,
         getLocationConfig } from 'store/getters'

import type { Wish,
              Wishlist } from 'typings'


interface SliderProps {
    location: string
}

interface TabCoords {
    offsetLeft: number;
    offsetWidth: number
}

interface SliderStyles {
    left?: number;
    width?: number
}

interface LinkOption {
    to: string;
    text: string
}

interface BreadCrumbsProps {
    isMobile?: boolean;
    shouldDropShadow?: boolean;
}

interface BreadCrumbsViewProps {
    wish: Wish | undefined;
    wishlist: Wishlist | undefined;
    awaitingWishes: boolean;
    awaitingUserWishes: boolean;
    awaitingWishlists: boolean;
    isMobile?: boolean;
    shouldDropShadow?: boolean;
}


const Slider = ({ location }: SliderProps) => {
    const sliderPadding = -4;
    const [sliderStyles, setSliderStyles] = useState<SliderStyles | undefined>(undefined);
    const [lastActiveTab, setLastActiveTab] = useState<TabCoords | undefined>(undefined);
    const currentTab = document.querySelector<HTMLAnchorElement>('.nav-elem.option.active');

    const startSliderMove = () => {
        const slider = document.querySelector<HTMLDivElement>('.bc-slider');
        const activeTab = document.querySelector<HTMLSpanElement>('.nav-elem.option.active span');
        if(!slider || !activeTab || !lastActiveTab) return;

        slider.classList.add('animated');
        const lastLeft = lastActiveTab.offsetLeft;
        const lastWidth = lastActiveTab.offsetWidth;
        const nextLeft = activeTab.offsetLeft;
        const nextWidth = activeTab.offsetWidth;
        if(nextLeft === lastLeft && nextWidth === lastWidth) return;

        if(nextLeft > lastLeft) {
            setSliderStyles({
                ...sliderStyles,
                width: (nextLeft - lastLeft) + nextWidth - 2 * sliderPadding
            })
        } else if(nextLeft < lastLeft) {
            setSliderStyles({
                left: nextLeft + sliderPadding,
                width: lastWidth + (lastLeft - nextLeft) - 2 * sliderPadding
            })
        } else return
    }
    
    const finishSliderMove = () => {
        const activeTab = document.querySelector<HTMLSpanElement>('.nav-elem.option.active span');
        if(!activeTab) return;

        setSliderStyles({
            left: activeTab.offsetLeft + sliderPadding,
            width: activeTab.offsetWidth - 2 * sliderPadding
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
}

const BreadCrumbsView = memo(({
    wish,
    wishlist,
    awaitingWishes,
    awaitingUserWishes,
    awaitingWishlists,
    isMobile,
    shouldDropShadow
} : BreadCrumbsViewProps
) => {
    const { location,
            section,
            wishId,
            wishlistId,
            isWishesSection,
            isInvitesSection,
            isItemsMode,
            isListsMode,
            isNewWish,
            isNewWishlist,
            isEditWish,
            isEditWishlist } = getLocationConfig();
    const isListsRoot = location === '/my-wishes/lists' || location === 'my-invites/lists';

    const itemsModeOptions = useMemo(() => {
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
                                key={ index }
                                className='nav-elem option'
                                to={ option.to }
                                children={ <span>{ option.text }</span> }
                                end={ isEditWish }
                            />
                    )}
                    { isEditWish &&
                        <>
                            <div className='nav-elem'>/</div>
                            { awaitingUserWishes
                                ?   <NavbarEllipsis/>
                                :   <NavLink
                                        className='nav-elem option'
                                        to={ location }
                                        children={ wish?.title ? wish.title + ': редактирование' : null }
                                        end
                                    />
                            }
                        </>
                    }
                    { !isMobile && isWishesSection && !(isNewWish || isNewWishlist) &&
                        <WithTooltip
                            trigger={
                                <Link
                                    className='icon-link'
                                    to='/my-wishes/items/new'
                                    children={ <Icon name='plus'/> }
                                />
                            }
                            text='Новое желание'
                        />
                    }
                </>
    },[ location,
        wish?.title
    ]);

    const listsModeOptions = useMemo(() => {
        const Slash = () => <div className='nav-elem'>/</div>;
        const RootCrumb = () => (
            <NavLink
                className='nav-elem option'
                to={ `/${ section }/lists` }
                children={ <span>{ isMobile ? 'Все вишлисты' : 'Вишлисты' }</span> }
                end
            />
        );
        const WishlistCrumb = () => (
            <NavLink
                className='nav-elem option'
                to={ `/${ section }/lists/${ wishlistId }` }
                children={ <span>{ wishlist?.title }</span> }
                end
            />
        );
        const WishCrumb = () => (
            <NavLink
                className='nav-elem option'
                to={ `/${ section }/lists/${ wishlistId }/${ wishId }` }
                children={ <span>{ wish?.title }</span> }
                end
            />
        );
        const EditCrumb = ({ title }: { title: string }) => (
            <NavLink
                className='nav-elem option'
                to={ location }
                children={ <span>{ title + ': редактирование' }</span> }
                end
            />
        );
        const NewWishlistCrumb = () => (
            <NavLink
                className='nav-elem option'
                to='/my-wishes/lists/new'
                children={<span>Новый вишлист</span>}
                end
            />
        );
        const Plus = () => (
            <WithTooltip
                trigger={ <Link
                    className='icon-link'
                    to='/my-wishes/lists/new'
                    children={ <Icon name='plus'/> }
                />}
                text={ isMobile ? 'Новый вишлист' : undefined }
            />
        );
        const Back = () => (
            <Link
                className={ 'icon-link' + (isListsRoot ? ' invisible' : '')}
                to={ location.split('/').slice(0,-1).join('/') }
                children={ <Icon name='back' size={ 66 }/> }
            />
        );
        return <>
            { isMobile && <Back/> }

            <div className='bread-box'>
                <RootCrumb/>
                
                { wishlistId &&
                    <>
                        <Slash/>
                        { awaitingWishlists
                            ? <NavbarEllipsis/>
                            : isEditWishlist
                            ? wishlist?.title && <EditCrumb title={ wishlist.title }/>
                            : wishlist?.title && <WishlistCrumb/>
                        }
                    </>
                }
                
                { wishlist?.title && wishId &&
                    <>
                        <Slash/>
                        { awaitingWishes
                            ? <NavbarEllipsis/>
                            : isEditWish
                            ? wish?.title && <EditCrumb title={ wish.title }/>
                            : wish?.title && <WishCrumb/>
                        }
                    </>
                }

                { (isNewWishlist && !isEditWishlist && !isEditWish)
                    ? <NewWishlistCrumb/>
                    : (!wishlistId && !wishId && isWishesSection && !isMobile) && <Plus/>
                }
            </div>
            
            { isMobile && wishlistId && wishlist && !wishId &&
                <WishlistMenu {...{ wishlist }}/>
            }
            { isMobile && wishlist?.title && wishId && wish &&
                <WishMenu {...{ wish }}/>
            }
        </>
    },[ location,
        wishlistId,
        wishId,
        wishlist?.title,
        wish?.title,
        awaitingWishlists,
        awaitingWishes,
        isMobile,
        isListsRoot
    ]);

    return (
        <div className={ 'bread-crumbs' + (isListsMode ? ' lists' : ' items') + (shouldDropShadow ? ' with-shadow' : '')}>
            <Slider {...{ location }}/>
            {   isItemsMode
                    ?   itemsModeOptions
              : isListsMode
                    ?   listsModeOptions
                    :   null
            }
        </div>
    )
});

export const BreadCrumbs = memo(({
    isMobile,
    shouldDropShadow
} : BreadCrumbsProps
) => {
    const { wishId,
            wishlistId } = getLocationConfig()

    const   wish = getWishById(wishId);
    const   wishlist = getWishlistById(wishlistId);
    const { awaitingUserWishes,
            awaitingWishes,
            awaitingWishlists } = getLoadingStatus();

    return (
        <BreadCrumbsView {...{
            wishlistTitle: wishlist?.title,
            wish,
            wishlist,
            awaitingWishes,
            awaitingUserWishes,
            awaitingWishlists,
            isMobile,
            shouldDropShadow
        }}/>
    )
});
