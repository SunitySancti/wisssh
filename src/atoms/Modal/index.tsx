import { useState,
         useRef,
         forwardRef,
         useImperativeHandle } from 'react'

import './styles.scss'
import { Button } from 'atoms/Button'
import { Portal } from 'containers/Portal'

import type { ReactNode,
              ForwardedRef,
              SyntheticEvent,
              RefObject } from 'react'
import type { ButtonProps } from 'atoms/Button'


export interface ModalProps {
    header: ReactNode;
    body: ReactNode;
    actions: ButtonProps[]
}

interface ModalViewProps extends ModalProps {
    backRef: RefObject<HTMLDivElement>;
    handleBackClick(e: SyntheticEvent): void;
}

export interface ModalRef {
    showModal(e: SyntheticEvent): void;
    hideModal(e: SyntheticEvent): void
}


const ModalView = ({
    header,
    body,
    actions,
    handleBackClick,
    backRef
}:  ModalViewProps
) => (
    <Portal layer='modal'>
        <div
            className={ 'background' }
            onClick={ handleBackClick }
            ref={ backRef }
        >
            <div className='modal-window' >
                <div
                    className='header'
                    children={ header }
                />
                <div
                    className='body'
                    children={ body }
                />
                <div className='actions' >
                    { actions?.map((action, index: number) => (
                        <Button key={ index } { ...action } />
                    ))}
                </div>
                <Button icon='close'/>
            </div>
        </div>
    </Portal>
);


export const Modal = forwardRef((
    props: ModalProps,
    ref: ForwardedRef<ModalRef>
) => {
    const [isVisible, setIsVisible] = useState(false);
    const backRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
        showModal(e: SyntheticEvent) {
            e.stopPropagation();
            e.preventDefault();
            setIsVisible(true)
        },
        hideModal(e: SyntheticEvent) {
            e.stopPropagation();
            e.preventDefault();
            setIsVisible(false)
        }
    }));

    const handleBackClick = (e: SyntheticEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if(e.target === backRef.current) {
            setIsVisible(false)
        }
    }

    return isVisible &&
        <ModalView {...{...props, backRef, handleBackClick }}/>
})
