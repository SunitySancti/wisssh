import   React,
       { useState,
         useEffect,
         useLayoutEffect,
         useCallback } from 'react'
import { useForm,
         useWatch } from 'react-hook-form'
import { useNavigate,
         useLocation,
         useParams } from 'react-router-dom'
import { useDispatch,
         useSelector } from 'react-redux'

import './styles.scss'
import { LogoIcon } from 'atoms/Icon'
import { Button } from 'atoms/Button'
import { TextInput } from 'inputs/TextInput'
import { PasswordInput } from 'inputs/PasswordInput'
import { CheckBox } from 'inputs/CheckBox'
import { sendPasswordResetEmail,
         verificateCode } from 'emails/PasswordResetEmail.tsx'

import { getUserNameByEmail,
         useLoginMutation,
         useSignupMutation } from 'store/apiSlice'
import { setRemember } from 'store/authSlice'
import { getAllUserNames } from 'store/getters'
import { decodeEmail } from 'utils'

const __DEV_MODE__ = import.meta.env.DEV


const ButtonGroup = ({
    control,
    flowStep,
    isAnyError,
    isLoading,
    goToResetRequest
}) => {
    const email    = useWatch({ control, name: 'email' });
    const password = useWatch({ control, name: 'password' });
    const nickname = useWatch({ control, name: 'nickname' });

    const disabled = isAnyError
                  || (flowStep === 'start' && !email)
                  || ((flowStep === 'login' || flowStep === 'signup') && !password)
                  || (flowStep === 'signup') && !nickname
    
    const props = {
        type: 'submit',
        round: true,
        disabled,
        isLoading
    }

    switch(flowStep) {
        case 'start':
            props.text = 'Продолжить'
            props.kind = 'clear'
            break
        case 'login':
            props.text = 'Войти'
            props.icon = 'login'
            props.kind = 'accent'
            break
        case 'signup':
            props.text = 'Зарегистрироваться и войти'
            props.icon = 'login'
            props.kind = 'accent'
            break
        case 'reset-request':
            props.text = 'Всё верно. Хочу восстановить пароль'
            props.kind = 'accent'
            break
        case 'reset-verification':
            props.text = 'Письмо отправлено'
            props.icon = 'ok'
            props.kind = 'clear'
            props.disabled = true
            break
        case 'reset-new-password':
            props.text = 'Завершить восстановление пароля и войти'
            props.icon = 'login'
            props.kind = 'accent'
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
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { encodedEmail } = useParams();
    
    // FORM SETTINGS
    
    const defaultValues = {
        email: '',
        password: '',
        nickname: '',
        shouldNotRemember: false,
        verificationCode: '',
        newPassword: ''
    }
    const { handleSubmit, register, control, setValue, formState:{ errors, isSubmitting }, reset, setFocus, getValues } = useForm({
        mode: 'onBlur',
        defaultValues
    });

    // STATE AND HOOKS

    const [flowStep, setFlowStep] = useState('start');
    // 'start' || 'login' || 'signup' || 'reset-request' || 'reset-verification' || 'reset-new-password'
    const [message, setMessage] = useState('Введите почту, чтобы войти или зарегистрироваться');
    const [connectionErrorMessage, setConnectionErrorMessage] = useState('');
    const [emailErrorMessage, setEmailErrorMessage] = useState('');
    const [nicknameErrorMessage, setNicknameErrorMessage] = useState('');
    const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
    const isAnyError = connectionErrorMessage || emailErrorMessage || nicknameErrorMessage;
    
    const [autofilledEmail, setAutofilledEmail] = useState('');
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

    const goToLoginOrSignup = useCallback(async (email) => {
        if(!email) return setFlowStep('start');
        if(autofilledEmail && email !== autofilledEmail) {
            setValue('password', '')    // null autofilled password
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

    const goToResetVerification = useCallback(async (email) => {
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
                setFocus('password')
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

    async function onSubmit(data, e) {
        e.preventDefault();
        const { email, password, nickname: name, newPassword } = data;

        switch(flowStep) {
            case 'start':
                await goToLoginOrSignup(email)
                break
            case 'login':
                login({ email, password })
                break
            case 'signup':
                signup({ email, password, name })
                break
            case 'reset-request':
                await goToResetVerification(email)
                break
            case 'reset-new-password':
                login({ email, newPassword });
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

    function handleEmailEvents(e) {
        if((e.type === 'keydown' && e.keyCode === 13) || (e.type === 'blur')) {
            const wrongEmail = errors?.email?.type === 'pattern';
            if(wrongEmail) {
                setEmailErrorMessage('Проверьте написание почты. Кажется, закралась ошибка')
            } else setEmailErrorMessage('')
        }
    }

    function handleFormChange(e) {
        switch(e.target.name) {
            case 'nickname': // detect used nickname
                const isUsed = allUserNames.includes(e.target.value);
                if(isUsed) setNicknameErrorMessage('Никнейм занят, попробуйте другой')
                else setNicknameErrorMessage('')
                break

            case 'password': // reset password error
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
    
    const { state } = useLocation();
    const token = useSelector(state => state.auth?.token);

    useLayoutEffect(() => {
        if(token) {
            const path = state?.redirectedFrom || '/my-wishes/items/actual'
            navigate(path,{ replace: true })
        }
    },[ token ]);

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
        <div className='login-page'>
            <div className='logo-icon'>
                <LogoIcon/>
                <div className='beta'>Beta</div>
            </div>
            <form
                onChange={ handleFormChange }
                onSubmit={ handleSubmit(onSubmit) }
            >
                <span 
                    className={ isAnyError || passwordErrorMessage ? 'message-line error' : 'message-line'}
                    children={ isAnyError || passwordErrorMessage
                        ? connectionErrorMessage || emailErrorMessage || nicknameErrorMessage || passwordErrorMessage
                        : message }
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
                    />
                    <PasswordInput
                        register={ register }
                        name='password'
                        label='Пароль'
                        labelWidth={ maxLabelWidth }
                        className={(flowStep === 'login' || flowStep === 'signup') ? 'visible' : 'collapsed'}
                    />
                    <TextInput
                        register={ register }
                        name='nickname'
                        label='Никнейм'
                        labelWidth={ maxLabelWidth }
                        className={flowStep === 'signup' ? 'visible' : 'collapsed'}
                        disabled={flowStep !== 'signup'}
                    />
                    <CheckBox
                        callback={(value) => dispatch(setRemember(!value))}
                        name='shouldNotRemember'
                        label='не запоминать меня на этом устройстве'
                        className={(flowStep === 'login' || flowStep === 'signup') ? 'visible' : 'collapsed'}
                    />
                    <TextInput
                        register={ register }
                        name='verificationCode'
                        label='Код из письма'
                        type='password'
                        labelWidth={ maxLabelWidth }
                        className={flowStep === 'reset-verification' || flowStep === 'reset-new-password' ? 'visible' : 'collapsed'}
                        disabled={flowStep !== 'reset-verification' && flowStep !== 'reset-request'}
                    />
                    <PasswordInput
                        register={ register }
                        name='newPassword'
                        label='Новый пароль'
                        autoComplete='new-password'
                        labelWidth={ maxLabelWidth }
                        className={flowStep === 'reset-new-password' ? 'visible' : 'collapsed'}
                        disabled={flowStep !== 'reset-new-password'}
                    />
                </div>
                <ButtonGroup {...{
                    control,
                    flowStep,
                    isAnyError,
                    isLoading: isSubmitting || loginAwait || signupAwait,
                    goToResetRequest
                }}/>
            </form>
        </div>
    )
}
