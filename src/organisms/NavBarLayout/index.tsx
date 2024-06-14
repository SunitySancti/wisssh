import { useRef,
         useState,
         forwardRef,
         useImperativeHandle,
         memo } from 'react'
import { Outlet,
         useNavigate } from 'react-router'
import { useSwipeable } from 'react-swipeable'

import './styles.scss'
import { BreadCrumbs } from 'molecules/BreadCrumbs'
import { ModeToggle } from 'molecules/ModeToggle'
import { ScrollBox } from 'containers/ScrollBox'

import { getLocationConfig } from 'store/getters'
import { useAppSelector } from 'store'

import type { RefObject,
              ForwardedRef,
              Dispatch,
              SetStateAction, 
              ReactNode } from 'react'
import type { SwipeEventData } from 'react-swipeable'


interface NavBarRef {
    toggleNavBarShadow(): void
}

interface SubmitRef {
    submitWish?(): void;
    submitWishlist?(): void;
    submitProfile?(): void
}

export interface WithSubmitRef {
    submitRef: RefObject<SubmitRef>;
}

export interface OutletContextType extends WithSubmitRef {
    setIsAbleToSumbit: Dispatch<SetStateAction<boolean>>;
}

interface NavBarViewProps extends WithSubmitRef {
    shouldDropShadow: boolean;
    isAbleToSumbit: boolean;
    isMobile: boolean;
}

interface NavBarProps extends WithSubmitRef {
    workSpaceRef: RefObject<HTMLDivElement>;
    isAbleToSumbit: boolean;
    isMobile: boolean;
}

interface WorkSpaceProps extends WithSubmitRef {
    isNarrow: boolean;
    isMobile: boolean;
    sidePadding: number;
    workSpaceRef: RefObject<HTMLDivElement>;
    navBarRef: RefObject<NavBarRef>;
    setIsAbleToSumbit: Dispatch<SetStateAction<boolean>>;
    swipeHandlers?: ReturnType<typeof useSwipeable>;
    swipeContainerLeft?: number;
    swipeContainerOpacity?: number
}


// const RefreshButton = memo(() => {
//     const { refreshUser,
//             fetchingUser } = getCurrentUser();
//     const { refreshFriends,
//             fetchingFriends } = getFriends();
//     const { refreshUserWishes,
//             fetchingUserWishes } = getUserWishes();        
//     const { refreshUserWishlists,
//             fetchingUserWishlists } = getUserWishlists();            
//     const { refreshFriendWishes,
//             fetchingFriendWishes } = getFriendWishes();                
//     const { refreshInvites,
//             fetchingInvites } = getInvites();
     
//     const refreshData = useCallback(() => {
//         refreshUser();
//         refreshFriends();
//         refreshUserWishes();
//         refreshUserWishlists();
//         refreshFriendWishes();
//         refreshInvites();
//     },[]);
//     const isLoading = fetchingUser || fetchingFriends || fetchingUserWishes || fetchingUserWishlists || fetchingFriendWishes || fetchingInvites;

//     return (
//         <WithTooltip
//             trigger={
//                 <Button
//                     icon='refresh'
//                     kind='clear'
//                     onClick={ refreshData }
//                     isLoading={ isLoading }
//                     spinnerSize={ 1.5 }
//                 />
//             }
//             text='Обновить данные'
//         />
//     )
// });


const NavBarView = ({
    shouldDropShadow,
    submitRef,
    isAbleToSumbit,
    isMobile
} : NavBarViewProps) => {
    const { isProfileSection } = getLocationConfig();
    return (
        <div className='navbar'>
            { isMobile
                ?   <BreadCrumbs {...{
                        shouldDropShadow,
                        isMobile,
                        submitRef,
                        isAbleToSumbit
                    }}/>            
                :   <ScrollBox {...{ shouldDropShadow }}>
                        { !isProfileSection && <ModeToggle/> }
                        <BreadCrumbs {...{ submitRef, isAbleToSumbit, isMobile }}/>
                        {/* <RefreshButton/> */}
                    </ScrollBox>
            }
        </div>
    );
}


const NavBar = forwardRef(({
    isMobile,
    workSpaceRef,
    submitRef,
    isAbleToSumbit
} : NavBarProps,
    ref: ForwardedRef<NavBarRef>
) => {
    const [ shouldDropShadow, setShouldDropShadow ] = useState(false);

    useImperativeHandle(ref, () => ({
        toggleNavBarShadow() { setShouldDropShadow(!!workSpaceRef.current?.scrollTop) }
    }));
    
    return <NavBarView {...{
        shouldDropShadow,
        submitRef,
        isAbleToSumbit,
        isMobile
    }}/>
});


