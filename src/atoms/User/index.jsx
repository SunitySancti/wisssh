import   React from 'react'
import { useSelector } from 'react-redux'

import './styles.scss'
import { UserPlaceholder } from 'atoms/Icon'
import { Spinner } from 'atoms/Preloaders'
import { WithTooltip } from 'atoms/WithTooltip'


export const UserPic = ({ imageURL, isLoading, size }) => {
    const sizeStyles = {
        width:  `${size || 4}rem`,
        height: `${size || 4}rem`
    }
    const spinnerProps = {
        size: size || 4,
        colorTheme: 'light',
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
}) => {
    const imageURL = useSelector(state => state.images?.imageURLs[user?.id]);
    const isLoading = useSelector(state => state.images?.loading[user?.id]);

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
