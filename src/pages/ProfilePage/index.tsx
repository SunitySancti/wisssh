import { useState,
         useEffect } from 'react'
import { useForm } from 'react-hook-form'

import './styles.scss'
import { Button } from 'atoms/Button'
import { ScrollBox } from 'containers/ScrollBox'
import { LineContainer } from 'containers/LineContainer'
import { DoubleColumnAdaptiveLayout } from 'containers/DoubleColumnAdaptiveLayout'
import { ImageInput } from 'inputs/ImageInput'
import { TextInput } from 'inputs/TextInput'
import { PasswordInput } from 'inputs/PasswordInput'

import { useAppSelector,
         useAppDispatch } from 'store'
import { getCurrentUser } from 'store/getters'
import { useUpdateProfileMutation } from 'store/apiSlice'
import { postImage,
         deleteImage } from 'store/imageSlice'

import type { BaseSyntheticEvent } from 'react'
import type { SubmitHandler } from 'react-hook-form'
import type { UserId } from 'typings'


interface ProfileFormValues {
    id?: UserId;
    name?: string;
    email?: string;
    newPassword?: string;
    confirmPassword?: string
}


const defaultValues: ProfileFormValues = {
    id: undefined,
    name: undefined,
    email: undefined,
    newPassword: undefined,
    confirmPassword: undefined
}

export const ProfilePage = () => {
    const dispatch = useAppDispatch();
    const { user,
            userHasLoaded } = getCurrentUser();
    const [ updateProfile ] = useUpdateProfileMutation();

    // FORM SETTINGS //

    const { handleSubmit,
            register,
            setValue,
            watch,
            formState,
            trigger } = useForm({
        mode: 'onBlur',
        defaultValues
    });
    const [ isSubmitted, setIsSubmitted ] = useState(false);

    const watchName = watch('name');
    const watchEmail = watch('email');
    const watchNewPassword = watch('newPassword');
    const watchConfirmPassword = watch('confirmPassword');
    const passwordsNotSame = !!watchConfirmPassword && (watchNewPassword !== watchConfirmPassword);

    useEffect(() => {
        if(userHasLoaded && user) {
            for (let [key, value] of Object.entries(user)) {
                if(key in defaultValues) {
                    setValue(key as keyof typeof defaultValues, value)
                }
            }
            trigger()
        }
    },[ userHasLoaded ]);

    useEffect(() => {
        if(formState.isDirty) {
            setIsSubmitted(false)
        }
    },[ watchName, watchEmail, watchNewPassword ])


    // IMAGE SETTINGS //
    
    const [ image, setImage ] = useState<Blob | undefined>(undefined);
    const [ isNewImage, setIsNewImage ] = useState(false);
    const currentImageURL = useAppSelector(state => state.images.imageURLs[user?.id || 'undefined']);
    
    function setNewImage(blob?: Blob) {
        setImage(blob);
        setIsSubmitted(false)
        setIsNewImage(true)
    }

    useEffect(() => {
        if(!currentImageURL) return
        
        async function setImageFromURL(url: string) {
            await fetch(url)
                .then(res => res.blob())
                .then(blob => setImage(blob))
                .catch(err => console.error(err))
        };
        setImageFromURL(currentImageURL);
    },[ currentImageURL ]);
    
    // FORM SUBMITTING //

    const onSubmit: SubmitHandler<ProfileFormValues> = async (data, e?: BaseSyntheticEvent) => {
        e?.preventDefault();
        e?.stopPropagation();
        
        const { id, name, email } = data
        if(!id || !name || !email) return

        
        updateProfile({ ...data, id, name, email });
        
        if(image) {
            const type = image.type.split('/')[1];
            const imageExtension = type === 'jpeg' ? 'jpg' : 'png';
            updateProfile({ ...data, id, name, email, imageExtension });

            if(isNewImage) {
                dispatch(postImage({
                    id,
                    file: image,
                    drive: 'avatars'
                }))
            }
        } else {
            updateProfile({ ...data, id, name, email, imageExtension: null });
            dispatch(deleteImage({
                id,
                drive: 'avatars'
            }))
        }
        setIsSubmitted(true)
    }

    useEffect(() => {
        if(!watchNewPassword) setValue('confirmPassword', '')
    },[ watchNewPassword ])
    
    // ALIGNMENTS //

    const [ maxLabelWidth, setMaxLabelWidth ] = useState<number | undefined>(undefined);

    useEffect(() => {
        const labels = document.querySelectorAll<HTMLDivElement>('.text-label');
        const labelWidths = [...labels].map(label => label?.offsetWidth);
        const maxWidth = labels.length ? Math.max(...labelWidths) : undefined;

        setMaxLabelWidth(maxWidth);
    });
    
    const putShadowOnContent = () => {
        const content = document.querySelector<HTMLDivElement>('.profile-body');
        const nav = document.querySelector<HTMLDivElement>('.navbar .content');
        if(!content || !nav) return
        
        if(content.scrollTop) {
            nav.classList.add('with-shadow')
        } else {
            nav.classList.remove('with-shadow')
        }
    }
    
    return (
        <>
            <div className='navbar'>
                <ScrollBox>
                    <div className='profile-header'>
                        Профиль пользователя <b>{ user ? '@' + user.name : '' }</b>
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
                                        icon={ isSubmitted ? 'ok' : 'save' }
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
    );
}
