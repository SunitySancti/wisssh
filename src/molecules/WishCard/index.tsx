import { memo,
         useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import './styles.scss'
import { WishCover,
         WishMenu } from 'molecules/WishStuff'
import { NewWishCardIcon } from 'atoms/Icon'

import { getLocationConfig, getWishById } from 'store/getters'
import { useAppSelector } from 'store'
import { makeupLongNumber } from 'utils'

import type { Wish,
              WishId } from 'typings'


interface WishCardCommonProps {
    value?: WishId[];
    onChange?: (newValue: WishId[]) => unknown;
}

interface WishCardProps extends WishCardCommonProps {
    id: WishId | 'new-wish';
}

interface WishCardModelProps extends WishCardCommonProps {
    id: WishId;
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
    ...props
} : WishCardProps
) => {
    const { section, mode, wishlistId } = getLocationConfig();
    const navigate = useNavigate();
    const handleClick = () => {
        console.log(['', section, mode, wishlistId, 'new-wish'].join('/'))
        navigate(['', section, mode, wishlistId, 'new-wish'].join('/'))
    }

    return id === 'new-wish'
        ? <div 
            className='wishcard fade-in new-wish-button'
            onClick={ handleClick }
          >
            <NewWishCardIcon/>
            Новое желание
          </div>
        : <WishCardModel {...{ id, ...props }}/>
}

export const WishCardModel = ({
    id,
    value,
    onChange
} : WishCardModelProps
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


const WishCardView = memo(({
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
                    <span className='title'>{
                        wish.title
                    }</span>
                }
                { !!wish.price && !isMobile &&
                    <span className='price'>{
                        makeupLongNumber(wish.price) + currency
                    }</span>
                }
            </div>
            { isSelected &&
                <div className='selection-mask'/>
            }
        </div>
    );
})
