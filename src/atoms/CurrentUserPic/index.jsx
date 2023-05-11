import   React,
       { useRef } from 'react'
import { useSelector,
         useDispatch } from 'react-redux'

import './styles.scss'
import { UserPlaceholder } from 'atoms/Icon'
import { WithDropDown } from 'atoms/WithDropDown'
import { WithSpinner } from 'atoms/WithSpinner'

import { postImage,
         deleteImageURL } from 'store/imageSlice'


export const CurrentUserPic = () => {
    const dispatch = useDispatch();
    const dropdownRef = useRef(null);
    const userId = useSelector(state => state.auth?.user.id)
    const imageURL = useSelector(state => state.images?.imageURLs[userId]);
    const isLoading = useSelector(state => state.images?.loading[userId]);
    
    const handleImagePick = async (e) => {
        dropdownRef.current.closeDropDown();
        const file = e.target.files[0];
        if(!file) return;
        dispatch(postImage({ id: userId, file, drive: 'avatars' }));
    }
        
    const UserPic = () => (
        <WithSpinner
            isLoading={ isLoading }
            colorTheme='dark'
            strokeWidth={ 6 }
            size={ 4 }
        >
            { imageURL
                ?   <img
                        src={ imageURL }
                        onError={() => dispatch(deleteImageURL(user?.id))}
                    />
                :   <UserPlaceholder/>
            }
        </WithSpinner>
    )
    
    const dropdownOptions = [{
        text: imageURL ? 'Сменить изображение' : 'Загрузить изображение',
        icon: 'upload',
        onClick: () => document.getElementById('uploadUserAvatar').click()
    }];

    return (
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
                trigger={ <UserPic/> }
            />
        </div>
    );
}
