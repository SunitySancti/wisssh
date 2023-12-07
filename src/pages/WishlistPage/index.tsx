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

export const WishlistPage = () => {
    const dispatch = useAppDispatch();
    const { section,
            wishlistId } = getLocationConfig();

    const { awaitingWishes,
            awaitingWishlists } = getLoadingStatus();
    const isLoading = awaitingWishes || awaitingWishlists;
    const wishlist = getWishlistById(wishlistId);
    const wishes = getWishesByWishlistId(wishlistId);
    
    // PROMOTE IMAGES

    useDeepCompareEffect(() => {
        if(wishes instanceof Array && wishes.length) {
            const wishIds = wishes.map(wish => wish.id);
            dispatch(promoteImages(wishIds))
        }
    },[ wishes ]);
    

    return ( isLoading
        ?   <div className='wishlist-page'>
                <WishPreloader isLoading/>
            </div>
        :   wishlist
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
