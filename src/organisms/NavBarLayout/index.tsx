import { useRef,
         useState,
         forwardRef,
         useImperativeHandle,
         memo } from 'react'
import { Outlet } from 'react-router'

import './styles.scss'
import { BreadCrumbs } from 'molecules/BreadCrumbs'
import { ModeToggle } from 'molecules/ModeToggle'
import { ScrollBox } from 'containers/ScrollBox'

import { getLocationConfig } from 'store/getters'
import { useAppSelector } from 'store'

import type { RefObject,
              ForwardedRef,
              Dispatch,
              SetStateAction } from 'react'
import { askMobile } from 'store/responsivenessSlice'


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
    isAbleToSumbit: boolean
}

interface NavBarProps extends WithSubmitRef {
    workSpaceRef: RefObject<HTMLDivElement>;
    isAbleToSumbit: boolean
}

interface WorkSpaceProps extends WithSubmitRef {
    isNarrow: boolean;
    isMobile: boolean;
    sidePadding: number;
    workSpaceRef: RefObject<HTMLDivElement>;
    navBarRef: RefObject<NavBarRef>;
    setIsAbleToSumbit: Dispatch<SetStateAction<boolean>>;
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
    isAbleToSumbit
} : NavBarViewProps) => {
    const isMobile = askMobile();
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
                        <BreadCrumbs {...{ submitRef, isAbleToSumbit }}/>
                        {/* <RefreshButton/> */}
                    </ScrollBox>
            }
        </div>
    );
}


const NavBar = forwardRef(({
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
        isAbleToSumbit
    }}/>
});

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
        <Outlet context={{ submitRef, setIsAbleToSumbit } satisfies OutletContextType}/>
    </div>
));


export const NavBarLayout = memo(() => {
    const workSpaceRef = useRef<HTMLDivElement>(null);
    const navBarRef = useRef<NavBarRef>(null);
    const submitRef = useRef<SubmitRef>(null);

    const [ isAbleToSumbit, setIsAbleToSumbit ] = useState(false);

    const isMobile = askMobile();
    const { isNarrow,
            sidePadding } = useAppSelector(state => state.responsiveness);

    return (
        <>
            <NavBar {...{
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
})
