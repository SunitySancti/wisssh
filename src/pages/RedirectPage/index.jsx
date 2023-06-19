import   React from 'react'
import { Navigate,
         useLocation } from 'react-router-dom'

export const RedirectPage = () => {
    const { state } = useLocation();

    return state && <Navigate to={ state.to } replace/>
}
