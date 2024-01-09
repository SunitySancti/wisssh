import { useState,
         useEffect,
         useCallback } from 'react'
import { useForm,
         useWatch } from 'react-hook-form'
import { Navigate,
         useNavigate } from 'react-router-dom'

import './styles.scss'
import { LogoIcon } from 'atoms/Icon'
import { Button } from 'atoms/Button'
import { TextInput } from 'inputs/TextInput'
import { PasswordInput } from 'inputs/PasswordInput'
import { CheckBox } from 'inputs/CheckBox'
import { sendPasswordResetEmail,
         verificateCode } from 'emails/PasswordResetEmail.tsx'

import { useAppSelector,
         useAppDispatch } from 'store'
import { getUserNameByEmail,
         useLoginMutation,
         useSignupMutation } from 'store/apiSlice'
import { setRemember } from 'store/authSlice'
import { getAllUserNames,
         getLocationConfig } from 'store/getters'
import { decodeEmail } from 'utils'

import type { ChangeEvent,
              SyntheticEvent,
              BaseSyntheticEvent } from 'react'
import type { Control,
              Path,
              FieldValues,
              SubmitHandler,
              UseFormRegister } from 'react-hook-form'
import type { ButtonProps } from 'atoms/Button'

const __DEV_MODE__ = import.meta.env.DEV


type FlowStep = 'start' | 'login' | 'signup' | 'reset-request' | 'reset-verification' | 'reset-new-password'

interface ButtonGroupProps<FV extends FieldValues> {
    control: Control<FV>,
    flowStep: FlowStep,
    isAnyError: boolean,
    isLoading: boolean,
    goToResetRequest: () => void
}

interface LoginPageViewProps<FV extends FieldValues> {
    token: string;
    flowStep: FlowStep;
    control: Control<FV>;
    register: UseFormRegister<LoginFormValues>;
    handleFormChange: (e: ChangeEvent<HTMLFormElement>) => void;
    handleFormSubmit: (e?: BaseSyntheticEvent | undefined) => Promise<void>;
    handleEmailEvents: (e: SyntheticEvent) => void;
    handleRememberCheckbox: (val: boolean) => void;
    shouldRemember: boolean;
    goToResetRequest: () => void;
    backToStart: () => void;
    maxLabelWidth: number;
    isLoading: boolean;
    isAnyError: boolean;
    message: string
}

interface LoginFormValues {
    email?: string;
    password?: string;
    maskedPassword?: string,
    nickname?: string;
    newPassword?: string;
    verificationCode?: string;
    shouldNotRemember: boolean
}

const defaultValues: LoginFormValues = {
    email: undefined,
    password: undefined,
    maskedPassword: undefined,
    nickname: undefined,
    newPassword: undefined,
    verificationCode: undefined,
    shouldNotRemember: false
}


const ButtonGroup = <FV extends FieldValues>({
    control,
    flowStep,
    isAnyError,
    isLoading,
    goToResetRequest
} : ButtonGroupProps<FV>
) => {
    const email    = useWatch({ control, name: 'email' as Path<FV> });
    const password = useWatch({ control, name: 'password' as Path<FV> });
    const maskedPassword = useWatch({ control, name: 'maskedPassword' as Path<FV> });
    const nickname = useWatch({ control, name: 'nickname' as Path<FV> });

    const disabled = isAnyError
                  || (flowStep === 'start' && !email)
                  || ((flowStep === 'login' || flowStep === 'signup') && (!password && !maskedPassword))
                  || (flowStep === 'signup') && !nickname
    
    const props: ButtonProps = {
        type: 'submit' as const,
        round: true,
        disabled,
        isLoading,
        text: undefined,
        icon: undefined,
        kind: undefined
    }

    switch(flowStep) {
        case 'start':
            props.text = 'Продолжить'
            props.kind = 'clear' as const
            break
        case 'login':
            props.text = 'Войти'
            props.icon = 'login' as const
            props.kind = 'accent' as const
            break
        case 'signup':
            props.text = 'Зарегистрироваться и войти'
            props.icon = 'login' as const
            props.kind = 'accent' as const
            break
        case 'reset-request':
            props.text = 'Всё верно. Хочу восстановить пароль'
            props.kind = 'accent' as const
            break
        case 'reset-verification':
            props.text = 'Письмо отправлено'
            props.icon = 'ok' as const
            props.kind = 'clear' as const
            props.disabled = true
            break
        case 'reset-new-password':
            props.text = 'Завершить восстановление пароля и войти'
            props.icon = 'login' as const
            props.kind = 'accent' as const
    }
    
    return (
        <div className='btn-group'>
            { flowStep === 'login' && 
                <Button
                    text='Восстановить пароль'
                    kind='clear'
                    onClick={ goToResetRequest }
                />
            }
            <Button { ...props }/>
        </div>
    );
}

