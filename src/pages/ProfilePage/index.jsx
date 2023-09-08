import { useState,
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
import { postImage,
         deleteImage } from 'store/imageSlice'


export const ProfilePage = () => {
    const dispatch = useDispatch();
    const { user, userHasLoaded } = getCurrentUser();
    const [ updateProfile ] = useUpdateProfileMutation();

    // FORM SETTINGS //

    const defaultValues = {
        id: user?.id || '',
        name: user?.name || '',
        email: user?.email || '',
        imageExtension: user?.imageExtension || '',
        newPassword: '',
        confirmPassword: '',
    }

    const { handleSubmit, register, setValue, watch, formState, trigger } = useForm({
        mode: 'onBlur',
        defaultValues
    });
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        if(userHasLoaded && user) {
            for (let [key, value] of Object.entries(user)) {
                setValue(key, value)
            }
            trigger()
        }
    },[ userHasLoaded ]);

    const watchName = watch('name');
    const watchEmail = watch('email');
    const watchNewPassword = watch('newPassword');
    const watchConfirmPassword = watch('confirmPassword');
    const passwordsNotSame = watchConfirmPassword && (watchNewPassword !== watchConfirmPassword);

    useEffect(() => {
        if(formState.isDirty) {
            setIsSubmitted(false)
        }
    },[ watchName, watchEmail, watchNewPassword ])


    // IMAGE SETTINGS //
    
    const [ image, setImage ] = useState(null);
    const [ isNewImage, setIsNewImage ] = useState(false);
    const currentImageURL = useSelector(state => state.images.imageURLs[user?.id]);
    
    function setNewImage(file) {
        setImage(file);
        setIsSubmitted(false)
        setIsNewImage(true)
    }

    useEffect(() => {
        if(!currentImageURL) return
        
        async function setImageFromURL() {
            await fetch(currentImageURL)
                .then(res => res.blob())
                .then(blob => setImage(blob))
                .catch(err => console.error(err))
        };
        setImageFromURL();
    },[ currentImageURL ]);
    
    // FORM SUBMITTING //

    const onSubmit = async (data, e) => {
        console.log({data})
        e.preventDefault();
        e.stopPropagation();
        
        updateProfile(data);
        
        if(image && isNewImage) {
            dispatch(postImage({
                id: data.id,
                file: image,
                drive: 'avatars'
            }))
        }
        if(!image) {
            dispatch(deleteImage({
                id: data.id,
                drive: 'avatars'
            }))
        }
        setIsSubmitted(true)
    }

    useEffect(() => {
        if(!watchNewPassword) setValue('confirmPassword', '')
    },[ watchNewPassword ])
    
    // ALIGNMENTS //

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
                                        text={ isSubmitted ? 'Изменения сохранены' : 'Сохранить изменения'}
                                        icon={isSubmitted ? 'ok' : 'save'}
                                        round
                                        disabled={
                                            isSubmitted ||
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
