import   React,
       { useState,
         useCallback,
         useMemo,
         useRef, 
         useEffect} from 'react'
import { useDropzone } from 'react-dropzone'

import './styles.scss'
import { Icon,
         WishPlaceholder,
         UserPlaceholder } from 'atoms/Icon'
import { Button } from 'atoms/Button'

const __DEV_MODE__ = import.meta.env.VITE_DEV_MODE === 'true';


export function compressAndDoSomething(file, doSomething, options) {
    const { maxWidth, maxHeight, quality, softCompress } = options;

    if(__DEV_MODE__) {
        console.log('input image size: ', file.size);
    }

    const blobURL = URL.createObjectURL(file);
    const img = new Image();
    img.src = blobURL;
    img.onerror = function () {
        URL.revokeObjectURL(this.src);
        console.log("Cannot compress image");
    };
    img.onload = function () {
        URL.revokeObjectURL(this.src);

        let width = img.width;
        let height = img.height;
    
        function constraintByWidth() {
            if (width > maxWidth) {
                height = Math.round(height * maxWidth / width);
                width = maxWidth;
            }
        }
        function constraintByHeight() {
            if (height > maxHeight) {
                width = Math.round(width * maxHeight / height);
                height = maxHeight;
            }
        }
    
        if(softCompress) {
            if(width / height > maxWidth / maxHeight) {
                constraintByHeight()
            } else {
                constraintByWidth()
            }
        } else {
            if(width / height > maxWidth / maxHeight) {
                constraintByWidth()
            } else {
                constraintByHeight()
            }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
            blob => {
                if(__DEV_MODE__) {
                    console.log('output image size: ', blob.size)
                }
                doSomething(blob)
            },
            file.type,
            quality
        );
    };
}

export const ImageInput = ({
    register,
    setValue,
    imageInputRef,
    image,
    setImage,
    isUser
}) => {
    const imgRef = useRef(null);
    const [ignoreHover, setIgnoreHover] = useState(false);
    const [imageURL, setImageURL] = useState(null);
    
    useEffect(() => {
        if(imageURL) {
            URL.revokeObjectURL(imageURL)
        }
        if(image) {
            setImageURL(URL.createObjectURL(image))
        } else {
            setImageURL(null)
        }
    },[ image ])

    // COMPRESS IMAGE //

    const compressOptions = {
        maxWidth: isUser ? 440 : 1000,
        maxHeight: isUser ? 440 : 1000,
        quality: 0.6,
        softCompress: isUser
    }

    // HANDLE INPUT //

    const onDrop = useCallback(acceptedFiles => {
        compressAndDoSomething(acceptedFiles[0], setImage, compressOptions)
    },[ setImage ]);

    const { getRootProps, isDragAccept, isDragReject } = useDropzone({
        onDrop,
        accept: {'image/*': ['.jpeg', '.png']}
    });
    
    const setSecondaryData = () => {
        if(image) {
            const aspectRatio = (imgRef.current?.offsetWidth / imgRef.current?.offsetHeight).toFixed(3);
            setValue('imageAR', aspectRatio);
            
            // let extension = image?.type?.split('/').at(-1);
            // if(extension === 'jpeg' || extension === 'pjpeg') {
            //     extension = 'jpg'
            // } else if(extension !== 'png') {
            //     return
            // }
            // setValue('imageExtension', extension)
        }
    }

    const deleteImage = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();

        setImage(null);
        setValue('imageAR', 1);
        // setValue('imageExtension', '');
    },[ setImage, setValue ]);

    if(imageInputRef) imageInputRef.current.deleteImage = deleteImage;

    // DROPZONE STYLING //

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
            {/* <input
                className='invis'
                type='text'
                {...register('imageExtension')}
            /> */}

            { content }
            
        </div>
    );
}
