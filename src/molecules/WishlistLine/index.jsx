import   React from 'react'
import { useNavigate } from 'react-router-dom'

import './styles.scss'
import { User } from 'atoms/User'
import { WishlistLinePointer } from 'atoms/Icon'
import { IconButton } from 'atoms/IconButton'
import { WithDropDown } from 'atoms/WithDropDown'

import { getUserById } from 'store/getters'
import { useDeleteWishlistMutation } from 'store/apiSlice'

export const WishlistLine = ({
    wishlist,
    onWishlistPage,
    ...rest
}) => {
    const navigate = useNavigate();
    const user = getUserById(wishlist?.author);

    const TimeInfo = () => {
        if(!wishlist?.date) return null;

        const eventTS = new Date( wishlist?.date[2], wishlist?.date[1] - 1, wishlist?.date[0]).getTime();
        const nowTS = Date.now();
        const daysToEvent = Math.ceil((eventTS - nowTS)/86400000)

        // проверка на число:

        if(!(String(parseInt(daysToEvent, 10)) === String(daysToEvent))) return null;

        if((daysToEvent > 2) && (daysToEvent < 7)) {
            const lastNum = parseInt(daysToEvent.toString().at(-1));
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
            const status = daysToEvent < 0
                ? 'past' : 'future'

            return (
                <div className={`time-info ${status}`}>
                    <span className='small'>{ wishlist?.date.join('.') }</span>
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

    // set dropdown:

    function deleteWishlist(e) {
        e.stopPropagation();
        dispatch(deleteWishlistById(wishlist?.id));
        const prefix = wishlist?.author === user.id
            ? '/my-wishes'
            : '/my-invites'
        navigate(`${prefix}/lists/`);
    }

    const menuOptions = [{
        icon: 'edit',
        text: 'Редактировать',
        onClick: () => navigate(location + '/editing')
    }, {
        icon: 'delete',
        text: 'Удалить вишлист',
        onClick: deleteWishlist
    }]


    return (
        <div
            className={ onWishlistPage ? 'wishlist-line selected on-wishlist-page' : 'wishlist-line' }
            id={ wishlist?.id }
            { ...rest }
        >
            <User
                user={ user }
                picSize='6'
                isPicOnly
            />
            <div className='title-container'>
                <WishlistLinePointer/>
                <div className='title'>{ wishlist?.title }, {wishlist?.author}, {user.name}</div>
            </div>
            <span className='description'>
                { wishlist?.description }
            </span>
            <TimeInfo/>
            <WithDropDown
                trigger={ <IconButton
                    icon='kebap'
                    size={ 4 }
                /> }
                options={ menuOptions }
            />
        </div>
    );
}