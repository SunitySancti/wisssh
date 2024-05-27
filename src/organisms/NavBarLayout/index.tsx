import { useRef,
         useState,
         forwardRef,
         useImperativeHandle,
         memo, 
         useCallback } from 'react'
import { Outlet } from 'react-router'

import './styles.scss'
import { Button } from 'atoms/Button'
import { WithTooltip } from 'atoms/WithTooltip'
import { BreadCrumbs } from 'molecules/BreadCrumbs'
import { ModeToggle } from 'molecules/ModeToggle'
import { ScrollBox } from 'containers/ScrollBox'

import { getCurrentUser,
         getFriends,
         getUserWishlists,
         getUserWishes,
         getInvites,
         getFriendWishes,
         getLocationConfig } from 'store/getters'
import { useAppSelector } from 'store'

import type { RefObject,
              ForwardedRef,
              Dispatch,
              SetStateAction } from 'react'
import { askMobile } from 'store/responsivenessSlice'


interface NavBarRef {
    toggleNavBarShadow(): void
}

export interface SubmitRef {
    submit?(): void;
    isValid?: boolean
}

interface SubmitRefs {
    wishSubmitRef: RefObject<SubmitRef>;
    wishlistSubmitRef: RefObject<SubmitRef>;
}

export interface OutletContextType extends SubmitRefs {
    setIsAbleToSumbit: Dispatch<SetStateAction<boolean>>;
}

interface NavBarViewProps extends SubmitRefs {
    shouldDropShadow: boolean;
    isAbleToSumbit: boolean
}

interface NavBarProps extends SubmitRefs {
    workSpaceRef: RefObject<HTMLDivElement>;
    isAbleToSumbit: boolean
}

interface WorkSpaceProps {
    isNarrow: boolean;
    isMobile: boolean;
    sidePadding: number;
    workSpaceRef: RefObject<HTMLDivElement>;
    navBarRef: RefObject<NavBarRef>;
    wishSubmitRef: RefObject<SubmitRef>;
    wishlistSubmitRef: RefObject<SubmitRef>;
    setIsAbleToSumbit: Dispatch<SetStateAction<boolean>>;
}


const RefreshButton = memo(() => {
    const { refreshUser,
            fetchingUser } = getCurrentUser();
    const { refreshFriends,
            fetchingFriends } = getFriends();
    const { refreshUserWishes,
            fetchingUserWishes } = getUserWishes();        
    const { refreshUserWishlists,
            fetchingUserWishlists } = getUserWishlists();            
    const { refreshFriendWishes,
            fetchingFriendWishes } = getFriendWishes();                
    const { refreshInvites,
            fetchingInvites } = getInvites();
     
    const refreshData = useCallback(() => {
        refreshUser();
        refreshFriends();
        refreshUserWishes();
        refreshUserWishlists();
        refreshFriendWishes();
        refreshInvites();
    },[]);
    const isLoading = fetchingUser || fetchingFriends || fetchingUserWishes || fetchingUserWishlists || fetchingFriendWishes || fetchingInvites;

    return (
        <WithTooltip
            trigger={
                <Button
                    icon='refresh'
                    kind='clear'
                    onClick={ refreshData }
                    isLoading={ isLoading }
                    spinnerSize={ 1.5 }
                />
            }
            text='Обновить данные'
        />
    )
});


const NavBarView = ({
    shouldDropShadow,
    wishSubmitRef,
    wishlistSubmitRef,
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
                        wishSubmitRef,
                        wishlistSubmitRef,
                        isAbleToSumbit
                    }}/>            
                :   <ScrollBox {...{ shouldDropShadow }}>
                        { !isProfileSection && <ModeToggle/> }
                        <BreadCrumbs {...{ wishSubmitRef, wishlistSubmitRef, isAbleToSumbit }}/>
                        <RefreshButton/>
                    </ScrollBox>
            }
        </div>
    );
}


const NavBar = forwardRef(({
    workSpaceRef,
    wishSubmitRef,
    wishlistSubmitRef,
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
        wishSubmitRef,
        wishlistSubmitRef,
        isAbleToSumbit
    }}/>
});

const WorkSpace = memo(({ 
    isNarrow,
    isMobile,
    sidePadding,
    workSpaceRef,
    navBarRef,
    wishSubmitRef,
    wishlistSubmitRef,
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
        <Outlet context={{ wishSubmitRef, wishlistSubmitRef, setIsAbleToSumbit } satisfies OutletContextType}/>
    </div>
));


export const NavBarLayout = memo(() => {
    const workSpaceRef = useRef<HTMLDivElement>(null);
    const navBarRef = useRef<NavBarRef>(null);
    const wishSubmitRef = useRef<SubmitRef>(null);
    const wishlistSubmitRef = useRef<SubmitRef>(null);

    const [ isAbleToSumbit, setIsAbleToSumbit ] = useState(false);

    const isMobile = askMobile();
    const { isNarrow,
            sidePadding } = useAppSelector(state => state.responsiveness);

    return (
        <>
            <NavBar {...{
                workSpaceRef,
                wishSubmitRef,
                wishlistSubmitRef,
                isAbleToSumbit,
                ref: navBarRef
            }}/>
            <WorkSpace {...{
                isNarrow,
                isMobile,
                sidePadding,
                workSpaceRef,
                navBarRef,
                wishSubmitRef,
                wishlistSubmitRef,
                setIsAbleToSumbit
            }}/>
        </>
    )
})
