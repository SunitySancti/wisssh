import { memo,
         useCallback } from 'react'
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

import type { Wishlist } from 'typings'


interface MappedEventsProps {
    wishlists: Wishlist[]
}

interface ListOfListsPageViewProps {
    wishlists: Wishlist[];
    isLoading: boolean;
    isEmptyList: boolean;
    isInvitesSection: boolean;
}


const MappedEvents = ({
    wishlists
} : MappedEventsProps
) => {
    const navigate = useNavigate();
    const { location } = getLocationConfig();
    
    return wishlists.map((item, index) => {

        const handleClick = useCallback(() => {
            navigate(location + '/' + item?.id)
        },[ location ])

        return (
            <WishlistLine
                key={ index }
                wishlist={ item }
                onClick={ handleClick }
            />
        )})
}


const ListOfListsPageView = memo(({
    isLoading,
    isEmptyList,
    wishlists,
    isInvitesSection
} : ListOfListsPageViewProps
) => {
    const actualEvents = wishlists
        .filter(list => (list.date && getDaysToEvent(list) >= 0))
        .sort(sortByDateAscend);
        
    const pastEvents = wishlists
        .filter(list => (list.date && getDaysToEvent(list) < 0))
        .sort(sortByDateDescend);

    return (
        <div className='list-of-lists-page'>
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
                    :   <>
                            <MappedEvents wishlists={ actualEvents }/>
                            { !!pastEvents.length &&
                                <Plug message='Прошедшие события'/>
                            }
                            <MappedEvents wishlists={ pastEvents }/>
                        </>
                    )
            }
        </div>
    )
});


export const ListOfListsPage = () => {
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

    return (
        <ListOfListsPageView {...{
            isLoading: awaitingWishlists,
            isEmptyList: isSuccess && !wishlists.length,
            wishlists,
            isInvitesSection
        }}/>
    )
}
