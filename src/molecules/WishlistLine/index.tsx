import './styles.scss'
import { User } from 'atoms/User'
import { WishlistMenu,
         TimeInfo } from 'molecules/WishlistStuff'

import type { SyntheticEvent } from 'react'
import type { Wishlist } from 'typings'
import { findOutMobile } from 'store/responsivenessSlice'


interface WishlistHeaderProps {
    wishlist: Wishlist;
    onClick?: (e: SyntheticEvent<HTMLDivElement>) => void
}


export const WishlistLine = ({
    wishlist,
    onClick
} : WishlistHeaderProps
) => {
    const isMobile = findOutMobile();

    return (
        <div
            className='wishlist-line'
            id={ wishlist.id }
            onClick={ onClick }
        >
            <div className='user-container'>
                <User
                    id={ wishlist.author }
                    picSize={ isMobile ? 5 : 6 }
                    picOnly
                    withTooltip
                />
            </div>

            <div className='flex-container'>
                <div className='title'>
                    <div className='scroll-container'>{ wishlist.title }</div>
                </div>
            </div>
            { !isMobile && <TimeInfo {...{ wishlist }}/>}

            <WishlistMenu {...{ wishlist }}/>
        </div>
    )
}
