import   React,
       { useState,
         useEffect } from 'react'
import   useDeepCompareEffect from 'use-deep-compare-effect'
import { Navigate,
         useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import './styles.scss'
import { WishCard } from 'molecules/WishCard'
import { WishlistHeader } from 'molecules/WishlistHeader'
import { MultiColumnLayout } from 'containers/MultiColumnLayout'
import { WishPreloader } from 'atoms/Preloaders'
import { Plug } from 'atoms/Plug'

import { getWishlistById,
         getWishesByWishlistId,
         getLoadingStatus } from 'store/getters'
import { promoteImages } from 'store/imageSlice'

export const WishlistPage = () => {
    const dispatch = useDispatch();
    const location = useLocation().pathname;
    const [, section, , wishlistId] = location.split('/');

    const { awaitingWishes,
            awaitingWishlists } = getLoadingStatus();
    const isLoading = awaitingWishes || awaitingWishlists;
    const wishlist = getWishlistById(wishlistId);
    const incomeWishes = getWishesByWishlistId(wishlistId);
    const [wishes, setWishes] = useState([]);

    useDeepCompareEffect(() => {
        setWishes(incomeWishes)
    },[ incomeWishes || []])
    
    // PROMOTE IMAGES
    
    // const wishIds = wishes?.map(wish => wish.id);
    // useEffect(() => {
    //     if(wishIds instanceof Array && wishIds?.length) {
    //         dispatch(promoteImages(wishIds))
    //     }
    // },[ wishIds ]);
    useDeepCompareEffect(() => {
        if(wishes instanceof Array && wishes.length) {
            const wishIds = wishes?.map(wish => wish?.id);
            dispatch(promoteImages(wishIds))
        }
    },[ wishes || []]);
    

    return ( isLoading
        ?   <div className='wishlist-page'>
                <WishPreloader isLoading/>
            </div>
        :   wishlist?.id
        ?   <div className='wishlist-page'>
                <WishlistHeader
                    wishlist={ wishlist }
                    onWishlistPage
                />
                { wishes instanceof Array && wishes.length
                    ?   <MultiColumnLayout
                            Card={ WishCard }
                            data={ wishes }
                        />
                    :   <Plug position='wishlistPageNoWishes'/>
                }
                
            </div>
        :   <Navigate
                to={ '/' + section + '/lists' }
                replace
            />
    );
}
