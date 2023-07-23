import   React,
       { useEffect,
         useState,
         useMemo } from 'react'
import { Link,
         Navigate,
         useLocation } from 'react-router-dom'
import { useDispatch,
         useSelector } from 'react-redux'

import './styles.scss'
import { DoubleColumnAdaptiveLayout } from 'containers/DoubleColumnAdaptiveLayout'
import { Icon,
         WishpageDescriptionPointer } from 'atoms/Icon'
import { User } from 'atoms/User'
import { WishPreloader } from 'atoms/Preloaders'
import { WishCover,
         WishButton,
         WishMenu,
         StatusBar } from 'molecules/WishStuff'

import { getWishById,
         getWishlistsByIdList,
         getUserById,
         getLoadingStatus } from 'store/getters'
import { promoteImages } from 'store/imageSlice'


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
            className='description-container'
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

const OuterLink = ({ urlString }) => {
    let url = null
    try {
        url = new URL(urlString);
    } catch(err) {}
    return ( urlString &&
        <a
            href={ urlString }
            className='inline-link'
        >
            { url ? url.host : urlString }
            <Icon name='outerLink' size={ 22 }/>
        </a>
    );
}

export const SingleWishPage = () => {
    const dispatch = useDispatch();
    const location = useLocation().pathname;
    const [, section, mode, tab, wishId] = location.split('/');
    
    const { awaitingWishes,
            awaitingWishlists } = getLoadingStatus();
    const isLoading = awaitingWishes || awaitingWishlists;
    const wish = getWishById(wishId);
    const author = getUserById(wish?.author);
    const wishlists = getWishlistsByIdList(wish?.inWishlists);

    // PROMOTE IMAGES

    useEffect(() => {
        if(wishId) {
            dispatch(promoteImages(wishId))
        }
        if(author?.id) {
            dispatch(promoteImages(author?.id))
        }
    },[ wishId, author?.id ]);

    // ALIGN SVG POINTER
    
    const [ pointerOffset, setPointerOffset ] = useState(69);
    useEffect(() => {
        const offset = document.querySelector('.info-field .user')?.offsetLeft - 11;
        if(!offset) return;
        setPointerOffset(offset)
    },[])

    // ALIGN FIRST COLUMN

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


    return ( isLoading
        ?   <div className='wish-page'>
                <WishPreloader isLoading/>
            </div>
        :   wish?.id
        ?   <div className='wish-page'>
                <DoubleColumnAdaptiveLayout
                    firstColumn={ <WishCover wish={ wish }/> }
                    firstColumnLimits={{
                        min: firstColumnMinWidth,
                        max: firstColumnMaxWidth
                    }}

                    secondColumn={
                        <>
                            <div className='header'>
                                <WishMenu wish={ wish }/>
                                <span className='title'>{ wish?.title }</span>
                                <OuterLink urlString={ wish?.external }/>
                                
                            </div>

                            <StatusBar wish={ wish }/>

                            <div className='info'>
                                <WishlistEntries {...{ wishlists, section }}/>
                                { !!author?.id &&
                                    <div className='info-field'>
                                        <span className='label'>Желает</span>
                                        <User user={ author }/>
                                    </div>
                                }
                                { !!wish?.description &&
                                    <Description description={ wish.description } pointerOffset={ pointerOffset }/>
                                }
                            </div>
                            
                            <div className='actions'>
                                { !!wish?.price &&
                                    <PriceLine price={ wish.price } currency={ wish.currency } />
                                }
                                <WishButton
                                    wish={ wish }
                                    kind='primary'
                                />
                            </div>
                        </>
                    }
                />
            </div>
        :   <Navigate
                to={ ['', section, mode, tab].join('/') }
                replace
            />
    )
}
