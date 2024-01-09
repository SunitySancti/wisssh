import { useState,
         useEffect,
         memo,
         useMemo, 
         useRef,
         useCallback} from 'react'
import { Outlet,
         useNavigate } from 'react-router-dom'

import './styles.scss'
import { SectionSwitcher } from 'molecules/SectionSwitcher'
import { CreationGroup } from 'molecules/CreationGroup'
import { UserGroup } from 'molecules/UserGroup'

import { updateHistory,
         clearHistory } from 'store/historySlice'
import { getImage } from 'store/imageSlice'
import { getLocationConfig,
         getCurrentUser} from 'store/getters'
import { useAppDispatch,
         useAppSelector } from 'store'

import type { RefObject,
              WheelEvent } from 'react'
import type { QueueItem } from 'store/imageSlice'
import type { WidthAwared } from 'typings'


interface AppHeaderViewProps {
    scrollContainerRef: RefObject<HTMLDivElement>;
    handleScroll(e: WheelEvent): void;
    groupsMaxWidth: number;
    creationGroupRef: RefObject<WidthAwared>;
    userGroupRef: RefObject<WidthAwared>;
    isShort: boolean
}


const AppHeaderView = memo(({
    scrollContainerRef,
    handleScroll,
    groupsMaxWidth,
    creationGroupRef,
    userGroupRef,
    isShort
} : AppHeaderViewProps
) => (
    <div
        className='scroll-container'
        ref={ scrollContainerRef }
        onWheel={ handleScroll }
    >
        <div className='app-header'>
            <div
                className='equalize-container'
                style={{ width: groupsMaxWidth }}
            >
                <CreationGroup ref={ creationGroupRef }/>
                <div className='space'/>
            </div>

            <SectionSwitcher isShort={ isShort }/>

            <div
                className='equalize-container'
                style={{ width: groupsMaxWidth }}
            >
                <div className='space'/>
                <UserGroup ref={ userGroupRef }/>
            </div>
        </div>
    </div>
));

export const AppHeader = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { location } = getLocationConfig();

    // REDIRECTING TO LOGIN OR LOGOUT //
    const token = useAppSelector(state => state.auth.token);
    const { user } = getCurrentUser();

    useEffect(() => {
        if(!token) {
            navigate('/login',{ state:{ redirectedFrom: location }})
        }
    },[ token ]);

    // HISTORY UPDATING //
    useEffect(() => { dispatch(updateHistory(location)) },[ location ]);
    useEffect(() => { return () => { dispatch(clearHistory()) }},[]);
    
    // FETCH IMAGES //
    const queue = useAppSelector(state => state.images.queue);
    const prior = useAppSelector(state => state.images.prior);
    const isLoading = useAppSelector(state => Boolean(Object.keys(state.images.loading).length));

    useEffect(() => {
        if(!isLoading) {
            const part: QueueItem[] = [];
            if(prior instanceof Array && prior.length) {
                part.push(...prior.slice(0,8))
            } else if(queue instanceof Array && queue.length) {
                part.push(...queue.slice(0,8))
            }

            part.forEach(item => dispatch(getImage(item)))
        }
    },[ queue, prior, isLoading ]);

    // HANDLE SCROLLING //
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const handleScroll = useCallback((e: WheelEvent) => {
        const scrollStep = 200;
        scrollContainerRef.current?.scroll({
            left: scrollContainerRef.current.scrollLeft + scrollStep * e.deltaY / 100,
            behavior: 'smooth'
        });
    },[ scrollContainerRef.current ])

    // SETTING SHORT OR FULL LOGO //
    const breakpoint = 1000;
    const [ isShort, setIsShort ] = useState(false);
    function checkWidth() {
        setIsShort(window.innerWidth < breakpoint)
    };
    useEffect(() => {
        checkWidth();
        window.addEventListener('resize', checkWidth);
        return () => {
            window.removeEventListener('resize', checkWidth);
        }
    },[]);

    // CENTERIZE LOGO //
    const creationGroupRef = useRef<WidthAwared>(null);
    const userGroupRef = useRef<WidthAwared>(null);

    const groupsMaxWidth = useMemo(() => {
        const defaultWidth = 198;
        const leftGroupWidth = creationGroupRef.current?.getWidth() || defaultWidth;
        const rightGroupWidth = userGroupRef.current?.getWidth() || defaultWidth;
        
        return Math.max(leftGroupWidth, rightGroupWidth)
    },[
        creationGroupRef.current?.getWidth(),
        userGroupRef.current?.getWidth(),
        user?.name
    ]);

    return (
        <AppHeaderView {...{
            scrollContainerRef,
            handleScroll,
            groupsMaxWidth,
            creationGroupRef,
            userGroupRef,
            isShort
        }}/>
    );
}

export const AppLayout = () => (
    <div className='app-layout'>
        <AppHeader/>
        <Outlet/>
    </div>
)
