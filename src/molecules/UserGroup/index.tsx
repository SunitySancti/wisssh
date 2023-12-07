import { useRef,
         useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import './styles.scss'
import { WithDropDown } from 'atoms/WithDropDown'
import { UserPic } from 'atoms/User'

import { compressAndDoSomething } from 'inputs/ImageInput'
import { postImage,
         promoteImages } from 'store/imageSlice'
import { useUpdateProfileMutation } from 'store/apiSlice'
import { getCurrentUser } from 'store/getters'
import { useAppDispatch,
         useAppSelector } from 'store'

import type { ChangeEvent } from 'react'
import type { WithDropDownRef } from 'atoms/WithDropDown'


export const UserGroup = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const dropdownRef = useRef<WithDropDownRef>(null);
    const [ updateProfile ] = useUpdateProfileMutation();

    const { user } = getCurrentUser();
    const imageURL = useAppSelector(state => state.images.imageURLs[user ? user.id : 'undefined']);
    const isLoading = useAppSelector(state => state.images.loading[user ? user.id : 'undefined']);
    const shouldShowImage = (imageURL || isLoading) && user?.imageExtension;

    useEffect(() => {
        if(user?.imageExtension) {
            dispatch(promoteImages(user?.id))
        }
    },[ user?.id ]);

    const dropdownOptions = [
        {
            text: shouldShowImage ? 'Поменять аватарку' : 'Загрузить аватарку',
            icon: shouldShowImage ? 'change' : 'upload',
            onClick: () => document.getElementById('uploadUserAvatar')?.click()
        },{
            text: 'Настройки профиля',
            icon: 'settings',
            onClick: () => navigate('/profile')
        },{
            text: 'Выйти',
            icon: 'logout',
            onClick: () => navigate('/logout')
        }
    ];

    function handleImagePick(e: ChangeEvent<HTMLInputElement>)  {
        dropdownRef.current?.closeDropDown();
        const fileList = e.target?.files;
        const file = fileList && fileList[0];
        if(!file || !user) return;

        const handlePostImage = (file: Blob) => {
            dispatch(postImage({ id: user.id, file, drive: 'avatars' }));
            const type = file.type.split('/')[1];
            const imageExtension = type === 'jpeg' ? 'jpg' : 'png';
            updateProfile({ ...user, imageExtension })
        }
        const compressOptions = {
            maxWidth: 440,
            maxHeight: 440,
            quality: 0.6,
            softCompress: true
        }
        compressAndDoSomething(file, handlePostImage, compressOptions);
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
                        accept='image/png, image/jpeg'
                        onChange={ handleImagePick }
                        style={{ display: 'none', height: 0 }}
                    />
                    { user?.name &&
                        <span className='user-name'>@ { user.name }</span>
                    }
                    <UserPic 
                        imageURL={ user?.imageExtension ? imageURL : null }
                        isLoading={ isLoading }
                        size={ 6 }
                    />
                </div>
            </>}
        />
    );
}
