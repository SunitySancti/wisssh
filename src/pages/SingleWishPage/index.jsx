import   React,
       { useEffect,
         useState,
         useMemo,
         useRef } from 'react'
import { Link,
         useLocation,
         useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

import './styles.scss'
import { DoubleColumnAdaptiveLayout } from 'containers/DoubleColumnAdaptiveLayout'
import { LineContainer } from 'containers/LineContainer'
import { Icon,
         WishpageDescriptionPointer,
         WishPlaceholder } from 'atoms/Icon'
import { User } from 'atoms/User'
import { Button,
         WishButton } from 'atoms/Button'
import { WithDropDown } from 'atoms/WithDropDown'
import { Modal } from 'atoms/Modal'

import { getWishById,
         getWishlistsByIdList,
         getUserById,
         getUserWishes } from 'store/getters'
import { useDeleteWishMutation } from 'store/apiSlice'


export const SingleWishPage = () => {
    const modalRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation().pathname;
    const locationSteps = location.split('/');
    const section = locationSteps.at(1);
    const currentWishId = locationSteps.pop();
    
    const [ deleteWish, deleteWishReturn ] = useDeleteWishMutation();
    const userWishes = getUserWishes();
    const wish = getWishById(currentWishId);
    const user = getUserById(wish?.author);
    const wishlists = getWishlistsByIdList(wish?.inWishlists);
    
    const [ pointerOffset, setPointerOffset ] = useState(69);
    useEffect(() => {
        const offset = document.querySelector('.info-field .user')?.offsetLeft - 11;
        if(!offset) return;
        setPointerOffset(offset)
    },[])

    // align first column:

    const imageURL = useSelector(state => state.images?.imageURLs[wish?.id]);
    
    const firstColumnMaxWidth = useMemo(() => {
        if(!imageURL || !wish) return 440

        const widthFromAR = ( window.innerHeight - 250 ) * wish.imageAR;
        const maximumWidth = 1000;
        
        if(widthFromAR < maximumWidth) {
            return widthFromAR
        } else {
            return maximumWidth
        }
    },[ imageURL, wish ]);

    const firstColumnMinWidth = useMemo(() => {
        const minHeight = 330
        if(!imageURL || !wish) return minHeight;
        else return minHeight * wish.imageAR;
    },[ imageURL, wish ]);


    const menuOptions = [{
        icon: 'edit',
        text: 'Редактировать',
        onClick: () => navigate(location + '/editing')
    },{
        icon: 'delete',
        text: 'Удалить желание',
        onClick: () => modalRef.current?.showModal()
    }];

    const modalActions = [{
        icon: 'cancel',
        text: 'Отмена',
        onClick: () => modalRef.current?.hideModal()
    },{
        kind: 'negative primary',
        icon: 'delete',
        text: 'Удалить навсегда',
        onClick: () => deleteWish(wish.id)
    }];

    useEffect(() => {
        if(deleteWishReturn?.error) {
            console.log(deleteWishReturn.error)
        } else {
            const wishKeys = userWishes.map(wish => wish.id);
            const deletedKey = deleteWishReturn?.data;
            
            if(deletedKey && !wishKeys.includes(deletedKey)) {
                navigate(locationSteps.join('/'))
            }
        }
    },[ deleteWishReturn, userWishes ])
    
    
    const Image = () => (
        <div className='container'>
            { imageURL
                ? <img src={ imageURL } />
                : <WishPlaceholder/>
            }
        </div>
    )

    const OuterLink = () => {
        let url = null
        try {
            url = new URL(wish?.external);
        } catch(err) {
            return null;
        }
        return (
            <a
                href={ wish?.external }
                className='inline-link'
            >
                { url.host }
                <Icon name='outerLink' size={22}/>
            </a>
        );
    }

    const WishlistEntries = () => {
        const labelText = (!wish?.inWishlists?.length)
            ? 'Не входит ни в один вишлист'
            : (wish?.inWishlists?.length === 1)
            ? 'В вишлистe'
            : 'В вишлистах:'

        const mappedLinks = wishlists?.map((wishlist, index) => {
            const comma = index ? (<span> , </span>) : null
            return (
                <div key={ index }>
                    { comma }
                    { wishlist
                        ? (
                            <Link
                                className='inline-link'
                                to={`/${ section }/lists/${ wishlist?.id }`}
                            >
                                { wishlist?.title }
                            </Link>
                      ) : (
                            <span className='wishlist-not-found'>
                                <b>{ id }</b> (не найден)
                            </span>
                    )}
                </div>
        )});

        return (
            <div className='info-field'>
                <span className='label'>{ labelText }</span>
                <div className='links'>{ mappedLinks }</div>
            </div>
        );
    }

    const UserInfo = () => {
        if(!user) return null;
        return (
            <div className='info-field'>
                <span className='label'>Желает</span>
                <User picSize='4' user={ user }/>
            </div>
    )}

    const Description = () => {
        if(!wish?.description) return null;
        const Pointer = () => {
            return (
                <div
                    className='description-pointer'
                    style={{
                        position: 'relative',
                        left: pointerOffset,
                    }}
                >
                    <WishpageDescriptionPointer/>
                </div>
        )}

        return (
            <div className='description'>
                <Pointer/>
                <div
                    className='container'
                    style={{minWidth: `${pointerOffset + 77}px`}}
                >{ wish?.description }</div>
            </div>
    )}

    const PriceLine = () => {
        if(wish?.price) {
            const currency
            = (wish?.currency === 'rouble') ? ' ₽'
            : (wish?.currency === 'dollar') ? ' $'
            : (wish?.currency === 'euro')   ? ' €' : ''
            return (
                <span className='price'>{ wish?.price + currency}</span>
            )
        } else return null
    }


    if (!wish) {
        return (
            <LineContainer
                className='not-found'
                children={<>
                    <span>Желание не найдено 😥</span>
                    <Button
                        kind='primary'
                        icon='plus'
                        text='Ко всем желаниям'
                        onClick={() => navigate(`/${ section }/items/all`)}
                        round
                    />
                </>}
            />
        )
    }

    return (
        <div className='wish-page'>
            <DoubleColumnAdaptiveLayout
                firstColumn={ <Image/> }
                firstColumnLimits={{
                    min: firstColumnMinWidth,
                    max: firstColumnMaxWidth
                }}

                secondColumn={
                    <>
                        <div className='header'>
                            <WithDropDown
                                trigger={ <Button icon='kebap' size={ 4 }/> }
                                options={ menuOptions }
                            />
                            <span className='title'>{ wish?.title }</span>
                            <OuterLink/>
                            
                        </div>

                        <div className='info'>
                            <WishlistEntries/>
                            <UserInfo/>
                            <Description/>
                        </div>
                        
                        <div className='actions'>
                            <PriceLine/>
                            <WishButton
                                wish={ wish }
                                kind='primary'
                            />
                        </div>

                        <Modal
                            ref={ modalRef }
                            header='Подтверждение удаления'
                            body='Желание будет удалено безвозвратно. Хотим убедиться, что вы действительно этого хотите'
                            actions={ modalActions }
                        />
                    </>
                }
            />
        </div>
    )
}
