import { useMemo,
         memo,
         useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import './styles.scss'
import { Button } from 'atoms/Button'
import { WithDropDown } from 'atoms/WithDropDown'
import { Modal } from 'atoms/Modal'

import { useDeleteWishlistMutation,
         useDeleteInvitationMutation } from 'store/apiSlice'
import { getLocationConfig } from 'store/getters'

import type { SyntheticEvent,
              RefObject } from 'react'
import type { Wishlist } from 'typings'
import type { ModalRef,
              ModalProps } from 'atoms/Modal'
import type { DropdownOption } from 'atoms/WithDropDown'


interface WishlistMenuProps {
    wishlist: Wishlist
}

interface WishlistMenuViewProps {
    dropdownOptions: DropdownOption[];
    modalRef: RefObject<ModalRef>;
    modalProps: ModalProps
}

interface TimeInfoProps {
    wishlist: Wishlist
}


const MemoizedMenuButton = memo(() => <Button className='wishlist-menu' icon='kebap' size={ 5 }/>)

const WishlistMenuView = memo(({
    dropdownOptions,
    modalRef,
    modalProps
} : WishlistMenuViewProps
) => (
    <>
        <WithDropDown
            trigger={ <MemoizedMenuButton/> }
            options={ dropdownOptions }
        />
        <Modal
            ref={ modalRef }
            {...modalProps }
        />
    </>
));

export const WishlistMenu = memo(({
    wishlist
} : WishlistMenuProps
) => {
    const navigate = useNavigate();
    const modalRef = useRef<ModalRef>(null);
    const { section,
            isInvitesSection } = getLocationConfig();

    const [ deleteWishlist ] = useDeleteWishlistMutation();
    const [ deleteInvitation ] = useDeleteInvitationMutation();
    
    function copyInvitationLink(e: SyntheticEvent) {
        e.stopPropagation();
        e.preventDefault();
        const url = window.location.origin + '/share/' + wishlist.invitationCode;
        navigator.clipboard.writeText(url)
    }
    
    const handleEdit = (e: SyntheticEvent) => {
        e.stopPropagation();
        navigate('/my-wishes/lists/' + wishlist.id + '/editing')
    }

    const handleDelete = (e: SyntheticEvent) => {
        e.stopPropagation();
        if(!wishlist?.id) return

        if(isInvitesSection) {
            deleteInvitation(wishlist.id)
        } else {
            deleteWishlist(wishlist.id)
        }

        modalRef?.current?.hideModal(e);
        navigate('/' + section + '/lists')
    }

    const tooNarrow = window.innerWidth < 375;

    const dropdownOptions = useMemo(() => {
        return isInvitesSection
            ?   [{
                    icon: 'delete' as const,
                    text: 'Отклонить приглашение',
                    onClick: (e: SyntheticEvent) => modalRef.current?.showModal(e)
                }]
            :   [{
                    icon: 'copy' as const,
                    text: `Скопировать ${ tooNarrow ? '' : 'пригласительную ' }ссылку`,
                    clickedIcon: 'ok' as const,
                    clickedText: 'Ссылка скопирована',
                    dontHideAfterClick: true,
                    onClick: copyInvitationLink,
                },{
                    icon: 'edit' as const,
                    text: 'Редактировать вишлист',
                    onClick: handleEdit
                },{
                    icon: 'delete' as const,
                    text: 'Удалить вишлист',
                    onClick: (e: SyntheticEvent) => modalRef.current?.showModal(e)
                }]
    },[
        isInvitesSection,
        handleEdit,
        copyInvitationLink
    ]);

    const modalProps = useMemo(() => ({
        header: 'Пожалуйста, подтвердите действие',
        body: isInvitesSection
            ? `Вишлист "${ wishlist.title }" будет удален из списка приглашений. Чтобы добавить его обратно, вам понадобится пригласительная ссылка.`
            : `Вишлист "${ wishlist.title }" будет удален без возможности восстановления. Включенные в него желания сохранятся.`,
        actions: [{
            icon: 'cancel' as const,
            text: 'Отмена',
            kind: 'clear' as const,
            onClick: (e: SyntheticEvent) => modalRef.current?.hideModal(e)
        }, {
            kind: 'negative primary' as const,
            icon: 'delete' as const,
            text: isInvitesSection
                ? 'Удалить приглашение'
                : 'Удалить вишлист',
            round: true,
            onClick: handleDelete
        }]
    }),[
        wishlist.title,
        isInvitesSection
    ]);

    return !!wishlist &&
        <WishlistMenuView {...{ dropdownOptions, modalRef, modalProps }}/>
});

export const TimeInfo = memo(({
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
});