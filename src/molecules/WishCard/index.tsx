import { memo,
         useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import './styles.scss'
import { WishCover,
         WishMenu } from 'molecules/WishStuff'

import { getLocationConfig } from 'store/getters'
import { askMobile } from 'store/responsivenessSlice'

import type { Wish,
              WishId } from 'typings'


interface WishCardProps {
    data: Wish;
    value?: WishId[];
    onChange?: (newValue: WishId[]) => unknown
}


export const WishCard = memo(({
    data: wish,
    value,
    onChange
} : WishCardProps
) => {
    // METHODS //
    const navigate = useNavigate();
    const { location,
            isInvitesSection } = getLocationConfig();

    // RESPONSIVENESS //
    const isMobile = askMobile();
    
    // ELEMENTS //
    const currency = wish.currency==='rouble' ? ' ₽'
                   : wish.currency==='dollar' ? ' $'
                   : wish.currency==='euro'   ? ' €' : '';

    // INPUT OR VIEW FEATURES //
    const isInput = !!value && !!onChange;
    const selected = isInput && value.includes(wish.id);
    
    const classes = 'wishcard fade-in' + (isInput ? ' input' : ' view') + (selected ? ' selected' : '');

    const handleCardClick = useCallback(() => {
        if(isInput) {
            const result = selected
                ? value.filter(id => id != wish.id)
                : value.concat([wish.id]);
            onChange(result);
        } else {
            navigate(location + '/' + wish.id)
        }
    },[ isInput,
        selected,
        location,
        value?.length
    ]);

    return (
        <div
            className={ classes }
            key={ wish.id }
            onClick={ handleCardClick }
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
            { selected &&
                <div className='selection-mask'/>
            }
        </div>
    );
})
