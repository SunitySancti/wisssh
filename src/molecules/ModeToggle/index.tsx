import { Link } from 'react-router-dom'

import './styles.scss'
import { Icon } from 'atoms/Icon'
import { WithTooltip } from 'atoms/WithTooltip'
import { useAppSelector } from 'store'
import { getLocationConfig } from 'store/getters'

export const ModeToggle = () => {
    const { location,
            isWishesSection,
            isInvitesSection,
            isItemsMode } = getLocationConfig();

    const wishesItemsLast = useAppSelector(state => state.history.myWishesSection.itemsModeLast);
    const wishesListsLast = useAppSelector(state => state.history.myWishesSection.listsModeLast);
    const invitesItemsLast = useAppSelector(state => state.history.myInvitesSection.itemsModeLast);
    const invitesListsLast = useAppSelector(state => state.history.myInvitesSection.listsModeLast);

    const itemsPath = isWishesSection
                        ? wishesItemsLast
                    : isInvitesSection
                        ? invitesItemsLast
                        : location;
                        
    const listsPath = isWishesSection
                        ? wishesListsLast
                    : isInvitesSection
                        ? invitesListsLast
                        : location;

    return (
        <div className='mode-toggle'>
            <div className='mt-slider' style={{ left: isItemsMode ? 0 : 40 }}/>
            <WithTooltip
                trigger={
                    <Link
                        className={ isItemsMode ? 'toggle-button active' : 'toggle-button'}
                        to={ itemsPath }
                        children={ <Icon name='present'/> }
                    />
                }
                text='Желания'
            />
            <WithTooltip
                trigger={
                    <Link
                        className={ isItemsMode ? 'toggle-button' : 'toggle-button active'}
                        to={ listsPath }
                        children={ <Icon name='wishlist'/> }
                    />
                }
                text='Вишлисты'
            />
        </div>
    );
}
