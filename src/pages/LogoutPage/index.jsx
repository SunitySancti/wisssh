import   React,
       { useLayoutEffect } from 'react'
import { useDispatch,
         useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

import { logout } from 'store/authSlice'
import { apiSlice } from 'store/apiSlice'
import { resetImageStore } from 'store/imageSlice'
import { clearHistory } from 'store/historySlice'

export const LogoutPage = () => {
    const dispatch = useDispatch();
    const token = useSelector(state => state.auth?.token);

    // LOGOUT AND REDIRECT

    useLayoutEffect(() => {
        dispatch(logout());
        dispatch(clearHistory());
        dispatch(resetImageStore());
        dispatch(apiSlice.util.resetApiState())
    },[])

    return !!token && <Navigate to='/login' replace/>
}
