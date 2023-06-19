import   React,
       { useEffect } from 'react'
import { Navigate,
         useLocation,
         useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import './styles.scss'
import { WishCard } from 'molecules/WishCard'
import { WishlistLine } from 'molecules/WishlistLine'
import { MultiColumnLayout } from 'containers/MultiColumnLayout'
import { WishPreloader } from 'atoms/Preloaders'

import { getWishlistById,
         getWishesByWishlistId,
         getLoadingStatus } from 'store/getters'
import { promoteImages } from 'store/imageSlice'

export const WishlistPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation().pathname;
    const [, section, , wishlistId] = location.split('/');

    const { awaitingWishes,
            awaitingWishlists } = getLoadingStatus();
    const isLoading = awaitingWishes || awaitingWishlists;
    const wishlist = getWishlistById(wishlistId);
    const wishes = getWishesByWishlistId(wishlistId);
    const wishIds = wishes?.map(wish => wish.id);

    // REDIRECT IF WISHLIST NOT FOUND

    useEffect(() => {
        if(!isLoading && !wishlist) {
            navigate('/' + section + '/lists', { replace: true })
        }
    },[ isLoading, wishlist, section ]);

    // PROMOTE IMAGES

    useEffect(() => {
        if(wishIds instanceof Array && wishIds?.length) {
            dispatch(promoteImages(wishIds))
        }
    },[ wishIds?.length ]);
    

    return ( isLoading
        ?   <div className='wishlist-page'>
                <WishPreloader isLoading/>
            </div>
        :   wishlist
        ?   <div className='wishlist-page'>
                <WishlistLine
                    wishlist={ wishlist }
                    onWishlistPage
                    openModal={ modalRef.current?.openModal }
                />
                <MultiColumnLayout
                    Card={ WishCard }
                    data={ wishes }
                />
            </div>
        :   <Navigate
                to={ '/' + section + '/lists' }
                replace
            />
    );
}
