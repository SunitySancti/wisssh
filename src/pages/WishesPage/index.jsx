import   React,
       { useMemo } from 'react'
import   useDeepCompareEffect from 'use-deep-compare-effect'
import { useLocation,
         useParams } from 'react-router'
import { useDispatch } from 'react-redux'

import { MultiColumnLayout } from 'containers/MultiColumnLayout'
import { WishCard } from 'molecules/WishCard'
import { WishPreloader } from 'atoms/Preloaders'
import { Plug } from 'atoms/Plug'

import { getCurrentUser,
         getUserWishes,
         getFriendWishes,
         getLoadingStatus } from 'store/getters'
import { promoteImages } from 'store/imageSlice'


export const WishesPage = () => {
    const dispatch = useDispatch();
    const section = useLocation().pathname.split('/').at(1);
    const { tabName } = useParams();

    const { user } = getCurrentUser();
    const { userWishes } = getUserWishes();
    const { friendWishes } = getFriendWishes();
    const { awaitingWishes: isLoading } = getLoadingStatus();

    const wishes = useMemo(() => {
        const allWishes = (section === 'my-wishes')  ? userWishes
                        : (section === 'my-invites') ? friendWishes : [];

        if(!allWishes?.length) return []

        switch (tabName) {
            case 'actual':
                return allWishes?.filter(wish => !wish.isCompleted)
            case 'reserved':
                return allWishes?.filter(wish => !wish.isCompleted && wish.reservedBy === user?.id)
            case 'completed':
                return allWishes?.filter(wish => wish.isCompleted)
            case 'all':
            default:
                return allWishes;
        }
    },[ section,
        tabName,
        userWishes,
        friendWishes,
    ]);

    const noWishesMessage = useMemo(() => {
        switch (tabName) {
            case 'actual':
                return 'Нет актуальных желаний'
            case 'reserved':
                return 'В данный момент вы не исполняете ни одного желания'
            case 'completed':
                return (section === 'my-wishes')
                    ? 'Нет исполненных желаний'
                    : 'Вы ещё не исполнили ни одного желания ваших друзей'
            case 'all':
            default:
                return (section === 'my-wishes')
                    ? 'У вас пока нет желаний'
                    : 'Здесь будут желания из вишлистов, в которые вас пригласят';
        }
    },[ section,
        tabName,
    ]);
    
    useDeepCompareEffect(() => {
        if(wishes instanceof Array && wishes.length) {
            const wishIds = wishes?.map(wish => wish?.id);
            dispatch(promoteImages(wishIds))
        }
    },[ wishes || []]);


    return ( isLoading
        ?   <div className='wish-page'>
                <WishPreloader isLoading/>
            </div>
        :   wishes instanceof Array && wishes.length
        ?   <MultiColumnLayout
                Card={ WishCard }
                data={ wishes }
            />
        :   <Plug message={ noWishesMessage }/>
    );
}
