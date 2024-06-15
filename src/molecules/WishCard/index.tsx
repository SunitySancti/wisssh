import { memo,
         useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import './styles.scss'
import { WishCover,
         WishMenu } from 'molecules/WishStuff'

import { getLocationConfig, getWishById } from 'store/getters'
import { useAppSelector } from 'store'

import type { Wish,
              WishId } from 'typings'


interface WishCardProps {
    id: WishId;
    value?: WishId[];
    onChange?: (newValue: WishId[]) => unknown
}
interface WishCardViewProps {
    wish: Wish;
    isInput: boolean;
    isSelected: boolean;
    isMobile: boolean;
    handleClick(): void
}

export const WishCard = ({
    id,
    value,
    onChange
} : WishCardProps
) => {
    // RESPONSIVENESS //
    const { isMobile } = useAppSelector(state => state.responsiveness);

    // NAVIGATION //
    const navigate = useNavigate();
    const { location } = getLocationConfig();

    // DATA //
    const wish = getWishById(id);

    // INPUT OR VIEW FEATURES //
    const isInput = !!value && !!onChange;
    const isSelected = isInput && value.includes(id);

    const handleClick = useCallback(() => {
        if(isInput) {
            const result = isSelected
                ? value.filter(id => id != id)
                : value.concat([id]);
            onChange(result);
        } else {
            navigate(location + '/' + id)
        }
    },[ isInput,
        isSelected,
        location,
        value?.length
    ]);

    return wish &&
        <WishCardView {...{
            wish,
            isInput,
            isSelected,
            isMobile,
            handleClick
        }}/>
}


export const WishCardView = memo(({
    wish,
    isInput,
    isSelected,
    isMobile,
    handleClick
} : WishCardViewProps
) => {
    const { isInvitesSection } = getLocationConfig();
    
    const classes = ['wishcard', 'fade-in'];
    if(isInput) {
        classes.push('input')
    } else {
        classes.push('view')
    }
    if(isSelected) {
        classes.push('selected')
    }
    if(isInvitesSection) {
        classes.push('of-friend')
    }
    const currency = wish.currency==='rouble' ? ' ₽'
                   : wish.currency==='dollar' ? ' $'
                   : wish.currency==='euro'   ? ' €' : '';

    return (
        <div
            className={ classes.join(' ') }
            key={ wish.id }
            onClick={ handleClick }
        >
            <WishCover wish={ wish } withUserPic={ !isMobile && isInvitesSection } onCard/>
            { !isMobile && !isInput && <WishMenu wish={ wish }/> }
            <div className='wishcard-content'>
                { wish.title &&
                    <span className='title'>{ wish.title }</span>
                }
                { !!wish.price && !isMobile &&
                    <span className='price'>{ wish.price + currency }</span>
                }
            </div>
            { isSelected &&
                <div className='selection-mask'/>
            }
        </div>
    );
})
