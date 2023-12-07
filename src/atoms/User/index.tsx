import './styles.scss'
import { UserPlaceholder } from 'atoms/Icon'
import { Spinner } from 'atoms/Preloaders'
import { WithTooltip } from 'atoms/WithTooltip'

import { useAppSelector } from 'store'

import type { User as UserType } from 'typings'


interface UserPicProps {
    imageURL?: string | null;
    isLoading?: boolean;
    size?: number           // in rem
}

interface UserProps {
    user?: UserType;
    picSize?: number;       // in rem
    picOnly?: boolean;
    tooltip?: string;
    [rest: string]: any
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
export const User = ({
    user,
    picSize,
    picOnly,
    tooltip,
    ...rest
} : UserProps
) => {
    
    const imageURL = useAppSelector(state => user ? state.images.imageURLs[user.id] : undefined);
    const isLoading = useAppSelector(state => user ? state.images.loading[user.id] : undefined);

    return (
        <div
            className='user'
            {...rest}
        >
            { tooltip
                ?   <WithTooltip
                        trigger={<>
                            <UserPic {...{ imageURL, isLoading, size: picSize }}/>
                            { !picOnly &&
                                <span className='name'>@{ user?.name }</span> }
                        </>}
                        text={ tooltip }
                    />
                :   <>
                        <UserPic {...{ imageURL, isLoading, size: picSize }}/>
                        { !picOnly && <span className='name'>@{ user?.name }</span> }
                    </>
            }
        </div>
    );
}
