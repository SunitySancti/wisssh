import './styles.scss'
import { User } from 'atoms/User'
import { WishlistHeaderPointer } from 'atoms/Icon'
import { WishlistMenu } from 'molecules/WishlistStuff'
import { Plug } from 'atoms/Plug'

import type { RefObject,
              SyntheticEvent } from 'react'
import type { Wishlist } from 'typings'


interface TimeInfoProps {
    wishlist: Wishlist
}

interface WishlistHeaderProps {
    wishlist: Wishlist | 'past-events-header' | 'no-actual-events';
    onWishlistPage?: boolean;
    onClick?: (e: SyntheticEvent<HTMLDivElement>) => void;
    headerRef?: RefObject<HTMLDivElement>;
    animationStep?: 0 | 1 | 2 | 3;
    isSelected?: boolean;
    topOffset?: number
}


const TimeInfo = ({
    wishlist
} : TimeInfoProps
) => {
    if(!wishlist.date) return null;

    const eventTS = new Date( wishlist.date[2], wishlist.date[1] - 1, wishlist.date[0]).getTime();
    const nowTS = Date.now();
    const daysToEvent = Math.ceil((eventTS - nowTS)/86400000);
    const dateString = wishlist.date.map(n => (n < 10) ? '0' + n : n).join('.');

    const isPast = daysToEvent < 0;
    const isToday = daysToEvent === 0;
    const isTomorrow = daysToEvent === 1;
    const isSoon = isToday || isTomorrow || daysToEvent === 2;
    const isUpToWeek = daysToEvent >=3 && daysToEvent <=6;
    const isInWeek = daysToEvent === 7;

    return (
        <div className={ 'time-info ' + (isSoon ? 'soon' : isPast ? 'past' : 'future') }>
            { isSoon
                ?   <span className='big'>{ isToday ? 'Сегодня' : isTomorrow ? 'Завтра' : 'Послезавтра' }</span>
                :   isUpToWeek
                ?   <>
                        <span className='small'>через</span>
                        <span className='big'>{ daysToEvent }</span>
                        <span className='small'>{ (daysToEvent % 10 <= 4) ? 'дня' : 'дней' }</span>
                    </>
                :   <span className='small'> { isInWeek ? 'Через неделю' : dateString }</span>
            }
        </div>
    )
}

export const WishlistHeader = ({
    wishlist,
    onWishlistPage,
    onClick,
    headerRef,
    animationStep,
    isSelected,
    topOffset
} : WishlistHeaderProps
) => {
    let classes = '';
    if(onWishlistPage) {
        classes = 'selected on-wishlist-page'
    } else {
        if(animationStep === 1) {
            classes = isSelected ? 'selected' : 'hidden'
        }
        if(animationStep === 2) {
            classes = isSelected ? 'selected' : 'invisible'
        }
        if(animationStep === 3) {
            classes = isSelected ? 'selected broad' : 'invisible'
        }
    }

    const styles = (headerRef?.current && animationStep === 2 && topOffset)
        ? { top: headerRef?.current?.offsetTop - topOffset + 'px' }
        : undefined

    switch(wishlist) {
        case 'no-actual-events':
            return (
                <Plug
                    message='Нет предстоящих событий'
                    className={ classes }
                />
            )
        case 'past-events-header':
            return (
                <div className={ 'group-header ' + classes }>
                    <span>Прошедшие события</span>
                </div>
            )
        default:
            return (
                <div
                    className={ 'wishlist-header ' + classes }
                    style={ styles }
                    id={ wishlist.id }
                    onClick={ onClick }
                    ref={ headerRef }
                >
                    <User
                        id={ wishlist.author }
                        picSize={ 6 }
                        picOnly
                        withTooltip
                    />

                    <div className='wishlist-body'>
                        <div className='preview-container'>
                            <div className='title-container'>
                                <WishlistHeaderPointer/>
                                <div className='title'>{ wishlist.title }</div>
                            </div>
                            <span className='description line'>{ wishlist.description }</span>
                            <TimeInfo {...{ wishlist }}/>
                        </div>
                        { wishlist &&
                            <span className='description full'>{ wishlist.description }</span>
                        }
                    </div>

                    <WishlistMenu {...{ wishlist }}/>
                </div>
            )

    }

    // return (wishlist === 'past-events-header')
    //     ?   <div className={ 'group-header ' + classes }>
    //             <span>Прошедшие события</span>
    //         </div>
    //     :   <div
    //             className={ 'wishlist-header ' + classes }
    //             style={ styles }
    //             id={ wishlist.id }
    //             onClick={ onClick }
    //             ref={ headerRef }
    //         >
    //             <User
    //                 id={ wishlist.author }
    //                 picSize={ 6 }
    //                 picOnly
    //                 withTooltip
    //             />

    //             <div className='wishlist-body'>
    //                 <div className='preview-container'>
    //                     <div className='title-container'>
    //                         <WishlistHeaderPointer/>
    //                         <div className='title'>{ wishlist.title }</div>
    //                     </div>
    //                     <span className='description line'>{ wishlist.description }</span>
    //                     <TimeInfo {...{ wishlist }}/>
    //                 </div>
    //                 { wishlist &&
    //                     <span className='description full'>{ wishlist.description }</span>
    //                 }
    //             </div>

    //             <WishlistMenu {...{ wishlist }}/>
    //         </div>
}
