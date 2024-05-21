import { useCallback,
         useRef,
         useState } from 'react'
import { useNavigate } from 'react-router'

import './styles.scss'
import { WishlistLine } from 'molecules/WishlistLine'
import { WishPreloader } from 'atoms/Preloaders'
import { Plug } from 'atoms/Plug'

import { getDaysToEvent,
         sortByDateAscend,
         sortByDateDescend } from 'utils'
import { getLocationConfig,
         getUserWishlists,
         getInvites,
         getLoadingStatus } from 'store/getters'

import type { RefObject } from 'react'
import type { Wishlist,
              WishlistId } from 'typings'


interface MappedEventsProps {
    wishlists: Wishlist[]
}

interface ListOfListsPageViewProps {
    pageRef: RefObject<HTMLDivElement>;
    wishlists: Wishlist[];
    isLoading: boolean;
    isEmptyList: boolean;
    isInvitesSection: boolean;
    animationStep: 0 | 1 | 2 | 3;
    setAnimationStep(step: 0 | 1 | 2 | 3): void;
}


const MappedEvents = ({
    wishlists
} : MappedEventsProps
) => {
    const navigate = useNavigate();
    const { location } = getLocationConfig();

    const actualEvents = wishlists
        .filter(list => (list.date && getDaysToEvent(list) >= 0))
        .sort(sortByDateAscend);
        
    const pastEvents = wishlists
        .filter(list => (list.date && getDaysToEvent(list) < 0))
        .sort(sortByDateDescend);

    const handleClick = useCallback((wishlistId?: WishlistId) => {
        navigate(location + '/' + wishlistId)
    },[ location ])

    
    return [ ...actualEvents, 'past-events-header' as const, ...pastEvents ].map((item, index) => (
        <WishlistLine
            key={ index }
            wishlist={ item }
            onClick={() => handleClick(typeof item === 'string' ? undefined : item?.id)}
        />
    ))
}


const ListOfListsPageView = ({
    pageRef,
    isLoading,
    isEmptyList,
    wishlists,
    animationStep,
    setAnimationStep,
    isInvitesSection
} : ListOfListsPageViewProps
) => (
    <div className='list-of-lists-page' ref={ pageRef } >
        {   isLoading
            ?   <WishPreloader isLoading/>
            : ( isEmptyList
                ? ( isInvitesSection
                        ?   <Plug message='Вас пока не пригласили в вишлисты'/>
                        :   <Plug
                                message='У вас пока нет вишлистов'
                                btnText='Создать первый вишлист'
                                navPath='/my-wishes/lists/new'
                            />
                    )
                :   <MappedEvents {...{
                        wishlists,
                        animationStep,
                        setAnimationStep,
                        pageRef
                    }}/>
                )
        }
    </div>
);


export const ListOfListsPage = () => {
    const pageRef = useRef<HTMLDivElement>(null);
    const { isWishesSection,
            isInvitesSection } = getLocationConfig();

    const { awaitingWishlists } = getLoadingStatus();
    const { userWishlists,
            userWishlistsHaveLoaded } = getUserWishlists();
    const { invites,
            invitesHaveLoaded } = getInvites();

    const wishlists = isWishesSection  ? userWishlists
                    : isInvitesSection ? invites : [];

    const isSuccess = isWishesSection  ? userWishlistsHaveLoaded
                    : isInvitesSection ? invitesHaveLoaded : false;

    const [ animationStep, setAnimationStep ] = useState<0 | 1 | 2 | 3>(0)

    return (
        <ListOfListsPageView {...{
            pageRef,
            isLoading: awaitingWishlists,
            isEmptyList: isSuccess && !wishlists.length,
            wishlists,
            animationStep,
            setAnimationStep,
            isInvitesSection
        }}/>
    )
}
