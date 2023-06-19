import   React,
       { useState,
         useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useSelector,
         useDispatch } from 'react-redux'

import './styles.scss'
import { Button } from 'atoms/Button'
import { ScrollBox } from 'containers/ScrollBox'
import { LineContainer } from 'containers/LineContainer'
import { DoubleColumnAdaptiveLayout } from 'containers/DoubleColumnAdaptiveLayout'
import { ImageInput } from 'inputs/ImageInput'
import { TextInput } from 'inputs/TextInput'
import { PasswordInput } from 'inputs/PasswordInput'

import { getCurrentUser } from 'store/getters'
import { useUpdateProfileMutation } from 'store/apiSlice'
import { postImage } from 'store/imageSlice'


export const ProfilePage = () => {
    const dispatch = useDispatch();
    const { user } = getCurrentUser();
    const [     updateProfile, {
        data:   updateProfileResponse }] = useUpdateProfileMutation();

    // setting form:

    const defaultValues = {
        id: user?.id || '',
        name: user?.name || '',
        email: user?.email || '',
        imageExtension: user?.imageExtension || '',
        newPassword: '',
        confirmPassword: '',
    }
    const { handleSubmit, register, setValue, watch, formState } = useForm({
        mode: 'onChange',
        defaultValues
    });
    const watchNewPassword = watch('newPassword');
    const watchConfirmPassword = watch('confirmPassword');
    const passwordsNotSame = watchConfirmPassword && (watchNewPassword !== watchConfirmPassword);

    // setting image:
    
    const [ image, setImage ] = useState(null);
    const [ imageIsNew, setImageIsNew ] = useState(false);
    const currentImageURL = useSelector(state => state.images.imageURLs[user?.id]);
    
    function setNewImage(file) {
        setImage(file);
        if(!imageIsNew) setImageIsNew(true)
    }

    useEffect(() => {
        if(!currentImageURL) return
        
        async function setImageFromURL() {
            await fetch(currentImageURL)
                .then(res => res.blob())
                .then(blob => setImage(blob))
                .catch(err => console.error(err))
        };
        setImageFromURL()
    },[ currentImageURL ]);
    
    //form methods:

    const onSubmit = async (data, e) => {
        e.preventDefault();
        e.stopPropagation();
        
        updateProfile(data);
        if(image && imageIsNew) {
            dispatch(postImage({
                id: data.id,
                file: image,
                drive: 'avatars'
            }));
        }
    }

    useEffect(() => {
        if(!image) console.log('image was discarded')
    },[ image ])

    useEffect(() => {
        if(!watchNewPassword) setValue('confirmPassword', '')
    },[ watchNewPassword ])

    useEffect(() => {
        if(updateProfileResponse) {
            console.log(updateProfileResponse)
        }
    },[ updateProfileResponse ])
    
    // align labels:

    const [maxLabelWidth, setMaxLabelWidth] = useState(null);

    useEffect(() => {
        const labels = document.querySelectorAll('.text-label');
        const labelWidths = [...labels].map(label => label?.offsetWidth);
        const maxWidth = labels.length ? Math.max(...labelWidths) : null;

        setMaxLabelWidth(maxWidth);
    });
    
    const putShadowOnContent = () => {
        const contentWasScrolled = document.querySelector('.profile-body').scrollTop;
        const nav = document.querySelector('.navbar .content');
        if(contentWasScrolled) nav.classList.add('with-shadow');
        else nav.classList.remove('with-shadow');
    }
    
    return (
        <>
            <div className='navbar'>
                <ScrollBox>
                    <div className='profile-header'>
                        Профиль пользователя <b>@{ user?.name }</b>
                    </div>
                </ScrollBox>
            </div>
            <div
                className='profile-body'
                onScroll={ putShadowOnContent }
            >
                <form onSubmit={ handleSubmit(onSubmit) }>
                    <DoubleColumnAdaptiveLayout
                        firstColumn={
                            <ImageInput
                                register={ register }
                                setValue={ setValue }
                                setImage={ setNewImage }
                                image={ image }
                                isUser
                            />
                        }
                        secondColumn={
                            <>
                                <TextInput
                                    name='name'
                                    register={ register }
                                    // placeholder='AmonRa'
                                    label='Никнейм'
                                    labelWidth={ maxLabelWidth }
                                    required
                                    formState={ formState }
                                />
                                <TextInput
                                    name='email'
                                    register={ register }
                                    type='email'
                                    patternType='email'
                                    placeholder='sun@inner.space'
                                    label='email'
                                    labelWidth={ maxLabelWidth }
                                    required
                                    formState={ formState }
                                />
                                <PasswordInput
                                    name='newPassword'
                                    register={ register }
                                    autoComplete="new-password"
                                    label='Изменить пароль'
                                    labelWidth={ maxLabelWidth }
                                />
                                { watchNewPassword &&
                                    <PasswordInput
                                        name='confirmPassword'
                                        register={ register }
                                        autoComplete="off"
                                        label='Подтверждение'
                                        labelWidth={ maxLabelWidth }
                                        required
                                        warningMessage={ passwordsNotSame && 'Пароли не совпадают' }
                                    />
                                }

                                <div className='divider'/>

                                <LineContainer className='align-right'>
                                    <Button
                                        type='submit'
                                        kind='primary'
                                        text='Сохранить изменения'
                                        icon='ok'
                                        round
                                        disabled={
                                            !formState.isValid ||
                                            formState.isSubmitting ||
                                            passwordsNotSame
                                        }
                                    />
                                </LineContainer>
                            </>
                        }
                    />
                </form>
            </div>
        </>
    )
}
