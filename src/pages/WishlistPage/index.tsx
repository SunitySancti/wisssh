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
import { getDaysToEvent } from 'utils'

import type { Wishlist } from 'typings'


interface WishlistPageViewProps {
    isLoading: boolean;
    wishlist: Wishlist | undefined;
    showNewWishCard?: boolean;
}


const WishlistPageView = memo(({
    isLoading,
    showNewWishCard,
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
                                ?   <MultiColumnLayout
                                        ids={ wishlist.wishes }
                                        showNewWishCard={ showNewWishCard }
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

    const showNewWishCard = isWishesSection && wishlist && getDaysToEvent(wishlist) >= 0;

    return (
        <WishlistPageView {...{
            isLoading,
            showNewWishCard,
            wishlist: memoizedWishlist
        }}/>
    )
}
