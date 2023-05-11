import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

import './styles.scss'
import { Icon } from 'atoms/Icon'

export const ModeToggle = () => {
    const pathSteps = useLocation().pathname.split('/')
    const isMyWishesSection = pathSteps[1] === 'my-wishes';
    const isItemsMode = pathSteps[2] === 'items';

    const wishesItemsLast = useSelector(state => state.history.myWishesSection.itemsModeLast);
    const wishesListsLast = useSelector(state => state.history.myWishesSection.listsModeLast);
    const invitesItemsLast = useSelector(state => state.history.myInvitesSection.itemsModeLast);
    const invitesListsLast = useSelector(state => state.history.myInvitesSection.listsModeLast);

    const itemsPath = isMyWishesSection
                    ? wishesItemsLast
                    : invitesItemsLast

    const listsPath = isMyWishesSection
                    ? wishesListsLast
                    : invitesListsLast

    return (
        <div className='mode-toggle'>
            <div className='mt-slider' style={{ left: isItemsMode ? 0 : 40 }}/>
            <Link
                className={ isItemsMode ? 'toggle-button active' : 'toggle-button'}
                to={ itemsPath }
                children={ <Icon name='present'/> }
            />
            <Link
                className={ isItemsMode ? 'toggle-button' : 'toggle-button active'}
                to={ listsPath }
                children={ <Icon name='wishlist'/> }
            />
        </div>
    );
}