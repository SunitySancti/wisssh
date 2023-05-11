import   React,
       { useState,
         useEffect,
         useRef,
         forwardRef,
         useImperativeHandle } from 'react'

import './styles.scss'
import { Icon } from 'atoms/Icon'
import { Portal } from 'containers/Portal'

export const WithDropDown = forwardRef(({
    trigger,
    options
},  ref ) => {
    const [ isDropped, setIsDropped ] = useState(false);
    const [ dropToRight, setDropToRight ] = useState(true);
    const [ coords, setCoords ] = useState({})
    const dropdownRef = useRef(null)
    const triggerRef = useRef(null)

    const openDropDown = e => {
        e.stopPropagation();
        alignDropdown();
        setIsDropped(true)
    }

    useImperativeHandle(ref, () => ({
        closeDropDown() { setIsDropped(false) }
    }))

    const closeDropDown = e => {
        if(dropdownRef.current && !dropdownRef.current.contains(e.target)) {
            setIsDropped(false)
        }
    }
    const alignDropdown = () => {
        const rect = triggerRef.current?.getBoundingClientRect();

        const left = dropToRight ? rect?.left || null : null;
        const right = dropToRight ? null : window.innerWidth - rect?.right || null;

        setCoords({ left, right, top: rect.bottom })
    }
    const setDirection = () => {
        const triggerRect = triggerRef.current?.getBoundingClientRect();
        const triggerMid = triggerRect.left + triggerRect.width / 2;
        const windowMid = window.innerWidth / 2;
        setDropToRight(triggerMid < windowMid)
    }

    useEffect(() => {
        setDirection();
        window.addEventListener('resize', alignDropdown);
        document.addEventListener('mousedown', closeDropDown);
        return () => {
            window.removeEventListener('resize', alignDropdown);
            document.removeEventListener('mousedown', closeDropDown)
        }
    },[ dropdownRef.current ])

    
    const Option = ({ icon, text, onClick, className, ...rest }) => (
        <div
            className={ 'dropdown-option ' + (className ? className : '') }
            onClick={ onClick }
            { ...rest }
        >
            { icon && <Icon name={ icon }/> }
            { text && <span>{ text }</span> }
        </div>
    );

    return (
        <>
            <div
                ref={ triggerRef }
                className='dropdown-trigger'
                children={ trigger }
                onClick={ openDropDown }
            />
            { isDropped && (
                <Portal layer='dropdown'>
                    <div
                        ref={ dropdownRef }
                        className='dropdown'
                        style={ coords }
                    >
                        { options?.map( (option, index) => (
                            <Option
                                key={ index }
                                { ...option }
                                onClick={() => {
                                    option.onClick();
                                    setIsDropped(false)
                                }}
                            />
                        ))}
                    </div>
                </Portal>
            )}
        </>
    );
})
