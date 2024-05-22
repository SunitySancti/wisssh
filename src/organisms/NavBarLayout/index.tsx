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
         getFriendWishes } from 'store/getters'
import { useAppSelector } from 'store'

import type { RefObject,
              ForwardedRef } from 'react'
import { askMobile } from 'store/responsivenessSlice'


interface NavBarViewProps {
    shouldDropShadow: boolean
}

interface NavBarProps {
    workSpaceRef: RefObject<HTMLDivElement>
}

interface NavBarRef {
    toggleNavBarShadow(): void
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


const NavBarView = ({ shouldDropShadow } : NavBarViewProps) => {
    const isMobile = askMobile();
    return (
        <div className='navbar'>
            { isMobile
                ?   <BreadCrumbs {...{
                        shouldDropShadow,
                        isMobile
                    }}/>            
                :   <ScrollBox {...{ shouldDropShadow }}>
                        <ModeToggle/>
                        <BreadCrumbs/>
                        <RefreshButton/>
                    </ScrollBox>
            }
        </div>
    );
}


const NavBar = forwardRef(({
    workSpaceRef
} : NavBarProps,
    ref: ForwardedRef<NavBarRef>
) => {
    const [ shouldDropShadow, setShouldDropShadow ] = useState(false);

    useImperativeHandle(ref, () => ({
        toggleNavBarShadow() { setShouldDropShadow(!!workSpaceRef.current?.scrollTop) }
    }));
    
    return <NavBarView {...{ shouldDropShadow }}/>
});

interface WorkSpaceProps {
    isNarrow: boolean;
    isMobile: boolean;
    sidePadding: number;
    workSpaceRef: RefObject<HTMLDivElement>;
    navBarRef: RefObject<NavBarRef>
}

const WorkSpace = memo(({ isNarrow, isMobile, sidePadding, workSpaceRef, navBarRef }: WorkSpaceProps) => (
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
        <Outlet />
    </div>
))


export const NavBarLayout = memo(() => {
    const workSpaceRef = useRef<HTMLDivElement>(null);
    const navBarRef = useRef<NavBarRef>(null);

    const isMobile = askMobile();
    const { isNarrow,
            sidePadding } = useAppSelector(state => state.responsiveness);

    return (
        <>
            <NavBar {...{ workSpaceRef, ref: navBarRef }}/>
            <WorkSpace {...{ isNarrow, isMobile, sidePadding, workSpaceRef, navBarRef }}/>
        </>
    )
})
