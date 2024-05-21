import './styles.scss'
import { User } from 'atoms/User'
import { LineContainer } from 'containers/LineContainer'
import { WishlistMenu,
         TimeInfo } from 'molecules/WishlistStuff'

import type { Wishlist } from 'typings'
import { findOutMobile } from 'store/responsivenessSlice'



interface WishlistHeaderProps {
    wishlist: Wishlist
}


export const WishlistHeader = ({
    wishlist
} : WishlistHeaderProps
) => {
    const isMobile = findOutMobile();

    return (
        <div
            className='wishlist-header'
            id={ wishlist.id }
        >
            <LineContainer className='align-center'>
                <User
                    id={ wishlist.author }
                    picSize={ isMobile ? 5 : 6 }
                    withTooltip
                />
                <div className='space'/>
                <TimeInfo {...{ wishlist }}/>
                { !isMobile && <WishlistMenu {...{ wishlist }}/>}
            </LineContainer>

            <div className='description'>{ wishlist.description }</div>
        </div>
    );
}
