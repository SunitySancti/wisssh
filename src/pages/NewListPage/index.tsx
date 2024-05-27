import { useState,
         useEffect,
         useImperativeHandle } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate,
         useOutletContext } from 'react-router-dom'

import './styles.scss'
import { Button } from 'atoms/Button'
import { TextInput } from 'inputs/TextInput'
import { DateSelect } from 'inputs/DateSelect'
import { CardSelect } from 'inputs/CardSelect'
import { LineContainer } from 'containers/LineContainer'

import { useAppDispatch } from 'store'
import { generateUniqueId,
         formatDateToArray } from 'utils'
import { usePostWishlistMutation } from 'store/apiSlice'
import { getLocationConfig,
         getCurrentUser,
         getActualWishes,
         getWishlistById } from 'store/getters'
import { promoteImages } from 'store/imageSlice'
import { askMobile } from 'store/responsivenessSlice'

import type { Control,
              FormState,
              SubmitHandler,
              UseFormRegister } from 'react-hook-form'
import type { BaseSyntheticEvent,
              MouseEvent } from 'react'
import type { WishlistDefaultValues,
              WishlistId,
              Wish,
              InvitationCode } from 'typings'
import type { OutletContextType } from 'organisms/NavBarLayout'


interface NewListPageViewProps {
    handleFormSubmit: (e?: BaseSyntheticEvent | undefined) => Promise<void>;
    resetForm: (e: MouseEvent) => void;
    cancelForm: (e: MouseEvent) => void;
    register: UseFormRegister<WishlistDefaultValues>;
    control: Control<WishlistDefaultValues>;
    formState: FormState<WishlistDefaultValues>;
    actualWishes: Wish[];
    isSubmitButtonDisabled: boolean;
    isSubmitButtonLoading: boolean;
    isLandscape: boolean;
    maxLabelWidth: number | undefined
}


const defaultValues: WishlistDefaultValues = {
    id: undefined,
    author: undefined,
    invitationCode: undefined,
    title: '',
    description: '',
    wishes: [],
    date: formatDateToArray(new Date()),
}

const NewListPageView = ({
    handleFormSubmit,
    resetForm,
    cancelForm,
    register,
    control,
    formState,
    actualWishes,
    isSubmitButtonDisabled,
    isSubmitButtonLoading,
    isLandscape,
    maxLabelWidth
} : NewListPageViewProps
) => {
    const isMobile = askMobile();
    return (
        <div className='new-list-page'>
            <form onSubmit={ handleFormSubmit } >
                <div className='inputs'>

                    <input
                        className='invis'
                        type='text'
                        {...register('author',{ required: true })}
                    />
                    <input
                        className='invis'
                        type='text'
                        {...register('id',{ required: true })}
                    />

                    <LineContainer
                        style={ isLandscape ? null : { flexFlow: 'column'} }
                    >
                        <TextInput
                            name='title'
                            register={ register }
                            placeholder='Придумайте запоминающееся название'
                            label='Название'
                            labelWidth={ maxLabelWidth }
                            required
                            formState={ formState }
                        /> 
                        <DateSelect
                            name='date'
                            control={ control }
                            label='Дата события'
                            labelWidth={ isLandscape ? undefined : maxLabelWidth }
                            required
                        />
                    </LineContainer> 

                    <TextInput
                        name='description'
                        register={ register }
                        placeholder='Что писать? Начните с приветствия. Опишите, каким вы хотели бы видеть мероприятие, что планируется — поход в бар, домашние посиделки или, может быть, что-то экзотичное. Если есть пожелания для гостей — что надеть или взять с собой — укажите их'
                        label='Описание'
                        labelWidth={ maxLabelWidth }
                        multiline
                        rows={ 8 }
                    />
                </div>

                { !isMobile &&
                    <>
                        <div className='divider'/>

                        <LineContainer className='align-right'>
                            <Button
                                icon='clear'
                                onClick={ resetForm }
                            />
                            <Button
                                icon='cancel'
                                onClick={ cancelForm }
                            />
                            <Button
                                type='submit'
                                kind='primary'
                                text='Сохранить вишлист'
                                icon='save'
                                round
                                disabled={ isSubmitButtonDisabled }
                                isLoading={ isSubmitButtonLoading }
                            />
                        </LineContainer>
                    </>
                }

                <div className='divider'/>

                <CardSelect
                    name='wishes'
                    control={ control }
                    options={ actualWishes }
                />
            </form>
        </div>
    )
}

