import   React from 'react'
import { useLocation,
         useParams,
         useNavigate } from 'react-router'
import { useSelector } from 'react-redux'

import { MultiColumnLayout } from 'containers/MultiColumnLayout'
import { LineContainer } from 'containers/LineContainer'
import { Button } from 'atoms/Button'
import { WishCard } from 'molecules/WishCard'

import { getUserWishes,
         getFriendsWishes } from 'store/getters'


export const WishesPage = () => {
    const navigate = useNavigate();
    const section = useLocation().pathname.split('/').at(1);
    const { tabName } = useParams();
    const currentUserId = useSelector(state => state.auth?.user?.id);

    const userWishes = getUserWishes();
    const friendsWishes = getFriendsWishes();

    const allWishes = (section === 'my-wishes')  ? userWishes
                    : (section === 'my-invites') ? friendsWishes : [];
    
    let wishes = [];
    let noWishesMessage = '';
    let newWishButtonText = '';
    switch (tabName) {
        case 'actual':
            wishes = allWishes?.filter(wish => !wish.isCompleted);
            noWishesMessage = 'Нет актуальных желаний';
            newWishButtonText = 'Новое желание';
            break;
        case 'reserved':
            wishes = allWishes?.filter(wish => !wish.isCompleted && wish.reservedBy === currentUserId);
            noWishesMessage = 'В данный момент вы не исполняете ни одного желания';
            break;
        case 'completed':
            wishes = allWishes?.filter(wish => wish.isCompleted);
            noWishesMessage = (section === 'my-wishes')
                ? 'Ни одного вашего желания пока не исполнено'
                : 'Вы ещё не исполнили ни одного желания ваших друзей';
            break;
        case 'all':
        default:
            wishes = allWishes;
            noWishesMessage = (section === 'my-wishes')
            ? 'Вы ещё не создали ни одного желания'
            : 'Нет желаний. Скорее всего, вас ещё не пригласили ни в один вишлист';
            newWishButtonText = 'Создать первое желание';
            break;
    }

    if(!wishes || !wishes.length) {
        return (
            <LineContainer
                className='not-found'
                children={<>
                    <span>{ noWishesMessage }</span>
                    { (section === 'my-wishes') && (tabName === 'actual' || tabName === 'all') && (
                        <Button
                            kind='primary'
                            icon='plus'
                            text={ newWishButtonText }
                            onClick={() => navigate('/my-wishes/items/new')}
                            round
                        />
                    )}
                </>}
            />
        );
    }

    return (
        <MultiColumnLayout
            Card={ WishCard }
            data={ wishes }
        />
    );
}