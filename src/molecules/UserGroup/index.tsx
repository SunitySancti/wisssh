import { useRef,
         forwardRef,
         useImperativeHandle,
         useMemo,
         memo, 
         useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import './styles.scss'
import { WithDropDown } from 'atoms/WithDropDown'
import { User } from 'atoms/User'

import { compressAndDoSomething } from 'inputs/ImageInput'
import { postImage } from 'store/imageSlice'
import { useUpdateProfileMutation } from 'store/apiSlice'
import { getCurrentUser } from 'store/getters'
import { useAppDispatch } from 'store'

import type { ChangeEvent,
              RefObject,
              ForwardedRef } from 'react'
import type { DropdownOption,
              WithDropDownRef } from 'atoms/WithDropDown'
import type { UserId,
              WidthAwared } from 'typings'


interface UserGroupViewProps {
    handleImagePick(e: ChangeEvent<HTMLInputElement>): void;
    imageInputRef: RefObject<HTMLInputElement>;
    dropdownRef: RefObject<WithDropDownRef>;
    dropdownOptions: DropdownOption[];
    userId?: UserId
}

const UserGroupView = memo(({
    handleImagePick,
    imageInputRef,
    dropdownRef,
    dropdownOptions,
    userId
} : UserGroupViewProps
) => (
    <WithDropDown
        ref={ dropdownRef }
        options={ dropdownOptions }
        trigger={
            <div className='user-group'>
                <input
                    ref={ imageInputRef }
                    type='file'
                    accept='image/png, image/jpeg'
                    onChange={ handleImagePick }
                    style={{ display: 'none', height: 0 }}
                />
                <User id={ userId } picSize={ 6 } reverse />
            </div>
        }
    />
));

export const UserGroup = forwardRef((
    _props,
    ref: ForwardedRef<WidthAwared>
) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const dropdownRef = useRef<WithDropDownRef>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const [ updateProfile ] = useUpdateProfileMutation();

    const { user } = getCurrentUser();

    const dropdownOptions = useMemo(() => [
        {
            text: user?.imageExtension ? 'Поменять аватарку' : 'Загрузить аватарку',
            icon: user?.imageExtension ? 'change' as const   : 'upload' as const,
            onClick: () => imageInputRef.current?.click()
        },{
            text: 'Настройки профиля',
            icon: 'settings' as const,
            onClick: () => navigate('/profile')
        },{
            text: 'Выйти',
            icon: 'logout' as const,
            onClick: () => navigate('/logout')
        }
    ],[ user?.imageExtension ]);

    useImperativeHandle(ref, () => ({
        getWidth() { return dropdownRef.current?.getWidth() }
    }));

    const handleImagePick = useCallback((e: ChangeEvent<HTMLInputElement>) => {
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
    },[]);

    return (
        <UserGroupView {...{
            handleImagePick,
            imageInputRef,
            dropdownRef,
            dropdownOptions,
            userId: user?.id
        }}/>
    )
})
