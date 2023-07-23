import   React,
       { useEffect,
         useMemo,
         useState } from 'react'
import { useLocation,
         useParams,
         NavLink,
         Link } from 'react-router-dom'

import './styles.scss'
import { Icon } from 'atoms/Icon'
import { NavbarEllipsis } from 'atoms/Preloaders'
import { WithTooltip } from 'atoms/WithTooltip'

import { getUserWishes,
         getFriendWishes,
         getWishlistById,
         getWishById,
         getLoadingStatus } from 'store/getters'


export const BreadCrumbs = () => {

    // LINKS DEFINITION //

    const location = useLocation().pathname;
    const mode = location.split('/')[2];
    const { wishlistId, wishId } = useParams();

    const wishlist = getWishlistById(wishlistId);
    const wish = getWishById(wishId);
    const { userWishes } = getUserWishes();
    const { friendWishes } = getFriendWishes();
    const { awaitingUserWishes,
            awaitingWishes,
            awaitingWishlists } = getLoadingStatus();

    const itemsModeOptions = useMemo(() => {
        const [, section, , newMark, , wishEditMark] = location.split('/');
        const isNew = newMark === 'new';
        const isWishEditing = wishEditMark === 'editing';

        let options = [];
        switch (section) {
            case 'my-wishes':
                options = [{
                    to: '/my-wishes/items/actual',
                    text: 'Актуальные'
                }, {
                    to: '/my-wishes/items/completed',
                    text: 'Исполненные'
                }, {
                    to: '/my-wishes/items/all',
                    text: userWishes?.length
                        ? `Все (${userWishes.length})`
                        : 'Все'
                }];

                if(isNew) {
                    options.push({
                        to: `/my-wishes/items/new`,
                        text: 'Новое желание'
                    })
                }
                break;

            case 'my-invites':
                options = [{
                    to: '/my-invites/items/reserved',
                    text: 'Зарезервировано мной'
                }, {
                    to: '/my-invites/items/completed',
                    text: 'Подарено'
                }, {
                    to: '/my-invites/items/all',
                    text: friendWishes?.length
                    ? `Все (${friendWishes.length})`
                    : 'Все'
                }];
        }
        return <>
            {   options.map((option, index) =>
                    <NavLink
                        key={ index }
                        className='nav-elem option'
                        to={ option.to }
                        children={ option.text }
                        end={ isWishEditing }
                    />
            )}
            { isWishEditing &&
                <>
                    <div className='nav-elem'>/</div>
                    { awaitingUserWishes
                        ?   <NavbarEllipsis/>
                        :   <NavLink
                                className='nav-elem option'
                                to={ location }
                                children={ wish.title + ': редактирование' }
                                end
                            />
                    }
                </>
            }
            { !isNew && section === 'my-wishes' &&
                <WithTooltip
                    trigger={
                        <Link
                            className='icon-link'
                            to='/my-wishes/items/new'
                            children={ <Icon name='plus'/> }
                        />
                    }
                    text='Новое желание'
                />
            }
        </>
    },[ location,
        wish?.title,
        userWishes?.length,
        friendWishes?.length
    ]);

    const listsModeOptions = useMemo(() => {
        const [, section, , newMark, wishlistEditMark, wishEditMark] = location.split('/');
        const isNew = newMark === 'new';
        const isWishlistEditing = wishlistEditMark === 'editing';
        const isWishEditing = wishEditMark === 'editing';
        
        return <>
            <NavLink
                className='nav-elem option'
                to={ `/${ section }/lists` }
                children={ 'Вишлисты' }
                end
            />

            { wishlistId &&
                <>
                    <div className='nav-elem'>/</div>
                    { awaitingWishlists
                        ?   <NavbarEllipsis/>
                        : isWishlistEditing
                        ?   <NavLink
                                className='nav-elem option'
                                to={ location }
                                children={ wishlist?.title + ': редактирование' }
                                end
                            />
                        : wishlist?.title &&
                            <NavLink
                                className='nav-elem option'
                                to={ `/${ section }/lists/${ wishlistId }` }
                                children={ wishlist?.title || 'Вишлист не найден' }
                                end
                            />
                    }
                </>
            }
            
            { wishlist?.title && wishId &&
                <>
                    <div className='nav-elem'>/</div>
                    { awaitingWishes
                    ?   <NavbarEllipsis/>
                    : isWishEditing
                    ?   <NavLink
                            className='nav-elem option'
                            to={ location }
                            children={ wish?.title + ': редактирование' }
                            end
                        />
                    : wish?.title &&
                        <NavLink
                            className='nav-elem option'
                            to={ `/${ section }/lists/${ wishlistId }/${ wishId }` }
                            children={ wish?.title || 'Желание не найдено' }
                            end
                        />
                    }
                </>
            }

            { isNew && !wishlistEditMark && !wishEditMark
            ?   <NavLink
                    className='nav-elem option'
                    to='/my-wishes/lists/new'
                    children='Новый вишлист'
                    end
                />
            : !wishlistId && !wishId && section === 'my-wishes' &&
                <WithTooltip
                    trigger={
                        <Link
                            className='icon-link'
                            to='/my-wishes/lists/new'
                            children={ <Icon name='plus'/> }
                        />
                    }
                    text='Новый вишлист'
                />
            }
        </>
    },[ location,
        wishlistId,
        wishId,
        wishlist?.title,
        wish?.title,
        awaitingWishlists,
        awaitingWishes
    ]);
    

    // SLIDER ANIMATION //

    const sliderPadding = 19;

    const [sliderStyles, setSliderStyles] = useState(null);
    const [lastActiveTab, setLastActiveTab] = useState(null);
    const currentTab = document.querySelector('.nav-elem.option.active');

    const startSliderMove = () => {
        document.querySelector('.bc-slider')?.classList.add('animated');
        const activeTab = document.querySelector('.nav-elem.option.active');
        if(!activeTab || !lastActiveTab || activeTab === lastActiveTab) return;

        const lastLeft = lastActiveTab.offsetLeft;
        const lastWidth = lastActiveTab.offsetWidth;
        const nextLeft = activeTab.offsetLeft;
        const nextWidth = activeTab.offsetWidth;
        if(nextLeft === lastLeft && nextWidth === lastWidth) return;

        if(nextLeft > lastLeft) {
            setSliderStyles({
                ...sliderStyles,
                width: (nextLeft - lastLeft) + nextWidth - 2 * sliderPadding
            })
        } else if(nextLeft < lastLeft) {
            setSliderStyles({
                left: nextLeft + sliderPadding,
                width: lastWidth + (lastLeft - nextLeft) - 2 * sliderPadding
            })
        } else return
    }
    const finishSliderMove = () => {
        const activeTab = document.querySelector('.nav-elem.option.active');
        if(!activeTab) return;

        setSliderStyles({
            left: activeTab.offsetLeft + sliderPadding,
            width: activeTab.offsetWidth - 2 * sliderPadding
        });
        setLastActiveTab({
            offsetLeft: activeTab.offsetLeft,
            offsetWidth: activeTab.offsetWidth
        });
        setTimeout(() => {
            document.querySelector('.bc-slider')?.classList.remove('animated')
        }, 300);
    }

    useEffect(() => {
        startSliderMove();
        setTimeout(finishSliderMove, 300);
    },[ location, currentTab?.innerHTML, userWishes?.length, friendWishes?.length ]);

    return (
        <div className='bread-crumbs'>
            <div
                className='bc-slider'
                style={ sliderStyles }
            />
            {   mode === 'items'
                    ?   itemsModeOptions
              : mode === 'lists'
                    ?   listsModeOptions
              : null
            }
        </div>
    );
}
