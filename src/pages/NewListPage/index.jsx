import React, { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import { Navigate } from 'react-router-dom'

import './styles.scss'
import { IconButton } from 'atoms/IconButton'
import { Button } from 'atoms/Button'
import { TextInput } from 'inputs/TextInput'
import { DateSelect } from 'inputs/DateSelect'
import { CardSelect } from 'inputs/CardSelect'
import { LineContainer } from 'containers/LineContainer'

import { generateUniqueId,
         formatDateToArray } from 'utils'
import { usePostWishlistMutation } from 'store/apiSlice'
import { getUserWishes,
         getAllRelevantWishlists } from 'store/getters'

export const NewListPage = () => {
    const currentUserId = useSelector(state => state.auth?.user?.id);
    const navigate = useNavigate();

    useEffect(() => {
        if(!currentUserId) navigate('/login')
    },[ currentUserId ])

    // setting form:

    const defaultValues = {
        id: '',
        author: currentUserId,
        wishes: [],
        title: '',
        description: '',
        date: formatDateToArray(new Date()),
    }
    const { handleSubmit, register, setValue, reset, control, formState } = useForm({
        mode: 'onChange',
        defaultValues
    });
    
    // form methods:
    
    const [postWishlist,{ data: postWishlistReturn }] = usePostWishlistMutation();

    const setId = useCallback(
        async () => {
            const id = await generateUniqueId();
            setValue('id', id);
            return id
        },
        [ generateUniqueId ]
    );
    useEffect(() => { setId() },[]);
    
    const onSubmit = async (data, e) => {
        e.preventDefault();
        if(!data.id) data.id = await setId();
        postWishlist(data);
    }
    
    useEffect(() => {
        if(postWishlistReturn?.id) {
            navigate(`/my-wishes/lists/${ postWishlistReturn.id }`)
        } else if(postWishlistReturn) {
            console.log(postWishlistReturn)
        }
    },[ postWishlistReturn ])
    
    const cancelForm = (e) => {
        e.preventDefault();
        navigate(-1);
    }
    const resetForm = (e) => {
        e.preventDefault();
        reset(defaultValues);
    }

    // set page orientation:

    const [isLandscape, setIsLandscape] = useState(true);
    const setPageOrientation = () => setIsLandscape(window.innerWidth > 1080);

    useEffect(() => {
        setPageOrientation();
        window.addEventListener('resize', setPageOrientation);
        return () => window.removeEventListener('resize', setPageOrientation);
    },[]);
    
    // align labels:

    const [maxLabelWidth, setMaxLabelWidth] = useState(null);

    useEffect(() => {
        const labels = document.querySelectorAll('.text-label');
        const labelWidths = [...labels].map(label => label?.offsetWidth);
        const maxWidth = labels.length
            ? Math.max(...labelWidths)
            : null;

        setMaxLabelWidth(maxWidth);
    });
    
    // get actual wishes for MultiColumnlayout:

    const wishes = getUserWishes()
                  .filter(wish => !wish.isCompleted);

    const divider = <div className='divider'/>

    return (
        <div className='new-list-page'>
            <form onSubmit={handleSubmit(onSubmit)} >
                <div className='inputs'>
                    <input
                        className='invis'
                        type='text'
                        {...register('id')}
                    />
                    <input
                        className='invis'
                        type='text'
                        {...register('author')}
                    />
                    <LineContainer
                        style={ isLandscape ? null : { flexFlow: 'column'} }
                    >
                        <TextInput
                            name='title'
                            register={register}
                            placeholder='Придумайте запоминающееся название'
                            label='Название'
                            labelWidth={maxLabelWidth}
                            required
                            formState={formState}
                        /> 
                        <DateSelect
                            name='date'
                            control={control}
                            label='Дата события'
                            labelWidth={ isLandscape ? null : maxLabelWidth }
                            required
                            formState={formState}
                        />
                    </LineContainer> 
                    <TextInput
                        name='description'
                        register={register}
                        placeholder='Что писать? Начните с приветствия. Опишите, каким вы хотели бы видеть мероприятие, что планируется — поход в бар, домашние посиделки или, может быть, что-то экзотичное. Если есть пожелания для гостей — что надеть или взять с собой — укажите их'
                        label='Описание'
                        labelWidth={maxLabelWidth}
                        multiline 
                    />
                </div>
                { divider }
                <CardSelect
                    name='wishes'
                    control={control}
                    options={wishes}
                />
                { divider }
                <LineContainer className='align-right'>
                    <IconButton
                        icon='clear'
                        onClick={resetForm}
                    />
                    <IconButton
                        icon='cancel'
                        onClick={cancelForm}
                    />
                    <Button
                        type='submit'
                        kind='primary'
                        text='Сохранить желание'
                        leftIcon='ok'
                        round
                        onClick={handleSubmit(onSubmit)}
                        disabled={!formState.isValid || formState.isSubmitting || formState.isSubmitted}
                    />
                </LineContainer>
            </form>
        </div> 
    )
}