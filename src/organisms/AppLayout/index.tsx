import { Fragment,
         useState,
         useEffect,
         memo,
         useMemo, 
         useRef,
         useCallback } from 'react'
import { Outlet,
         Link,
         useNavigate } from 'react-router-dom'
import { useDeepCompareCallback,
         useDeepCompareEffect } from 'use-deep-compare'

import './styles.scss'
import { SectionSwitcher } from 'molecules/SectionSwitcher'
import { CreationGroup } from 'molecules/CreationGroup'
import { UserGroup } from 'molecules/UserGroup'
import { Icon,
         LogoIcon,
         BurgerCross } from 'atoms/Icon'
import { User } from 'atoms/User'

import { updateIndex,
         updateHistory,
         clearHistory } from 'store/historySlice'
import { getImage,
         removeUrl } from 'store/imageSlice'
import { getLocationConfig,
         getCurrentUser,
         getPrimaryImageIds,
         getSecondaryImageIds,
         getRestImageIds, 
         getFriends,
         getUserWishes,
         getFriendWishes} from 'store/getters'
import { useAppDispatch,
         useAppSelector } from 'store'

import type { RefObject,
              SyntheticEvent,
              WheelEvent } from 'react'
import type { WidthAwared,
              UserId,
              Wish as WishType,
              User as UserType } from 'typings'

import { __API_URL__ } from 'environment'


interface AppHeaderViewProps {
    handleScroll(e: WheelEvent): void;
    scrollContainerRef: RefObject<HTMLDivElement>;
    creationGroupRef: RefObject<WidthAwared>;
    userGroupRef: RefObject<WidthAwared>;
    groupsMaxWidth: number
}

interface AppHeaderMobileViewProps {
    toggleMenu(e: SyntheticEvent): void;
    isMenuOpen: boolean;
    appHeaderHeight: number;
    top: number;
    userId: UserId | undefined;
}


function useRedirectController() {
    // REDIRECTING TO LOGIN PAGE //
    const navigate = useNavigate();
    const token = useAppSelector(state => state.auth.token);
    const { location } = getLocationConfig();

    useEffect(() => {
        if(!token) {
            navigate('/login',{ state: location })
        }
    },[ token ]);
}

function useFetchImagesController() {
    const dispatch = useAppDispatch();
    const isLoading = useAppSelector(state => Boolean(Object.keys(state.images.loading).length));
    const imageURLs = useAppSelector(state => state.images.imageURLs);

    const { user } = getCurrentUser();
    const { friends } = getFriends();
    const { userWishes } = getUserWishes();
    const { friendWishes } = getFriendWishes();

    const primary = getPrimaryImageIds();
    const secondary = getSecondaryImageIds();
    const rest = getRestImageIds();

    useDeepCompareEffect(() => {
        if(isLoading) return

        if(primary.isReady && !primary.isEmpty) {
            primary.imageIds.forEach(id => {
                dispatch(getImage(id))
            })
        }

        if(primary.isEmpty && secondary.isReady && !secondary.isEmpty) {
            secondary.imageIds.forEach(id => {
                dispatch(getImage(id))
            })
        }

        if(primary.isEmpty && secondary.isEmpty) {
            rest.imageIds.forEach(id => {
                dispatch(getImage(id))
            })
        }
    },[ isLoading, primary, secondary, rest ]);

    const refreshImage = useDeepCompareCallback((unit: WishType | UserType | undefined) => {
        if(unit) {
            const { id, withImage } = unit;
            
            const unitTS = unit.lastImageUpdate || 1;
            const imageTS = imageURLs[id]?.timestamp || 0

            if(unitTS > imageTS) {
                if(withImage) {
                    dispatch(getImage(id))
                } else {
                    dispatch(removeUrl(id))
                }
            }
        }
    },[ imageURLs, dispatch, getImage, removeUrl ]);

    useDeepCompareEffect(() => {
        refreshImage(user)
    },[ user ]);

    useDeepCompareEffect(() => {
        friends.forEach(user => {
            refreshImage(user)
        })
    },[ friends ]);

    useDeepCompareEffect(() => {
        userWishes.forEach(wish => {
            refreshImage(wish)
        })
    },[ userWishes ]);

    useDeepCompareEffect(() => {
        friendWishes.forEach(wish => {
            refreshImage(wish)
        })
    },[ friendWishes ]);
}

function useHistoryController() {
    const dispatch = useAppDispatch();
    const { location } = getLocationConfig();
    const { isMobile } = useAppSelector(state => state.responsiveness);
    const { lastIndex } = useAppSelector(state => state.history);
    
    useEffect(() => {
        if(isMobile) {
            dispatch(updateIndex())
        } else {
            dispatch(updateHistory(location))
        }
    },[ location ]);

    useEffect(() => {
        return () => {
            dispatch(clearHistory())
        }
    },[])

    const hasBackPressed =  useMemo(() => {
        return lastIndex > window.history.state.idx
    },[ location ])

    return { hasBackPressed }
}


const AppHeaderView = memo(({
    handleScroll,
    scrollContainerRef,
    creationGroupRef,
    userGroupRef,
    groupsMaxWidth
} : AppHeaderViewProps
) => (
    <div
        className='scroll-container'
        ref={ scrollContainerRef }
        onWheel={ handleScroll }
    >
        <div className='app-header'>
            <div
                className='equalize-container'
                style={{ width: groupsMaxWidth }}
            >
                <CreationGroup ref={ creationGroupRef }/>
                <div className='space'/>
            </div>

            <SectionSwitcher/>

            <div
                className='equalize-container'
                style={{ width: groupsMaxWidth }}
            >
                <div className='space'/>
                <UserGroup ref={ userGroupRef }/>
            </div>
        </div>
    </div>
));

