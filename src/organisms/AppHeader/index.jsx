import   React,
       { useState,
         useEffect,
         useMemo } from 'react'
import { Outlet,
         Navigate,
         useNavigate,
         useLocation } from 'react-router-dom'
import { useDispatch,
         useSelector } from 'react-redux'

import './styles.scss'
import { SectionSwitcher } from 'molecules/SectionSwitcher'
import { CreationGroup } from 'molecules/CreationGroup'
import { UserGroup } from 'molecules/UserGroup'

import { updateHistory,
         clearHistory } from 'store/historySlice'
import { getImage } from 'store/imageSlice'
import { getCurrentUser} from 'store/getters'

export const AppHeader = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation().pathname;
    const token = useSelector(state => state.auth?.token);
    const { user, awaitingUser } = getCurrentUser();

    useEffect(() => {
        if(!user && !awaitingUser) navigate('/logout')
    });
    
    // FETCH IMAGES //
    const queue = useSelector(state => state.images?.queue);
    const prior = useSelector(state => state.images?.prior);
    const isLoading = useSelector(state => Boolean(Object.keys(state.images?.loading)?.length));

    useEffect(() => {
        if(!isLoading) {
            let part;
            if(prior instanceof Array && prior.length) {
                part = prior.slice(0,8)
            } else if(queue instanceof Array && queue.length) {
                part = queue.slice(0,8)
            }

            part?.forEach(item => dispatch(getImage(item)))
        }
    },[ queue, prior, isLoading ]);

    // HISTORY UPDATING
    useEffect(() => { dispatch(updateHistory(location)) },[ location ]);
    useEffect(() => { return () => { dispatch(clearHistory()) }},[]);

    
    const breakpointWidth = 1000;
    const [isShort, setIsShort] = useState(false);
    const checkWidth = () => setIsShort(window.innerWidth < breakpointWidth);

    const scrollStep = 200;
    const scrollContainer = document.querySelector('.scroll-container');
    const handleScroll = (e) => {
        e.preventDefault();
        const step = scrollContainer?.scrollLeft + scrollStep * e.deltaY / 100;
        scrollContainer?.scroll({
            left: step,
            behavior: 'auto'
        });
    }

    useEffect(() => {
        checkWidth();
        window.addEventListener('resize', checkWidth);
        scrollContainer?.addEventListener('wheel', handleScroll);
        return () => {
            window.removeEventListener('resize', checkWidth);
            scrollContainer?.addEventListener('wheel', handleScroll);
        }
    },[]);

    // CENTERIZE LOGO
    const [groupsMaxWidth, setGroupsMaxWidth] = useState(300);
    
    useEffect(() => {
        const creationGroupRef = document.querySelector('.app-header .creation-group');
        const userGroupRef = document.querySelector('.app-header .user-group');
        if(!creationGroupRef || !userGroupRef) setGroupsMaxWidth(220)
        
        const leftGroupWidth = creationGroupRef?.offsetWidth;
        const rightGroupWidth = userGroupRef?.offsetWidth;
        if(!leftGroupWidth || !rightGroupWidth) setGroupsMaxWidth(220)

        setGroupsMaxWidth(leftGroupWidth > rightGroupWidth
                        ? leftGroupWidth : rightGroupWidth)
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
                <div className='scroll-container'>
                    <div className='app-header'>
                        <div
                            className='equalize-container'
                            style={{ width: groupsMaxWidth }}
                        >
                            <CreationGroup isShort={ isShort }/>
                            <div className='space'/>
                        </div>

                        <SectionSwitcher isShort={ isShort }/>

                        <div
                            className='equalize-container'
                            style={{ width: groupsMaxWidth }}
                        >
                            <div className='space'/>
                            <UserGroup isShort={ isShort }/>
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