export const LoginPage = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { encodedEmail } = getLocationConfig();

    // AVOID PASSWORD SAVING IF REMEMBER: FALSE

    const shouldRemember = useAppSelector(state => state.auth.remember);
    
    // FORM SETTINGS
    
    const { handleSubmit,
            register,
            control,
            setValue,
            formState:{ errors, isSubmitting },
            reset,
            setFocus } = useForm<LoginFormValues>({
        mode: 'onBlur',
        defaultValues
    });

    // STATE AND HOOKS

    const [ flowStep, setFlowStep ] = useState<FlowStep>('start');
    const [ message, setMessage ] = useState('Введите почту, чтобы войти или зарегистрироваться');
    const [ connectionErrorMessage, setConnectionErrorMessage ] = useState('');
    const [ emailErrorMessage, setEmailErrorMessage ] = useState('');
    const [ nicknameErrorMessage, setNicknameErrorMessage ] = useState('');
    const [ passwordErrorMessage, setPasswordErrorMessage ] = useState('');
    const isAnyError = Boolean(connectionErrorMessage || emailErrorMessage || nicknameErrorMessage || passwordErrorMessage);
    
    const [ autofilledEmail, setAutofilledEmail ] = useState('');
    const maxLabelWidth = 121;
    
    const { allUserNames,
            loadingAllUserNamesWasCrashed,
            refreshAllUserNames } = getAllUserNames();

    const         [ login, {
        error:      loginError,
        isError:    loginWasCrashed,
        isLoading:  loginAwait }] = useLoginMutation();

    const         [ signup, {
        error:      signupError,
        isError:    signupWasCrashed,
        isLoading:  signupAwait }] = useSignupMutation();

    // FORM ROUTING

    const backToStart = useCallback(() => {
        setFlowStep('start');
        setMessage('Введите почту, чтобы войти или зарегистрироваться');
        setNicknameErrorMessage('');
    },[]);

    const goToLoginOrSignup = useCallback(async (email: string) => {
        if(!email) return setFlowStep('start');
        if(autofilledEmail && email !== autofilledEmail) {
            setValue('password', '')        // null autofilled password
            setValue('maskedPassword', '')
        };
        const userName = await getUserNameByEmail(email);
        if(userName) {
            setFlowStep('login');
            setMessage(`Добрый день, ${userName}. Рады снова вас видеть!`)
        } else {
            setFlowStep('signup');
            setMessage('Кажется, вы здесь впервые. Давайте зарегистрируемся!')
        }
    },[ autofilledEmail ]);

    const goToResetRequest = useCallback(() => {
        setFlowStep('reset-request');
        setMessage('Ваш аккаунт привязан к этой почте?')
    },[]);

    const goToResetVerification = useCallback(async (email: string) => {
        await sendPasswordResetEmail(email);
        setFlowStep('reset-verification');
        setMessage('Дальнейшие инструкции направлены вам в письме')
    },[]);

    const goToCreateNewPassword = useCallback(() => {
        setFlowStep('reset-new-password');
        setMessage('Придумайте новый пароль');
        navigate('/login',{ replace: true });
    },[]);

    // CATCH VERIFICATION CODE FROM URL

    useEffect(() => {
        if(encodedEmail) {
            const email = decodeEmail(encodedEmail.slice(0, -6));
            const code = encodedEmail.slice(-6);
            const emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            
            if(emailPattern.test(email)) {
                setValue('email', email);
                setValue('verificationCode', code);
                verificateCode(code, goToCreateNewPassword)
            } else {
                navigate('/login',{ replace: true })
            }
        }
    },[ encodedEmail ]);

    useEffect(() => {
        switch(flowStep) {
            case 'start':
                setFocus('email', { shouldSelect: true })
                break
            case 'login':
            case 'signup':
                setFocus(shouldRemember ? 'password' : 'maskedPassword')
                break
            case 'reset-request':
            case 'reset-verification':
                setFocus('verificationCode')
                setValue('verificationCode', '')
                break
            case 'reset-new-password':
                setFocus('newPassword')
        }
    },[ flowStep ]);

    // FORM SUBMIT

    const onSubmit: SubmitHandler<LoginFormValues> = async (data, e?: BaseSyntheticEvent) => {
        e?.preventDefault();
        const { email, password, maskedPassword, nickname: name, newPassword } = data;
        const truePassword = shouldRemember ? password : maskedPassword;

        switch(flowStep) {
            case 'start':
                if(email) {
                    await goToLoginOrSignup(email)
                }
                break
            case 'login':
                if(email) {
                    login({ email, password: truePassword })
                }
                break
            case 'signup':
                if(email && password && name) {
                    if(truePassword) {
                        signup({ email, name, password: truePassword })
                    }
                }
                break
            case 'reset-request':
                if(email) {
                    await goToResetVerification(email)
                }
                break
            case 'reset-new-password':
                if(email && newPassword) {
                    login({ email, newPassword });
                }
        }
    }

    // ERROR HANDLERS

    useEffect(() => {
        if(loginWasCrashed) {
            if(__DEV_MODE__) {
                console.log('Login error:', loginError)
            }
            setPasswordErrorMessage('Неверный пароль')
        } else setPasswordErrorMessage('')
    },[ loginWasCrashed ]);

    useEffect(() => {
        if(signupWasCrashed && __DEV_MODE__) console.log('Signup error:', signupError)
    },[ signupWasCrashed ]);

    useEffect(() => {
        if(loadingAllUserNamesWasCrashed) {
            setConnectionErrorMessage('Сервер не отвечает, попробуйте перезагрузить страницу')
        } else setConnectionErrorMessage('')
    },[ loadingAllUserNamesWasCrashed ]);

    function handleEmailEvents(e: SyntheticEvent) {
        if((e.type === 'keydown' && 'key' in e && e.key === 'Enter') || (e.type === 'blur')) {
            const wrongEmail = errors?.email?.type === 'pattern';
            if(wrongEmail) {
                setEmailErrorMessage('Проверьте написание почты. Кажется, закралась ошибка')
            } else setEmailErrorMessage('')
        }
    }

    function handleFormChange(e: ChangeEvent<HTMLFormElement>) {
        if(!e.target) return
        switch(e.target.name) {
            case 'nickname': // detect used nickname
                const isUsed = allUserNames.includes(e.target.value);
                if(isUsed) setNicknameErrorMessage('Никнейм занят, попробуйте другой')
                else setNicknameErrorMessage('')
                break

            case 'password': // reset password error
            case 'maskedPassword':
                setPasswordErrorMessage('')
                break

            case 'email': // detect email autofill
                if(!autofilledEmail) setAutofilledEmail(e.target.value)
                break
            
            case 'verificationCode': // detect verification code autofill
                if(e.target.value.length === 6) {
                    verificateCode(e.target.value, goToCreateNewPassword)
                }
        }
    }

    // REDIRECT IF LOGGED IN
    const token = useAppSelector(state => state.auth.token);

    // CLEANUP

    useEffect(() => {
        refreshAllUserNames();
        setFocus('email', { shouldSelect: true })
        return () => {
            backToStart();
            setAutofilledEmail('');
            reset(defaultValues)
        }
    },[]);

    return (
        <LoginPageView {...{
            token,
            flowStep,
            control,
            register,
            handleFormChange,
            handleFormSubmit: handleSubmit(onSubmit),
            handleEmailEvents,
            handleRememberCheckbox: (value: boolean) => dispatch(setRemember(!value)),
            shouldRemember,
            goToResetRequest,
            backToStart,
            maxLabelWidth,
            isLoading: isSubmitting || loginAwait || signupAwait,
            isAnyError,
            message: isAnyError
                ? connectionErrorMessage || emailErrorMessage || nicknameErrorMessage || passwordErrorMessage
                : message
        }}/>
    )
}

