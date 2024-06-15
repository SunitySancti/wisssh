import { useMemo } from 'react'
import { useDeepCompareMemo } from 'use-deep-compare'

import { MultiColumnLayout } from 'containers/MultiColumnLayout'
import { WishPreloader } from 'atoms/Preloaders'
import { Plug } from 'atoms/Plug'

import { getLocationConfig,
         getCurrentUser,
         getUserWishes,
         getFriendWishes,
         getLoadingStatus } from 'store/getters'
import { useAppSelector } from 'store'

import type { WishId } from 'typings'


interface WishesPageViewProps {
    isLoading: boolean;
    wishIds: WishId[];
    noWishesMessage: string;
    isNarrow?: boolean
}


const WishesPageView = ({
    isLoading,
    wishIds,
    noWishesMessage
} : WishesPageViewProps
) => (
    isLoading
        ?   <div className='wish-page'>
                <WishPreloader isLoading/>
            </div>
        :   wishIds instanceof Array && wishIds.length
        ?   <MultiColumnLayout ids={ wishIds }/>
        :   <Plug message={ noWishesMessage }/>
    )

export const WishesPage = () => {
    const { section,
            tab,
            isWishesSection,
            isInvitesSection } = getLocationConfig();

    const { user } = getCurrentUser();
    const { userWishes } = getUserWishes();
    const { friendWishes } = getFriendWishes();
    const { awaitingWishes: isLoading } = getLoadingStatus();

    const wishIds = useDeepCompareMemo(() => {
        const allWishes = isWishesSection  ? userWishes
                        : isInvitesSection ? friendWishes : [];

        if(!allWishes.length) return []


        switch (tab) {
            case 'actual':
                return allWishes.filter(wish => !wish.isCompleted)
                                .map(wish => wish.id)
            case 'reserved':
                return allWishes.filter(wish => !wish.isCompleted && wish.reservedBy === user?.id)
                                .map(wish => wish.id)
            case 'completed':
                return allWishes.filter(wish => wish.isCompleted)
                                .map(wish => wish.id)
            case 'all':
            default:
                return allWishes.map(wish => wish.id);
        }
    },[ section,
        tab,
        userWishes,
        friendWishes,
    ]);

    const noWishesMessage = useMemo(() => {
        switch (tab) {
            case 'actual':
                return 'Нет актуальных желаний'
            case 'reserved':
                return 'В данный момент вы не исполняете ни одного желания'
            case 'completed':
                return isWishesSection
                    ? 'Нет исполненных желаний'
                    : 'Вы ещё не исполнили ни одного желания ваших друзей'
            case 'all':
            default:
                return isWishesSection
                    ? 'У вас пока нет желаний'
                    : 'Здесь будут желания из вишлистов, в которые вас пригласят';
        }
    },[ section, tab ]);
    
    // RESPONSIVENESS
    const { isNarrow } = useAppSelector(state => state.responsiveness);

    return (
        <WishesPageView {...{
            isLoading,
            wishIds,
            noWishesMessage,
            isNarrow
        }}/>
    )
}
