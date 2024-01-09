import { useCallback,
         useRef,
         useState } from 'react'
import { useNavigate } from 'react-router'

import './styles.scss'
import { WishlistHeader } from 'molecules/WishlistHeader'
import { WishPreloader } from 'atoms/Preloaders'
import { Plug } from 'atoms/Plug'

import { getDaysToEvent,
         sortByDateAscend,
         sortByDateDescend,
         delay } from 'utils'
import { getLocationConfig,
         getUserWishlists,
         getInvites,
         getLoadingStatus } from 'store/getters'

import type { SetStateAction,
              RefObject } from 'react'
import type { Wishlist,
              WishlistId } from 'typings'


interface MappedEventsProps {
    wishlists: Wishlist[];
    animationStep: 0 | 1 | 2 | 3;
    setAnimationStep(step: 0 | 1 | 2 | 3): void;
    pageRef: RefObject<HTMLDivElement>
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
    wishlists,
    animationStep,
    setAnimationStep,
    pageRef
} : MappedEventsProps
) => {
    const navigate = useNavigate();
    const { location } = getLocationConfig();
    const [ topOffset, setTopOffset ] = useState<number | undefined>(undefined);


    const actualEvents = wishlists
        .filter(list => (list.date && getDaysToEvent(list) >= 0))
        .sort(sortByDateAscend);

    const actualEventsOrPlug = actualEvents.length
        ? actualEvents
        : [ 'no-actual-events' ] as const
        
    const pastEvents = wishlists
        .filter(list => (list.date && getDaysToEvent(list) < 0))
        .sort(sortByDateDescend);


    const handleClick = useCallback((
        setIsSelected: (value: SetStateAction<boolean>) => void,
        wishlistId?: WishlistId
    ) => {
        const top = pageRef.current ? pageRef.current.offsetTop - pageRef.current.getBoundingClientRect().top : undefined;
        Promise.resolve()
            .then(() => { setAnimationStep(1); setIsSelected(true) })
            .then(() => delay(200))
            .then(() => { setAnimationStep(2); setTopOffset(top) })
            .then(() => delay(200))
            .then(() => { setAnimationStep(3) })
            .then(() => delay(400))
            .then(() => navigate(location + '/' +  wishlistId))
    },[ location ]);

    
    return [ ...actualEventsOrPlug, 'past-events-header' as const, ...pastEvents ].map((item, index) => {
        const headerRef = useRef(null);
        const [ isSelected, setIsSelected ] = useState(false);

        return (
            <WishlistHeader
                key={ index }
                wishlist={ item }
                onClick={() => handleClick(setIsSelected, (typeof item === 'string' ? undefined : item?.id))}
                {...{
                    headerRef,
                    animationStep,
                    isSelected,
                    topOffset
                }}
            />
        )
    })
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
