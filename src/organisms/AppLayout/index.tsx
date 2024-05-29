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

import './styles.scss'
import { SectionSwitcher } from 'molecules/SectionSwitcher'
import { CreationGroup } from 'molecules/CreationGroup'
import { UserGroup } from 'molecules/UserGroup'
import { Icon,
         LogoIcon,
         BurgerCross } from 'atoms/Icon'
import { User } from 'atoms/User'

import { updateHistory,
         clearHistory } from 'store/historySlice'
import { getImage } from 'store/imageSlice'
import { getLocationConfig,
         getCurrentUser } from 'store/getters'
import { useAppDispatch,
         useAppSelector } from 'store'
import { askMobile } from 'store/responsivenessSlice'

import type { RefObject,
              WheelEvent } from 'react'
import type { QueueItem } from 'store/imageSlice'
import type { WidthAwared,
              UserId } from 'typings'


interface AppHeaderViewProps {
    handleScroll(e: WheelEvent): void;
    scrollContainerRef: RefObject<HTMLDivElement>;
    creationGroupRef: RefObject<WidthAwared>;
    userGroupRef: RefObject<WidthAwared>;
    groupsMaxWidth: number
}

interface AppHeaderMobileViewProps {
    toggleMenu(): void;
    isMenuOpen: boolean;
    appHeaderHeight: number;
    top: number;
    userId: UserId | undefined;
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

function useRedirectController() {
    // REDIRECTING TO LOGIN PAGE //
    const navigate = useNavigate();
    const token = useAppSelector(state => state.auth.token);

    useEffect(() => {
        if(!token) {
            navigate('/login',{ state:{ redirectedFrom: location }})
        }
    },[ token ]);
}

function useFetchImagesController() {
    const dispatch = useAppDispatch();
    const queue = useAppSelector(state => state.images.queue);
    const prior = useAppSelector(state => state.images.prior);
    const isLoading = useAppSelector(state => Boolean(Object.keys(state.images.loading).length));

    useEffect(() => {
        if(isLoading) {
            return
        }
        const partLength = 8;
        const part: QueueItem[] = [];
        
        if(prior instanceof Array && prior.length) {
            part.push(...prior.slice(0, partLength))
        } else if(queue instanceof Array && queue.length) {
            part.push(...queue.slice(0, partLength))
        }

        part.forEach(item => {
            dispatch(getImage(item))
        })
    },[ queue, prior, isLoading ]);
}

const AppHeader = () => {
    const dispatch = useAppDispatch();
    const { location } = getLocationConfig();

    useRedirectController();
    useFetchImagesController();

    // HISTORY UPDATING //
    useEffect(() => { dispatch(updateHistory(location)) },[ location ]);
    useEffect(() => { return () => { dispatch(clearHistory()) }},[]);

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

    const appHeaderHeight = 66;

    const { section,
            mode } = getLocationConfig();
    const { user } = getCurrentUser();

    const optionId = mode ? section + '/' + mode : section!;

    const [ isMenuOpen, setIsMenuOpen ] = useState(false);

    const top = useMemo(() => {
        const targetOption = document.getElementById(optionId) as HTMLAnchorElement | null;
        const rect = targetOption?.getBoundingClientRect()
        return rect
            ? (appHeaderHeight - rect.height) / 2 - rect.top
            : 0
    },[ isMenuOpen ]);
    
    const toggleMenu = useCallback(() => {
        setIsMenuOpen(!isMenuOpen);
        const animation = document.getElementById('burger-to-cross') as unknown as SVGAnimateElement | null
        animation?.beginElement()
    },[ isMenuOpen ]);
    
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
    const { isNarrow } = useAppSelector(state => state.responsiveness);
    const isMobile = askMobile()
    
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