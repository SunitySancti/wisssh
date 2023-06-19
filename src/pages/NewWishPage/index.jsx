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

import { generateUniqueId } from 'utils'
import { getCurrentUser,
         getUserWishlists,
         getWishById } from 'store/getters'
import { usePostWishMutation } from 'store/apiSlice'
import { postImage } from 'store/imageSlice'

export const NewWishPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const imageInputRef = useRef({});

    const [ , , , tab, editingWishId, editing ] = useLocation().pathname?.split('/');
    const isNewWish = (tab === 'new');
    const isEditing = (editing === 'editing');

    const { user } = getCurrentUser();
    const { userWishlists } = getUserWishlists();
    const editingWish = getWishById(editingWishId);
    const [ postWish,{ isLoading: awaitPostWish }] = usePostWishMutation();

    // FORM SETTINGS //

    const defaultValues = isNewWish && !isEditing
        ? {
            id: '',
            author: user?.id,
            inWishlists: [],
            reservedBy: '',
            title: '',
            description: '',
            imageExtension: '',
            imageAR: 1,
            external: '',
            price: 0,
            currency: 'rouble',
            stars: 0,
            isCompleted: false
        }
        :   editingWish

    const { handleSubmit, register, setValue, reset, watch, control, formState } = useForm({
        mode: 'onChange',
        defaultValues: defaultValues
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
    const wishlistOptions = userWishlists?.map(list => ({
        value: list.id,
        label: list.title
    }));

    async function setId() {
        const id = await generateUniqueId();
        setValue('id', id);
    }

    useEffect(() => {
        if(isNewWish && !isEditing) {
            setId()
        }
    },[ isNewWish, isEditing ]);

    useEffect(() => {
        if(user?.id && isNewWish && !isEditing) {
            setValue('author', user?.id)
        }
    },[ user?.id, isNewWish, isEditing ]);
        
    // setting image:

    const [ image, setImage ] = useState(null);
    const [ isNewImage, setIsNewImage ] = useState(false);
    const currentImageURL = useSelector(state => state.images?.imageURLs[editingWish?.id]);
    
    function setNewImage(file) {
        setImage(file);
        if(!isNewImage) setIsNewImage(true)
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
        if(image && (isNewImage || isNewWish)) {
            dispatch(postImage({
                id: data.id,
                file: image,
                drive: 'covers'
            }));
        }
        navigate(`/my-wishes/items/${ data.isCompleted ? 'completed' : 'actual' }/${ data.id }`)
    }

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
                                {...register('author',{ required: true })}
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
                            <input
                                className='invis'
                                type='text'
                                {...register('id',{ required: true })}
                            />
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
