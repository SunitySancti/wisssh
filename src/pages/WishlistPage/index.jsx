import { React } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { WishCard } from 'molecules/WishCard'
import { WishlistLine } from 'molecules/WishlistLine'
import { MultiColumnLayout } from 'containers/MultiColumnLayout'
import { LineContainer } from 'containers/LineContainer'
import { Button } from 'atoms/Button'

import { getWishlistById,
         getAllRelevantWishes } from 'store/getters'

export const WishlistPage = () => {
    const navigate = useNavigate();
    const location = useLocation().pathname;
    const pathSteps = location.split('/');
    const wishlistId = pathSteps.at(-1)
                     ? pathSteps.at(-1)
                     : pathSteps.at(-2);
    const section = pathSteps[1];

    const wishlist = getWishlistById(wishlistId);
    const wishes = getAllRelevantWishes()
                  .filter(wish => wish.inWishlists.includes(wishlist?.id));

    
    if (!wishlist) {
        return (
            <LineContainer
                className='not-found'
                children={
                    <>
                        <span>Вишлист не найден 😥</span>
                        <Button
                            kind='primary'
                            leftIcon='plus'
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