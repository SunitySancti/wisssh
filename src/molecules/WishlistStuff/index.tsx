import { useMemo,
         useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from 'atoms/Button'
import { WithDropDown } from 'atoms/WithDropDown'
import { Modal } from 'atoms/Modal'

import { useDeleteWishlistMutation,
         useDeleteInvitationMutation } from 'store/apiSlice'
import { getLocationConfig } from 'store/getters'

import type { SyntheticEvent } from 'react'
import { Wishlist } from 'typings'
import { ModalRef } from 'atoms/Modal'


interface WishlistMenuProps {
    wishlist: Wishlist
}


export const WishlistMenu = ({
    wishlist
} : WishlistMenuProps
) => {
    const navigate = useNavigate();
    const deleteModalRef = useRef<ModalRef>(null);
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

        deleteModalRef?.current?.hideModal(e);
        navigate('/' + section + '/lists')
    }

    const dropdownOptions = useMemo(() => {
        return isInvitesSection
            ?   [{
                    icon: 'delete',
                    text: 'Удалить из списка приглашений',
                    onClick: (e: SyntheticEvent) => deleteModalRef.current?.showModal(e)
                }]
            :   [{
                    icon: 'copy',
                    text: 'Скопировать пригласительную ссылку',
                    clickedIcon: 'ok',
                    clickedText: 'Ссылка скопирована',
                    dontHideAfterClick: true,
                    onClick: copyInvitationLink,
                },{
                    icon: 'edit',
                    text: 'Редактировать вишлист',
                    onClick: handleEdit
                },{
                    icon: 'delete',
                    text: 'Удалить вишлист',
                    onClick: (e: SyntheticEvent) => deleteModalRef.current?.showModal(e)
                }]
    },[
        isInvitesSection,
        handleEdit,
        copyInvitationLink
    ]);

    const deleteModalProps = {
        header: 'Пожалуйста, подтвердите действие',
        body: isInvitesSection
            ? `Вишлист "${ wishlist.title }" будет удален из списка приглашений. Чтобы добавить его обратно, вам понадобится пригласительная ссылка.`
            : `Вишлист "${ wishlist.title }" будет удален без возможности восстановления. Включенные в него желания сохранятся.`,
        actions: [{
            icon: 'cancel' as const,
            text: 'Отмена',
            onClick: (e: SyntheticEvent) => deleteModalRef.current?.hideModal(e)
        }, {
            kind: 'negative primary' as const,
            icon: 'delete' as const,
            text: isInvitesSection
                ? 'Удалить приглашение'
                : 'Удалить вишлист',
            onClick: handleDelete
        }]
    }

    return wishlist
        ?   <>
                <WithDropDown
                    trigger={ <Button icon='kebap' size={ 4 }/> }
                    options={ dropdownOptions }
                />
                <Modal
                    ref={ deleteModalRef }
                    {...deleteModalProps }
                />
            </>
        : null
}
