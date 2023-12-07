import { useEffect,
         useMemo,
         useState } from 'react'
import { NavLink,
         Link } from 'react-router-dom'

import './styles.scss'
import { Icon } from 'atoms/Icon'
import { NavbarEllipsis } from 'atoms/Preloaders'
import { WithTooltip } from 'atoms/WithTooltip'

import { getUserWishes,
         getFriendWishes,
         getWishlistById,
         getWishById,
         getLoadingStatus,
         getLocationConfig } from 'store/getters'


interface LinkOption {
    to: string;
    text: string
}

interface TabCoords {
    offsetLeft: number;
    offsetWidth: number
}

interface SliderStyles {
    left?: number;
    width?: number
}


export const BreadCrumbs = () => {
    // LINKS DEFINITION //
    
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
            isEditWishlist } = getLocationConfig()

    const wish = getWishById(wishId);
    const wishlist = getWishlistById(wishlistId);
    const { userWishes } = getUserWishes();
    const { friendWishes } = getFriendWishes();
    const { awaitingUserWishes,
            awaitingWishes,
            awaitingWishlists } = getLoadingStatus();

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
                text: userWishes.length
                    ? `Все (${userWishes.length})`
                    : 'Все'
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
                text: 'Зарезервировано мной'
            }, {
                to: '/my-invites/items/completed',
                text: 'Подарено'
            }, {
                to: '/my-invites/items/all',
                text: friendWishes.length
                    ? `Все (${friendWishes.length})`
                    : 'Все'
            });
        }
        return  <>
                    { options.map((option, index) =>
                            <NavLink
                                key={ index }
                                className='nav-elem option'
                                to={ option.to }
                                children={ option.text }
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
                                        children={ wish ? wish.title + ': редактирование' : null }
                                        end
                                    />
                            }
                        </>
                    }
                    { isWishesSection && !(isNewWish || isNewWishlist) &&
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
        wish?.title,
        userWishes.length,
        friendWishes.length
    ]);

    const listsModeOptions = useMemo(() => {        
        return <>
            <NavLink
                className='nav-elem option'
                to={ `/${ section }/lists` }
                children={ 'Вишлисты' }
                end
            />

            { wishlistId &&
                <>
                    <div className='nav-elem'>/</div>
                    { awaitingWishlists
                        ?   <NavbarEllipsis/>
                        : isEditWishlist
                        ? !!wishlist &&
                            <NavLink
                                className='nav-elem option'
                                to={ location }
                                children={ wishlist.title + ': редактирование' }
                                end
                            />
                        : !!wishlist &&
                            <NavLink
                                className='nav-elem option'
                                to={ `/${ section }/lists/${ wishlistId }` }
                                children={ wishlist.title || 'Безымянный вишлист' }
                                end
                            />
                    }
                </>
            }
            
            { wishlist?.title && wishId &&
                <>
                    <div className='nav-elem'>/</div>
                    { awaitingWishes
                    ?   <NavbarEllipsis/>
                    : isEditWish
                    ? !!wish &&
                        <NavLink
                            className='nav-elem option'
                            to={ location }
                            children={ wish.title + ': редактирование' }
                            end
                        />
                    : !!wish &&
                        <NavLink
                            className='nav-elem option'
                            to={ `/${ section }/lists/${ wishlistId }/${ wishId }` }
                            children={ wish.title || 'Безымянное желание' }
                            end
                        />
                    }
                </>
            }

            { (isNewWishlist && !isEditWishlist && !isEditWish)
            ?   <NavLink
                    className='nav-elem option'
                    to='/my-wishes/lists/new'
                    children='Новый вишлист'
                    end
                />
            : !wishlistId && !wishId && section === 'my-wishes' &&
                <WithTooltip
                    trigger={
                        <Link
                            className='icon-link'
                            to='/my-wishes/lists/new'
                            children={ <Icon name='plus'/> }
                        />
                    }
                    text='Новый вишлист'
                />
            }
        </>
    },[ location,
        wishlistId,
        wishId,
        wishlist?.title,
        wish?.title,
        awaitingWishlists,
        awaitingWishes
    ]);
    

    // SLIDER ANIMATION //

    const sliderPadding = 19;

    const [sliderStyles, setSliderStyles] = useState<SliderStyles | undefined>(undefined);
    const [lastActiveTab, setLastActiveTab] = useState<TabCoords | undefined>(undefined);
    const currentTab = document.querySelector<HTMLAnchorElement>('.nav-elem.option.active');

    const startSliderMove = () => {
        const slider = document.querySelector<HTMLDivElement>('.bc-slider');
        const activeTab = document.querySelector<HTMLAnchorElement>('.nav-elem.option.active');
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
        const activeTab = document.querySelector<HTMLAnchorElement>('.nav-elem.option.active');
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
            document.querySelector('.bc-slider')?.classList.remove('animated')
        }, 300);
    }

    useEffect(() => {
        startSliderMove();
        setTimeout(finishSliderMove, 300);
    },[ location, currentTab?.innerHTML, userWishes?.length, friendWishes?.length ]);

    return (
        <div className='bread-crumbs'>
            <div
                className='bc-slider'
                style={ sliderStyles }
            />
            {   isItemsMode
                    ?   itemsModeOptions
              : isListsMode
                    ?   listsModeOptions
                    :   null
            }
        </div>
    );
}
