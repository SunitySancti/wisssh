import './styles.scss'
import { User } from 'atoms/User'
import { WithTooltip } from 'atoms/WithTooltip'
import { WishlistHeaderPointer } from 'atoms/Icon'
import { WishlistMenu } from 'molecules/WishlistStuff/index.jsx'

import { getUserById } from 'store/getters'

import type { Wishlist } from 'typings'


interface WishlistHeaderProps {
    wishlist: Wishlist;
    onWishlistPage?: boolean;
    [prop: string]: unknown
}


export const WishlistHeader = ({
    wishlist,
    onWishlistPage,
    ...rest
} : WishlistHeaderProps
) => {
    const author = getUserById(wishlist.author);

    const TimeInfo = () => {
        if(!wishlist.date) return null;

        const eventTS = new Date( wishlist.date[2], wishlist.date[1] - 1, wishlist.date[0]).getTime();
        const nowTS = Date.now();
        const daysToEvent = Math.ceil((eventTS - nowTS)/86400000);

        if((daysToEvent > 2) && (daysToEvent < 7)) {
            const lastNum = parseInt(daysToEvent.toString().at(-1)!);
            const ending = (lastNum < 5) ? 'дня' : 'дней';

            return (
                <div className='time-info future'>
                    <span className='small'>через</span>
                    <span className='big'>{ daysToEvent }</span>
                    <span className='small'>{ ending }</span>
                </div>
            );
        } else if(daysToEvent === 7) {
            return (
                <div className='time-info future'>
                    <span className='small'>Через неделю</span>
                </div>
        )} else if((daysToEvent < 0) || (daysToEvent > 7)) {
            const correctedDate = wishlist.date.map(num => {
                const str = String(num);
                return str.length === 1 ? '0' + str : str
            })
            return (
                <div className={`time-info ${ daysToEvent < 0 ? 'past' : 'future' }`}>
                    <span className='small'>{ correctedDate.join('.') }</span>
                </div>
        )} else {
            const text = daysToEvent === 0
                ? 'Сегодня' : daysToEvent === 1
                ? 'Завтра' : 'Послезавтра'

            return (
                <div className='time-info soon'>
                    <span className='big'>{ text }</span>
                </div>
            );
        }
    }

    return (
        <div
            className={ 'wishlist-header' + (onWishlistPage ? ' selected on-wishlist-page' : '') }
            id={ wishlist.id }
            { ...rest }
        >
            <WithTooltip
                trigger={ <User user={ author } picSize={ 6 } picOnly />}
                text={ author ? author.name : '' }
            />
            

            <div className='wishlist-body'>
                <div className='preview-container'>
                    <div className='title-container'>
                        <WishlistHeaderPointer/>
                        <div className='title'>{ wishlist.title }</div>
                    </div>
                    <span className='description line'>{ wishlist.description }</span>
                    <TimeInfo/>
                </div>
                { wishlist &&
                    <span className='description full'>{ wishlist.description }</span>
                }
            </div>


            <WishlistMenu {...{ wishlist }}/>
        </div>
    );
}