const SwipeContainer = ({ children }: { children: ReactNode }) => {
    const navigate = useNavigate();
    const { location } = getLocationConfig();
    const containerRef = useRef<HTMLDivElement | null>(null);

    const resetStyles = () => {
        if(containerRef.current) {
            containerRef.current.style.left = '0px'
            containerRef.current.style.opacity = '1'
        }
    }

    const isSwipableLeft = [
        '/my-wishes/items/actual',
        '/my-wishes/items/completed',
        '/my-invites/items/reserved',
        '/my-invites/items/completed',
    ].includes(location);

    const isSwipableRight = [
        '/my-wishes/items/completed',
        '/my-wishes/items/all',
        '/my-invites/items/completed',
        '/my-invites/items/all',
    ].includes(location);

    const triggerX = window.innerWidth / 4

    const onSwipedLeft = ({ absX }: SwipeEventData) => {
        if(absX > triggerX) {
            switch(location) {
                case '/my-wishes/items/actual':
                    navigate('/my-wishes/items/completed')
                    break
                case '/my-wishes/items/completed':
                    navigate('/my-wishes/items/all')
                    break
                case '/my-invites/items/reserved':
                    navigate('/my-invites/items/completed')
                    break
                case '/my-invites/items/completed':
                    navigate('/my-invites/items/all')
            }
        }
        resetStyles()
    };

    const onSwipedRight = ({ absX }: SwipeEventData) => {
        if(absX > triggerX) {
            switch(location) {
                case '/my-wishes/items/completed':
                    navigate('/my-wishes/items/actual')
                    break
                case '/my-wishes/items/all':
                    navigate('/my-wishes/items/completed')
                    break
                case '/my-invites/items/completed':
                    navigate('/my-invites/items/reserved')
                    break
                case '/my-invites/items/all':
                    navigate('/my-invites/items/completed')
            }
        }
        resetStyles()
    };

    const onSwiping = ({ dir, deltaX, absX }: SwipeEventData) => {
        const correctLeftSwipe = (dir === 'Left') && isSwipableLeft;
        const correctRightSwipe = (dir === 'Right') && isSwipableRight;
        
        if(containerRef.current && (correctLeftSwipe || correctRightSwipe)) {
            containerRef.current.style.left = deltaX.toFixed() + 'px'
            containerRef.current.style.opacity = (1 - Math.min((absX / triggerX), 0.9)) + ''
        }
    };


    const swipeHandlers = useSwipeable({ onSwipedLeft, onSwipedRight, onSwiping, delta: 30 });

    const refPassthrough = (el: HTMLDivElement) => {
        swipeHandlers.ref(el);
        containerRef.current = el;
    }

    return (
        <div {...{
            className: 'swipe-container',
            children,
            ...swipeHandlers,
            ref:refPassthrough
        }}/>
    )
}


const WorkSpace = memo(({ 
    isNarrow,
    isMobile,
    sidePadding,
    workSpaceRef,
    navBarRef,
    submitRef,
    setIsAbleToSumbit
} : WorkSpaceProps
) => (
    <div
        className={ 'work-space' + ( isNarrow ? ' narrow' : '' )}
        ref={ workSpaceRef }
        onScroll={ () => navBarRef.current?.toggleNavBarShadow() }
        style={ isMobile
            ? undefined
            : {
                paddingLeft: sidePadding - 16,
                paddingRight: sidePadding - 16
            }
        }
    >
        { isMobile
            ? <SwipeContainer>
                <Outlet context={{ submitRef, setIsAbleToSumbit } satisfies OutletContextType}/>
            </SwipeContainer>
            :   <Outlet context={{ submitRef, setIsAbleToSumbit } satisfies OutletContextType}/>
        }
    </div>
));


export const NavBarLayout = () => {
    const workSpaceRef = useRef<HTMLDivElement>(null);
    const navBarRef = useRef<NavBarRef>(null);
    const submitRef = useRef<SubmitRef>(null);

    const [ isAbleToSumbit, setIsAbleToSumbit ] = useState(false);

    const { isNarrow,
            isMobile,
            sidePadding } = useAppSelector(state => state.responsiveness);

    return (
        <>
            <NavBar {...{
                isMobile,
                workSpaceRef,
                submitRef,
                isAbleToSumbit,
                ref: navBarRef
            }}/>
            <WorkSpace {...{
                isNarrow,
                isMobile,
                sidePadding,
                workSpaceRef,
                navBarRef,
                submitRef,
                setIsAbleToSumbit
            }}/>
        </>
    )
}
