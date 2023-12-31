import { useEffect,
         useState,
         useMemo } from 'react'
import { Link,
         Navigate } from 'react-router-dom'

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

import { useAppDispatch,
         useAppSelector } from 'store'
import { getLocationConfig,
         getWishById,
         getWishlistsByIdList,
         getLoadingStatus } from 'store/getters'
import { promoteImages } from 'store/imageSlice'

import type { Wishlist } from 'typings'
import type { Section } from 'store/getters'


interface WishlistEntriesProps {
    wishlists: Wishlist[];
    section?: Section
}

interface DescriptionProps {
    description: string;
    pointerOffset: number   // in px
}

interface PriceLineProps {
    price: number | null;
    currency: 'rouble' | 'dollar' | 'euro'
}

interface OuterLinkProps {
    urlString: string
}


const WishlistEntries = ({
    wishlists,
    section
} : WishlistEntriesProps
) => (
    <div className='info-field'>
        <span className='label'>
            { wishlists.length === 1 ? 'В вишлистe'
                : wishlists.length   ? 'В вишлистах:'
                : 'Не входит ни в один вишлист'
            }
        </span>
        <div className='links'>
            { wishlists.map((wishlist, index) => (
                <div key={ index }>
                    { index
                        ? <span> , </span>
                        : null
                    }
                    {   <Link
                            className='inline-link'
                            to={ `/${ section }/lists/${ wishlist.id }` }
                        >
                            { wishlist.title }
                        </Link>
                    }
                </div>
            ))}
        </div>
    </div>
);

const Description = ({
    description,
    pointerOffset
} : DescriptionProps
) => (
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
            style={{ minWidth: `${ pointerOffset + 77 }px` }}
        >
            { description.split(/\r?\n/).map((line, index) => (
                <span key={ index }>{ line }</span>
            ))}
        </div>
    </div>
);

const PriceLine = ({
    price,
    currency
} : PriceLineProps
) => (
    <span className='price'>
        { !!price && price + (
              (currency === 'rouble') ? ' ₽'
            : (currency === 'dollar') ? ' $'
            : (currency === 'euro')   ? ' €' : ''
        )}
    </span>
);

const OuterLink = ({
    urlString
} : OuterLinkProps
) => {
    let url = null
    try {
        url = new URL(urlString);
    } catch(err) {}
    return ( urlString
        ?   <a
                href={ urlString }
                className='inline-link'
            >
                { url ? url.host : urlString }
                <Icon name='outerLink' size={ 22 }/>
            </a>
        : null
    );
}

export const SingleWishPage = () => {
    const dispatch = useAppDispatch();
    const { section,
            mode,
            tab,
            wishId } = getLocationConfig();
    
    const { awaitingWishes,
            awaitingWishlists } = getLoadingStatus();
    const isLoading = awaitingWishes || awaitingWishlists;
    const wish = getWishById(wishId);
    const wishlists = getWishlistsByIdList(wish?.inWishlists);

    // PROMOTE IMAGES

    useEffect(() => {
        if(wishId) {
            dispatch(promoteImages(wishId))
        }
        // if(author) {
        //     dispatch(promoteImages(author.id))
        // }
    },[ wishId ]);

    // ALIGN SVG POINTER
    
    const [ pointerOffset, setPointerOffset ] = useState(69);
    useEffect(() => {
        const authorRef = document.querySelector<HTMLDivElement>('.info-field .user')
        if(!authorRef) return;
        setPointerOffset(authorRef.offsetLeft - 11)
    },[])

    // ALIGN FIRST COLUMN

    const imageURL = useAppSelector(state => state.images.imageURLs[wishId || 'undefined']);
    
    const firstColumnMaxWidth = useMemo(() => {
        if(!imageURL || !wish) return 440

        const widthFromAR = ( window.innerHeight - 250 ) * wish.imageAR;
        const maximumWidth = 1000;
        
        if(widthFromAR < maximumWidth) {
            return widthFromAR
        } else {
            return maximumWidth
        }
    },[ imageURL, wish?.imageAR ]);

    const firstColumnMinWidth = useMemo(() => {
        const minHeight = 330
        if(!imageURL || !wish) {
            return minHeight
        } else {
            return minHeight * wish.imageAR
        }
    },[ imageURL, wish?.imageAR ]);


    return ( isLoading
        ?   <div className='wish-page'>
                <WishPreloader isLoading/>
            </div>
        :   wish
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
                                <span className='title'>{ wish.title }</span>
                                <OuterLink urlString={ wish.external }/>
                                
                            </div>

                            <StatusBar wish={ wish }/>

                            <div className='info'>
                                <WishlistEntries {...{ wishlists, section }}/>
                                { !!wish.author &&
                                    <div className='info-field'>
                                        <span className='label'>Автор</span>
                                        <User id={ wish.author }/>
                                    </div>
                                }
                                { !!wish.description &&
                                    <Description description={ wish.description } pointerOffset={ pointerOffset }/>
                                }
                            </div>
                            
                            <div className='actions'>
                                { !!wish.price &&
                                    <PriceLine price={ wish.price } currency={ wish.currency } />
                                }
                                <WishButton wish={ wish }/>
                            </div>
                        </>
                    }
                />
            </div>
        :   <Navigate
                to={ ['', section, mode, tab].join('/') }
                replace
            />
    );
}
