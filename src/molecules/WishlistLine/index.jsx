import   React from 'react'
import { useNavigate } from 'react-router-dom'

import './styles.scss'
import { User } from 'atoms/User'
import { WishlistLinePointer } from 'atoms/Icon'
import { Button } from 'atoms/Button'
import { WithDropDown } from 'atoms/WithDropDown'

import { getCurrentUser,
         getUserById } from 'store/getters'
import { useDeleteWishlistMutation } from 'store/apiSlice'


export const WishlistLine = ({
    wishlist,
    onWishlistPage,
    ...rest
}) => {
    const navigate = useNavigate();
    const author = getUserById(wishlist?.author);
    const { user } = getCurrentUser();

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

    function copyInvitationLink(e) {
        e.stopPropagation();
        e.preventDefault();
        const url = window.location.origin + '/share/' + wishlist.invitationCode;
        navigator.clipboard.writeText(url)
    }

    const wishlistOptions =  [{
        icon: 'copy',
        text: 'Копировать ссылку',
        clickedIcon: 'ok',
        clickedText: 'Ссылка скопирована',
        dontHideAfterClick: true,
        onClick: copyInvitationLink,
    },{
        icon: 'edit',
        text: 'Редактировать',
        onClick: () => navigate('/my-wishes/lists/' + wishlist.id + '/editing')
    },{
        icon: 'delete',
        text: 'Удалить вишлист',
        // onClick: deleteWishlist
    }];

    const inviteOptions = [{
        icon: 'delete',
        text: 'Удалить из списка приглашений',
        // onClick: deleteInvite
    }];


    return (
        <div
            className={ onWishlistPage ? 'wishlist-line selected on-wishlist-page' : 'wishlist-line' }
            id={ wishlist?.id }
            { ...rest }
        >
            <User user={ author } picSize={ 6 } picOnly />

            <div className='title-container'>
                <WishlistLinePointer/>
                <div className='title'>{ wishlist?.title }</div>
            </div>

            <span className='description'>{ wishlist?.description }</span>

            <TimeInfo/>
            <WithDropDown
                trigger={ <Button icon='kebap' size={ 4 }/> }
                options={ (user?.id === author?.id)
                    ? wishlistOptions
                    : inviteOptions
                }
            />
        </div>
    );
}
