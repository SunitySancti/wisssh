import { useState,
         useMemo,
         useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import './styles.scss'
import { Icon,
         KebapBackground } from 'atoms/Icon'
import { Button } from 'atoms/Button'
import { User } from 'atoms/User'
import { StarRating } from 'inputs/StarRating'
import { WishPreloader } from 'atoms/Preloaders'
import { WithDropDown } from 'atoms/WithDropDown'
import { Modal } from 'atoms/Modal'

import { useAppSelector,
         useAppDispatch } from 'store'
import { getLocationConfig,
         getCurrentUser,
         getUserById } from 'store/getters'
import { usePostWishMutation,
         useDeleteWishMutation,
         useCompleteWishMutation,
         useUncompleteWishMutation,
         useReserveWishMutation,
         useUnreserveWishMutation } from 'store/apiSlice'
import { copyWishCover } from 'store/imageSlice'
import { generateUniqueId } from 'utils'
            
import type { SyntheticEvent } from 'react'
import type { Wish,
              ImageId } from 'typings'
import type { IconName } from 'atoms/Icon'
import type { ModalRef } from 'atoms/Modal'


interface StatusBarProps {
    wish: Wish;
    onCard?: boolean
}

interface WishCoverProps {
    wish: Wish;
    withUserPic?: boolean;
    onCard?: boolean
}

interface WishButtonProps {
    wish: Wish
}

interface WishMenuProps {
    wish: Wish
}

interface DropDownOption {
    icon: IconName;
    text: string;
    onClick: (e: SyntheticEvent) => void | Promise<void>
}


export const StatusBar = ({
    wish,
    onCard
} : StatusBarProps
) => {
    const { user } = getCurrentUser();
    const innerRef = useRef<HTMLDivElement>(null);
    const defaultWidth = 34;
    const [width, setWidth] = useState(defaultWidth);

    const showText = () => {
        if(onCard) {
            const width = innerRef.current?.offsetWidth;
            setWidth(width ? width + 22 : defaultWidth)
        }
    }
    const hideText = () => {
        if(onCard) {
            setWidth(defaultWidth)
        }
    }

    let text, icon;
    if(wish.isCompleted) {
        text = 'Желание исполнено';
        icon = 'completed' as const;

        if(wish.author !== user?.id && wish.reservedBy === user?.id) {
            text += ' вами'
        }
    } else if(wish.reservedBy) {
        if(wish.reservedBy === user?.id) {
            text = 'Вы исполняете это желание'
        } else {
            text = 'Желание исполняется'
        }
        icon = 'inProgress' as const
    }

    return (text
        ?   <div
                className={ onCard ? 'status-bar on-card' : 'status-bar' }
                onClick={e => e.stopPropagation()}
                onMouseEnter={ showText }
                onMouseLeave={ hideText }
                style={onCard ? { width } : undefined}
            >
                <div
                    className='inner-container'
                    ref={ innerRef }
                >
                    { icon &&
                        <Icon name={ icon } size={ 34 }/>
                    }
                    <span>{ text }</span>
                </div>
            </div>
        : null
    );
}

export const WishCover = ({
    wish,
    withUserPic,
    onCard
} : WishCoverProps
) => {
    const author = getUserById(wish?.author);
    const imageURL = useAppSelector(state => state.images?.imageURLs[wish?.id]);
    const isLoading = useAppSelector(state => state.images?.loading[wish?.id]);
    
    return (
        <div
            className='wish-cover'
            style={{ aspectRatio: (wish?.imageAR || 1) + '' }}
        >
            <StarRating readOnly rating={ wish?.stars }/>
            { withUserPic &&
                <User
                    user={ author }
                    picSize={ 6 }
                    picOnly
                    tooltip={ author ? `@ ${author.name}` : undefined }
                    onClick={(e: MouseEvent) => e.stopPropagation()}
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
    );
}


export const WishButton = ({
    wish
} : WishButtonProps
) => {
    const { isWishesSection } = getLocationConfig();
    const { user } = getCurrentUser();
    const [ completeWish ] = useCompleteWishMutation();
    const [ reserveWish ] = useReserveWishMutation();
    const [ unreserveWish ] = useUnreserveWishMutation();

    const buttonProps = useMemo(() => {
        if(wish.isCompleted) return undefined
        
        if(isWishesSection) { // actual and reserved wishes of current user
            return {
                icon: 'completed' as const,
                text: 'Отметить исполненным',
                onClick: () => completeWish(wish.id),
            }
        } else if(!wish.reservedBy) { // actual wishes of other users
            return {
                icon: 'magicWand' as const,
                text: 'Исполнить желание',
                kind: 'primary' as const,
                onClick: () => reserveWish(wish.id),
            }
        } else if(wish.reservedBy === user?.id) { // reserved by current user
            return {
                icon: 'cancel' as const,
                text: 'Отменить резервирование',
                onClick: () => unreserveWish(wish.id),
            }
        } else return undefined
    },[ wish.isCompleted,
        wish.reservedBy
    ]);

    return buttonProps ? <Button {...buttonProps }/> : null
}

export const WishMenu = ({
    wish
} : WishMenuProps
) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { location,
            section,
            mode,
            tab,
            wishlistId,
            wishId,
            isWishesSection,
            isItemsMode } = getLocationConfig();

    const { user } = getCurrentUser();
    const deleteModalRef = useRef<ModalRef>(null);
    const uncompleteModalRef = useRef<ModalRef>(null);

    const [ postWish ] = usePostWishMutation();
    const [ deleteWish ] = useDeleteWishMutation();
    const [ completeWish ] = useCompleteWishMutation();
    const [ uncompleteWish ] = useUncompleteWishMutation();
    const [ reserveWish ] = useReserveWishMutation();
    const [ unreserveWish ] = useUnreserveWishMutation();

    const handleEdit = (e: SyntheticEvent) => {
        e.stopPropagation();
        navigate([, section, mode, (tab || wishlistId), wishId, 'editing'].join('/'));
    }

    const handleCopy = async (e: SyntheticEvent) => {
        e.stopPropagation();
        const newId = await generateUniqueId<ImageId>();
        if(!user || typeof newId !== 'string' || newId.length !== 6) return;

        const newWish = {
            ...wish,
            id: newId,
            author: user.id,
            inWishlists: [],
            reservedBy: null,
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

    const handleDelete = (e: SyntheticEvent) => {
        e.stopPropagation();

        deleteWish(wish.id);
        deleteModalRef.current?.hideModal(e);
        const path = ['/my-wishes', mode, (tab || wishlistId)].join('/');
        navigate('/redirect',{ state:{ redirectTo: path }})
    }

    const handleComplete = (e: SyntheticEvent) => {
        e.stopPropagation();

        completeWish(wish.id);

        if((isItemsMode) && (wishId === wish.id)) {
            navigate('/' + section + '/items/completed/' + wishId)
        } else {
            navigate('/redirect',{ state:{ redirectTo: location }})
        }
    }

    const handleActualize = (e: SyntheticEvent) => {
        e.stopPropagation();

        uncompleteWish(wish.id);
        uncompleteModalRef.current?.hideModal(e);

        if((isItemsMode) && (wishId === wish.id)) {
            navigate('/my-wishes/items/actual/' + wishId)
        } else {
            navigate('/redirect',{ state:{ redirectTo: location }})
        }
    }

    const dropdownOptions = useMemo(() => {
        if(!user) {
            return [{
                icon: 'change',
                text: 'Обновить страницу',
                onClick: () => window.location.reload()
            }]
        }

        const result: DropDownOption[] = [];
        if(isWishesSection) {
            result.push({
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
                onClick: (e: SyntheticEvent) => deleteModalRef?.current?.showModal(e)
            });
            if(wish.isCompleted) {
                result.push({
                    icon: 'actualize',
                    text: `Актуализировать`,
                    onClick: (e: SyntheticEvent) => uncompleteModalRef?.current?.showModal(e)
                })
            } else {
                result.push({
                    icon: 'completed',
                    text: 'Отметить исполненным',
                    onClick: handleComplete,
                })
            }
        } else {
            result.push({
                icon: 'copy',
                text: 'Копировать в мои желания',
                onClick: handleCopy
            });
            if(!wish.isCompleted) {
                if(!wish.reservedBy) {
                    result.push({
                        icon: 'magicWand',
                        text: 'Исполнить желание',
                        onClick: () => { reserveWish(wish.id) },
                    })
                } else if(wish.reservedBy === user.id) {
                    result.push({
                        icon: 'cancel',
                        text: 'Отменить резервирование',
                        onClick: () => { unreserveWish(wish.id) },
                    },{
                        icon: 'completed',
                        text: 'Желание исполнено!',
                        onClick: handleComplete,
                    })
                }
            }
        }

        return result
    },[ isWishesSection,
        wish.id,
        wish.isCompleted,
        wish.reservedBy,
        handleEdit,
        handleCopy,
        handleComplete,
        reserveWish,
        unreserveWish
    ]);

    const deleteModalProps = {
        header: 'Пожалуйста, подтвердите действие',
        body: `Желание "${ wish.title }" будет удалено без возможности восстановления.`,
        actions: [{
            icon: 'cancel' as const,
            text: 'Отмена',
            onClick: (e: SyntheticEvent) => deleteModalRef.current?.hideModal(e)
        }, {
            kind: 'negative primary' as const,
            icon: 'delete' as const,
            text: 'Удалить желание',
            onClick: handleDelete
        }]
    }

    const uncompleteModalProps = {
        header: 'Пожалуйста, подтвердите действие',
        body: `Желание будет отмечено как неисполненное. Рассматривайте актуализацию желания как отмену ошибочной отметки об исполнении. Не рекомендуется использовать актуализацию для создания нового желания по шаблону исполненного — для этого лучше подойдет действие "Создать копию"`,
        actions: [{
            icon: 'actualize' as const,
            text: 'Актуализировать',
            onClick: handleActualize
        }, {
            kind: 'primary' as const,
            icon: 'cancel' as const,
            text: 'Отмена',
            onClick: (e: SyntheticEvent) => uncompleteModalRef.current?.hideModal(e)
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
    );
}
