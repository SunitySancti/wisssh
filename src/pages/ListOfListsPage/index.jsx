import   React,
       { useCallback,
         useMemo } from 'react'
import { useNavigate,
         useLocation } from 'react-router'

import './styles.scss'
import { WishlistLine } from 'molecules/WishlistLine'
import { Button } from 'atoms/Button'
import { LineContainer } from 'containers/LineContainer'
import { WishPreloader } from 'atoms/Preloaders'

import { getDaysToEvent,
         sortByDateAscend,
         sortByDateDescend } from 'utils'
import { getUserWishlists,
         getInvites,
         getLoadingStatus } from 'store/getters'


export const ListOfListsPage = () => {
    const navigate = useNavigate();
    const location = useLocation().pathname;
    const section = location.split('/').at(1);
    const isInvite = section === 'my-invites';

    const { userWishlists,
            userWishlistsHaveLoaded } = getUserWishlists();
    const { invites,
            invitesHaveLoaded } = getInvites();

    const wishlists = (section === 'my-wishes') ? userWishlists
                    : (section === 'my-invites') ? invites : [];

    const isSuccess = (section === 'my-wishes') ? userWishlistsHaveLoaded
                    : (section === 'my-invites') ? invitesHaveLoaded : false;

    const { awaitingWishlists: isLoading } = getLoadingStatus();
    
    const pastEvents = useMemo(() => {
        if(wishlists instanceof Array || wishlists?.length) {
            return wishlists.filter(list => list.date)
                            .filter(event => getDaysToEvent(event) < 0)
                            .sort(sortByDateDescend)
        } else return []
    },[ section, wishlists?.length ]);

    const actualEvents = useMemo(() => {
        if(wishlists instanceof Array || wishlists?.length) {
            return wishlists.filter(list => list.date)
                            .filter(event => getDaysToEvent(event) >= 0)
                            .sort(sortByDateAscend)
        } else return []
    },[ section, wishlists?.length ]);
    
    const handleClick = useCallback(( wishlistId ) => {
        const slashCorrection = location.at(-1) === '/' ? '' : '/'
        const path = location + slashCorrection;
        const delayParams = [200, 400, 1000];

        const thisNode = document.getElementById(wishlistId);
        const allNodes = document.querySelectorAll(`.list-of-lists-page > div`);
        const workSpace = document.querySelector('.work-space');
        const navbar = document.querySelector('.navbar');

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
                transition: all ease-out 400ms;
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
    },[ location ]);

    const mapWishlists = (items = [], ) => {
        return items.map((item, index) => (
            <WishlistLine
                wishlist={ item }
                onClick={() => handleClick(item?.id)}
                key={ index }
            />
        ))
    }


    return ( isLoading
        ?   <div className='wish-page'>
                <WishPreloader isLoading/>
            </div>
        :   <div className='list-of-lists-page'>
                { isSuccess && !wishlists?.length &&
                    <LineContainer
                        className='not-found'
                        children={ isInvite
                            ?  <span>Вас пока не пригласили в вишлисты</span>
                            :   <>
                                    <span>У вас нет вишлистов</span>
                                    <Button
                                        kind='primary'
                                        text='Создадим ?'
                                        onClick={() => navigate('/my-wishes/lists/new')}
                                        round
                                    />
                                </>
                        }
                    />
                }
                { actualEvents?.length
                    ?   mapWishlists(actualEvents)
                    :   <LineContainer
                            className='not-found'
                            children={ <span>Нет предстоящих событий</span> }
                        />
                }
                { pastEvents?.length
                    ?   <>
                            <div className='group-header'>
                                <span>Прошедшие события</span>
                            </div>
                            { mapWishlists(pastEvents) }
                        </>
                    :   null
                }
            </div>
    )
}
