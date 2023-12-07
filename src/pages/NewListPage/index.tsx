import { useState,
         useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

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

import type { SubmitHandler } from 'react-hook-form'
import type { BaseSyntheticEvent } from 'react'
import type { WishlistDefaultValues,
              WishlistId,
              InvitationCode } from 'typings'


const defaultValues: WishlistDefaultValues = {
    id: undefined,
    author: undefined,
    invitationCode: undefined,
    title: '',
    description: '',
    wishes: [],
    date: formatDateToArray(new Date()),
}

export const NewListPage = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    
    const { location,
            wishlistId,
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
    },[ editingWishlist?.id, location ]);

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
    
    // FORM SUBMITTING
    
    const onSubmit: SubmitHandler<WishlistDefaultValues> = async (data, e?: BaseSyntheticEvent) => {
        e?.preventDefault();
        const { id, author, invitationCode } = data;
        if(!id || !author || !invitationCode) return
        postWishlist({ ...data, id, author, invitationCode });
        navigate(`/my-wishes/lists/${ id }`)
    }
    
    const cancelForm = (e: MouseEvent) => {
        e.preventDefault();
        navigate(-1);
    }
    const resetForm = (e: MouseEvent) => {
        e.preventDefault();
        reset(defaultValues);
    }

    // PAGE ORIENTATION

    const [isLandscape, setIsLandscape] = useState(true);
    const setPageOrientation = () => setIsLandscape(window.innerWidth > 1080);

    useEffect(() => {
        setPageOrientation();
        window.addEventListener('resize', setPageOrientation);
        return () => window.removeEventListener('resize', setPageOrientation);
    },[]);
    
    // ALIGNMENTS

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
        <div className='new-list-page'>
            <form onSubmit={ handleSubmit(onSubmit) } >
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
                    />
                </div>

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
                        onClick={ handleSubmit(onSubmit) }
                        disabled={ formState.isDirty && !formState.isValid }
                        isLoading={ formState.isSubmitting || awaitPostWishlist }
                    />
                </LineContainer>

                <div className='divider'/>

                <CardSelect
                    name='wishes'
                    control={ control }
                    options={ actualWishes }
                />
            </form>
        </div> 
    );
}