const LoginPageView = <FV extends FieldValues>({
    token,
    flowStep,
    control,
    register,
    handleFormChange,
    handleFormSubmit,
    handleEmailEvents,
    handleRememberCheckbox,
    shouldRemember,
    goToResetRequest,
    backToStart,
    maxLabelWidth,
    isLoading,
    isAnyError,
    message
} : LoginPageViewProps<FV>
) => {
    const { redirectedFrom } = getLocationConfig();

    return ( token
        ?   <Navigate 
                to={ redirectedFrom || '/my-wishes/items/actual' }
                state={{ redirectedFrom: '/login' }}
                replace
            />
        :   
        <div className='login-page'>
            <div className='logo-icon'>
                <LogoIcon/>
                <div className='beta'>Beta</div>
            </div>
            <form
                onChange={ handleFormChange }
                onSubmit={ handleFormSubmit }
            >
                <span 
                    className={ 'message-line' + (isAnyError ? ' error' : '') }
                    children={ message }
                />
                <div className='inputs'>
                    <TextInput
                        register={ register }
                        name='email'
                        patternType='email'
                        label='Почта'
                        labelWidth={ maxLabelWidth }
                        disabled= { flowStep !== 'start' }
                        onBlur={ handleEmailEvents }
                        onKeyDown={ handleEmailEvents }
                        rightAlignedComponent={ flowStep !== 'start' &&
                            <Button
                                icon='change'
                                onClick={ backToStart }
                                className='back-btn'
                            />
                        }
                        autoComplete={ shouldRemember ? 'username' : 'off' }
                    />
                    <PasswordInput
                        register={ register }
                        name={ shouldRemember ? 'password' : 'maskedPassword' }
                        label='Пароль'
                        labelWidth={ maxLabelWidth }
                        autoComplete={ shouldRemember ? 'current-password' : 'off' }
                        className={ (flowStep === 'login' || flowStep === 'signup') ? 'visible' : 'collapsed' }
                    />
                    <TextInput
                        register={ register }
                        name='nickname'
                        label='Никнейм'
                        labelWidth={ maxLabelWidth }
                        className={ flowStep === 'signup' ? 'visible' : 'collapsed' }
                        disabled={ flowStep !== 'signup' }
                    />
                    <CheckBox
                        callback={ handleRememberCheckbox }
                        name='shouldNotRemember'
                        label='не запоминать меня на этом устройстве'
                        className={ (flowStep === 'login' || flowStep === 'signup') ? 'visible' : 'collapsed' }
                    />
                    <TextInput
                        register={ register }
                        name='verificationCode'
                        label='Код из письма'
                        type='password'
                        labelWidth={ maxLabelWidth }
                        className={ flowStep === 'reset-verification' || flowStep === 'reset-new-password' ? 'visible' : 'collapsed' }
                        disabled={ flowStep !== 'reset-verification' && flowStep !== 'reset-request' }
                    />
                    <PasswordInput
                        register={ register }
                        name='newPassword'
                        label='Новый пароль'
                        autoComplete='new-password'
                        labelWidth={ maxLabelWidth }
                        className={ flowStep === 'reset-new-password' ? 'visible' : 'collapsed' }
                        disabled={ flowStep !== 'reset-new-password' }
                    />
                </div>
                <ButtonGroup {...{
                    control,
                    flowStep,
                    isAnyError,
                    isLoading,
                    goToResetRequest
                }}/>
            </form>
        </div>
    )
}
