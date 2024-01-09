import { useEffect } from 'react'
import { useNavigate } from 'react-router'

import './styles.scss'
import { WishPreloader } from 'atoms/Preloaders'

import { useAcceptInvitationMutation } from 'store/apiSlice'
import { getLocationConfig,
         getFriendWishes, 
         getInvites,
         getFriends,
         getCurrentUser } from 'store/getters'


export const InvitationAcceptancePage = () => {
    const navigate = useNavigate();
    const { invitationCode } = getLocationConfig();
    const { userTimeStamp } = getCurrentUser();
    const { friendsTimeStamp } = getFriends();
    const { invitesTimeStamp } = getInvites();
    const { friendWishesTimeStamp } = getFriendWishes();

    const [                 acceptInvitation, {
        data:               acceptanceResponse,
        isSuccess:          invitationAccepted,
        isLoading:          awaitingAcceptance,
        isError:            aceptanceDeclined,
        fulfilledTimeStamp: acceptanceTimeStamp
    }] = useAcceptInvitationMutation();

    useEffect(() => {
        if(invitationCode && !awaitingAcceptance && !invitationAccepted) {
            acceptInvitation(invitationCode);
        }
    },[ invitationCode, awaitingAcceptance, invitationAccepted ]);

    useEffect(() => {
        if(!acceptanceTimeStamp || !friendWishesTimeStamp || !invitesTimeStamp || !userTimeStamp || !friendsTimeStamp) return
        if(invitationAccepted && acceptanceResponse) {
            const friendWishesAreUpToDate = friendWishesTimeStamp > acceptanceTimeStamp;
            const invitesAreUpToDate = invitesTimeStamp > acceptanceTimeStamp;
            const friendsAreUpToDate = friendsTimeStamp > acceptanceTimeStamp;
            const userIsUpToDate = userTimeStamp > acceptanceTimeStamp;
            
            const { inviteId, valid } = acceptanceResponse

            if(friendWishesAreUpToDate && invitesAreUpToDate && userIsUpToDate && friendsAreUpToDate) {
                navigate((valid ? '/my-invites' : '/my-wishes') + '/lists/' + inviteId)
            }
        }
    },[ invitationAccepted,
        acceptanceTimeStamp,
        friendWishesTimeStamp,
        invitesTimeStamp,
        userTimeStamp,
        friendsTimeStamp
    ]);

    useEffect(() => {
        if(aceptanceDeclined) {
            navigate(-1)
        }
    },[ aceptanceDeclined ])

    return (
        <div className='invitation-acceptance-page'>
            <WishPreloader isLoading/>
        </div>
    );
}
