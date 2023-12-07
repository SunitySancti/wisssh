import { useState,
         useEffect,
         useRef,
         useMemo} from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

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

import { useAppDispatch,
         useAppSelector } from 'store'
import { generateUniqueId } from 'utils'
import { getLocationConfig,
         getCurrentUser,
         getUserWishlists,
         getWishById,
         getLoadingStatus } from 'store/getters'
import { usePostWishMutation } from 'store/apiSlice'
import { postImage,
         deleteImage } from 'store/imageSlice'

import type { BaseSyntheticEvent } from 'react'
import type { SubmitHandler } from 'react-hook-form'
import type { WishId,
              WishDefaultValues } from 'typings'



const defaultValues: WishDefaultValues = {
    id: undefined,
    author: undefined,
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
    createdAt: null,
    lastModifiedAt: undefined
}

export const NewWishPage = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const imageInputRef = useRef({ deleteImage(_e: Event){} });

    const { location,
            wishId,
            isNewWish,
            isEditWish } = getLocationConfig();

    const { user } = getCurrentUser();
    const { userWishlists } = getUserWishlists();
    const editingWish = getWishById(wishId);
    const { awaitingUserWishes } = getLoadingStatus();
    const [ postWish,{
            isLoading: awaitPostWish }] = usePostWishMutation();

    // FORM SETTINGS //

    const { handleSubmit,
            register,
            setValue,
            reset,
            watch,
            control,
            formState } = useForm<WishDefaultValues>({
        mode: 'onChange',
        defaultValues
    });

    useEffect(() => {
        if(editingWish && isEditWish) {
            for (let [key, value] of Object.entries(editingWish)) {
                setValue(key as keyof WishDefaultValues, value)
            }
        } else {
            for (let [key, value] of Object.entries(defaultValues)) {
                setValue(key as keyof WishDefaultValues, value)
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
    const wishlistOptions = userWishlists.map(list => ({
        value: list.id,
        label: list.title
    }));

    async function setId() {
        const id = await generateUniqueId<WishId>();
        setValue('id', id);
    }

    useEffect(() => {
        if(isNewWish) {
            setId()
        }
    },[ isNewWish ]);

    useEffect(() => {
        if(user) {
            setValue('author', user.id)
        }
    },[ user?.id ])

    useEffect(() => {
        if(user?.id && isNewWish) {
            setValue('author', user?.id)
        }
    },[ user?.id, isNewWish ]);

    // IMAGE SETTINGS //

    const [ image, setImage ] = useState<Blob | undefined>(undefined);
    const [ isNewImage, setIsNewImage ] = useState(false);
    const currentImageURL = useAppSelector(state => state.images.imageURLs[editingWish?.id || 'undefined']);
    
    function setNewImage(blob?: Blob) {
        setImage(blob);
        if(!isNewImage) setIsNewImage(true)
    }

    useEffect(() => {
        if(!currentImageURL) return
        
        async function setImageFromURL(url: string) {
            await fetch(url)
                .then(res => res.blob())
                .then(blob => setImage(blob))
                .catch(err => console.error(err))
        };
        setImageFromURL(currentImageURL)
        
    },[ currentImageURL ]);
    
    // FORM SUBMITTING //

    const onSubmit: SubmitHandler<WishDefaultValues> = async (data, e?: BaseSyntheticEvent) => { 
        e?.preventDefault();

        const { id, author, isCompleted } = data;
        if(!id || !author) return
        
        postWish({ ...data, id, author });

        if(image && (isNewImage || isNewWish)) {
            dispatch(postImage({
                id,
                file: image,
                drive: 'covers'
            }))
        }
        if(!image && !isNewWish && isEditWish) {
            dispatch(deleteImage({
                id,
                drive: 'covers'
            }))
        }
        navigate(`/my-wishes/items/${ isCompleted ? 'completed' : 'actual'  }/${ id }`)
    }

    const cancelForm = (e: Event) => {
        e.preventDefault();
        navigate(-1);
    }
    const resetForm = (e: Event) => {
        e.preventDefault();
        reset(defaultValues);
        imageInputRef.current.deleteImage(e);
    }
    
    // ALIGNMENTS //

    const [ maxLabelWidth, setMaxLabelWidth ] = useState<number | undefined>(undefined);

    useEffect(() => {
        const labels = document.querySelectorAll<HTMLDivElement>('.text-label');
        const labelWidths = [...labels].map(label => label?.offsetWidth);
        const maxWidth = labels.length ? Math.max(...labelWidths) : undefined;

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
        name: 'id' as const,
        required: true
    },{
        name: 'author' as const,
        required: true
    },{
        name: 'createdAt' as const,
        required: false
    },{
        name: 'completedAt' as const,
        required: false
    },{
        name: 'lastModifiedAt' as const,
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
                                        control={ control }
                                        name='isCompleted'
                                        options={ statusOptions }
                                        label='Статус'
                                        labelWidth={ maxLabelWidth }
                                        placeholder='Актуально'
                                    />
                                    <StarRating
                                        name='stars'
                                        control={ control }
                                        maxStars={ 3 }
                                        starBoxSize={ 4 }
                                        rating={ 0 }
                                    />
                                </LineContainer>
                                <SelectBox
                                    control={ control }
                                    name='inWishlists'
                                    options={ wishlistOptions }
                                    label='Вишлисты'
                                    labelWidth={ maxLabelWidth }
                                    isMulti
                                    placeholder='Можно сразу добавить в вишлисты'
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
