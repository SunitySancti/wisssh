import   React,
       { useLayoutEffect } from 'react'
import { useDispatch,
         useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

import { logout } from 'store/authSlice'

export const LogoutPage = () => {
    const dispatch = useDispatch();
    const token = useSelector(state => state.auth?.token);

    // LOGOUT AND REDIRECT

    useLayoutEffect(() => {
        dispatch(logout())
    },[])

    return !!token && <Navigate to='/login' replace/>
}
