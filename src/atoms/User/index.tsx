import { useEffect } from 'react'
    
import './styles.scss'
import { UserPlaceholder } from 'atoms/Icon'
import { Spinner } from 'atoms/Preloaders'
import { WithTooltip } from 'atoms/WithTooltip'

import { useAppSelector,
         useAppDispatch } from 'store'
import { getUserById } from 'store/getters'
import { promoteImages } from 'store/imageSlice'

import type { UserId } from 'typings'
import type { SyntheticEvent } from 'react'


interface UserPicProps {
    imageURL?: string | null;
    isLoading?: boolean;
    size?: number       // in rem
}

interface optionalUserParameters {
    picSize?: number;   // in rem
    picOnly?: boolean;
    withTooltip?: boolean;
    onClick?: (e: SyntheticEvent) => void;
    reverse?: boolean
}

interface UserProps extends optionalUserParameters {
    id?: UserId;
}

interface UserViewProps extends optionalUserParameters {
    name?: string;
    imageURL?: string | null;
    isLoading?: boolean;
}


export const UserPic = ({
    imageURL,
    isLoading,
    size
} : UserPicProps
) => {
    const sizeStyles = {
        width:  `${size || 4}rem`,
        height: `${size || 4}rem`
    }
    const spinnerProps = {
        size: size || 4,
        colorTheme: 'light' as const,
        strokeWidth: 6,
    }
    
    return (
        <div className='user-pic' style={{
            minWidth: `${size}rem`,
            minHeight: `${size}rem`
        }}>
            { isLoading && <Spinner {...spinnerProps}/> }
            { imageURL
                ? <img src={ imageURL } style={ sizeStyles }/>
                : <UserPlaceholder style={ sizeStyles }/>
            }
        </div>
    )
}

const UserView = ({
    picSize,
    picOnly,
    withTooltip,
    onClick,
    name,
    imageURL,
    isLoading,
    reverse
} : UserViewProps) => (
    <div
        className={ 'user ' + (reverse ? 'text-left' : 'text-right') }
        onClick={ onClick }
    >
        { (withTooltip && name)
            ?   <WithTooltip
                    trigger={<UserPic {...{ imageURL, isLoading, size: picSize }}/>}
                    text={ '@ ' + name }
                />
            :   <UserPic {...{ imageURL, isLoading, size: picSize }}/>
        }
        { (name && !picOnly) && <span className='name'>@ { name }</span> }
    </div>
);

export const User = ({
    id,
    ...optionalParams
} : UserProps
) => {
    const dispatch = useAppDispatch();
    const user = getUserById(id);
    const imageURL = useAppSelector(state => id ? state.images.imageURLs[id] : undefined);
    const isLoading = useAppSelector(state => id ? state.images.loading[id] : undefined);

    useEffect(() => {
        if(id && user?.imageExtension) dispatch(promoteImages(id))
    },[ id, user?.imageExtension ]);

    return user &&
        <UserView {...{...optionalParams, name: user?.name, imageURL, isLoading }} />
}
