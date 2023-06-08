import   React,
       { useState,
         useEffect,
         useMemo } from 'react'
import { Outlet,
         useNavigate,
         useLocation } from 'react-router'
import { useDispatch,
         useSelector } from 'react-redux'

import './styles.scss'
import { SectionSwitcher } from 'molecules/SectionSwitcher'
import { CreationGroup } from 'molecules/CreationGroup'
import { UserGroup } from 'molecules/UserGroup'

import { updateHistory,
         clearHistory } from 'store/historySlice'


export const AppHeader = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation().pathname;
    const token = useSelector(state => state.auth?.token);

    // HISTORY UPDATING
    useEffect(() => { dispatch(updateHistory(location)) },[ location ]);
    useEffect(() => { return () => { dispatch(clearHistory()) }},[]);


    useEffect(() => {
        if(!token) {
            navigate('/login', { state: {
                redirectedFrom: location,
                
            }})
        }
    },[ token ]);

    
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
    const [groupsMaxWidth, setGroupsMaxWidth] = useState(220);
    
    useEffect(() => {
        const creationGroupRef = document.querySelector('.app-header .creation-group');
        const userGroupRef = document.querySelector('.app-header .user-group');
        if(!creationGroupRef || !userGroupRef) setGroupsMaxWidth(220)
        
        const leftGroupWidth = creationGroupRef?.offsetWidth;
        const rightGroupWidth = userGroupRef?.offsetWidth;
        if(!leftGroupWidth || !rightGroupWidth) setGroupsMaxWidth(220)

        setGroupsMaxWidth(leftGroupWidth > rightGroupWidth
                        ? leftGroupWidth : rightGroupWidth)
    },[ isShort ]);


    // MORE OPTIMAL REALIZATION WITH USEMEMO. NEEDS FORWARD REF IN CREATIONGROUP AND USERGROUP FOR CORRECT WORK

    // const groupsMaxWidth = useMemo(() => {
    //     console.log({ isShort })
    //     const creationGroupRef = document.querySelector('.app-header .creation-group');
    //     const userGroupRef = document.querySelector('.app-header .user-group');
    //     console.log({ creationGroupRef, userGroupRef })
    //     if(!creationGroupRef || !userGroupRef) return 220
        
    //     const leftGroupWidth = creationGroupRef?.offsetWidth;
    //     const rightGroupWidth = userGroupRef?.offsetWidth;
    //     console.log({ leftGroupWidth, rightGroupWidth })
    //     if(!leftGroupWidth || !rightGroupWidth) return 220

    //     return leftGroupWidth > rightGroupWidth
    //          ? leftGroupWidth : rightGroupWidth
    // },[ isShort ]);


    return (
        <div className='app-layout'>
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
    );
}
