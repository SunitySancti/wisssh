import   React,
       { useEffect } from 'react'
import { useParams,
         useNavigate } from 'react-router'

import './styles.scss'
import { WishPreloader } from 'atoms/Preloaders'

import { useAcceptInvitationMutation } from 'store/apiSlice'


export const InvitationAcceptancePage = () => {
    const { invitationCode } = useParams();
    const navigate = useNavigate();

    const [         acceptInvitation, {
        data:       acceptanceResponse,
        isSuccess:  invitationAccepted,
        isLoading:  awaitingAcceptance,
        isError:    aceptanceDeclined
    }] = useAcceptInvitationMutation(invitationCode);

    useEffect(() => {
        if(invitationCode && !awaitingAcceptance) {
            acceptInvitation(invitationCode);
        }
    },[ invitationCode, awaitingAcceptance ]);

    useEffect(() => {
        if(invitationAccepted) {
            const section = acceptanceResponse.valid
                ? '/my-invites'
                : '/my-wishes'
            navigate(section + '/lists/' + acceptanceResponse.inviteId)
        }
    },[ invitationAccepted ]);

    useEffect(() => {
        if(aceptanceDeclined) {
            navigate(-1)
        }
    },[ aceptanceDeclined ])

    return (
        <div className='invitation-acceptance-page'>
            <WishPreloader isLoading/>
        </div>
    )
}
