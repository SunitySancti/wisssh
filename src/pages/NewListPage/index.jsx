import   React,
       { useState,
         useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { useDispatch } from 'react-redux'

import './styles.scss'
import { Button } from 'atoms/Button'
import { TextInput } from 'inputs/TextInput'
import { DateSelect } from 'inputs/DateSelect'
import { CardSelect } from 'inputs/CardSelect'
import { LineContainer } from 'containers/LineContainer'

import { formatDateToArray } from 'utils'
import { usePostWishlistMutation } from 'store/apiSlice'
import { getActualWishes,
         getCurrentUser } from 'store/getters'
import { promoteImages } from 'store/imageSlice'

export const NewListPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const [         postWishlist, {
        data:       pwResponse,
        error:      pwError,
        isSuccess:  pwSuccess,
        isError:    pwWasCrashed,
        isLoading:  pwAwaiting      }] = usePostWishlistMutation();

    // const actualWishes = {};
    const { actualWishes } = getActualWishes();
    const { user,
            userHasLoaded } = getCurrentUser();
    const actualWishIds = actualWishes?.map(w => w.id);

    useEffect(() => {
        dispatch(promoteImages(actualWishIds))
    },[ actualWishIds?.length ])

    // FORM SETTINGS

    const defaultValues = {
        author: user?.id || '',
        wishes: [],
        title: '',
        description: '',
        date: formatDateToArray(new Date()),
    }
    const { handleSubmit, register, reset, control, formState, setValue } = useForm({
        mode: 'onChange',
        defaultValues
    });

    useEffect(() => {
        if(userHasLoaded) {
            setValue('author', user?.id)
        }
    },[ userHasLoaded ])
    
    // FORM SUBMITTING
    
    const onSubmit = async (data, e) => {
        e.preventDefault();
        postWishlist(data);
    }
    
    useEffect(() => {
        if(pwSuccess) {
            navigate(`/my-wishes/lists/${ pwResponse.id }`)
        }
    },[ pwSuccess ]);

    useEffect(() => {
        if(pwWasCrashed) {
            console.log(pwError)
        }
    },[ pwWasCrashed ])
    
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

    const divider = <div className='divider'/>

    return (
        <div className='new-list-page'>
            <form onSubmit={handleSubmit(onSubmit)} >
                <div className='inputs'>

                    <input className='invis' type='text' {...register('author')}/>

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

                { divider }

                <CardSelect
                    name='wishes'
                    control={ control }
                    options={ actualWishes }
                />

                { divider }
                
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
                        isLoading={ pwAwaiting || formState.isSubmitting }
                    />
                </LineContainer>
            </form>
        </div> 
    )
}