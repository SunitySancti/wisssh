import   React,
       { useEffect,
         useState } from 'react'
import { useLocation,
         useParams,
         NavLink } from 'react-router-dom'

import './styles.scss'
import { getWishlistById,
         getWishById } from 'store/getters'


export const BreadCrumbs = () => {

    // define links and titles of bread crumbs:

    const location = useLocation().pathname;
    const [ , section, mode, ...pathRest ] = location.split('/');
    const { wishlistId, wishId } = useParams();

    const isListsMode = (mode === 'lists');
    const isNew = (pathRest[0] === 'new');
    const isWishEditing = (pathRest[2] === 'editing');

    // const wishlist = {};
    // const wish = {};
    const wishlist = getWishlistById(wishlistId);
    const wish = getWishById(wishId);

    const wishlistName = wishlist ? wishlist.title : 'wishlist: ' + wishlistId + ' not found';
    const wishName = wish ? wish.title : 'wish: ' + wishId + ' not found';

    let options = [];
    switch (section + '/' + mode) {
        case 'my-wishes/items':
            options = [{
                to: '/my-wishes/items/actual',
                text: 'Актуальные'
            }, {
                to: '/my-wishes/items/completed',
                text: 'Исполненные'
            }, {
                to: '/my-wishes/items/all',
                text: 'Все'
            }];
            break;

        case 'my-wishes/lists':
            options = [{
                to: '/my-wishes/lists',
                text: 'Вишлисты'
            }];
            break;

        case 'my-invites/items':
            options = [{
                to: '/my-invites/items/reserved',
                text: 'Исполняю...'
            }, {
                to: '/my-invites/items/completed',
                text: 'Подарено'
            }, {
                to: '/my-invites/items/all',
                text: 'Все'
            }];
            break;

        case 'my-invites/lists': 
            options = [{
                to: '/my-invites/lists',
                text: 'Вишлисты'
            }]
    }

    if(wishlistId && isListsMode) {
        options.push({
            to: `/${section}/lists/${wishlistId}`,
            text: wishlistName
        })
    }
    
    if(wishId && wishlistId && isListsMode) {
        options.push({
            to: `/${section}/lists/${wishlistId}/${wishId}`,
            text: wishName
        })
    }

    if(isNew && section === 'my-wishes') {
        options.push({
            to: `/my-wishes/${mode}/new`,
            text: isListsMode ? 'Новый вишлист' : 'Новое желание'
        })
    }

    if(isWishEditing && !isListsMode) {
        options.push({
            to: location,
            text: wishName + ': редактирование'
        })
    }

    // components:

    const NavOption = ({ to, text, index, onClick }) => {
        const slash = (<div className='nav-elem'>/</div>);
        return (
            <>
                { isListsMode && index > 0 && slash }
                { isWishEditing && index === 3 && slash}
                <NavLink
                    className='nav-elem option'
                    to= { to }
                    end={ isListsMode || isWishEditing }
                    children={ text }
                    onClick={onClick}
                />
            </>
        );
    }

    // calculate sliders position and behavior:

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
    },[location, currentTab?.innerHTML]);

    return (
        <div className='bread-crumbs'>
            <div
                className='bc-slider'
                style={sliderStyles}
            />
            { options.map((option, index) => (
                <NavOption
                    key={ index }
                    to={ option?.to }
                    text={ option?.text }
                    index={ index }
                />
            ))}
        </div>
    );
}