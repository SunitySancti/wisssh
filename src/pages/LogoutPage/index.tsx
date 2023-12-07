import { useLayoutEffect } from 'react'
import { Navigate } from 'react-router-dom'

import { useAppDispatch,
         useAppSelector } from 'store'
import { logout } from 'store/authSlice'
import { apiSlice } from 'store/apiSlice'
import { resetImageStore } from 'store/imageSlice'
import { clearHistory } from 'store/historySlice'


export const LogoutPage = () => {
    const dispatch = useAppDispatch();
    const token = useAppSelector(state => state.auth.token);

    // LOGOUT AND REDIRECT

    useLayoutEffect(() => {
        dispatch(logout());
        dispatch(clearHistory());
        dispatch(resetImageStore());
        dispatch(apiSlice.util.resetApiState())
    },[])

    return token ? <Navigate to='/login' replace/> : null
}
