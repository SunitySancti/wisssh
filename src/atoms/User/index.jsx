import   React from 'react'
import { useSelector,
         useDispatch } from 'react-redux'

import './styles.scss'
import { UserPlaceholder } from 'atoms/Icon'

import { deleteImageURL } from 'store/imageSlice'


export const User = ({
    user,
    picSize,
    isPicOnly
}) => {
    const dispatch = useDispatch();
    const imageURL = useSelector(state => state.images?.imageURLs[user?.id]);

    const sizeStyles = picSize
        ? { width: `${picSize}rem`, height: `${picSize}rem` }
        : { width: '4rem', height: '4rem' }

    const nameString = isPicOnly
        ? null
        : <span className='name'>@{ user?.name }</span>

    return (
        <div className='user'>
            { imageURL
                ? <img
                        src={ imageURL }
                        style={ sizeStyles }
                        onError={() => dispatch(deleteImageURL(user?.id))}
                    />
                : <UserPlaceholder/>
            }
            { nameString }
        </div>
    );
}
