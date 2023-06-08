import React from 'react'
import { Link } from 'react-router-dom'

import './styles.scss'
import { Icon, Gratitude } from 'atoms/Icon'

export const CreationGroup = ({ isShort }) => {
    
    return (
        <div className='creation-group'>
            <Gratitude />
            <Link
                to='/my-wishes/items/new'
                className='icon-link'
                children={ <Icon name='newWish'/> }
            />
            <Link
                to='/my-wishes/lists/new'
                className='icon-link'
                children={ <Icon name='newList'/> }
            />
        </div>
    );
}