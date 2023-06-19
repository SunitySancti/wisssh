import   React,
       { useMemo } from 'react'
import { useNavigate,
         useLocation } from 'react-router-dom'

import './styles.scss'
import { User } from 'atoms/User'
import { WishlistLinePointer } from 'atoms/Icon'
import { Button } from 'atoms/Button'
import { WithDropDown } from 'atoms/WithDropDown'

import { getUserById } from 'store/getters'


export const WishlistLine = ({
    wishlist,
    onWishlistPage,
    setAndOpenDeletingModal,
    isDeleting,
    ...rest
}) => {
    const navigate = useNavigate();
    const isInvite = useLocation().pathname.split('/').at(1) === 'my-invites';
    const author = getUserById(wishlist?.author);

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

    // DROPDOWN SETTINGS //

    function copyInvitationLink(e) {
        e.stopPropagation();
        e.preventDefault();
        const url = window.location.origin + '/share/' + wishlist.invitationCode;
        navigator.clipboard.writeText(url)
    }

    const dropdownOptions =  [{
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
        text: isInvite
            ? 'Удалить из списка приглашений'
            : 'Удалить вишлист',
        onClick: (e) => setAndOpenDeletingModal(e, wishlist)
    }];

    const classes = useMemo(() => {
        let result = 'wishlist-line';
        if(onWishlistPage) result += ' selected on-wishlist-page'
        if(isDeleting) result += ' deleted'
        return result
    },[ onWishlistPage, isDeleting ]);

    return (
        <div
            className={ classes }
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
                options={ dropdownOptions }
            />
        </div>
    );
}
