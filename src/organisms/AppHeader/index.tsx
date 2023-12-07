import { useState,
         useEffect } from 'react'
import { Outlet,
         Navigate,
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

import type { WheelEvent } from 'react'
import type { QueueItem } from 'store/imageSlice'


export const AppHeader = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { location } = getLocationConfig();
    const token = useAppSelector(state => state.auth.token);
    const { user, awaitingUser } = getCurrentUser();

    useEffect(() => {
        if(!user && !awaitingUser) navigate('/logout')
    });
    
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

    // HISTORY UPDATING
    useEffect(() => { dispatch(updateHistory(location)) },[ location ]);
    useEffect(() => { return () => { dispatch(clearHistory()) }},[]);

    
    const breakpointWidth = 1000;
    const [isShort, setIsShort] = useState(false);
    const checkWidth = () => setIsShort(window.innerWidth < breakpointWidth);

    const scrollStep = 200;
    const scrollContainer = document.querySelector<HTMLDivElement>('.scroll-container');
    const handleScroll = (e: WheelEvent) => {
        if(scrollContainer) {
            const step = scrollContainer.scrollLeft + scrollStep * e.deltaY / 100;
            scrollContainer.scroll({
                left: step,
                behavior: 'smooth'
            });
        }
    }

    useEffect(() => {
        checkWidth();
        window.addEventListener('resize', checkWidth);
        return () => {
            window.removeEventListener('resize', checkWidth);
        }
    },[]);

    // CENTERIZE LOGO
    const [groupsMaxWidth, setGroupsMaxWidth] = useState(300);
    
    useEffect(() => {
        const creationGroupRef = document.querySelector<HTMLDivElement>('.app-header .creation-group');
        const userGroupRef = document.querySelector<HTMLDivElement>('.app-header .user-group');
        if(!creationGroupRef || !userGroupRef) setGroupsMaxWidth(220)
        
        const leftGroupWidth = creationGroupRef?.offsetWidth;
        const rightGroupWidth = userGroupRef?.offsetWidth;
        if(!leftGroupWidth || !rightGroupWidth) {
            setGroupsMaxWidth(220)
        } else {
            setGroupsMaxWidth(leftGroupWidth > rightGroupWidth
                            ? leftGroupWidth : rightGroupWidth)
        }
    },[ isShort, user?.name ]);


    // MORE OPTIMAL REALIZATION WITH USEMEMO. NEEDS FORWARD REF IN CREATIONGROUP AND USERGROUP FOR CORRECT WORK

    // const groupsMaxWidth = useMemo(() => {
    //     const creationGroupRef = document.querySelector('.app-header .creation-group');
    //     const userGroupRef = document.querySelector('.app-header .user-group');
    //     if(!creationGroupRef || !userGroupRef) return 220
        
    //     const leftGroupWidth = creationGroupRef?.offsetWidth;
    //     const rightGroupWidth = userGroupRef?.offsetWidth;
    //     if(!leftGroupWidth || !rightGroupWidth) return 220

    //     return leftGroupWidth > rightGroupWidth
    //          ? leftGroupWidth : rightGroupWidth
    // },[ isShort ]);

    return ( token
        ?   <div className='app-layout'>
                <div
                    className='scroll-container'
                    onWheel={ handleScroll }
                >
                    <div className='app-header'>
                        <div
                            className='equalize-container'
                            style={{ width: groupsMaxWidth }}
                        >
                            <CreationGroup/>
                            <div className='space'/>
                        </div>

                        <SectionSwitcher isShort={ isShort }/>

                        <div
                            className='equalize-container'
                            style={{ width: groupsMaxWidth }}
                        >
                            <div className='space'/>
                            <UserGroup/>
                        </div>
                    </div>
                </div>
                
                <Outlet/>
            </div>
        :   <Navigate
                to='/login'
                state={{ redirectedFrom: location }}
                replace
            />
    );
}
