import React from 'react'
import { Link } from 'react-router-dom'

import './styles.scss'
import { Icon,
         Gratitude } from 'atoms/Icon'
import { WithTooltip } from 'atoms/WithTooltip'

export const CreationGroup = ({ isShort }) => {
    
    return (
        <div className='creation-group'>
            {/* <WithTooltip
                trigger={ <Gratitude/> }
                text='Благодарность разработчику'
            /> */}
            <Gratitude/>
            <WithTooltip
                trigger={
                    <Link
                        to='/my-wishes/items/new'
                        className='icon-link'
                        children={ <Icon name='newWish'/> }
                    />
                }
                text='Новое желание'
            />
            <WithTooltip
                trigger={
                    <Link
                        to='/my-wishes/lists/new'
                        className='icon-link'
                        children={ <Icon name='newList'/> }
                    />
                }
                text='Новый вишлист'
            />
        </div>
    );
}