export const NewListPage = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    
    const { wishlistId,
            isNewWishlist,
            isEditWishlist } = getLocationConfig();

    const [ postWishlist,{ isLoading: awaitPostWishlist }] = usePostWishlistMutation();
    const { user } = getCurrentUser();
    const { actualWishes } = getActualWishes();
    const actualWishIds = actualWishes?.map(wish => wish.id);
    const editingWishlist = getWishlistById(wishlistId);

    // FORM SETTINGS //
    const { handleSubmit,
            register,
            reset,
            control,
            formState,
            setValue } = useForm<WishlistDefaultValues>({
        mode: 'onChange',
        defaultValues
    });

    useEffect(() => {
        if(editingWishlist && isEditWishlist) {
            for (let [key, value] of Object.entries(editingWishlist)) {
                setValue(key, value)
            }
        } else {
            for (let [key, value] of Object.entries(defaultValues)) {
                setValue(key, value)
            }
        }
    },[ editingWishlist?.id, isEditWishlist ]);

    async function setIdAndInvitationCode() {
        const id = await generateUniqueId<WishlistId>();
        const invitationCode = await generateUniqueId<InvitationCode>(11);
        setValue('id', id);
        setValue('invitationCode', invitationCode);
    }

    useEffect(() => {
        if(isNewWishlist && !isEditWishlist) {
            setIdAndInvitationCode();
        }
    },[ isNewWishlist, isEditWishlist ]);

    useEffect(() => {
        if(user && isNewWishlist && !isEditWishlist) {
            setValue('author', user.id)
        }
    },[ user?.id, isNewWishlist, isEditWishlist ]);
    
    // FORM SUBMITTING //
    const onSubmit: SubmitHandler<WishlistDefaultValues> = async (data, e?: BaseSyntheticEvent) => {
        e?.preventDefault();
        if(formState.isValid) {
            const { id, author, invitationCode } = data;
            if(!id || !author || !invitationCode) return
            postWishlist({ ...data, id, author, invitationCode });
            navigate(`/my-wishes/lists/${ id }`)
        }
    }
    const handleFormSubmit = handleSubmit(onSubmit);
    
    const cancelForm = (e: MouseEvent) => {
        e.preventDefault();
        navigate(-1);
    }
    const resetForm = (e: MouseEvent) => {
        e.preventDefault();
        reset(defaultValues);
    }

    // TRANSLATE SUBMIT FUNCTION TO NAVBAR //
    const { wishlistSubmitRef, setIsAbleToSumbit } = useOutletContext<OutletContextType>();
    useImperativeHandle(wishlistSubmitRef, () => ({
        submit: handleFormSubmit
    }));
    useEffect(() => {
        setIsAbleToSumbit(formState.isValid)
    },[ formState.isValid ]);
    

    // PAGE ORIENTATION //
    const [isLandscape, setIsLandscape] = useState(true);
    const setPageOrientation = () => setIsLandscape(window.innerWidth > 1080);

    useEffect(() => {
        setPageOrientation();
        window.addEventListener('resize', setPageOrientation);
        return () => window.removeEventListener('resize', setPageOrientation);
    },[]);
    
    // ALIGNMENTS //
    const [maxLabelWidth, setMaxLabelWidth] = useState<number | undefined>(undefined);

    useEffect(() => {
        const labels = document.querySelectorAll<HTMLDivElement>('.text-label');
        const labelWidths = [...labels].map(label => label.offsetWidth);
        const maxWidth = labels.length ? Math.max(...labelWidths) : undefined;

        setMaxLabelWidth(maxWidth);
    });

    useEffect(() => {
        dispatch(promoteImages(actualWishIds))
    },[ actualWishIds?.length ])

    return (
        <NewListPageView {...{
            handleFormSubmit,
            resetForm,
            cancelForm,
            register,
            control,
            formState,
            actualWishes,
            isSubmitButtonDisabled: !formState.isValid,
            isSubmitButtonLoading: formState.isSubmitting || awaitPostWishlist,
            isLandscape,
            maxLabelWidth
        }}/>
    );
}
