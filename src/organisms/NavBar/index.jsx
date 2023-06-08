import   React,
       { useEffect,
         useCallback } from 'react'
import { Outlet,
         useLocation } from 'react-router'

import './styles.scss'
import { BreadCrumbs } from 'molecules/BreadCrumbs'
import { ModeToggle } from 'molecules/ModeToggle'
import { ScrollBox } from 'containers/ScrollBox'

import { getFriends,
         getUserWishlists,
         getUserWishes,
         getInvites,
         getFriendWishes } from 'store/getters'
import { usePrefetch } from 'store/apiSlice'


export const NavBar = () => {
    const locationCase = useLocation().pathname.split('/').slice(1,3).join('/');
    
    const   triggerUserWishes          = usePrefetch('getUserWishes');
    const { userWishesHaveLoaded }     = getUserWishes();
        
    const   triggerUserWishlists       = usePrefetch('getUserWishlists');
    const { userWishlistsHaveLoaded }  = getUserWishlists();
            
    const   triggerFriendWishes        = usePrefetch('getFriendWishes');
    const { friendWishesHaveLoaded }   = getFriendWishes();
                
    const   triggerInvites             = usePrefetch('getInvites');
    const { invitesHaveLoaded }        = getInvites();

    const   triggerFriends             = usePrefetch('getFriends');
    const { friendsHaveLoaded }        = getFriends();
        

    const fetchRest = useCallback(() => {
        if(!userWishesHaveLoaded) {
            triggerUserWishes(null, true)
        }
        if(!userWishlistsHaveLoaded) {
            triggerUserWishlists(null, true)
        }
        if(!friendWishesHaveLoaded) {
            triggerFriendWishes(null, true)
        }
        if(!invitesHaveLoaded) {
            triggerInvites(null, true)
        }
        if(!friendsHaveLoaded) {
            triggerFriends(null, true)
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
                triggerUserWishes(null, true);
                if(userWishesHaveLoaded) fetchRest()
                break
            case 'my-wishes/lists':
                triggerUserWishlists(null, true);
                if(userWishlistsHaveLoaded) fetchRest()
                break
            case 'my-invites/items':
                triggerFriendWishes(null, true);
                if(friendWishesHaveLoaded) fetchRest()
                break
            case 'my-invites/lists':
                triggerInvites(null, true);
                triggerFriends(null, true);
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
        const contentWasScrolled = document.querySelector('.work-space').scrollTop;
        const nav = document.querySelector('.navbar .content');
        if(contentWasScrolled) {
                nav.classList.add('with-shadow')
        } else  nav.classList.remove('with-shadow');
    }
    
    return (
        <>
            <div className='navbar'>
                <ScrollBox>
                    <ModeToggle/>
                    <BreadCrumbs/>
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
