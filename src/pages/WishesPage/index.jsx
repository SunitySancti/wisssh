import   React,
       { useEffect } from 'react'
import { useLocation,
         useParams,
         useNavigate } from 'react-router'
import { useDispatch } from 'react-redux'

import { MultiColumnLayout } from 'containers/MultiColumnLayout'
import { LineContainer } from 'containers/LineContainer'
import { Button } from 'atoms/Button'
import { WishCard } from 'molecules/WishCard'

import { getCurrentUser,
         getUserWishes,
         getFriendWishes } from 'store/getters'
import { promoteImages } from 'store/imageSlice'


export const WishesPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const section = useLocation().pathname.split('/').at(1);
    const { tabName } = useParams();

    const { user } = getCurrentUser();
    const { userWishes } = getUserWishes();
    const { friendWishes } = getFriendWishes();

    const allWishes = (section === 'my-wishes')  ? userWishes
                    : (section === 'my-invites') ? friendWishes : [];
    
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
            wishes = allWishes?.filter(wish => !wish.isCompleted && wish.reservedBy === user.id);
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
    
    const wishIds = wishes?.map(wish => wish.id);
    useEffect(() => {
        if(wishIds instanceof Array && wishIds.length) {
            dispatch(promoteImages(wishIds))
        }
    },[ wishIds?.length ]);


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