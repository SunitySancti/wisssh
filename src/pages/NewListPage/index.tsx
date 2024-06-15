import { memo,
         useState,
         useEffect,
         useImperativeHandle, 
         useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate,
         useOutletContext } from 'react-router-dom'
import { useDeepCompareMemo } from 'use-deep-compare'

import './styles.scss'
import { Button } from 'atoms/Button'
import { TextInput } from 'inputs/TextInput'
import { DateSelect } from 'inputs/DateSelect'
import { CardSelect } from 'inputs/CardSelect'
import { LineContainer } from 'containers/LineContainer'

import { useAppSelector } from 'store'
import { generateUniqueId,
         formatDateToArray } from 'utils'
import { usePostWishlistMutation } from 'store/apiSlice'
import { getLocationConfig,
         getCurrentUser,
         getActualWishIds,
         getWishlistById } from 'store/getters'

import type { Control,
              FormState,
              SubmitHandler,
              UseFormRegister } from 'react-hook-form'
import type { BaseSyntheticEvent,
              MouseEvent } from 'react'
import type { WishlistDefaultValues,
              WishlistId,
              WishId,
              InvitationCode } from 'typings'
import type { OutletContextType } from 'organisms/NavBarLayout'


interface NewListPageViewProps {
    handleFormSubmit: (e?: BaseSyntheticEvent | undefined) => Promise<void>;
    resetForm: (e: MouseEvent) => void;
    cancelForm: (e: MouseEvent) => void;
    register: UseFormRegister<WishlistDefaultValues>;
    control: Control<WishlistDefaultValues>;
    formState: FormState<WishlistDefaultValues>;
    actualWishIds: WishId[];
    isSubmitButtonDisabled: boolean;
    isSubmitButtonLoading: boolean;
    isLandscape: boolean;
    maxLabelWidth: number | undefined;
    isMobile: boolean;
}


const defaultValues: WishlistDefaultValues = {
    id: undefined,
    author: undefined,
    invitationCode: undefined,
    title: '',
    description: '',
    wishes: [],
    guests: [],
    date: formatDateToArray(new Date()),
}

const NewListPageView = memo(({
    handleFormSubmit,
    resetForm,
    cancelForm,
    register,
    control,
    formState,
    actualWishIds,
    isSubmitButtonDisabled,
    isSubmitButtonLoading,
    isLandscape,
    maxLabelWidth,
    isMobile
} : NewListPageViewProps
) => {
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
                    options={ actualWishIds }
                />
            </form>
        </div>
    )
});

export const NewListPage = () => {
    const navigate = useNavigate();
    
    const isMobile = useAppSelector(state => state.responsiveness.isMobile);
    const { wishlistId,
            isNewWishlist,
            isEditWishlist } = getLocationConfig();

    const [ postWishlist,{ isLoading: awaitPostWishlist }] = usePostWishlistMutation();
    const { user } = getCurrentUser();
    const actualWishIds = getActualWishIds();
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

    const memoizedFormState = useDeepCompareMemo(() => (
        formState
    ),[ formState ]);

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
        const { id, author, invitationCode } = data;
        if(!id || !author || !invitationCode) return
        postWishlist({ ...data, id, author, invitationCode });
        navigate(`/my-wishes/lists/${ id }`)
    }
    const handleFormSubmit = useCallback(handleSubmit(onSubmit),[
        handleSubmit,
        postWishlist,
        navigate
    ]);
    
    const cancelForm = useCallback((e: MouseEvent) => {
        e.preventDefault();
        navigate(-1);
    },[ navigate ])
    const resetForm = useCallback((e: MouseEvent) => {
        e.preventDefault();
        reset(defaultValues);
    },[ reset, defaultValues])

    // TRANSLATE SUBMIT FUNCTION TO NAVBAR //
    const { submitRef, setIsAbleToSumbit } = useOutletContext<OutletContextType>();
    const isAbleToSumbit = formState.isValid;

    useImperativeHandle(submitRef, () => ({
        submitWishlist: handleFormSubmit
    }));
    useEffect(() => {
        setIsAbleToSumbit(isAbleToSumbit)
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

    return (
        <NewListPageView {...{
            handleFormSubmit,
            resetForm,
            cancelForm,
            register,
            control,
            formState: memoizedFormState,
            actualWishIds,
            isSubmitButtonDisabled: !isAbleToSumbit,
            isSubmitButtonLoading: formState.isSubmitting || awaitPostWishlist,
            isLandscape,
            maxLabelWidth,
            isMobile
        }}/>
    );
}
