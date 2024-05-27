import { useState,
         useEffect, 
         useCallback } from 'react'
import { useForm } from 'react-hook-form'

import './styles.scss'
import { Button } from 'atoms/Button'
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
import type { FormState,
              SubmitHandler,
              UseFormRegister } from 'react-hook-form'
import type { UserId } from 'typings'


interface LabelAlignment {
    labelWidth: number
}

interface ProfileFormViewProps extends LabelAlignment {
    handleFormSubmit: (e?: BaseSyntheticEvent | undefined) => Promise<void>;
    register: UseFormRegister<ProfileFormValues>;
    formState: FormState<ProfileFormValues>;
    passwordsNotSame: boolean;
    isSubmitted: boolean;
    image: Blob | undefined;
    setImage: (blob?: Blob | undefined) => void;
    watchNewPassword: string | undefined;
}

interface ProfileFormValues {
    id?: UserId;
    name?: string;
    email?: string;
    newPassword?: string;
    confirmPassword?: string
}


const ProfileFormView = ({
    handleFormSubmit,
    register,
    formState,
    passwordsNotSame,
    isSubmitted,
    image,
    setImage,
    watchNewPassword,
    labelWidth
} : ProfileFormViewProps
) => (
    <form onSubmit={ handleFormSubmit }>
        <DoubleColumnAdaptiveLayout
            firstColumn={
                <ImageInput {...{
                    register,
                    setImage,
                    image,
                    isUser: true
                }}/>
            }
            secondColumn={
                <>
                    <div className='inputs'>
                        <TextInput {...{
                            register,
                            name: 'name',
                            label: 'Никнейм',
                            formState,
                            labelWidth,
                            required: true
                        }}/>
                        <TextInput {...{
                            register,
                            name: 'email',
                            label: 'email',
                            type: 'email',
                            patternType: 'email',
                            formState,
                            labelWidth,
                            required: true,
                        }}/>
                        <PasswordInput {...{
                            register,
                            name: 'newPassword',
                            label: 'Изменить пароль',
                            autoComplete: "new-password",
                            labelWidth
                        }}/>
                        { watchNewPassword &&
                            <PasswordInput {...{
                                register,
                                name: 'confirmPassword',
                                label: 'Подтверждение',
                                autoComplete: "off",
                                required: true,
                                warningMessage: passwordsNotSame ? 'Пароли не совпадают' : undefined,
                                labelWidth
                            }}/>
                        }
                    </div>

                    <div className='divider'/>

                    <LineContainer className='align-right'>
                        <Button
                            type='submit'
                            kind='primary'
                            text={ isSubmitted ? 'Изменения сохранены' : 'Сохранить изменения'}
                            icon={ isSubmitted ? 'ok' : 'save' }
                            round
                            disabled={ isSubmitted
                                    || !formState.isValid
                                    || formState.isSubmitting
                                    || passwordsNotSame
                            }
                        />
                    </LineContainer>
                </>
            }
        />
    </form>
);

const ProfileForm = ({ labelWidth }: LabelAlignment) => {
    const dispatch = useAppDispatch();
    const { user } = getCurrentUser();
    const [ updateProfile ] = useUpdateProfileMutation();
    
    const defaultValues: ProfileFormValues = {
        id: user?.id,
        name: user?.name,
        email: user?.email,
        newPassword: undefined,
        confirmPassword: undefined
    }

    // FORM SETTINGS //
    const { handleSubmit,
            register,
            setValue,
            watch,
            formState } = useForm<ProfileFormValues>({
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
        if(user) {
            for (let [key, value] of Object.entries(user)) {
                if(key in defaultValues) {
                    setValue(key as keyof ProfileFormValues, value)
                }
            }
        }
    },[ user ]);

    useEffect(() => {
        if(formState.isDirty) {
            setIsSubmitted(false)
        }
    },[ watchName,
        watchEmail,
        watchNewPassword
    ]);


    // IMAGE SETTINGS //
    const [ image, setImage ] = useState<Blob | undefined>(undefined);
    const [ isNewImage, setIsNewImage ] = useState(false);
    const currentImageURL = useAppSelector(state => state.images.imageURLs[user?.id || 'undefined']);
    
    const setNewImage = useCallback((blob?: Blob) => {
        setImage(blob);
        setIsSubmitted(false)
        setIsNewImage(true)
    },[])

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

    return (
        <ProfileFormView {...{
            handleFormSubmit: handleSubmit(onSubmit),
            register,
            formState,
            passwordsNotSame,
            isSubmitted,
            image,
            setImage: setNewImage,
            userName: user ? '@' + user.name : '',
            watchNewPassword,
            labelWidth
        }}/>
    )
}

export const ProfilePage = () => {
    // LABEL ALIGNMENT //
    const defaultLabelWidth = 151;
    const [ labelWidth, setLabelWidth ] = useState<number>(defaultLabelWidth);

    useEffect(() => {
        const labels = document.querySelectorAll<HTMLDivElement>('.text-label');
        const labelWidths = [...labels].map(label => label?.offsetWidth);
        const maxWidth = labels.length ? Math.max(...labelWidths) : defaultLabelWidth;

        setLabelWidth(maxWidth);
    });
    
    return <ProfileForm {...{ labelWidth }}/>
}
