import { useNavigate,
         useLocation } from 'react-router-dom'

import './styles.scss'
import { Button } from 'atoms/Button'

import type { IconName } from 'atoms/Icon'
import type { SyntheticEvent } from 'react';


interface PlugBaseProps {
    message?: string;
    btnIcon?: IconName;
    btnText?: string;
}

interface PlugViewProps extends PlugBaseProps {
    btnHandleClick(e: SyntheticEvent): void
}

interface PlugProps extends PlugBaseProps {
    position?: 'wishlistPageNoWishes' | 'newListNoWishes';
    navPath?: string
}


const PlugView = ({
    message,
    btnIcon,
    btnText,
    btnHandleClick
}:  PlugViewProps
) => (
    <div className='plug'>
        { !!message && <span>{ message }</span> }
        { btnHandleClick && !!(btnIcon || btnText) &&
            <Button
                icon={ btnIcon }
                text={ btnText }
                kind='primary'
                round
                onClick={ btnHandleClick }
            />
        }
    </div>
);

export const Plug = ({
    position,
    message,
    btnIcon,
    btnText,
    navPath = ''
}:  PlugProps
) => {
    const navigate = useNavigate();
    const location = useLocation().pathname;

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
    }

    return <PlugView {...{ message, btnIcon, btnText }} btnHandleClick={ (_e) => navigate(navPath) }/>
}
