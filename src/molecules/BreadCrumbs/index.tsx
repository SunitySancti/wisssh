import { useEffect,
         memo,
         useState, 
         useRef } from 'react'
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
import { useOverflowDetector } from 'hooks/useOverflowDetector'

import type { Wish,
              Wishlist } from 'typings'
import type { ReactNode } from 'react'


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

interface CrumbProps {
    to: string;
    children: ReactNode
}

interface EditCrumbProps {
    location: string
    title?: string
}

interface PlusProps {
    isWishCreating?: boolean
}

interface BreadCrumbsProps {
    isMobile?: boolean;
    shouldDropShadow?: boolean;
}

interface TabsProps {
    wishTitle?: string;
    isMobile?: boolean;
}

interface CrumbsProps {
    awaitingWishlists: boolean;
    awaitingWishes: boolean;
    isMobile?: boolean;
    wishlist?: Wishlist;
    wish?: Wish;
    leftOverflow?: boolean;
    rightOverflow?: boolean;
}


const Slider = ({ location }: SliderProps) => {
    const sliderPadding = 0;
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

        console.log(activeTab, nextLeft, nextWidth)

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
        const container = document.querySelector<HTMLAnchorElement>('.nav-elem.option.active');
        if(!activeTab) return;

        console.log({ currentTab, activeTab })

        setSliderStyles({
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
}

const Crumb = ({ to, children }: CrumbProps) => {
    const ref = useRef(null);
    const [leftOverflow, rightOverflow] = useOverflowDetector(ref);


    useEffect(() => {
        console.log({ leftOverflow, rightOverflow })
    },[ leftOverflow,
        rightOverflow
    ])
    return (
        <NavLink
            className='nav-elem option'
            end
            {...{ to, ref }}
        >
            <div className={ 'left overflow-mask' + (leftOverflow ? '' : ' hidden')}/>
            { children }
            <div className={ 'right overflow-mask' + (rightOverflow ? '' : ' hidden')}/>
        </NavLink>
    )
};

const EditCrumb = memo(({ title, location }: EditCrumbProps) => {
    return title
        ?   <Crumb
                to={ location }
                children={ <span>{ 'Редактирование: ' + title }</span> }
            />
        : null
});

const Plus = memo(({ isWishCreating }: PlusProps) => (
    <WithTooltip
        trigger={
            <Link
                className='icon-link'
                to={ `/my-wishes/${ isWishCreating ? 'items' : 'lists' }/new` }
                children={ <Icon name='plus'/> }
            />
        }
        text={ isWishCreating ? 'Новое желание' : 'Новый вишлист' }
    />
));


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
        
        { !isMobile && isWishesSection && !(isNewWish || isNewWishlist) &&
            <Plus isWishCreating/>
        }
    
        { wishId && isEditWish &&
            <EditCrumb {...{ location, title: wishTitle }}/>
        }
    </>
});

const Crumbs = memo(({
    isMobile,
    awaitingWishlists,
    awaitingWishes,
    wishlist,
    wish
} : CrumbsProps
) => {
    const { location,
            section,
            wishId,
            wishlistId,
            isWishesSection,
            isNewWishlist,
            isEditWish,
            isEditWishlist } = getLocationConfig();

    const Slash = memo(() => <div className='nav-elem'>/</div>);
    
    const RootCrumb = memo(() => (
        <Crumb
            to={ `/${ section }/lists` }
            children={ <span>{ section === 'my-invites' ? 'Все приглашения' : 'Все вишлисты' }</span> }
        />
    ));
    
    const WishlistCrumb = memo(() => (
        <Crumb to={ `/${ section }/lists/${ wishlistId }` }>
            <span>{ wishlist?.title }</span>
        </Crumb>
    ));
    
    const WishCrumb = memo(() => (
        <Crumb to={ location }>
            <span>{ wish?.title }</span>
        </Crumb>
    ));

    const NewWishlistCrumb = memo(() => (
        <Crumb
            to='/my-wishes/lists/new'
            children={ <span>Новый вишлист</span> }
        />
    ));
    
    return <>
            <RootCrumb/>
            
            { wishlistId && // We're in a /lists/ mode and on a whether <WishlistPage> or <SingleWishPage>
                <>
                    <Slash/>
                    { awaitingWishlists
                        ? <NavbarEllipsis/>
                    : isEditWishlist
                        ? <EditCrumb {...{ location, title: wishlist?.title }}/>
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
                        ? <EditCrumb {...{ location, title: wish?.title }}/>
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
                            ? <EditCrumb {...{ location, title: wish?.title }}/>
                            : <WishCrumb/>
                        }
                    </>
                }

            { (isNewWishlist && !isEditWishlist && !isEditWish)
                ? <NewWishlistCrumb/>
                : (!wishlistId && !wishId && isWishesSection && !isMobile) && <Plus/>
            }
    </>
});


export const BreadCrumbs = memo(({
    isMobile,
    shouldDropShadow
} : BreadCrumbsProps
) => {
    const { location,
            isListsMode,
            isItemsMode,
            wishId,
            wishlistId,
            isEditWish,
            isEditWishlist } = getLocationConfig()

    const   wish = getWishById(wishId);
    const   wishlist = getWishlistById(wishlistId);
    const { awaitingWishes,
            awaitingWishlists } = getLoadingStatus();

    const isCrumbs = isListsMode || isMobile && wishId;

    const Back = memo(() => {
        const isListsRoot = location === '/my-wishes/lists' || location === '/my-invites/lists';
        return <Link
            className={ 'icon-link' + (isListsRoot ? ' invisible' : '')}
            to={ location.split('/').slice(0,-1).join('/') }
            children={ <Icon name='back' size={ 66 }/> }
        />
    });

    return (
        <div className={ 'bread-crumbs ' + (isCrumbs ? 'crumbs' : 'tabs') + (shouldDropShadow ? ' with-shadow' : '')}>
            
            { isMobile && isCrumbs && <Back/> }

            <div className='bread-box crumbs'>
                <Slider {...{ location }}/>
                { isCrumbs // true in /lists/ mode and in mobile version of wish pages and wish edit pages
                    ? <Crumbs {...{
                        isMobile,
                        awaitingWishlists,
                        awaitingWishes,
                        wishlist,
                        wish
                    }}/>
                    : <Tabs {...{
                        isMobile,
                        wishTitle: wish?.title
                    }}/>
                }
            </div>
            
            { isMobile && wishlistId && wishlist && !wishId &&
                <>{
                    isEditWishlist
                        ? <div style={{ width: '2rem', flexShrink: '0' }}/>
                        : <WishlistMenu {...{ wishlist }}/>
                }</>
            }
            { isMobile && (isItemsMode || wishlist) && wish &&
                <>{
                    isEditWish
                        ? <div style={{ width: '2rem', flexShrink: '0' }}/>
                        : <WishMenu {...{ wish }}/>
                }</>
            }
        </div>
    )
});
