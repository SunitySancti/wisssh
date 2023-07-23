import   React from 'react'
import { useNavigate,
         useLocation } from 'react-router-dom'

import './styles.scss'
import { Button } from 'atoms/Button'


export const Plug = ({ position, message, btnIcon, btnText, navPath }) => {
    const navigate = useNavigate();
    const location = useLocation().pathname;
    const isInvite = location.split('/').at(1) === 'my-invites';

    switch(position) {
        case 'wishlistPageNoWishes':
            message = 'В вишлисте пока нет желаний'
            btnIcon = 'plus'
            btnText = 'Добавить'
            navPath = location + '/editing'
            break;
        case 'newListNoWishes':
            message = 'Нет актуальных желаний'
            btnIcon = 'plus'
            btnText = 'Создать желание'
            navPath = '/my-wishes/items/new'
            break;
    }

    return (
        <div className='plug'>
            <span>{ message }</span>
            {!isInvite &&
                <Button
                    icon={ btnIcon }
                    text={ btnText }
                    kind='primary'
                    round
                    onClick={ () => navigate(navPath) }
                />
            }
        </div>
    )
}
