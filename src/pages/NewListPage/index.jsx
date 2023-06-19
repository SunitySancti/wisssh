import   React,
       { useState,
         useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate,
         useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import './styles.scss'
import { Button } from 'atoms/Button'
import { TextInput } from 'inputs/TextInput'
import { DateSelect } from 'inputs/DateSelect'
import { CardSelect } from 'inputs/CardSelect'
import { LineContainer } from 'containers/LineContainer'

import { generateUniqueId,
         formatDateToArray } from 'utils'
import { usePostWishlistMutation } from 'store/apiSlice'
import { getActualWishes,
         getCurrentUser,
         getWishlistById } from 'store/getters'
import { promoteImages } from 'store/imageSlice'

export const NewListPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const [ , , , wishlistId, editing ] = useLocation().pathname?.split('/');
    const isNewWishlist = (wishlistId === 'new');
    const isEditing = (editing === 'editing');

    const { user } = getCurrentUser();
    const actualWishes = getActualWishes();
    const actualWishIds = actualWishes?.map(wish => wish.id);
    const editingWishlist = getWishlistById(wishlistId);
    const [ postWishlist,{ isLoading: awaitPostWishlist }] = usePostWishlistMutation();

    // FORM SETTINGS //

    const defaultValues = isNewWishlist && !isEditing
        ? {
            id: '',
            invitationCode: '',
            title: '',
            author: user?.id,
            description: '',
            wishes: [],
            date: formatDateToArray(new Date()),
        }
        :   editingWishlist

    const { handleSubmit, register, reset, control, formState, setValue } = useForm({
        mode: 'onChange',
        defaultValues
    });

    async function setIdAndInvitationCode() {
        const id = await generateUniqueId();
        const invitationCode = await generateUniqueId(11);
        setValue('id', id);
        setValue('invitationCode', invitationCode);
    }

    useEffect(() => {
        if(isNewWishlist && !isEditing) {
            setIdAndInvitationCode();
        }
    },[ isNewWishlist, isEditing ]);

    useEffect(() => {
        if(user?.id && isNewWishlist && !isEditing) {
            setValue('author', user?.id)
        }
    },[ user?.id, isNewWishlist, isEditing ]);
    
    // FORM SUBMITTING
    
    const onSubmit = async (data, e) => {
        e.preventDefault();
        console.log(data)
        postWishlist(data);
        navigate(`/my-wishes/lists/${ data.id }`)
    }
    
    const cancelForm = (e) => {
        e.preventDefault();
        navigate(-1);
    }
    const resetForm = (e) => {
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

    const [maxLabelWidth, setMaxLabelWidth] = useState(null);

    useEffect(() => {
        const labels = document.querySelectorAll('.text-label');
        const labelWidths = [...labels].map(label => label?.offsetWidth);
        const maxWidth = labels?.length
            ? Math.max(...labelWidths)
            : null;

        setMaxLabelWidth(maxWidth);
    });

    useEffect(() => {
        dispatch(promoteImages(actualWishIds))
    },[ actualWishIds?.length ])


    return (
        <div className='new-list-page'>
            <form onSubmit={handleSubmit(onSubmit)} >
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
                            labelWidth={ isLandscape ? null : maxLabelWidth }
                            required
                            formState={ formState }
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

                <CardSelect
                    name='wishes'
                    control={ control }
                    options={ actualWishes }
                />

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
                        text='Сохранить желание'
                        icon='ok'
                        round
                        onClick={ handleSubmit(onSubmit) }
                        disabled={ !formState.isValid }
                        isLoading={ formState.isSubmitting || awaitPostWishlist }
                    />
                </LineContainer>
            </form>
        </div> 
    )
}
