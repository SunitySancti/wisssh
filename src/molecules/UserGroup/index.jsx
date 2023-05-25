import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import './styles.scss'
import { Button } from 'atoms/Button'
import { CurrentUserPic } from 'atoms/CurrentUserPic'

import { logout } from 'store/authSlice'


export const UserGroup = ({ isShort }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const currentUserId = useSelector(state => state.auth?.userId);

    function goToLogin() {
        navigate('/login')
    }
    function goToProfile() {
        navigate('/profile')
    }
    function logoutAndGoToLogin() {
        dispatch(logout());
        goToLogin()
    }

    return (
        <div className='user-group'>
            { currentUserId
              ? <>
                    <Button
                        icon='logout'
                        onClick={ logoutAndGoToLogin }
                    />
                    <Button
                        icon='settings'
                        onClick={ goToProfile }/>
                    <CurrentUserPic/>
                </>
              : <Button
                    icon='login'
                    onClick={ goToLogin }
                />
            }
        </div>
    );
}
