import   React,
       { useEffect,
         useState,
         useMemo,
         useRef } from 'react'
import { Link,
         useLocation,
         useNavigate } from 'react-router-dom'
import { useDispatch,
         useSelector } from 'react-redux'

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
import { promoteImages } from 'store/imageSlice'


    
const Image = ({ imageURL }) => (
    <div className='container'>
        { imageURL
            ? <img src={ imageURL } />
            : <WishPlaceholder/>
        }
    </div>
);

const WishlistEntries = ({ wishlists, section }) => {
    const labelText = (!wishlists?.length)
        ? 'Не входит ни в один вишлист'
        : (wishlists?.length === 1)
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

const Description = ({ description, pointerOffset }) => (
    <div className='description'>
        <div
            className='description-pointer'
            style={{
                position: 'relative',
                left: pointerOffset,
            }}
        >
            <WishpageDescriptionPointer/>
        </div>
        <div
            className='container'
            style={{minWidth: `${pointerOffset + 77}px`}}
        >
            { description }
        </div>
    </div>
);

const PriceLine = ({ price, currency }) => (
    <span className='price'>
        { price + (
              (currency === 'rouble') ? ' ₽'
            : (currency === 'dollar') ? ' $'
            : (currency === 'euro')   ? ' €' : ''
        )}
    </span>
);

export const SingleWishPage = () => {
    const modalRef = useRef(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation().pathname;
    const locationSteps = location.split('/');
    const section = locationSteps.at(1);
    const currentWishId = locationSteps.pop();
    
    const [ deleteWish, deleteWishReturn ] = useDeleteWishMutation();
    const { userWishes } = getUserWishes();
    const wish = getWishById(currentWishId);
    const author = getUserById(wish?.author);
    const wishlists = getWishlistsByIdList(wish?.inWishlists);

    useEffect(() => {
        dispatch(promoteImages(currentWishId))
    },[ currentWishId ]);

    useEffect(() => {
        dispatch(promoteImages(author?.id))
    },[ author?.id ]);
    
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
            const wishKeys = userWishes?.map(wish => wish.id);
            const deletedKey = deleteWishReturn?.data;
            
            if(deletedKey && !wishKeys.includes(deletedKey)) {
                navigate(locationSteps.join('/'))
            }
        }
    },[ deleteWishReturn, userWishes ])
    

    const OuterLink = ({ urlString }) => {
        let url = null
        try {
            url = new URL(urlString);
        } catch(err) {
            return;
        }
        return (
            <a
                href={ urlString }
                className='inline-link'
            >
                { url ? url.host : urlString }
                <Icon name='outerLink' size={ 22 }/>
            </a>
        );
    }
    

    if(!wish) {
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
    } else {
        return (
            <div className='wish-page'>
                <DoubleColumnAdaptiveLayout
                    firstColumn={ <Image imageURL={ imageURL }/> }
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
                                <OuterLink urlString={ wish?.external }/>
                                
                            </div>

                            <div className='info'>
                                <WishlistEntries {...{ wishlists, section }}/>
                                { author?.id &&
                                    <div className='info-field'>
                                        <span className='label'>Желает</span>
                                        <User user={ author }/>
                                    </div>
                                }
                                { wish?.description &&
                                    <Description description={ wish.description } pointerOffset={ pointerOffset }/>
                                }
                            </div>
                            
                            <div className='actions'>
                                { wish?.price &&
                                    <PriceLine price={ wish.price } currency={ wish.currency } />
                                }
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
}
