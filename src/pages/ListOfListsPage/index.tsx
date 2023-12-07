import { useCallback,
         useMemo } from 'react'
import { useNavigate } from 'react-router'

import './styles.scss'
import { WishlistHeader } from 'molecules/WishlistHeader'
import { WishPreloader } from 'atoms/Preloaders'
import { Plug } from 'atoms/Plug'

import { getDaysToEvent,
         sortByDateAscend,
         sortByDateDescend } from 'utils'
import { getLocationConfig,
         getUserWishlists,
         getInvites,
         getLoadingStatus } from 'store/getters'

import type { Wishlist,
              WishlistId } from 'typings'


export const ListOfListsPage = () => {
    const navigate = useNavigate();
    const { location,
            section,
            isWishesSection,
            isInvitesSection } = getLocationConfig();

    const { awaitingWishlists: isLoading } = getLoadingStatus();
    const { userWishlists,
            userWishlistsHaveLoaded } = getUserWishlists();
    const { invites,
            invitesHaveLoaded } = getInvites();

    const wishlists = isWishesSection  ? userWishlists
                    : isInvitesSection ? invites : [];

    const isSuccess = isWishesSection  ? userWishlistsHaveLoaded
                    : isInvitesSection ? invitesHaveLoaded : false;

    
    const pastEvents = useMemo(() => {
        if(wishlists instanceof Array) {
            return wishlists.filter(list => (list.date && getDaysToEvent(list) < 0))
                            .sort(sortByDateDescend)
        } else return []
    },[ section, wishlists.length ]);

    const actualEvents = useMemo(() => {
        if(wishlists instanceof Array) {
            return wishlists.filter(list => (list.date && getDaysToEvent(list) >= 0))
                            .sort(sortByDateAscend)
        } else return []
    },[ section, wishlists.length ]);
    

    const handleClick = useCallback(( wishlistId: WishlistId ) => {
        const delayParams = [200, 400, 1000];

        const allNodes = document.querySelectorAll<HTMLDivElement>(`.list-of-lists-page > div`);
        const thisNode = document.getElementById(wishlistId);
        const workSpace = document.querySelector<HTMLDivElement>('.work-space');
        const navbar = document.querySelector<HTMLDivElement>('.navbar > .scroll-box > .content');

        if(!allNodes.length || !thisNode || !workSpace || !navbar) return

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
            thisNode.style.padding = `2rem`;
            navbar.classList.remove('with-shadow');
        }
        const lastStep = () => {
            navigate(location + '/' +  wishlistId)
            workSpace.scrollTo(0, 0);
        }

        firstStep();
        setTimeout(secondStep, delayParams[0]);
        setTimeout(thirdStep, delayParams[1]);
        setTimeout(lastStep, delayParams[2]);
    },[ location ]);

    const mapWishlists = (items: Wishlist[]) => {
        return items.map((item, index) => (
            <WishlistHeader
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
                { isSuccess && !wishlists.length &&
                    <>
                        { isInvitesSection
                            ?   <Plug message='Вас пока не пригласили в вишлисты'/>
                            :   <Plug
                                    message='У вас пока нет вишлистов'
                                    btnText='Создать первый вишлист'
                                    navPath='/my-wishes/lists/new'
                                />
                        }
                    </>
                }
                { actualEvents.length
                    ?   mapWishlists(actualEvents)
                    :   !!wishlists?.length &&
                            <Plug message='Нет предстоящих событий'/>
                }
                { !!pastEvents.length &&
                    <>
                        <div className='group-header'>
                            <span>Прошедшие события</span>
                        </div>
                        { mapWishlists(pastEvents) }
                    </>
                }
            </div>
    );
}
