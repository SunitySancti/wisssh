import { React } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

import './styles.scss'
import { WishlistLine } from 'molecules/WishlistLine'
import { Button } from 'atoms/Button'
import { LineContainer } from 'containers/LineContainer'

import { getDaysToEvent, sortByDateAscend, sortByDateDescend } from 'utils'
import { useGetSomeWishlistsQuery } from 'store/apiSlice'
import { getUserWishlists,
         getFriendsWishlists } from 'store/getters'


export const ListOfListsPage = () => {
    const navigate = useNavigate();
    const location = useLocation().pathname;
    const section = location.split('/').at(1);

    let wishlists = [];
    switch(section) {
        case 'my-wishes':
            wishlists = getUserWishlists();
            break;
        case 'my-invites':
            wishlists = getFriendsWishlists();
    }


    if (!wishlists || !wishlists.length) {
        const children = (section === 'my-wishes')
                      ? <>
                            <span>У вас пока нет ни одного вишлиста</span>
                            <Button
                                kind='primary'
                                leftIcon='plus'
                                text='Создать вишлист'
                                onClick={() => navigate('/my-wishes/lists/new')}
                                round
                            />
                        </>
                      : <span>Вас ещё не пригласили ни в один вишлист</span>
        return (
            <LineContainer
                className='not-found'
                children={ children }
            />
        );
    }


    const events = wishlists.filter(list => list.date && list.author);
    const pastEvents = events
        .filter(event => getDaysToEvent(event) < 0)
        .sort(sortByDateDescend);
    const actualEvents = events
        .filter(event => !pastEvents.includes(event))
        .sort(sortByDateAscend);
    
    const handleClick = ( wishlistId ) => {
        const slashCorrection = location.at(-1) === '/' ? '' : '/'
        const path = location + slashCorrection;
        const delayParams = [200, 300, 600];

        const thisNode = document.getElementById(wishlistId);
        const allNodes = document.querySelectorAll(`.list-of-lists-page > div`);
        const workSpace = document.querySelector('.work-space');
        const navbar = document.querySelector('.navbar')

        const currentCoords = thisNode.getBoundingClientRect();
        const navbarCoords = navbar.getBoundingClientRect();
        
        const firstStep = () => {
            thisNode.classList.add('selected');
            allNodes.forEach(node => (node!==thisNode) && node.classList.add('hidden'));
        }
        const secondStep = () => {
            thisNode.style.cssText = `
                position: fixed;
                width: ${currentCoords.width}px;
                top: ${currentCoords.y}px;
                transition: all ease-in-out 240ms;
            `;
        }
        const thirdStep = () => {
            thisNode.style.top = `${navbarCoords.y + navbarCoords.height}px`
            thisNode.style.padding = `1rem 2rem`;
            navbar.classList.remove('with-shadow');
        }
        const lastStep = () => {
            navigate(path + wishlistId)
            workSpace.scrollTo(0, 0);
        }

        firstStep();
        setTimeout(secondStep, delayParams[0]);
        setTimeout(thirdStep, delayParams[1]);
        setTimeout(lastStep, delayParams[2]);
    };

    return (
        <div className='list-of-lists-page'>
            { actualEvents.length
              ? actualEvents.map((item, index) => (
                    <WishlistLine
                        wishlist={ item }
                        onClick={() => handleClick(item?.id)}
                        key={ index }
                    />
                )
            ) : (
                <LineContainer
                    className='not-found'
                    children={ <span>Нет предстоящих событий</span> }
                />
            )}
            { pastEvents.length ? (
                <div className='group-header'>
                    <span>Прошедшие события</span>
                </div>
            ) : null}
            { pastEvents.length ? pastEvents.map((item, index) => (
                <WishlistLine
                    wishlist={ item }
                    onClick={() => handleClick(item?.id)}
                    key={ index }
                />
            )) : null}
        </div>
    );
}