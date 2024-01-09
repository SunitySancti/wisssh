import { useState,
         useEffect,
         useRef,
         forwardRef,
         useImperativeHandle } from 'react'

import './styles.scss'
import { Icon } from 'atoms/Icon'
import { Portal } from 'containers/Portal'

import type { ReactNode,
              ForwardedRef,
              SyntheticEvent,
              RefObject } from 'react'
import type { IconName } from 'atoms/Icon'
import type { WidthAwared } from 'typings'


interface OptionBaseProps {
    onClick: (e: SyntheticEvent) => void;
    icon: IconName;
    text: string;
    clickedIcon?: IconName;
    clickedText?: string
}

export interface DropdownOption extends OptionBaseProps {
    dontHideAfterClick?: boolean;
}

interface OptionProps extends DropdownOption {
    setIsDropped: (value: boolean) => void;
}

interface OptionViewProps extends OptionBaseProps {
    clicked: boolean
}

interface Coords {
    left?: number;
    right?: number;
    top: number;
}

interface WithDropDownProps {
    trigger: ReactNode;
    options: DropdownOption[];
    className?: string
}

interface WithDropDownViewProps extends WithDropDownProps {
    triggerRef: RefObject<HTMLDivElement>;
    dropdownRef: RefObject<HTMLDivElement>;
    openDropDown(e: SyntheticEvent): void;
    isDropped: boolean;
    setIsDropped(value: boolean): void
    coords?: Coords;
}

export type WithDropDownRef = WidthAwared & {
    closeDropDown(): void
}

const OptionView = ({
    icon,
    text,
    clickedIcon,
    clickedText,
    onClick,
    clicked
} : OptionViewProps
) => (
    <div
        className={ 'dropdown-option ' + (clicked ? 'disabled ' : '') }
        onClick={ onClick }
    >
        { icon && 
            <Icon name={ clicked ? clickedIcon || icon : icon }/>
        }
        { text &&
            <span>{ clicked ? clickedText || text : text }</span>
        }
    </div>
);

const Option = ({
    onClick,
    setIsDropped,
    dontHideAfterClick,
    ...baseProps
} : OptionProps
) => {
    const [clicked, setClicked] = useState(false);
    const handleClick = (e: SyntheticEvent) => {
        onClick(e);
        if(dontHideAfterClick) {
            setClicked(true)
        } else {
            setIsDropped(false)
        }
    }
    return (
        <OptionView {...{
            ...baseProps,
            onClick: handleClick,
            clicked
        }}/>
    )
}

const WithDropDownView = ({
    trigger,
    options,
    className,
    triggerRef,
    dropdownRef,
    openDropDown,
    isDropped,
    setIsDropped,
    coords
}:  WithDropDownViewProps
) => (
    <>
        <div
            className={ 'dropdown-trigger ' + (className || '')}
            children={ trigger }
            ref={ triggerRef }
            onClick={ openDropDown }
        />
        { isDropped && 
            <Portal layer='dropdown'>
                <div
                    ref={ dropdownRef }
                    className='dropdown'
                    style={ coords }
                >
                    { options.map( (option, index) => (
                        <Option
                            key={ index }
                            { ...option }
                            setIsDropped={ setIsDropped }
                        />
                    ))}
                </div>
            </Portal>
        }
    </>
);


export const WithDropDown = forwardRef((
    props : WithDropDownProps,
    ref: ForwardedRef<WithDropDownRef>
) => {
    const [ isDropped, setIsDropped ] = useState(false);
    const [ coords, setCoords ] = useState<Coords | undefined>(undefined);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const minPadding = 11;

    const openDropDown = (e: SyntheticEvent) => {
        e.stopPropagation();
        alignDropdown();
        setIsDropped(true)
    }

    const closeDropDown = (e: MouseEvent) => {
        if(dropdownRef.current && !dropdownRef.current.contains(e.target as HTMLElement | null)) {
            setIsDropped(false)
        }
    }

    useImperativeHandle(ref, () => ({
        closeDropDown() { setIsDropped(false) },
        getWidth() { return triggerRef.current?.offsetWidth }
    }));


    const alignDropdown = () => {
        const rect = triggerRef.current?.getBoundingClientRect();
        if(!rect) return
        
        const dropToRight = (rect.left + rect.width / 2) < (window.innerWidth * 2 / 3);
        let left = undefined, right = undefined;

        if(dropToRight) {
            left = Math.max(rect.left, minPadding);
        } else {
            right = Math.max(window.innerWidth - rect.right, minPadding)
        }

        setCoords({ left, right, top: rect.bottom })
    }

    useEffect(() => {
        window.addEventListener('resize', alignDropdown);
        document.addEventListener('mousedown', closeDropDown);
        return () => {
            window.removeEventListener('resize', alignDropdown);
            document.removeEventListener('mousedown', closeDropDown)
        }
    },[ dropdownRef.current ]);

    return (
        <WithDropDownView {...{
            ...props,
            triggerRef,
            dropdownRef,
            openDropDown,
            coords,
            isDropped,
            setIsDropped
        }}/>
    )
})
