import { Html } from '@react-email/html'
import { Head } from '@react-email/head'
import { Body } from '@react-email/body'
import { Container } from '@react-email/container'
import { Row } from '@react-email/row'
import { Column } from '@react-email/column'
import { Heading } from '@react-email/heading'
import { Img } from '@react-email/img'
import { Button } from '@react-email/button'
import { Text } from '@react-email/text'
import { Hr } from '@react-email/hr'
import { Preview } from '@react-email/preview'
import { render } from '@react-email/render'

const apiUrl = import.meta.env.VITE_API_URL;

// colors:
const primary = '#F3E672';
const dark = 'rgba(0, 0, 0, 0.75)';
const light = 'rgba(0, 0, 0, 0.5)';
const ghost = 'rgba(0, 0, 0, 0.05)';

//font-sizes:
const huge = '24px';
const large = '16px';
const general = '14px';
const small = '12px';


const logo = {
    width: 185,
    height: 66,
};
    
const main = {
    backgroundColor: '#fffdee',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
    height: '100vh',
    paddingTop: '11px'
};

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '33px',
    border: '1px solid #f0f0f0',
    maxWidth: '600px',
};

const heading = {
    fontSize: huge,
    letterSpacing: '-0.5px',
    lineHeight: '1.3',
    fontWeight: '400',
    color: dark,
    padding: '11px 0 22px',
    margin: '0 auto'
};

const row = {
    margin: '33px 0',
    paddingLeft: '8px',
    paddingRight: '8px',
    width: '100%',
};

const column = {
    width: '30%',
    margin: 'auto',
    textAlign: 'center' as const,
    verticalAlign: 'middle'
}

const hr = {
    borderColor: '#ccc',
    margin: '42px 0 26px',
};

const textPrimary = {
    fontSize: general,
    color: dark,
};

const textSecondary = {
    fontSize: small,
    color: light,
    margin: '11px 0'
};

const button = {
    backgroundColor: primary,
    color: dark,
    borderRadius: '6px',
    fontSize: large,
    lineHeight: '22px',
    fontFamily: '"GothamPro", sans-serif',
    fontWeight: '400',
    textDecoration: 'none',
    letterSpacing:' -0.5px',
    textAlign: 'center' as const,
    display: 'block',
};

const code = {
    height: '44px',
    fontFamily: 'monospace',
    fontWeight: '700',
    padding: '6px 11px',
    backgroundColor: ghost,
    letterSpacing: '-0.3px',
    fontSize: huge,
    borderRadius: '4px',
    color: dark,
};

const userInsertPoint = '__USER__';
const linkInsertPoint = '__LINK__';
const codeInsertPoint = '__CODE__';
const logoInsertPoint = '__LOGO__';

export const PasswordResetEmail = () => (
    <Html>
        <Head/>
        <Preview>Сброс пароля от аккаунта в приложении Wisssh</Preview>
        <Body style={ main }>
            <Container style={ container }>
                <Img
                    src={ logoInsertPoint }
                    width="185"
                    height="66"
                    alt="Wisssh"
                    style={ logo }
                />
                <Heading style={ heading }>
                    Сброс пароля от аккаунта
                </Heading>
                <Text style={ textPrimary }>
                    Привет, { userInsertPoint }
                </Text>
                <Text style={ textPrimary }>
                    Мы получили заявку на сброс пароля от вашего аккаунта.
                    Для продолжения выполните одно из следующих действий:
                </Text>
                <Row style={ row }>
                    <Column style={{ ...column, width: '40%' }}>
                        <Button pY={11} pX={22} style={ button } href={ window.location.origin + '/login/' + linkInsertPoint }>
                            Сбросить пароль
                        </Button>
                    </Column>
                    <Column style={{ ...column, width: '40%' }}>
                        <Text style={{ ...textSecondary, padding: '11px' }}>или вставьте код вручную:</Text>
                    </Column>
                    <Column style={{ ...column, width: '20%' }}>
                        <code style={code}>{ codeInsertPoint }</code>
                    </Column>
                </Row>
                
                <Text style={ textPrimary }>
                    Кнопка и код будут доступны в течение 5 минут.
                </Text>
                
                <Hr style={hr} />
                
                <Text style={ textSecondary }>
                    Если вы получили это письмо по ошибке, проигнорируйте его. Это безопасно.
                </Text>
            </Container>
        </Body>
    </Html>
);

export async function sendPasswordResetEmail(email: string) {
    return await fetch(apiUrl + '/mail/send-password-reset-email', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email,
            subject: 'Wisssh: сброс пароля',
            emailHtml: render(<PasswordResetEmail/>, { pretty: true }),
            emailText: render(<PasswordResetEmail/>, { plainText: true })
        }),
    })
        .then(res => res.json());
}

export async function verificateCode(code: string, callback: Function) {
    await fetch(apiUrl + '/mail/verificate-password-reset/' + code)
        .then(res => res.json())
        .then(success => {
            if(success) callback()
            else console.log('Wrong verification code')
        })
        .catch(error => {
            console.error(error)
        })
}
