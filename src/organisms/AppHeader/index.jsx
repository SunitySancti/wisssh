import React, { useState, useEffect } from 'react'
import { Outlet,
         useNavigate,
         useLocation } from 'react-router'
import { useDispatch,
         useSelector } from 'react-redux'

import './styles.scss'
import { SectionSwitcher } from 'molecules/SectionSwitcher'
import { CreationGroup } from 'molecules/CreationGroup'
import { UserGroup } from 'molecules/UserGroup'

import { fetchUserAvatar,
         fetchWishCover } from 'store/imageSlice'
import { getCurrentUser,
         getFriends,
         getUserWishlists,
         getUserWishes,
         getInvites,
         getFriendsWishes } from 'store/getters'


export const AppHeader = ({ onLogoClick }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation().pathname;
    const token = useSelector(state => state.auth?.token);

    useEffect(() => {
        if(!token) {
            navigate('/login', { state: {
                redirectedFrom: location,
                
            }})
        }
    },[ token ])

    const { user } = getCurrentUser();
    const { friends,
            friendsHaveLoaded } = getFriends();
    const { userWishlists } = getUserWishlists();
    const { userWishes,
            userWishesHaveLoaded } = getUserWishes();
    const { invites } = getInvites();
    const { friendsWishes,
            friendsWishesHaveLoaded } = getFriendsWishes();

    useEffect(() => {
        if(user?.id) dispatch(fetchUserAvatar(user?.id))
    },[ user?.id ])
    
    useEffect(() => {
        if(!userWishesHaveLoaded || !userWishes?.length) return
        for (const wish of userWishes) {
            dispatch(fetchWishCover(wish.id))
        }
    },[ userWishes, userWishesHaveLoaded ]);

    useEffect(() => {
        if(!friendsWishesHaveLoaded || !friendsWishes?.length) return
        for (const wish of friendsWishes) {
            dispatch(fetchWishCover(wish.id))
        }
    },[ friendsWishes, friendsWishesHaveLoaded ]);

    useEffect(() => {
        if(!friendsHaveLoaded || !friends?.length) return
        for (const user of friends) {
            dispatch(fetchUserAvatar(user.id))
        }
    },[ friends, friendsHaveLoaded ]);


    const breakpointWidth = 1000;
    const [isShort, setIsShort] = useState(false);
    const checkWidth = () => setIsShort(window.innerWidth < breakpointWidth);

    const scrollStep = 200;
    const scrollContainer = document.querySelector('.scroll-container');
    const handleScroll = (e) => {
        e.preventDefault();
        const step = scrollContainer?.scrollLeft + scrollStep * e.deltaY / 100;
        scrollContainer?.scroll({
            left: step,
            behavior: 'auto'
        });
    }

    useEffect(() => {
        checkWidth();
        window.addEventListener('resize', checkWidth);
        scrollContainer?.addEventListener('wheel', handleScroll);
        return () => {
            window.removeEventListener('resize', checkWidth);
            scrollContainer?.addEventListener('wheel', handleScroll);
        }
    },[]);


    return (
        <div className='app-layout'>
            <div className='scroll-container'>
                <div className='app-header'>
                    <CreationGroup isShort={isShort} />
                    <SectionSwitcher isShort={isShort} onLogoClick={ onLogoClick }/>
                    <UserGroup isShort={isShort}/>
                </div>
            </div>
            
            <Outlet/>
        </div>
    );
}