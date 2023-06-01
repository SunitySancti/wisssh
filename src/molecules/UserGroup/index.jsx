import   React,
       { useRef } from 'react'
import { useDispatch,
         useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import './styles.scss'
import { UserPlaceholder } from 'atoms/Icon'
import { WithDropDown } from 'atoms/WithDropDown'
import { WithSpinner } from 'atoms/Spinner'
import { Button } from 'atoms/Button'

import { logout } from 'store/authSlice'
import { postImage } from 'store/imageSlice'
import { getCurrentUser } from 'store/getters'


const UserPic = ({ imageURL, isLoading }) => (
    <WithSpinner
        isLoading={ isLoading }
        colorTheme='dark'
        strokeWidth={ 6 }
        size={ 4 }
    >
        { imageURL
            ?   <img src={ imageURL }/>
            :   <UserPlaceholder/>
        }
    </WithSpinner>
);

export const UserGroup = ({ isShort }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    const { user } = getCurrentUser();
    const isLogged = useSelector(state => state.auth?.token);
    const imageURL = useSelector(state => state.images?.imageURLs[user?.id]);
    const isLoading = useSelector(state => state.images?.loading[user?.id]);

    const dropdownOptions = [{
        text: imageURL ? 'Сменить изображение' : 'Загрузить изображение',
        icon: 'upload',
        onClick: () => document.getElementById('uploadUserAvatar').click()
    }];

    function handleImagePick(e)  {
        dropdownRef.current.closeDropDown();
        const file = e.target.files[0];
        if(!file) return;
        dispatch(postImage({ id: user?.id, file, drive: 'avatars' }));
    }
    

    return (
        <div className='user-group'>
            { isLogged
                ? <>
                    <Button
                        icon='logout'
                        onClick={ () => dispatch(logout()) }
                    />
                    <Button
                        icon='settings'
                        onClick={ () => navigate('/profile') }/>
                    <div className='current-user-pic'>
                        <input
                            id='uploadUserAvatar'
                            type='file'
                            accept='image/*'
                            onChange={ handleImagePick }
                            style={{ display: 'none', height: 0 }}
                        />
                        <WithDropDown
                            ref={ dropdownRef }
                            options={ dropdownOptions }
                            trigger={ <UserPic {...{ imageURL, isLoading }}/> }
                        />
                    </div>
                </>
                : <Button
                    icon='login'
                    onClick={ () => navigate('/login') }
                />
            }
        </div>
    );
}
