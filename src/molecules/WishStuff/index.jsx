import   React,
       { useState,
         useMemo,
         useRef } from 'react'
import { useNavigate,
         useLocation } from 'react-router-dom'
import { useSelector,
         useDispatch } from 'react-redux'

import './styles.scss'
import { Icon, KebapBackground } from 'atoms/Icon'
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


export const StatusBar = ({ wish, onCard }) => {
    const { user } = getCurrentUser();
    const innerRef = useRef(null);
    const defaultWidth = 34;
    const [width, setWidth] = useState(defaultWidth);

    const showText = e => {
        if(onCard) {
            const width = innerRef.current?.offsetWidth;
            setWidth(width + 22 || defaultWidth)
        }
    }
    const hideText = e => {
        if(onCard) {
            setWidth(defaultWidth)
        }
    }

    let text, icon;
    if(wish.isCompleted) {
        text = 'Желание исполнено';
        icon = 'completed';

        if(wish.author !== user?.id && wish.reservedBy === user?.id) {
            text += ' вами'
        }
    } else if(wish.reservedBy) {
        if(wish.reservedBy === user?.id) {
            text = 'Вы исполняете это желание'
        } else {
            text = 'Желание исполняется'
        }
        icon = 'inProgress'
    }

    return ( text &&
        <div
            className={ onCard ? 'status-bar on-card' : 'status-bar' }
            onClick={e => e.stopPropagation()}
            onMouseEnter={ showText }
            onMouseLeave={ hideText }
            style={onCard ? { width } : null}
        >
            <div
                className='inner-container'
                ref={ innerRef }
            >
                <Icon name={ icon } size={ 34 }/>
                <span>{ text }</span>
            </div>
        </div>
    )
}

export const WishCover = ({ wish, withUserPic, onCard }) => {
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
            { onCard &&
                <StatusBar wish={ wish } onCard={ onCard }/>
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
    const [ completeWish ] = useCompleteWishMutation();
    const [ reserveWish ] = useReserveWishMutation();
    const [ unreserveWish ] = useUnreserveWishMutation();

    const buttonProps = useMemo(() => {
        if(!wish || typeof wish !== 'object' || wish.isCompleted) return null
        
        if(isCurrentUserWish) { // actual and reserved wishes of current user
            return {
                icon: 'completed',
                text: 'Отметить исполненным',
                onClick: () => completeWish(wish.id),
            }
        } else if(!wish.reservedBy) { // actual wishes of other users
            return {
                icon: 'magicWand',
                text: 'Исполнить желание',
                kind: 'primary',
                onClick: () => reserveWish(wish.id),
            }
        } else if(wish.reservedBy === user?.id) { // reserved by current user
            return {
                icon: 'cancel',
                text: 'Отменить резервирование',
                onClick: () => unreserveWish(wish.id),
            }
        }
    });

    return buttonProps
        ? <Button {...buttonProps }/>
        : null
}

export const WishMenu = ({ wish }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation().pathname;
    const [, section, mode, tabOrWishlistId, wishId ] = location.split('/');
    const isCurrentUserWish = section === 'my-wishes';

    const { user } = getCurrentUser();
    const deleteModalRef = useRef(null);
    const uncompleteModalRef = useRef(null);

    const [ postWish ] = usePostWishMutation();
    const [ deleteWish ] = useDeleteWishMutation();
    const [ completeWish ] = useCompleteWishMutation();
    const [ uncompleteWish ] = useUncompleteWishMutation();
    const [ reserveWish ] = useReserveWishMutation();
    const [ unreserveWish ] = useUnreserveWishMutation();

    const handleEdit = (e) => {
        e.stopPropagation();
        const path = [, section, mode, tabOrWishlistId, wish.id, 'editing'].join('/')
        navigate(path)
    }

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
            isCompleted: false,
            completedAt: null
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
        const path = ['/my-wishes', mode, tabOrWishlistId].join('/');
        navigate('/redirect',{ state:{ to: path }})
    }

    const handleComplete = (e) => {
        e.stopPropagation();
        if(!wish?.id) return

        completeWish(wish.id);

        if((mode === 'items') && (wishId === wish.id)) {
            navigate('/' + section + '/items/completed/' + wishId)
        } else {
            navigate('/redirect',{ state:{ to: location }})
        }
    }

    const handleActualize = (e) => {
        e.stopPropagation();
        if(!wish?.id) return

        uncompleteWish(wish.id);
        uncompleteModalRef?.current?.hideModal(e);

        if((mode === 'items') && (wishId === wish.id)) {
            navigate('/my-wishes/items/actual/' + wishId)
        } else {
            navigate('/redirect',{ state:{ to: location }})
        }
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
                text: 'Редактировать желание',
                onClick: handleEdit
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
                    icon: 'actualize',
                    text: `Актуализировать`,
                    onClick: (e) => uncompleteModalRef?.current?.showModal(e)
                })
            } else {
                result.push({
                    icon: 'completed',
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
                        icon: 'magicWand',
                        text: 'Исполнить желание',
                        onClick: () => reserveWish(wish.id),
                    })
                } else if(wish.reservedBy === user.id) {
                    result.push({
                        icon: 'cancel',
                        text: 'Отменить резервирование',
                        onClick: () => unreserveWish(wish.id),
                    },{
                        icon: 'completed',
                        text: 'Желание исполнено!',
                        onClick: handleComplete,
                    })
                }
            }
        }

        return result
    },[ isCurrentUserWish,
        wish?.id,
        wish?.isCompleted,
        wish?.reservedBy,
        handleEdit,
        handleCopy,
        handleComplete
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
        body: `Желание будет отмечено как неисполненное. Рассматривайте актуализацию желания как отмену ошибочной отметки об исполнении. Не рекомендуется использовать актуализацию для создания нового желания по шаблону исполненного — для этого лучше подойдет действие "Создать копию"`,
        actions: [{
            icon: 'actualize',
            text: 'Актуализировать',
            onClick: handleActualize
        }, {
            kind: 'primary',
            icon: 'cancel',
            text: 'Отмена',
            onClick: (e) => uncompleteModalRef?.current?.hideModal(e)
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
