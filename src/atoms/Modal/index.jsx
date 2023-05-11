import   React,
       { useState,
         useEffect,
         useRef,
         forwardRef,
         useImperativeHandle } from 'react'

import './styles.scss'
import { Button } from 'atoms/Button'
import { IconButton } from 'atoms/IconButton'
import { Portal } from 'containers/Portal'

export const Modal = forwardRef(({
    header,
    body,
    actions
}, ref ) => {
    const [ classes, setClasses ] = useState('hidden');
    const backRef = useRef(null);

    useImperativeHandle(ref, () => ({
        showModal() { setClasses('visible') },
        hideModal() { setClasses('hidden') }
    }))

    const handleBackClick = (e) => {
        if(e.target === backRef.current) {
            setClasses('hidden')
        }
    }


    return ( 
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
                            <Button
                                key={ index }
                                { ...action }
                            />
                        ))}
                    </div>
                    <IconButton icon='close'/>
                </div>
            </div>
        </Portal>
    )
})