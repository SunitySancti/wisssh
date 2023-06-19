import   React,
       { useMemo,
         useRef } from 'react'
import { useNavigate,
         useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

import './styles.scss'
import { KebapBackground } from 'atoms/Icon'
import { Button } from 'atoms/Button'
import { User } from 'atoms/User'
import { StarRating } from 'inputs/StarRating'
import { WishPreloader } from 'atoms/Preloaders'
import { WithDropDown } from 'atoms/WithDropDown'
import { Modal } from 'atoms/Modal'

import { getCurrentUser,
         getUserById } from 'store/getters'
import { usePostWishMutation,
         useDeleteWishMutation,
         useCompleteWishMutation,
         useUncompleteWishMutation,
         useReserveWishMutation,
         useUnreserveWishMutation } from 'store/apiSlice'
import { copyWishCover } from 'store/imageSlice'
import { generateUniqueId } from 'utils'


export const WishCover = ({ wish, withUserPic }) => {
    const author = getUserById(wish?.author);
    const imageURL = useSelector(state => state.images?.imageURLs[wish?.id]);
    const isLoading = useSelector(state => state.images?.loading[wish?.id]);
    
    return (
        <div
            className='wish-cover'
            style={{ aspectRatio: wish?.imageAR || 1 }}
        >
            <StarRating readOnly rating={ wish?.stars }/>
            { withUserPic &&
                <User
                    user={ author }
                    picSize={ 6 }
                    picOnly
                    tooltip={ `@ ${author?.name}`}
                    onClick={e => e.stopPropagation()}
                />
            }
            { imageURL
                ? <img src={ imageURL }/>
                : <WishPreloader isLoading={ isLoading }/>
            }
        </div>
    )
}

export const WishButton = ({ wish }) => {
    const isCurrentUserWish = useLocation().pathname.split('/').at(1) === 'my-wishes';

    const { user } = getCurrentUser();
    const [ completeWish, completeWishReturn ] = useCompleteWishMutation();
    const [ uncompleteWish, uncompleteWishReturn ] = useUncompleteWishMutation();
    const [ reserveWish, reserveWishReturn ] = useReserveWishMutation();
    const [ unreserveWish, unreserveWishReturn ] = useUnreserveWishMutation();

    const buttonProps = useMemo(() => {
        if(!wish?.id) return {}

        if(wish.isCompleted) {  // completed wishes of any user
            // Для желания текущего юзера добавить отмену исполнения
            return {
                icon: 'ok',
                text: 'Желание исполнено',
                disabled: true,
            }
        } else if(isCurrentUserWish) {  // actual and reserved wishes of current user
            return {
                icon: 'ok',
                text: 'Отметить исполненным',
                onClick: () => completeWish(wish.id),
            }
        } else if(!wish.reservedBy) {   // actual wishes of other users
            return {
                icon: 'present',    // Заменить на magicWand
                text: 'Исполнить желание',
                onClick: () => reserveWish(wish.id),
            }
        } else if(wish.reservedBy === user?.id) {
            // Добавить отмену резервирования
            return {
                icon: 'star',   // Заменить на processing
                text: 'Вы исполняете это желание',
                disabled: true,
            }
        } else {
            return {
                icon: 'lock',
                text: 'Зарезервировано',                
                disabled: true,
            }
        }
    });

    return <Button {...buttonProps }/>
}

export const WishMenu = ({ wish }) => {
    const navigate = useNavigate();
    const location = useLocation().pathname;
    const [, section, mode, tabOrWishlistId ] = location.split('/');
    const isCurrentUserWish = section === 'my-wishes';

    const { user } = getCurrentUser();
    const deleteModalRef = useRef(null);
    const uncompleteModalRef = useRef(null);

    const [ postWish, postWishReturn ] = usePostWishMutation();
    const [ deleteWish, deleteWishReturn ] = useDeleteWishMutation();
    const [ completeWish, completeWishReturn ] = useCompleteWishMutation();
    const [ uncompleteWish, uncompleteWishReturn ] = useUncompleteWishMutation();
    const [ reserveWish, reserveWishReturn ] = useReserveWishMutation();
    const [ unreserveWish, unreserveWishReturn ] = useUnreserveWishMutation();

    const handleCopy = async (e) => {
        e.stopPropagation();
        const newId = await generateUniqueId();
        if(!wish?.id || !user?.id || typeof newId !== 'string' || newId.length !== 6) return;

        const newWish = {
            ...wish,
            id: newId,
            author: user.id,
            inWishlists: [],
            reservedBy: '',
            isCompleted: false
        }
        postWish(newWish);
        if(wish.imageExtension) {
            dispatch(copyWishCover({
                sourceId: wish.id,
                targetId: newWish.id,
                extension: wish.imageExtension
            }))
        }
        navigate('/my-wishes/items/actual/' + newWish.id)
    }

    const handleDelete = (e) => {
        e.stopPropagation();
        if(!wish?.id) return

        deleteWish(wish.id);
        deleteModalRef?.current?.hideModal(e);
        navigate(['/my-wishes', mode, tabOrWishlistId].join('/'),{ replace: true })
    }

    const handleComplete = (e) => {
        e.stopPropagation();
        if(!wish?.id) return

        completeWish(wish.id);
        navigate('/redirect',{ state:{ to: location }})
    }

    const handleActualize = (e) => {
        e.stopPropagation();
        if(!wish?.id) return

        uncompleteWish(wish.id);
        uncompleteModalRef?.current?.hideModal(e);
        navigate('/redirect',{ state:{ to: location }})
    }

    const dropdownOptions = useMemo(() => {
        if(!wish?.id || !user?.id) {
            return [{
                icon: 'change',
                text: 'Обновить страницу',
                onClick: () => window.location.reload()
            }]
        }

        let result = [];
        if(isCurrentUserWish) {
            result = [{
                icon: 'edit',
                text: 'Редактировать',
                onClick: () => navigate('/my-wishes/items/' + wish.id + '/editing')
            },{
                icon: 'copy',
                text: 'Создать копию',
                onClick: handleCopy
            },{
                icon: 'delete',
                text: 'Удалить желание',
                onClick: (e) => deleteModalRef?.current?.showModal(e)
            }];
            if(wish.isCompleted) {
                result.push({
                    icon: 'undo',
                    text: `Актуализировать`,
                    onClick: (e) => uncompleteModalRef?.current?.showModal(e)
                })
            } else {
                result.push({
                    icon: 'ok',
                    text: 'Отметить исполненным',
                    onClick: handleComplete,
                })
            }
        } else {
            result = [{
                icon: 'copy',
                text: 'Копировать в мои желания',
                onClick: handleCopy
            }];
            if(!wish.isCompleted) {
                if(!wish.reservedBy) {
                    result.push({
                        icon: 'present',    // Заменить на magicWand
                        text: 'Исполнить желание',
                        onClick: () => reserveWish(wish.id),
                    })
                } else if(wish.reservedBy === user.id) {
                    result.push({
                        icon: 'cancel',
                        text: 'Отменить резервирование',
                        onClick: () => unreserveWish(wish.id),
                    },{
                        icon: 'ok',
                        text: 'Желание исполнено!',
                        onClick: handleComplete,
                    })
                }
            }
        }

        return result
    },[ isCurrentUserWish,
        wish?.id,
        wish?.isCompleted
    ]);

    const deleteModalProps = {
        header: 'Пожалуйста, подтвердите действие',
        body: `Желание "${ wish?.title }" будет удалено без возможности восстановления.`,
        actions: [{
            icon: 'cancel',
            text: 'Отмена',
            onClick: (e) => deleteModalRef?.current?.hideModal(e)
        }, {
            kind: 'negative primary',
            icon: 'delete',
            text: 'Удалить желание',
            onClick: handleDelete
        }]
    }

    const uncompleteModalProps = {
        header: 'Пожалуйста, подтвердите действие',
        body: `Не рекомендуется актуализировать желание, если оно было исполнено. Если вы хотите создать ещё одно такое же желание, используйте "Создать копию"`,
        actions: [{
            icon: 'cancel',
            text: 'Отмена',
            onClick: (e) => uncompleteModalRef?.current?.hideModal(e)
        }, {
            kind: 'negative primary',
            icon: 'delete',
            text: 'Актуализировать желание',
            onClick: handleActualize
        }]
    }

    return (
        <>
            <WithDropDown
                trigger={<>
                    <KebapBackground/>
                    <Button icon='kebap' size={ 4 }/>
                </>}
                options={ dropdownOptions }
                className='wish-menu'
            />
            <Modal
                ref={ deleteModalRef }
                {...deleteModalProps }
            />
            <Modal
                ref={ uncompleteModalRef }
                {...uncompleteModalProps }
            />
        </>
    )
}
