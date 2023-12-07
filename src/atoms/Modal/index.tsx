import { useState,
         useRef,
         forwardRef,
         useImperativeHandle } from 'react'

import './styles.scss'
import { Button } from 'atoms/Button'
import { Portal } from 'containers/Portal'

import type { ReactNode,
              ForwardedRef,
              SyntheticEvent } from 'react'
import type { ButtonProps } from 'atoms/Button'


interface ModalProps {
    header: ReactNode;
    body: ReactNode;
    actions: ButtonProps[]
}

export interface ModalRef {
    showModal(e: SyntheticEvent): void;
    hideModal(e: SyntheticEvent): void
}


export const Modal = forwardRef(({
    header,
    body,
    actions
}:  ModalProps,
    ref: ForwardedRef<ModalRef>
) => {
    const [classes, setClasses] = useState('hidden');
    const [isShown, setIsShown] = useState(false);
    const backRef = useRef(null);

    useImperativeHandle(ref, () => ({
        showModal(e: SyntheticEvent) {
            e.stopPropagation();
            e.preventDefault();
            setIsShown(true);
            setClasses('visible')
        },
        hideModal(e: SyntheticEvent) {
            e.stopPropagation();
            e.preventDefault();
            setIsShown(false);
            setClasses('hidden')
        }
    }));

    const handleBackClick = (e: SyntheticEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if(e.target === backRef.current) {
            setIsShown(false)
            setClasses('hidden')
        }
    }


    return ( isShown 
        ?   <Portal layer='modal'>
                <div
                    className={ 'background ' + classes }
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
        : null
    )
})