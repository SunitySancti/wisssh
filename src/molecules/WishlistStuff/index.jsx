import   React,
       { useMemo,
         useRef } from 'react'
import { useNavigate,
         useLocation } from 'react-router-dom'

import { Button } from 'atoms/Button'
import { WithDropDown } from 'atoms/WithDropDown'
import { Modal } from 'atoms/Modal'

import { useDeleteWishlistMutation,
         useDeleteInvitationMutation } from 'store/apiSlice'


export const WishlistMenu = ({ wishlist }) => {
    const navigate = useNavigate();
    const deleteModalRef = useRef(null);
    const section = useLocation().pathname.split('/').at(1);
    const isInvite = section === 'my-invites';

    const [ deleteWishlist ] = useDeleteWishlistMutation();
    const [ deleteInvitation ] = useDeleteInvitationMutation();
    
    function copyInvitationLink(e) {
        e.stopPropagation();
        e.preventDefault();
        const url = window.location.origin + '/share/' + wishlist.invitationCode;
        navigator.clipboard.writeText(url)
    }

    const handleDelete = (e) => {
        e.stopPropagation();
        if(!wishlist?.id) return

        if(isInvite) {
            deleteInvitation(wishlist.id)
        } else {
            deleteWishlist(wishlist.id)
        }

        deleteModalRef?.current?.hideModal(e);
        navigate('/' + section + '/lists')
    }

    const dropdownOptions = useMemo(() => ([{
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
        onClick: (e) => deleteModalRef?.current?.showModal(e)
    }]),[
        wishlist,
        navigate,
        copyInvitationLink
    ]);

    const deleteModalProps = {
        header: 'Пожалуйста, подтвердите действие',
        body: isInvite
            ? `Вишлист "${ wishlist?.title }" будет удален из списка приглашений. Чтобы добавить его обратно, вам понадобится пригласительная ссылка.`
            : `Вишлист "${ wishlist?.title }" будет удален без возможности восстановления. Включенные в него желания сохранятся.`,
        actions: [{
            icon: 'cancel',
            text: 'Отмена',
            onClick: (e) => deleteModalRef?.current?.hideModal(e)
        }, {
            kind: 'negative primary',
            icon: 'delete',
            text: isInvite
                ? 'Удалить приглашение'
                : 'Удалить вишлист',
            onClick: handleDelete
        }]
    }

    return (
        <>
            <WithDropDown
                trigger={ <Button icon='kebap' size={ 4 }/> }
                options={ dropdownOptions }
            />
            <Modal
                ref={ deleteModalRef }
                {...deleteModalProps }
            />
        </>
    )
}
