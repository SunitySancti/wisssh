import { useRef,
         useEffect } from 'react'
import { useDispatch,
         useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import './styles.scss'
import { WithDropDown } from 'atoms/WithDropDown'
import { UserPic } from 'atoms/User'

import { compressAndDoSomething } from 'inputs/ImageInput'
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
    const shouldSwowImage = (imageURL || isLoading) && user?.imageExtension;

    useEffect(() => {
        if(user?.imageExtension) {
            dispatch(promoteImages(user?.id))
        }
    },[ user?.id ]);

    const dropdownOptions = [
        {
            text: shouldSwowImage ? 'Поменять аватарку' : 'Загрузить аватарку',
            icon: shouldSwowImage ? 'change' : 'upload',
            onClick: () => document.getElementById('uploadUserAvatar').click()
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

    function handleImagePick(e)  {
        dropdownRef.current?.closeDropDown();
        const file = e.target.files[0];
        if(!file || !user?.id) return;
        const handlePostImage = (file) => {
            dispatch(postImage({ id: user.id, file, drive: 'avatars' }));
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
