import   React,
       { useEffect } from 'react'
import { useLocation,
         useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import { WishCard } from 'molecules/WishCard'
import { WishlistLine } from 'molecules/WishlistLine'
import { MultiColumnLayout } from 'containers/MultiColumnLayout'
import { LineContainer } from 'containers/LineContainer'
import { Button } from 'atoms/Button'

import { getWishlistById,
         getWishesByWishlistId } from 'store/getters'
import { promoteImages } from 'store/imageSlice'

export const WishlistPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation().pathname;
    const pathSteps = location.split('/');
    const wishlistId = pathSteps.at(-1)
                     ? pathSteps.at(-1)
                     : pathSteps.at(-2);
    const section = pathSteps[1];

    const wishlist = getWishlistById(wishlistId);
    const wishes = getWishesByWishlistId(wishlistId);
    const wishIds = wishes?.map(wish => wish.id);

    useEffect(() => {
        if(wishIds instanceof Array && wishIds.length) {
            dispatch(promoteImages(wishIds))
        }
    },[ wishIds?.length ]);

    if (!wishlist) {
        return (
            <LineContainer
                className='not-found'
                children={
                    <>
                        <span>Вишлист не найден 😥</span>
                        <Button
                            kind='primary'
                            icon='plus'
                            text='К списку вишлистов'
                            onClick={() => navigate(`/${ section }/lists`)}
                            round
                        />
                    </>
                }
            />
        );
    }

    return (
        <>
            <WishlistLine
                wishlist={ wishlist }
                onWishlistPage={ true }
            />
            <MultiColumnLayout
                Card={ WishCard }
                data={ wishes }
            />
        </>
    );
}