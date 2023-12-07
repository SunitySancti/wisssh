import { useState,
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

import type { MutableRefObject } from 'react'
import type { FieldValues,
              Path,
              UseFormRegister } from 'react-hook-form'

const __DEV_MODE__ = import.meta.env.DEV


interface ImageInputProps<FV extends FieldValues> {
    register: UseFormRegister<FV>,
    setImage: (blob?: Blob) => void,
    setValue?: (fieldName: 'imageAR', newValue: number) => void,
    image?: Blob,
    imageInputRef?: MutableRefObject<{
        deleteImage(e: Event): void;
    }>,
    isUser?: boolean
}


export function compressAndDoSomething(
    file: File,
    doSomething: (blob: Blob) => unknown,
    options: {
        maxWidth: number;
        maxHeight: number;
        quality: number;
        softCompress: boolean
    }
) {
    const { maxWidth, maxHeight, quality, softCompress } = options;

    if(__DEV_MODE__) {
        console.log('input image size: ', file.size);
    }

    const blobURL = URL.createObjectURL(file);
    const img = new Image();
    img.src = blobURL;
    img.onerror = function () {
        URL.revokeObjectURL(img.src);
        console.log("Image compression failed");
    };
    img.onload = function () {
        URL.revokeObjectURL(img.src);

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
        canvas.getContext("2d")?.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
            blob => {
                if(__DEV_MODE__) {
                    console.log('output image size: ', blob?.size)
                }
                if(blob) {
                    doSomething(blob)
                }
            },
            file.type,
            quality
        );
    };
}

export const ImageInput = <FV extends FieldValues>({
    register,
    setValue,
    imageInputRef,
    image,
    setImage,
    isUser
} : ImageInputProps<FV>
) => {
    const imgRef = useRef<HTMLImageElement>(null);
    const [ignoreHover, setIgnoreHover] = useState(false);
    const [imageURL, setImageURL] = useState<string | undefined>(undefined);
    
    useEffect(() => {
        if(imageURL) {
            URL.revokeObjectURL(imageURL)
        }
        if(image) {
            setImageURL(URL.createObjectURL(image))
        } else {
            setImageURL(undefined)
        }
    },[ image ])

    // COMPRESS IMAGE //

    const compressOptions = {
        maxWidth: isUser ? 440 : 1000,
        maxHeight: isUser ? 440 : 1000,
        quality: 0.6,
        softCompress: !!isUser
    }

    // HANDLE INPUT //

    const onDrop = useCallback((acceptedFiles: File[]) => {
        compressAndDoSomething(acceptedFiles[0], setImage, compressOptions)
    },[ setImage ]);

    const { getRootProps, isDragAccept, isDragReject } = useDropzone({
        onDrop,
        accept: {'image/*': ['.jpeg', '.png']}
    });
    
    const setSecondaryData = () => {
        if(image && setValue) {
            if(imgRef.current) {
                const aspectRatio = Number((imgRef.current?.offsetWidth / imgRef.current?.offsetHeight).toFixed(3));
                setValue('imageAR', aspectRatio ? aspectRatio : 1);
            } else {
                setValue('imageAR', 1);
            }
        }
    }

    const deleteImage = useCallback((e: Event) => {
        e.preventDefault();
        e.stopPropagation();

        setImage(undefined);
        if(setValue) {
            setValue('imageAR', 1);
        }
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
                {...register('imageAR' as Path<FV>)}
            />

            { content }
            
        </div>
    );
}
