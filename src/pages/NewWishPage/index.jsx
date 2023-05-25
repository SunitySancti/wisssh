import   React,
       { useState,
         useEffect,
         useRef,
         useMemo} from 'react'
import { useDispatch,
         useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { useLocation,
         useNavigate } from 'react-router-dom'

import './styles.scss'
import { Button } from 'atoms/Button'
import { ImageInput } from 'inputs/ImageInput'
import { TextInput } from 'inputs/TextInput'
import { SelectBox } from 'inputs/SelectBox'
import { StarRating } from 'inputs/StarRating'
import { ToggleInput } from 'inputs/ToggleInput'
import { LineContainer } from 'containers/LineContainer'
import { DoubleColumnAdaptiveLayout } from 'containers/DoubleColumnAdaptiveLayout'

import { getUserWishlists,
         getWishById,
         getUserWishes } from 'store/getters'
import { usePostWishMutation } from 'store/apiSlice'
import { postImage } from 'store/imageSlice'

export const NewWishPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const imageInputRef = useRef({});

    const [ postWish,{ data: postWishResponse, error: postWishError, isLoading: awaitPostWish }] = usePostWishMutation();
    const userWishes = getUserWishes();
    const currentUserId = useSelector(state => state.auth?.userId);

    useEffect(() => {
        if(!currentUserId) navigate('/login')
    },[ currentUserId ])
    
    // setting form:

    const [ , , , , editingWishId, editing ] = useLocation().pathname?.split('/');
    const isEditingPage = (editing === 'editing');

    const wishValues = isEditingPage ? getWishById(editingWishId) : null;
    const defaultValues = {
        id: undefined,
        author: currentUserId,
        inWishlists: [],
        reservedBy: '',
        title: '',
        description: '',
        imageExtension: '',
        imageAR: 1,
        external: '',
        price: '',
        currency: 'rouble',
        stars: 0,
        isCompleted: ''
    }
    const { handleSubmit, register, setValue, reset, watch, control, formState } = useForm({
        mode: 'onChange',
        defaultValues: wishValues || defaultValues
    });
    
    const statusOptions = [
        { value: false, label: 'Актуально' },
        { value: true, label: 'Исполнено' }
    ];
    const currencyOptions = [
        {value: 'rouble', label: '₽'},
        {value: 'euro', label: '€'},
        {value: 'dollar', label: '$'},
    ];
    const wishlistOptions = getUserWishlists().map(list => ({
        value: list.id,
        label: list.title
    }))
        
    // setting image:

    const [ image, setImage ] = useState(null);
    const [ imageIsNew, setImageIsNew ] = useState(false);
    const currentImageURL = useSelector(state => state.images?.imageURLs[wishValues?.id]);
    
    function setNewImage(file) {
        setImage(file);
        if(!imageIsNew) setImageIsNew(true)
    }

    useEffect(() => {
        if(!currentImageURL) return;
        
        async function setImageFromURL() {
            await fetch(currentImageURL)
                .then(res => res.blob())
                .then(blob => setImage(blob))
                .catch(err => console.error(err))
        };
        setImageFromURL()
    },[ currentImageURL ]);

    // FORM SUBMITTING

    const onSubmit = async (data, e) => { 
        e.preventDefault();

        postWish(data);
        if(image && (imageIsNew || !isEditingPage)) {
            dispatch(postImage({
                id: data.id,
                file: image,
                drive: 'covers'
            }));
        }
    }

    useEffect(() => {
        if(postWishError?.status) {
            console.log(postWishError)
        } else {
            const wishKeys = userWishes.map(wish => wish.id);
            const postedKey = postWishResponse?.id;

            if(postedKey && wishKeys.includes(postedKey)) {
                const tab = postWishResponse?.isCompleted ? 'completed' : 'actual';
                navigate(`/my-wishes/items/${ tab }/${ postedKey }`)
            }
        }
    },[ postWishResponse?.id, postWishError?.status, userWishes.length ])

    const cancelForm = (e) => {
        e.preventDefault();
        navigate(-1);
    }
    const resetForm = (e) => {
        e.preventDefault();
        reset(defaultValues);
        imageInputRef.current.deleteImage();
    }
    
    // ALIGNMENTS

    const [ maxLabelWidth, setMaxLabelWidth ] = useState(null);

    useEffect(() => {
        const labels = document.querySelectorAll('.text-label');
        const labelWidths = [...labels].map(label => label?.offsetWidth);
        const maxWidth = labels.length ? Math.max(...labelWidths) : null;

        setMaxLabelWidth(maxWidth);
    });

    const watchImageAR = watch('imageAR');
    
    const firstColumnMaxWidth = useMemo(() => {
        if(!image) return 440

        const widthFromAR = ( window.innerHeight - 250 ) * watchImageAR;
        const maximumWidth = 1000;
        
        if(widthFromAR < maximumWidth) {
            return widthFromAR
        } else {
            return maximumWidth
        }
    },[ image, watchImageAR ]);

    const firstColumnMinWidth = useMemo(() => {
        const minHeight = 330
        if(!image) return minHeight;
        else return minHeight * watchImageAR;
    },[ image, watchImageAR ]);


    return (
        <div className='new-wish-page'>
            <form onSubmit={ handleSubmit(onSubmit) }>
                <DoubleColumnAdaptiveLayout
                    widthBreakpoint={ 1140 }
                    firstColumn={
                        <>
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
                            <ImageInput
                                register={ register }
                                setValue={ setValue }
                                imageInputRef={ imageInputRef }
                                image={ image }
                                setImage={ setNewImage }
                            />
                        </>
                    }
                    firstColumnLimits={{
                        min: firstColumnMinWidth,
                        max: firstColumnMaxWidth
                    }}
                    secondColumn={
                        <>
                            <TextInput
                                name='title'
                                register={ register }
                                placeholder='Таинственный артефакт'
                                label='Название'
                                labelWidth={ maxLabelWidth }
                                required
                                formState={ formState }
                            />
                            <TextInput
                                name='description'
                                register={ register }
                                placeholder='Отметьте моменты, которые вам важны. Чем точнее вы опишете желание, тем проще друзьям будет его исполнить'
                                label='Описание'
                                labelWidth={ maxLabelWidth }
                                multiline
                                
                            />
                            <TextInput
                                name='external'
                                register={ register }
                                placeholder='https://magicstore.com/goods/mysterious-artefact'
                                label='Ссылка'
                                labelWidth={ maxLabelWidth }
                            />
                            <LineContainer>
                                <TextInput
                                    name='price'
                                    formState={ formState }
                                    patternType='number'
                                    register={ register }
                                    placeholder='4200'
                                    label='Цена'
                                    labelWidth={ maxLabelWidth }
                                />
                                <ToggleInput
                                    name='currency'
                                    control={ control }
                                    options={ currencyOptions }
                                />
                            </LineContainer>
                            <LineContainer>
                                <SelectBox
                                    name='isCompleted'
                                    control={ control }
                                    options={ statusOptions }
                                    placeholder='Актуально'
                                    label='Статус'
                                    labelWidth={ maxLabelWidth }
                                />
                                <StarRating
                                    name='stars'
                                    control={ control }
                                    maxStars={ 3 }
                                    starBoxSize={ 4 }
                                />
                            </LineContainer>
                            <SelectBox
                                name='inWishlists'
                                control={ control }
                                isMulti
                                options={ wishlistOptions }
                                placeholder='Можно сразу добавить в вишлисты'
                                label='Вишлисты'
                                labelWidth={ maxLabelWidth }
                                noOptionsMessage={() => 'У вас пока нет актуальных вишлистов'}
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
                                    isLoading={ formState.isSubmitting || awaitPostWish }
                                />
                            </LineContainer>
                        </>
                    }
                    secondColumnLimits={{
                        min: 500
                    }}
                />
            </form>
        </div>
    );
}