import { memo } from 'react'
import { useDeepCompareMemo } from 'use-deep-compare'
import { Navigate } from 'react-router-dom'

import './styles.scss'
import { WishlistHeader } from 'molecules/WishlistHeader'
import { MultiColumnLayout } from 'containers/MultiColumnLayout'
import { WishPreloader } from 'atoms/Preloaders'
import { Plug } from 'atoms/Plug'

import { getLocationConfig,
         getWishlistById,
         getLoadingStatus } from 'store/getters'

import type { Wishlist } from 'typings'


interface WishlistPageViewProps {
    isLoading: boolean;
    wishlist: Wishlist | undefined;
}


const WishlistPageView = memo(({
    isLoading,
    wishlist
} : WishlistPageViewProps
) => {
    const { section } = getLocationConfig();
    return (
        <div className='wishlist-page'>
            {  isLoading
                ?   <WishPreloader isLoading/>
                :   wishlist
                    ?   <>
                            <WishlistHeader {...{ wishlist }}/>
                            { wishlist.wishes.length
                                ?   <MultiColumnLayout ids={ wishlist.wishes }/>
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
    const memoizedWishlist = useDeepCompareMemo(() => wishlist,[ wishlist ]);

    return (
        <WishlistPageView {...{
            isLoading,
            wishlist: memoizedWishlist
        }}/>
    )
}
