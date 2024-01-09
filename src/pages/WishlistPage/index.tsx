import { memo,
         useMemo } from 'react'
import   useDeepCompareEffect from 'use-deep-compare-effect'
import { Navigate } from 'react-router-dom'

import './styles.scss'
import { WishCard } from 'molecules/WishCard'
import { WishlistHeader } from 'molecules/WishlistHeader'
import { MultiColumnLayout } from 'containers/MultiColumnLayout'
import { WishPreloader } from 'atoms/Preloaders'
import { Plug } from 'atoms/Plug'

import { useAppDispatch } from 'store'
import { getLocationConfig,
         getWishlistById,
         getWishesByWishlistId,
         getLoadingStatus } from 'store/getters'
import { promoteImages } from 'store/imageSlice'

import type { Wish,
              Wishlist } from 'typings'


interface WishlistPageViewProps {
    isLoading: boolean;
    wishlist: Wishlist | undefined;
    wishes: Wish[]
}


const WishlistPageView = memo(({
    isLoading,
    wishlist,
    wishes
} : WishlistPageViewProps
) => {
    const { section } = getLocationConfig();
    return (
        <div className='wishlist-page'>
            {  isLoading
                ?   <WishPreloader isLoading/>
                :   wishlist
                    ?   <>
                            <WishlistHeader
                                wishlist={ wishlist }
                                onWishlistPage
                            />
                            { wishes.length
                                ?   <MultiColumnLayout
                                        Card={ WishCard }
                                        data={ wishes }
                                    />
                                :   <Plug position='wishlistPageNoWishes'/>
                            }
                            
                        </>
                    :   <Navigate
                            to={ '/' + section + '/lists' }
                            replace
                        />
            }
        </div>
    )
});

export const WishlistPage = () => {
    const dispatch = useAppDispatch();
    const { wishlistId,
            isWishesSection } = getLocationConfig();

    const { awaitingUserWishes,
            awaitingFriendWishes,
            awaitingUserWishlists,
            awaitingInvites } = getLoadingStatus();
    
    const isLoading = isWishesSection
        ? awaitingUserWishes || awaitingUserWishlists
        : awaitingFriendWishes || awaitingInvites;

    const wishlist = getWishlistById(wishlistId);
    const wishes = getWishesByWishlistId(wishlistId);

    const memoizedWishlist = useMemo(() => {
        return wishlist
    },[ wishlist?.id ])

    const memoizedWishes = useMemo(() => {
        return wishes
    },[ wishes.length ])
    
    // PROMOTE IMAGES

    useDeepCompareEffect(() => {
        if(wishes.length) {
            const wishIds = wishes.map(wish => wish.id);
            dispatch(promoteImages(wishIds))
        }
    },[ wishes ]);

    return (
        <WishlistPageView {...{
            isLoading,
            wishlist: memoizedWishlist,
            wishes: memoizedWishes
        }}/>
    )
}
