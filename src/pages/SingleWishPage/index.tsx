import { useEffect,
         useState,
         memo,
         useMemo,
         Fragment } from 'react'
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

import { useAppSelector } from 'store'
import { getLocationConfig,
         getWishById,
         getWishlistsByIdList,
         getLoadingStatus } from 'store/getters'
import { makeupLongNumber } from 'utils'

import type { Wish,
              Wishlist } from 'typings'
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


function makeURL(string: string) {
    let url;
    try {
      url = new URL(string);
    } catch (_) {}
    return url;
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
                top: '1px'
            }}
        >
            <WishpageDescriptionPointer/>
        </div>
        <div
            className='description-container'
            style={{ minWidth: `${ pointerOffset + 77 }px` }}
        >
            { description
                .split(/\r?\n/)
                .map((line, index) =>
                    <span key={ index }>
                        { line
                            .split(' ')
                            .map((token, idx) => {
                                const url = makeURL(token);
                                const wrappedToken = url
                                    ? <a className='inline-link'
                                         href={ url.href }
                                         target='_blank'
                                      >
                                        { url.host }
                                      </a>
                                    : <>{ token }</>
                                return (
                                    <Fragment key={ idx }>
                                        { idx && <> </> }
                                        { wrappedToken }
                                    </Fragment>
                                )
                            })
                        }
                    </span>
            )}
        </div>
    </div>
);

const PriceLine = ({
    price,
    currency
} : PriceLineProps
) => (
    <span className='price'>
        { !!price && makeupLongNumber(price) + (
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

interface SingleWishPageViewProps {
    isLoading: boolean;
    wish: Wish | undefined;
    wishlists: Wishlist[];
    firstColumnMinWidth?: number;
    firstColumnMaxWidth?: number;
    pointerOffset: number;
    isMobile: boolean;
}


const SingleWishPageView = memo(({
    isLoading,
    wish,
    wishlists,
    firstColumnMinWidth,
    firstColumnMaxWidth,
    pointerOffset,
    isMobile
} : SingleWishPageViewProps
) => {
    const { section,
            mode,
            tab } = getLocationConfig();

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
                                    { !isMobile && <WishMenu wish={ wish }/> }
                                    <span className='title'>{ wish.title }</span>
                                    <div style={{ flex: 1 }}/>
                                    <OuterLink urlString={ wish.external }/>
                                </div>

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

                                    <StatusBar wish={ wish }/>
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
});

export const SingleWishPage = () => {
    const isMobile = useAppSelector(state => state.responsiveness.isMobile);
    const { wishId } = getLocationConfig();
    
    const { awaitingWishes,
            awaitingWishlists } = getLoadingStatus();
    const wish = getWishById(wishId);
    const wishlists = getWishlistsByIdList(wish?.inWishlists);

    // ALIGN SVG POINTER
    const [ pointerOffset, setPointerOffset ] = useState(69);
    useEffect(() => {
        const authorRef = document.querySelector<HTMLDivElement>('.info-field .user')
        if(!authorRef) return;
        setPointerOffset(authorRef.offsetLeft - 11)
    },[])

    // ALIGN FIRST COLUMN
    const imageURL = useAppSelector(state => wishId ? state.images.imageURLs[wishId] : undefined);

    const firstColumnMinWidth = useMemo(() => {
        const minHeight = 330;
        return isMobile
            ? 1
            : (wish && wish.imageAR && imageURL)
            ? minHeight * wish.imageAR
            : minHeight
    },[ imageURL, wish?.imageAR, isMobile ]);
    
    const firstColumnMaxWidth = useMemo(() => {
        if(!imageURL || !wish) return 440

        const widthFromAR = ( window.innerHeight - (isMobile ? 200 : 250) ) * wish.imageAR;
        const maximumWidth = isMobile ? window.innerWidth : 1000;
        
        return Math.min(widthFromAR, maximumWidth)
    },[ imageURL, wish?.imageAR, isMobile ]);

    return (
        <SingleWishPageView {...{
            isLoading: awaitingWishes || awaitingWishlists,
            wish,
            wishlists,
            firstColumnMinWidth,
            firstColumnMaxWidth,
            pointerOffset,
            isMobile
        }}/>
    );
}
