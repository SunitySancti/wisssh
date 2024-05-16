import { useEffect,
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
import { getLocationConfig } from 'store/getters'
import { useAppDispatch,
         useAppSelector } from 'store'

import type { RefObject,
              WheelEvent } from 'react'
import type { QueueItem } from 'store/imageSlice'
import type { WidthAwared } from 'typings'
import { findOutMobile } from 'store/responsivenessSlice'


interface AppHeaderViewProps {
    handleScroll(e: WheelEvent): void;
    scrollContainerRef: RefObject<HTMLDivElement>;
    creationGroupRef: RefObject<WidthAwared>;
    userGroupRef: RefObject<WidthAwared>;
    groupsMaxWidth: number
}


const AppHeaderView = memo(({
    handleScroll,
    scrollContainerRef,
    creationGroupRef,
    userGroupRef,
    groupsMaxWidth
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

            <SectionSwitcher/>

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
        userGroupRef.current?.getWidth()
    ]);

    return (
        <AppHeaderView {...{
            handleScroll,
            scrollContainerRef,
            creationGroupRef,
            userGroupRef,
            groupsMaxWidth
        }}/>
    );
}

export const AppLayout = () => {
    // RESPONSIVENESS //
    const { isNarrow } = useAppSelector(state => state.responsiveness);
    const isMobile = findOutMobile()
    
    return (
        <div className={'app-layout' + (isNarrow ? ' narrow' : '') + (isMobile ? ' mobile' : '')}>
            <AppHeader/>
            <Outlet/>
        </div>
    )
}