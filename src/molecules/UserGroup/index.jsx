import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import './styles.scss'
import { IconButton } from 'atoms/IconButton'
import { CurrentUserPic } from 'atoms/CurrentUserPic'

import { logout } from 'store/authSlice'


export const UserGroup = ({ isShort }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const currentUserId = useSelector(state => state.auth?.user?.id);

    return (
        <div className='user-group'>
            
            
            { currentUserId
              ? <>
                    <IconButton
                        icon='logout'
                        onClick={ () => dispatch(logout()) }
                    />
                    <IconButton
                        icon='settings'
                        onClick={ () => navigate('/profile') }/>
                    <CurrentUserPic/>
                </>
              : <IconButton
                    icon='login'
                    onClick={ () => navigate('/login') }
                />
            }
        </div>
    );
}