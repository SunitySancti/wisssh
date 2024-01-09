import { useEffect,
         useCallback,
         useRef,
         useState,
         forwardRef,
         useImperativeHandle } from 'react'
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
import { usePrefetch } from 'store/apiSlice'

import type { RefObject,
              ForwardedRef } from 'react'


interface NavBarViewProps {
    shouldDropShadow: boolean
}

interface NavBarProps {
    workSpaceRef: RefObject<HTMLDivElement>
}

interface NavBarRef {
    toggleNavBarShadow(): void
}


const controlDataFetch = () => {
    const { section, mode } = getLocationConfig();

    const   triggerFriends = usePrefetch('getFriends');
    const { friendsHaveLoaded } = getFriends();

    const   triggerUserWishes = usePrefetch('getUserWishes');
    const { userWishesHaveLoaded } = getUserWishes();
        
    const   triggerUserWishlists = usePrefetch('getUserWishlists');
    const { userWishlistsHaveLoaded } = getUserWishlists();
            
    const   triggerFriendWishes = usePrefetch('getFriendWishes');
    const { friendWishesHaveLoaded } = getFriendWishes();
                
    const   triggerInvites = usePrefetch('getInvites');
    const { invitesHaveLoaded } = getInvites();

    const fetchRest = useCallback(() => {
        if(!userWishesHaveLoaded) {
            triggerUserWishes()
        }
        if(!userWishlistsHaveLoaded) {
            triggerUserWishlists()
        }
        if(!friendWishesHaveLoaded) {
            triggerFriendWishes()
        }
        if(!invitesHaveLoaded) {
            triggerInvites()
        }
        if(!friendsHaveLoaded) {
            triggerFriends()
        }
    },[ userWishesHaveLoaded,
        userWishlistsHaveLoaded,
        friendWishesHaveLoaded,
        invitesHaveLoaded,
        friendsHaveLoaded
    ]);

    useEffect(() => {
        switch(section + '/' + mode) {
            case 'my-wishes/items':
                triggerUserWishes();
                if(userWishesHaveLoaded) fetchRest()
                break
            case 'my-wishes/lists':
                triggerUserWishlists();
                if(userWishlistsHaveLoaded) fetchRest()
                break
            case 'my-invites/items':
                triggerFriendWishes();
                if(friendWishesHaveLoaded) fetchRest()
                break
            case 'my-invites/lists':
                triggerInvites();
                triggerFriends();
                if(invitesHaveLoaded && friendsHaveLoaded) fetchRest()
        }
    },[ section,
        mode,
        userWishesHaveLoaded,
        userWishlistsHaveLoaded,
        friendWishesHaveLoaded,
        invitesHaveLoaded,
        friendsHaveLoaded
    ])
}


const RefreshButton = () => {
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
     
    const refreshData = () => {
        refreshUser();
        refreshFriends();
        refreshUserWishes();
        refreshUserWishlists();
        refreshFriendWishes();
        refreshInvites();
    }
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
}


const NavBarView = ({ shouldDropShadow } : NavBarViewProps) => (
    <div className='navbar'>
        <ScrollBox {...{ shouldDropShadow }}>
            <ModeToggle/>
            <BreadCrumbs/>
            <RefreshButton/>
        </ScrollBox>
    </div>
);


const NavBar = forwardRef(({
    workSpaceRef
} : NavBarProps,
    ref: ForwardedRef<NavBarRef>
) => {
    const [ shouldDropShadow, setShouldDropShadow ] = useState(false);
    controlDataFetch();

    useImperativeHandle(ref, () => ({
        toggleNavBarShadow() { setShouldDropShadow(!!workSpaceRef.current?.scrollTop) }
    }));
    
    return <NavBarView {...{ shouldDropShadow }}/>
});

export const NavBarLayout = () => {
    const workSpaceRef = useRef<HTMLDivElement>(null);
    const navBarRef = useRef<NavBarRef>(null);

    return (
        <>
            <NavBar {...{ workSpaceRef, ref: navBarRef }}/>
            <div
                className='work-space'
                ref={ workSpaceRef }
                onScroll={ () => navBarRef.current?.toggleNavBarShadow() }
            >
                <Outlet />
            </div>
        </>
    )
}
