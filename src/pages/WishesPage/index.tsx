import { useMemo } from 'react'
import { useDeepCompareMemo,
         useDeepCompareEffect } from 'use-deep-compare'

import { MultiColumnLayout } from 'containers/MultiColumnLayout'
import { WishCard } from 'molecules/WishCard'
import { WishPreloader } from 'atoms/Preloaders'
import { Plug } from 'atoms/Plug'

import { useAppDispatch } from 'store'
import { getLocationConfig,
         getCurrentUser,
         getUserWishes,
         getFriendWishes,
         getLoadingStatus } from 'store/getters'
import { promoteImages } from 'store/imageSlice'
import { useAppSelector } from 'store'

import type { Wish } from 'typings'


interface WishesPageViewProps {
    isLoading: boolean;
    wishes: Wish[];
    noWishesMessage: string;
    isNarrow?: boolean
}


const WishesPageView = ({
    isLoading,
    wishes,
    noWishesMessage
} : WishesPageViewProps
) => (
    isLoading
        ?   <div className='wish-page'>
                <WishPreloader isLoading/>
            </div>
        :   wishes instanceof Array && wishes.length
        ?   <MultiColumnLayout
                Card={ WishCard }
                data={ wishes }
            />
        :   <Plug message={ noWishesMessage }/>
    )

export const WishesPage = () => {
    const dispatch = useAppDispatch();
    const { section,
            tab,
            isWishesSection,
            isInvitesSection } = getLocationConfig();

    const { user } = getCurrentUser();
    const { userWishes } = getUserWishes();
    const { friendWishes } = getFriendWishes();
    const { awaitingWishes: isLoading } = getLoadingStatus();

    const wishes = useDeepCompareMemo(() => {
        const allWishes = isWishesSection  ? userWishes
                        : isInvitesSection ? friendWishes : [];

        if(!allWishes.length) return []


        switch (tab) {
            case 'actual':
                return allWishes.filter(wish => !wish.isCompleted)
                // .sort((a, b) => (b.stars - a.stars))
            case 'reserved':
                return allWishes.filter(wish => !wish.isCompleted && wish.reservedBy === user?.id)
            case 'completed':
                return allWishes.filter(wish => wish.isCompleted)
            case 'all':
            default:
                return allWishes;
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
    
    useDeepCompareEffect(() => {
        if(wishes instanceof Array && wishes.length) {
            const wishIds = wishes.map(wish => wish.id);
            dispatch(promoteImages(wishIds))
        }
    },[ wishes ]);
    
    // RESPONSIVENESS
    const { isNarrow } = useAppSelector(state => state.responsiveness);

    return (
        <WishesPageView {...{
            isLoading,
            wishes,
            noWishesMessage,
            isNarrow
        }}/>
    )
}
