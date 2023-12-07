import { useEffect,
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
import { usePrefetch } from 'store/apiSlice'


export const NavBar = () => {
    const { section, mode } = getLocationConfig();
    const locationCase = section + '/' + mode;
    
    const { refreshUser,
            fetchingUser } = getCurrentUser();

    const   triggerFriends = usePrefetch('getFriends');
    const { friendsHaveLoaded,
            refreshFriends,
            fetchingFriends } = getFriends();

    const   triggerUserWishes = usePrefetch('getUserWishes');
    const { userWishesHaveLoaded,
            refreshUserWishes,
            fetchingUserWishes } = getUserWishes();
        
    const   triggerUserWishlists = usePrefetch('getUserWishlists');
    const { userWishlistsHaveLoaded,
            refreshUserWishlists,
            fetchingUserWishlists } = getUserWishlists();
            
    const   triggerFriendWishes = usePrefetch('getFriendWishes');
    const { friendWishesHaveLoaded,
            refreshFriendWishes,
            fetchingFriendWishes } = getFriendWishes();
                
    const   triggerInvites = usePrefetch('getInvites');
    const { invitesHaveLoaded,
            refreshInvites,
            fetchingInvites } = getInvites();
     
    const isLoading = fetchingUser || fetchingFriends || fetchingUserWishes || fetchingUserWishlists || fetchingFriendWishes || fetchingInvites

    const refreshData = () => {
        refreshUser();
        refreshFriends();
        refreshUserWishes();
        refreshUserWishlists();
        refreshFriendWishes();
        refreshInvites();
    }

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
        switch(locationCase) {
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
    },[ locationCase,
        userWishesHaveLoaded,
        userWishlistsHaveLoaded,
        friendWishesHaveLoaded,
        invitesHaveLoaded,
        friendsHaveLoaded
    ]);
    

    const putShadowOnContent = () => {
        const contentWasScrolled = document.querySelector<HTMLDivElement>('.work-space')?.scrollTop;
        const nav = document.querySelector<HTMLDivElement>('.navbar .content');
        if(contentWasScrolled) {
            nav && nav.classList.add('with-shadow')
        } else {
            nav && nav.classList.remove('with-shadow')
        }
    }
    
    return (
        <>
            <div className='navbar'>
                <ScrollBox>
                    <ModeToggle/>
                    <BreadCrumbs/>
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
                </ScrollBox>
            </div>
            <div
                className='work-space'
                onScroll={ putShadowOnContent }
            >
                <Outlet />
            </div>
        </>
    );
}
