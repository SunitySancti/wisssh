import   React,
       { useEffect,
         useRef,
         useCallback,
         useState } from 'react'
import { Navigate,
         useLocation,
         useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import './styles.scss'
import { WishCard } from 'molecules/WishCard'
import { WishlistLine } from 'molecules/WishlistLine'
import { MultiColumnLayout } from 'containers/MultiColumnLayout'
import { Modal } from 'atoms/Modal'
import { WishPreloader } from 'atoms/Preloaders'

import { getCurrentUser,
         getWishlistById,
         getWishesByWishlistId,
         getLoadingStatus } from 'store/getters'
import { promoteImages } from 'store/imageSlice'
import { useDeleteWishlistMutation,
         useDeleteInvitationMutation } from 'store/apiSlice'


export const WishlistPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation().pathname;
    const [, section, , wishlistId] = location.split('/');

    const { user,
            userHasLoaded } = getCurrentUser();
    const { awaitingUserWishes,
            awaitingFriendWishes,
            awaitingUserWishlists,
            awaitingInvites } = getLoadingStatus();
    const isLoading = awaitingUserWishes || awaitingFriendWishes || awaitingUserWishlists || awaitingInvites;
    const wishlist = getWishlistById(wishlistId);
    const wishes = getWishesByWishlistId(wishlistId);
    const wishIds = wishes?.map(wish => wish.id);

    // REDIRECT IF WISHLIST NOT FOUND

    useEffect(() => {
        if(!userHasLoaded) return
        if(section === 'my-wishes' && !user.wishlists.includes(wishlistId)) {
            navigate('/' + section + '/lists', { replace: true })
        }
        if(section === 'my-invites' && !user.invites.includes(wishlistId)) {
            navigate('/' + section + '/lists', { replace: true })
        }
    },[ userHasLoaded, section, wishlistId ]);

    // PROMOTE IMAGES

    useEffect(() => {
        if(wishIds instanceof Array && wishIds?.length) {
            dispatch(promoteImages(wishIds))
        }
    },[ wishIds?.length ]);
    
    // MODAL SETTINGS //
    
    // const isInvite = location.split('/').at(1) === 'my-invites';
    // const deletingModalRef = useRef(null);
    // const [wishlistForDelete, setWishlistForDelete] = useState(null);
    
    // const [deleteWishlist] = useDeleteWishlistMutation();
    // const [deleteInvitation] = useDeleteInvitationMutation();

    // const setAndOpenDeletingModal = useCallback((e, wishlist) => {
    //     e.stopPropagation();
    //     e.preventDefault();

    //     setWishlistForDelete(wishlist)
    //     deletingModalRef?.current?.showModal(e)
    // },[ deletingModalRef?.current, setWishlistForDelete ])

    // const handleDelete = useCallback((e) => {
    //     e.stopPropagation();
    //     e.preventDefault();
    //     if(!wishlistForDelete?.id) return

    //     if(isInvite) {
    //         deleteInvitation(wishlistForDelete.id)
    //     } else {
    //         deleteWishlist(wishlistForDelete.id)
    //     }
        navigate('/' + section + '/lists', { state: {
            processingId: wishlistForDelete.id,
        }})
    },[ wishlistForDelete?.id ]);

    // const modalProps = {
    //     header: 'Пожалуйста, подтвердите действие',
    //     body: isInvite
    //         ? `Вишлист "${ wishlistForDelete?.title }" будет удален из списка приглашений. Чтобы добавить его обратно, вам понадобится пригласительная ссылка.`
    //         : `Вишлист "${ wishlistForDelete?.title }" будет удален без возможности восстановления. Включенные в него желания сохранятся.`,
    //     actions: [{
    //         icon: 'cancel',
    //         text: 'Отмена',
    //         onClick: (e) => deletingModalRef?.current?.hideModal(e)
    //     }, {
    //         kind: 'negative primary',
    //         icon: 'delete',
    //         text: isInvite
    //             ? 'Удалить приглашение'
    //             : 'Удалить вишлист',
    //         onClick: handleDelete
    //     }]
    // }

    return ( isLoading
        ?   <div className='wishlist-page'>
                <WishPreloader isLoading/>
            </div>
        :   wishlist
        ?   <div className='wishlist-page'>
                <WishlistLine
                    {...{ wishlist, setAndOpenDeletingModal }}
                    onWishlistPage
                />
                <MultiColumnLayout
                    Card={ WishCard }
                    data={ wishes }
                />
                <Modal
                    ref={ deletingModalRef }
                    {...modalProps }
                />
            </div>
        :   <Navigate
                to={ '/' + section + '/lists' }
                replace
            />
    );
}
