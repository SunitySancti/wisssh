import   React,
       { useState,
         useRef,
         forwardRef,
         useImperativeHandle } from 'react'

import './styles.scss'
import { Button } from 'atoms/Button'
import { Portal } from 'containers/Portal'

export const Modal = forwardRef(({
    header,
    body,
    actions
}, ref ) => {
    const [classes, setClasses] = useState('hidden');
    const [isShown, setIsShown] = useState(false);
    const backRef = useRef(null);

    useImperativeHandle(ref, () => ({
        showModal(e) {
            e.stopPropagation();
            e.preventDefault();
            setIsShown(true)
            setClasses('visible')
        },
        hideModal(e) {
            e.stopPropagation();
            e.preventDefault();
            setIsShown(false)
            setClasses('hidden')
        }
    }))

    const handleBackClick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        if(e.target === backRef.current) {
            setIsShown(false)
            setClasses('hidden')
        }
    }


    return ( isShown && 
        <Portal layer='modal'>
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
                        { actions?.map((action, index) => (
                            <Button key={ index } { ...action } />
                        ))}
                    </div>
                    <Button icon='close'/>
                </div>
            </div>
        </Portal>
    )
})