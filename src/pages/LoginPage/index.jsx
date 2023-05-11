import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import './styles.scss'
import { LogoIcon } from 'atoms/Icon'
import { Button } from 'atoms/Button'
import { TextInput } from 'inputs/TextInput'
import { PasswordInput } from 'inputs/PasswordInput'

import { useGetUsersQuery,
         useLoginMutation,
         useSignupMutation } from 'store/apiSlice'

export const LoginPage = () => {
    const navigate = useNavigate();
    
    // setting form:
    
    const defaultValues = {
        loginOrEmail: '',
        name: '',
        email: '',
        password: '',
    }
    const { handleSubmit, register, watch, setValue, getValues } = useForm({
        mode: 'onChange',
        defaultValues
    });
    const watchLoginOrEmail = watch('loginOrEmail');

    const [matchedUserName, setMatchedUserName] = useState(null);
    const [isRegisterFlow, setIsRegisterFlow] = useState(false);
    const [isEmailFirst, setIsEmailFirst] = useState(false);

    const [login,{ data: loggedUser }] = useLoginMutation();
    const [signup,{ data: signedUser }] = useSignupMutation();
    const { refetch, data: allUsers } = useGetUsersQuery();


    const message = watchLoginOrEmail === ''
        ? 'Добро пожаловать в wisssh — ваш персональный менеджер желаний'
        : matchedUserName
        ? `Рады снова вас видеть, ${matchedUserName}! :)`
        : 'Кажется, вы здесь впервые. Зарегистрируемся? Это быстро :)'

    const buttonText = isRegisterFlow
        ? 'Завершить регистрацию и войти'
        : <>
            <span className={ matchedUserName ? 'active' : ''}>Войти</span>
             / 
            <span className={ matchedUserName ? '' : 'active'}>зарегистрироваться</span>
          </>
    

    // form methods:

    const onSubmit = async (data) => {
        const { name, email, password } = data;

        if(matchedUserName) {
            if(isEmailFirst) {
                login({ email, password }) 
            } else {
                login({ name, password })
            }
        } else {
            if(isRegisterFlow) {
                signup({ name, email, password })
            } else {
                setIsRegisterFlow(true);
            }
        }
    }

    useEffect(() => {
        const user = allUsers?.find(user => (
            user.name === watchLoginOrEmail || user.email === watchLoginOrEmail
        ));
        setMatchedUserName(user?.name || null);

        const checkFieldForEmail = watchLoginOrEmail.includes('@');
        setIsEmailFirst(checkFieldForEmail);

        if(checkFieldForEmail) {
            setValue('email', watchLoginOrEmail);
            setValue('name', '');
        } else {
            setValue('email', '');
            setValue('name', watchLoginOrEmail);
        }
    },[ watchLoginOrEmail ]);

    useEffect(() => {
        if (isRegisterFlow) document.querySelector('.last-input').focus();
    },[ isRegisterFlow ])

    useEffect(() => {
        if(!signedUser) return;
        const { email, password } = getValues();
        login({ email, password });
    },[ signedUser ])

    useEffect(() => {
        if(loggedUser?.token) navigate('/');
    },[ loggedUser?.token ]);

    // align labels:

    const [maxLabelWidth, setMaxLabelWidth] = useState(null);

    useEffect(() => {
        const labels = document.querySelectorAll('.text-label');
        const labelWidths = [...labels].map(label => label?.offsetWidth);
        const maxWidth = labels.length ? Math.max(...labelWidths) : null;

        setMaxLabelWidth(maxWidth);
    });

    return (
        <div className='login-page'>
            <LogoIcon/>
            <form>
                <span
                    className='message-line'
                    children={ message }
                />
                <div className='inputs'>
                    <TextInput
                        register={ register }
                        name={ !isRegisterFlow ? 'loginOrEmail' : isEmailFirst ? 'email' : 'name' }
                        label={ !isRegisterFlow ? 'Login / email' : isEmailFirst ? 'Email' : 'Login' }
                        labelWidth={ maxLabelWidth }
                        required
                    />
                    <PasswordInput
                        register={ register }
                        autoComplete="off"
                        labelWidth={ maxLabelWidth }
                        required
                    />
                    { isRegisterFlow &&
                        <>
                            <div className='free-space'/>
                            <TextInput
                                register={ register }
                                name={ isEmailFirst ? 'name' : 'email' }
                                label={ isEmailFirst ? 'Login' : 'Email' }
                                labelWidth={ maxLabelWidth }
                                required
                                className='last-input'
                            />
                        </>
                    }
                </div>
                <Button
                    type='submit'
                    leftIcon='login'
                    text={ buttonText }
                    kind='clear'
                    onClick={ handleSubmit(onSubmit) }
                />
            </form>
        </div>
    )
}