const AppHeader = () => {
    useRedirectController();
    useFetchImagesController();
    useHistoryController();

    // HANDLE SCROLLING //
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const handleScroll = useCallback((e: WheelEvent) => {
        const scrollStep = 200;
        scrollContainerRef.current?.scroll({
            left: scrollContainerRef.current.scrollLeft + scrollStep * e.deltaY / 100,
            behavior: 'smooth'
        });
    },[]);

    // CENTERIZE LOGO //
    const creationGroupRef = useRef<WidthAwared>(null);
    const userGroupRef = useRef<WidthAwared>(null);

    const groupsMaxWidth = useMemo(() => {
        const defaultWidth = 198;
        const leftGroupWidth = creationGroupRef.current?.getWidth() || defaultWidth;
        const rightGroupWidth = userGroupRef.current?.getWidth() || defaultWidth;
        
        return Math.max(leftGroupWidth, rightGroupWidth)
    },[
        creationGroupRef.current?.getWidth(),
        userGroupRef.current?.getWidth()
    ]);

    return (
        <AppHeaderView {...{
            handleScroll,
            scrollContainerRef,
            creationGroupRef,
            userGroupRef,
            groupsMaxWidth
        }}/>
    );
}


const AppHeaderMobileView = memo(({
    toggleMenu,
    isMenuOpen,
    appHeaderHeight,
    top,
    userId,
} : AppHeaderMobileViewProps
) => {
    const optionGroups = [[{
        icon: 'present' as const,
        text: 'Мои желания',
        path: '/my-wishes/items/actual',
        id: 'my-wishes/items',
    }, {
        icon: 'wishlist' as const,
        text: 'Мои вишлисты',
        path: '/my-wishes/lists',
        id: 'my-wishes/lists',
    }, {
        icon: 'invite' as const,
        text: 'Приглашения',
        path: '/my-invites/lists',
        id: 'my-invites/lists',
    }, {
        icon: 'magicWand' as const,
        text: 'Желания друзей',
        path: '/my-invites/items/reserved',
        id: 'my-invites/items',
    }], [{
        icon: 'profile' as const,
        text: 'Профиль',
        path: '/profile',
        id: 'profile',
    }], [{
        icon: 'logout' as const,
        text: 'Выйти',
        path: '/logout',
        id: 'logout',
    }]];
    return (
        <div className='app-header-mobile'
            style={{ height: appHeaderHeight }}
        >
        <User id={ userId } picSize={ 5 } picOnly />

        <div className='cutting-frame'
                style={{ height: isMenuOpen ? '100vh' : appHeaderHeight }}
        >
            <div className='app-menu'
                    style={{ top: isMenuOpen ? 0 : top }}
            >
                <div className='logo-icon'>
                    <LogoIcon/>
                    <div className='beta'>Beta</div>
                </div>
                <div className='upper space'/>
                <div className='menu-options'>
                    { optionGroups.map((group, index) => (
                        <Fragment key={ 'group' + index }>
                            { !!index &&
                                <div className='divider'/>
                            }
                            { group.map(({ icon, text, path, id }, index) => (
                                <Link
                                    className='app-menu-option'
                                    id={ id }
                                    to={ path }
                                    onClick={ toggleMenu }
                                    children={<>
                                        <Icon name={ icon }/>
                                        <span>{ text }</span>
                                    </>}
                                    key={ 'option' + index }
                                />
                            )) }
                        </Fragment>
                    ))}
                </div>
                <div className='lower space'/>
            </div>
        </div>

        <BurgerCross reverse={ !isMenuOpen } onClick={ toggleMenu } />
        </div>
    )
})


const AppHeaderMobile = () => {
    useRedirectController();
    useFetchImagesController();
    const { hasBackPressed } = useHistoryController();
    const navigate = useNavigate();

    const { section,
            mode } = getLocationConfig();
    const { user } = getCurrentUser();

    const appHeaderHeight = 66;

    const [ isMenuOpen, setIsMenuOpen ] = useState(false);
    
    const toggleMenu = useCallback(() => {
        setIsMenuOpen(!isMenuOpen);
        const animation = document.getElementById('burger-to-cross') as unknown as SVGAnimateElement | null
        animation?.beginElement()
    },[ isMenuOpen ]);

    useEffect(() => {
        if(isMenuOpen && hasBackPressed) {
            toggleMenu();
            navigate(1)
        }
    },[ isMenuOpen,
        hasBackPressed
    ]);

    const optionId = mode ? section + '/' + mode : section || '';
    const targetOption = document.getElementById(optionId) as HTMLAnchorElement | null;
    
    const top = useMemo(() => {
        const rect = targetOption?.getBoundingClientRect()
        return rect
            ? (appHeaderHeight - rect.height) / 2 - rect.top
            : 0
    },[ isMenuOpen, targetOption ]);
    
    return (
        <AppHeaderMobileView {...{
            toggleMenu,
            isMenuOpen,
            appHeaderHeight,
            top,
            userId: user?.id
        }}/>
    )
}

export const AppLayout = () => {
    // RESPONSIVENESS //
    const { isNarrow,
            isMobile } = useAppSelector(state => state.responsiveness);
    
    return (
        <div className={'app-layout' + (isNarrow ? ' narrow' : '') + (isMobile ? ' mobile' : '')}>
            { isMobile
                ? <AppHeaderMobile/>
                : <AppHeader/>
            }
            <Outlet/>
        </div>
    )
}
