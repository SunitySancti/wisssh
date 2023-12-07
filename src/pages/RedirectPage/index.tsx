import { Navigate } from 'react-router-dom'

import { getLocationConfig } from 'store/getters'


export const RedirectPage = () => {
    const { redirectTo } = getLocationConfig();
    
    return <Navigate to={ redirectTo || '/my-wishes/items/actual' } replace/>
}
