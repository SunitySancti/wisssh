import   React, {
         useState,
         useEffect,
         useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { useForm,
         useWatch } from 'react-hook-form'
import { useNavigate, 
         useParams } from 'react-router-dom'

import './styles.scss'
import { LogoIcon } from 'atoms/Icon'
import { Button } from 'atoms/Button'
import { TextInput } from 'inputs/TextInput'
import { PasswordInput } from 'inputs/PasswordInput'
import { CheckBox } from 'inputs/CheckBox'
import { sendPasswordResetEmail,
         verificateCode } from 'emails/PasswordResetEmail.tsx'

import { useGetUsersQuery,
         useLoginMutation,
         useSignupMutation } from 'store/apiSlice'
import { logout } from 'store/authSlice'
import { decodeEmail } from 'utils'


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
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { encodedEmail } = useParams();
    
    // FORM SETTINGS
    
    const defaultValues = {
        email: '',
        password: '',
        nickname: '',
        shallNotRemember: false,
        verificationCode: '',
        newPassword: ''
    }
    const { handleSubmit, register, control, watch, setValue, formState:{ errors, isSubmitting }, reset, setFocus } = useForm({
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
    const notRemember = watch('shallNotRemember');
    const maxLabelWidth = 121;
    
    const {   data: allUsers,
           refetch: refreshUsers,
           isError: usersLoadingWasCrashed } = useGetUsersQuery();

    const         [ login, {
        data:       loginResponse,
        error:      loginError,
        isSuccess:  loginSuccess,
        isError:    loginWasCrashed,
        isLoading:  loginAwait }] = useLoginMutation();

    const         [ signup, {
        data:       signupResponse,
        error:      signupError,
        isSuccess:  signupSuccess,
        isError:    signupWasCrashed,
        isLoading:  signupAwait }] = useSignupMutation();

    // FORM ROUTING

    const backToStart = useCallback(() => {
        setFlowStep('start');
        setMessage('Введите почту, чтобы войти или зарегистрироваться');
        setNicknameErrorMessage('');
    },[]);

    const goToLoginOrSignup = useCallback((email) => {
        if(!allUsers || !email) return setFlowStep('start');
        if(autofilledEmail && email !== autofilledEmail) {
            setValue('password', '')    // null autofilled password
        };
        const userName = allUsers.find(user => user.email === email)?.name;
        if(userName) {
            setFlowStep('login');
            setMessage(`Добрый день, ${userName}. Рады снова вас видеть!`)
        } else {
            setFlowStep('signup');
            setMessage('Кажется, вы здесь впервые. Давайте зарегистрируемся!')
        }
    },[ allUsers?.length, autofilledEmail ]);

    const goToResetRequest = useCallback(() => {
        setFlowStep('reset-request');
        setMessage('Ваш аккаунт привязан к этой почте?')
    },[]);

    const goToResetVerification = useCallback(async (email) => {
        console.log(await sendPasswordResetEmail(email));
        setFlowStep('reset-verification');
        setMessage('Дальнейшие инструкции направлены вам в письме')
    },[]);

    const goToCreateNewPassword = useCallback(() => {
        setFlowStep('reset-new-password');
        setMessage('Придумайте новый пароль');
        navigate('/login');
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
                navigate('/login')
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
                goToLoginOrSignup(email)
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
    
    // GET RESPONSE AND REDIRECT

    useEffect(() => {
        const token = loginResponse?.token || signupResponse?.token;
        const userId = loginResponse?.userId || signupResponse?.userId;
        if(!token || !userId) return;
        
        const storage = notRemember ? sessionStorage : localStorage;
        storage.setItem('token', token);
        storage.setItem('userId', userId);
        
        navigate('/my-wishes/items/actual')
    },[ loginSuccess, signupSuccess, notRemember ]);

    // ERROR HANDLERS

    useEffect(() => {
        if(loginWasCrashed) {
            console.log(loginError)
            setPasswordErrorMessage('Неверный пароль')
        } else setPasswordErrorMessage('')
    },[ loginWasCrashed ]);

    useEffect(() => {
        if(signupWasCrashed) console.log(signupError)
    },[ signupWasCrashed ])

    useEffect(() => {
        if(usersLoadingWasCrashed) {
            setConnectionErrorMessage('Сервер не отвечает, попробуйте перезагрузить страницу')
        } else setConnectionErrorMessage('')
    },[ usersLoadingWasCrashed ]);

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
                const isUsed = allUsers?.find(user => user.name === e.target.value)?.name;
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

    // CLEANUP

    useEffect(() => {
        dispatch(logout());
        refreshUsers();
        setFocus('email', { shouldSelect: true })
        return () => {
            backToStart();
            setAutofilledEmail('');
            reset(defaultValues)
        }
    },[]);

    return (
        <div className='login-page'>
            <LogoIcon/>
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
                        control={ control }
                        name='shallNotRemember'
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
