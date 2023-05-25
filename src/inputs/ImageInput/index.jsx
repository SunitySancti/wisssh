import   React,
       { useState,
         useCallback,
         useMemo,
         useRef } from 'react'
import { useDropzone } from 'react-dropzone'

import './styles.scss'
import { Icon,
         WishPlaceholder,
         UserPlaceholder } from 'atoms/Icon'
import { Button } from 'atoms/Button'

export const ImageInput = ({
    register,
    setValue,
    imageInputRef,
    image,
    setImage,
    isUser
}) => {
    const [ ignoreHover, setIgnoreHover ] = useState(false);
    const imgRef = useRef(null);
    const imageURL = useMemo(() => {
        if(image) {
            return URL.createObjectURL(image)
        } else return null
    },[ image ])

    const onDrop = useCallback(acceptedFiles => {
        setImage(acceptedFiles[0])
    },[ setImage ]);

    const { getRootProps, isDragAccept, isDragReject } = useDropzone({
        onDrop,
        accept: {'image/*': ['.jpeg', '.png']}
    });
    
    const setSecondaryData = () => {
        if(image) {
            const aspectRatio = (imgRef.current?.offsetWidth / imgRef.current?.offsetHeight).toFixed(3);
            const extension   = image.name?.split('.').at(-1);
            
            setValue('imageAR', aspectRatio);
            if(extension) setValue('imageExtension', extension)
        }
    }

    const deleteImage = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();

        setImage(null);
        setValue('imageAR', 1);
        setValue('imageExtension', '');
    },[ setValue ]);

    if(imageInputRef) imageInputRef.current.deleteImage = deleteImage;

    // set dropzone styles:

    const classes = useMemo(() => {
        let result = isUser ? 'image-input user-avatar' : 'image-input wish-cover';
        if(isDragAccept) result += ' droppable';
        if(isDragReject) result += ' rejected';
        if(ignoreHover) result += ' ignore-hover';
        if(imageURL) result += ' preview'
        else result += ' no-image'
        return result
    },[ isUser, isDragAccept, isDragReject, imageURL, ignoreHover ]);


    const content = useMemo(() => {
        if(imageURL) {
            return (
                <>
                    <div className='container'>
                        <img
                            src={ imageURL }
                            alt={ image?.name }
                            ref={ imgRef }
                            onLoad={ setSecondaryData }
                        />
                    </div>
                    <Icon
                        name='change'
                        className={'transparent-icon change-btn'}
                    />
                    <Button
                        icon='close'
                        className='transparent-icon close-btn'
                        onClick={ deleteImage }
                        onMouseEnter={() => setIgnoreHover(true)}
                        onMouseLeave={() => setIgnoreHover(false)}
                    />
                </>
            );
        } else return (
            <>
                <div className='container'>
                    { isUser ? <UserPlaceholder/> : <WishPlaceholder/> }
                </div>
                <Button
                    text='Загрузить изображение'
                    icon='upload'
                    round
                />
            </>
        )
    }, [
        image,
        imageURL,
        imgRef,
        isDragAccept,
        isDragReject
    ])

    return (
        <div
            className={ classes }
            {...getRootProps()}
        >
            <input
                className='invis'
                type='text'
                {...register('imageAR')}
            />
            <input
                className='invis'
                type='text'
                {...register('imageExtension')}
            />

            { content }
            
        </div>
    );
}