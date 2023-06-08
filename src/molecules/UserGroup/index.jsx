import   React,
       { useRef,
         useEffect } from 'react'
import { useDispatch,
         useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import './styles.scss'
import { WithDropDown } from 'atoms/WithDropDown'
import { UserPic } from 'atoms/User'

import { logout } from 'store/authSlice'
import { postImage,
         promoteImages } from 'store/imageSlice'
import { getCurrentUser } from 'store/getters'


export const UserGroup = ({ isShort }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    const { user } = getCurrentUser();
    const imageURL = useSelector(state => state.images?.imageURLs[user?.id]);
    const isLoading = useSelector(state => state.images?.loading[user?.id]);

    useEffect(() => {
        dispatch(promoteImages(user?.id))
    },[ user?.id ]);

    const dropdownOptions = [
        {
            text: imageURL || isLoading ? 'Поменять аватарку' : 'Загрузить аватарку',
            icon: imageURL || isLoading ? 'change' : 'upload',
            onClick: () => document.getElementById('uploadUserAvatar').click()
        },{
            text: 'Настройки профиля',
            icon: 'settings',
            onClick: () => navigate('/profile')
        },{
            text: 'Выйти',
            icon: 'logout',
            onClick: () => dispatch(logout())
        }
    ];

    function handleImagePick(e)  {
        dropdownRef.current?.closeDropDown();
        const file = e.target.files[0];
        if(!file) return;
        dispatch(postImage({ id: user?.id, file, drive: 'avatars' }));
    }
    

    return (
            <WithDropDown
                ref={ dropdownRef }
                options={ dropdownOptions }
                trigger={<>
                    <div className='user-group'>
                        <input
                            id='uploadUserAvatar'
                            type='file'
                            accept='image/*'
                            onChange={ handleImagePick }
                            style={{ display: 'none', height: 0 }}
                        />
                        { user?.name &&
                            <span className='user-name'>@ { user.name }</span>
                        }
                        <UserPic {...{ imageURL, isLoading, size: 6 }}/>
                    </div>
                </>}
            />
    );
}
