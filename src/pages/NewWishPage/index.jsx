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
import { WishPreloader } from 'atoms/Preloaders'
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
         getWishById,
         getLoadingStatus } from 'store/getters'
import { usePostWishMutation } from 'store/apiSlice'
import { postImage,
         deleteImage } from 'store/imageSlice'

export const NewWishPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const imageInputRef = useRef({});

    const location = useLocation().pathname
    const [ , , , tab, editingWishId, editing ] = location?.split('/');
    const isNewWish = (tab === 'new');
    const isEditing = (editing === 'editing');

    const { user } = getCurrentUser();
    const { userWishlists } = getUserWishlists();
    const editingWish = getWishById(editingWishId);
    const { awaitingUserWishes } = getLoadingStatus();
    const [ postWish,{ isLoading: awaitPostWish }] = usePostWishMutation();

    // FORM SETTINGS //

    const defaultValues = {
        id: '',
        author: user?.id,
        title: '',
        description: '',
        external: '',
        imageExtension: null,
        imageAR: 1,
        stars: 0,
        price: null,
        currency: 'rouble',
        inWishlists: [],
        reservedBy: null,
        isCompleted: false,
        completedAt: null,
        createdAt: null
    }

    const { handleSubmit, register, setValue, reset, watch, control, formState } = useForm({
        mode: 'onChange',
        defaultValues
    });

    useEffect(() => {
        if(editingWish && isEditing) {
            for (let [key, value] of Object.entries(editingWish)) {
                setValue(key, value)
            }
        } else {
            for (let [key, value] of Object.entries(defaultValues)) {
                setValue(key, value)
            }
        }
    },[ editingWish?.id, location ]);
    
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

    // IMAGE SETTINGS //

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
    
    // FORM SUBMITTING //

    const onSubmit = async (data, e) => { 
        e.preventDefault();
        
        postWish(data);

        if(image && (isNewImage || isNewWish)) {
            dispatch(postImage({
                id: data.id,
                file: image,
                drive: 'covers'
            }))
        }
        if(!image && !isNewWish && isEditing) {
            dispatch(deleteImage({
                id: data.id,
                drive: 'covers'
            }))
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
    
    // ALIGNMENTS //

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

    const invisibleFields = [{
        name: 'id',
        required: true
    },{
        name: 'author',
        required: true
    },{
        name: 'createdAt',
        required: false
    },{
        name: 'completedAt',
        required: false
    }];


    return ( awaitingUserWishes
        ?   <div className='wish-page'>
                <WishPreloader isLoading/>
            </div>
        :   <div className='new-wish-page'>
                <form onSubmit={ handleSubmit(onSubmit) }>
                    <DoubleColumnAdaptiveLayout
                        widthBreakpoint={ 1140 }
                        firstColumn={
                            <>
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
                                { invisibleFields.map(({name, required}, index) => (
                                    <input
                                        key={ index }
                                        className='invis'
                                        type='text'
                                        {...register(name,{ required })}
                                    />
                                ))}
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
                                        placeholder={ 4200 }
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
                                        icon='save'
                                        round
                                        onClick={ handleSubmit(onSubmit) }
                                        disabled={ formState.isDirty && !formState.isValid }
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
