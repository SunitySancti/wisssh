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

import { getWishlistById,
         getWishById,
         getLoadingStatus,
         getLocationConfig } from 'store/getters'


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

interface BreadCrumbsViewProps {
    wishTitle: string | undefined;
    wishlistTitle: string | undefined;
    awaitingWishes: boolean;
    awaitingUserWishes: boolean;
    awaitingWishlists: boolean
}

const Slider = ({ location }: SliderProps) => {
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
    wishTitle,
    wishlistTitle,
    awaitingWishes,
    awaitingUserWishes,
    awaitingWishlists
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
                text: 'Зарезервировано мной'
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
                                        children={ wishTitle ? wishTitle + ': редактирование' : null }
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
        wishTitle
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
                        ? wishlistTitle &&
                            <NavLink
                                className='nav-elem option'
                                to={ location }
                                children={ wishlistTitle + ': редактирование' }
                                end
                            />
                        : wishlistTitle &&
                            <NavLink
                                className='nav-elem option'
                                to={ `/${ section }/lists/${ wishlistId }` }
                                children={ wishlistTitle }
                                end
                            />
                    }
                </>
            }
            
            { wishlistTitle && wishId &&
                <>
                    <div className='nav-elem'>/</div>
                    { awaitingWishes
                    ?   <NavbarEllipsis/>
                    : isEditWish
                    ? wishTitle &&
                        <NavLink
                            className='nav-elem option'
                            to={ location }
                            children={ wishTitle + ': редактирование' }
                            end
                        />
                    : wishTitle &&
                        <NavLink
                            className='nav-elem option'
                            to={ `/${ section }/lists/${ wishlistId }/${ wishId }` }
                            children={ wishTitle }
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
        wishlistTitle,
        wishTitle,
        awaitingWishlists,
        awaitingWishes
    ]);

    return (
        <div className='bread-crumbs'>
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

export const BreadCrumbs = memo(() => {
    const { wishId,
            wishlistId } = getLocationConfig()

    const   wish = getWishById(wishId);
    const   wishlist = getWishlistById(wishlistId);
    const { awaitingUserWishes,
            awaitingWishes,
            awaitingWishlists } = getLoadingStatus();

    return (
        <BreadCrumbsView {...{
            wishTitle: wish?.title,
            wishlistTitle: wishlist?.title,
            awaitingWishes,
            awaitingUserWishes,
            awaitingWishlists
        }}/>
    )
});
