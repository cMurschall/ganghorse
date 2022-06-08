import { Body } from "routing-controllers";


interface TextFunc {
    (linkUrl: string, params?: string[]): string;
}

interface EmailMessage {
    subject: string,
    text: TextFunc,
    html: TextFunc
}


const htmlTemplate = (body: string): string => {
    return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
            <title>A Simple Responsive HTML Email</title>
            <style type="text/css">
            body {margin: 0; padding: 0; min-width: 100%!important;}
            .content {width: 100%; max-width: 600px;}  
            </style>
        </head>
        <body yahoo bgcolor="#f6f8f1">
            <table width="100%" bgcolor="#f6f8f1" border="0" cellpadding="0" cellspacing="0">
                <tr>
                    <td>
                        <table class="content" align="center" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                                <td>
                                    ${body}
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
    </html>`
}


export const registrationMessages: { [locale: string]: EmailMessage; } = {
    "de": {
        subject: "Ihre Registrierung auf Gang Horse",
        text: (linkUrl) => {
            return `Herzlich willkommen!\nBitte öffnen Sie den Link \n${linkUrl}\num die Registrierung abzuschließen.`
        },
        html: (linkUrl) => {
            return `Herzlich willkommen!</br>Bitte öffnen Sie den <a  target="_blank" rel="noopener noreferrer" href="${linkUrl}">Link</a> um die Registrierung abzuschließen.`
        },
    },
    "en": {
        subject: "Your registration at Gang Horse",
        text: (linkUrl) => {
            return `Welcome!\nIn order to finish the registration process please open the link \n${linkUrl}`
        },
        html: (linkUrl) => {
            return `Welcome!</br>In order to finish the registration process please open the <a  target="_blank" rel="noopener noreferrer" href="${linkUrl}">link</a>`
        },
    },
};




export const forgotPasswordMessages: { [locale: string]: EmailMessage; } = {
    "de": {
        subject: "Ihr neues Password auf Gang Horse",
        text: (linkUrl) => {
            return `Ein neues Password wurde angefordert!\nBitte öffnen Sie den Link \n${linkUrl}\n um ein neues Password zu generieren.\nWenn Sie kein neues Password angefordert haben, können Sie diese Email ignorieren.`
        },
        html: (linkUrl) => {
            return `Ein neues Password wurde angefordert!</br>Bitte öffnen Sie den <a  target="_blank" rel="noopener noreferrer" href="${linkUrl}">Link</a> um ein neues Password zu generieren.</br>Wenn Sie kein neues Password angefordert haben, können Sie diese Email ignorieren.`
        },
    },
    "en": {
        subject: "Your new password at Gang Horse",
        text: (linkUrl) => {
            return `A new password has been requested!\nIn order to change your password please open the link \n${linkUrl}\n to enter a new password. If you did not request a new password, you may ignore this email.`
        },
        html: (linkUrl) => {
            return `A new password has been requested!</br>In order to change your password please open the <a  target="_blank" rel="noopener noreferrer" href="${linkUrl}">link</a> to enter a new password. If you did not request a new password, you may ignore this email.`
        },
    },
};



export const newMessageAddedMessages: { [locale: string]: EmailMessage; } = {
    "de": {
        subject: "Ein neuer, öffentlicher Kommentar ist eingetroffen",
        text: (linkUrl, params) => {
            return `Ein neuer Kommentar zur Anzeige '${params || [][0]}' wurde geschrieben\nUnter diesem Link \n${linkUrl}\n kommen Sie zur Anzeige.`
        },
        html: (linkUrl, params) => {
            return `Ein neuer Kommentar zur Anzeige '${params || [][0]}' wurde geschrieben</br>Unter diesem <a  target="_blank" rel="noopener noreferrer" href="${linkUrl}">Link</a> kommen Sie zur Anzeige.`
        },
    },
    "en": {
        subject: "A new public comment has arrived",
        text: (linkUrl, params) => {
            return `A new message regading the advertisement '${params || [][0]}' has been send. You can visit the advertisement by following this link: ${linkUrl}`
        },
        html: (linkUrl, params) => {
            return `A new message regading the advertisement '${params || [][0]}' has been send. You can visit the advertisement by following this <a  target="_blank" rel="noopener noreferrer" href="${linkUrl}">link</a>`
        }
    },
};

export const newPrivateMessageNotification: { [locale: string]: EmailMessage; } = {
    "de": {
        subject: "Eine Nutzeranfrage ist eingetroffen",
        text: (text, params) => {
            return `Eine Anfrage zur Anzeige '${params || [][0]}' ist eingetroffen:\n${text}`
        },
        html: (text, params) => {
            return `Eine Anfrage zur Anzeige '${params || [][0]}' ist eingetroffen:</br>${text}`
        }
    },
    "en": {
        subject: "A user message has arrived",
        text: (text, params) => {
            return `A new message regading the advertisement '${params || [][0]}' has been send:\n ${text}`
        },
        html: (text, params) => {
            return `A new message regading the advertisement '${params || [][0]}' has been send:</br>${text}`
        }
    },
};


export const alreadyExistingUserRegistration: { [locale: string]: EmailMessage; } = {
    "de": {
        subject: "Ungültiger Registrierungsversuch",
        text: (userName) => {
            return `Jemand hat versucht, ihren Nutzernamen '${userName}' nochmal zu registrieren. Der Versuch wurde abgewiesern und an Ihrem Konto wurde nichts geändert.`
        },
        html: (userName) => {
            return `Jemand hat versucht, ihren Nutzernamen '${userName}' nochmal zu registrieren. Der Versuch wurde abgewiesern und an Ihrem Konto wurde nichts geändert.`
        }
    },
    "en": {
        subject: "Invalid register attempt",
        text: (userName) => {
            return `Someone has tried to register a user with your user name '${userName}'. The attempt was rejected and your account was not changed.`
        },
        html: (userName) => {
            return `Someone has tried to register a user with your user name '${userName}'. The attempt was rejected and your account was not changed.`
        }
    },
};
export const noUserDescription: { [locale: string]: EmailMessage; } = {
    "de": {
        subject: "Achtung - keine Nutzerbeschreibung",
        text: () => {
            return `Ihr Angebot auf gang.horse wurde gespeichert. Sie haben noch keine Angaben in Ihrer Nutzerbeschreibung gemacht. Geben Sie unter Einstellungen => Beschreibung eine Beschreibung mit einer Kontaktmöglichkeit (z.B. eine Emailadresse oder Telefonnummer) an.`
        },
        html: () => {
            return `Ihr Angebot auf gang.horse wurde gespeichert. Sie haben noch keine Angaben in Ihrer Nutzerbeschreibung gemacht. Geben Sie unter Einstellungen => Beschreibung eine Beschreibung mit einer Kontaktmöglichkeit (z.B. eine Emailadresse oder Telefonnummer) an.`
        }
    },
    "en": {
        subject: "Attention - no user description",
        text: () => {
            return `Your offer on gang.horse has been saved. You have not yet made any entries in your user description. Under Settings => Description, enter a description with a contact option (e.g. an email address or telephone number).`
        },
        html: () => {
            return `Your offer on gang.horse has been saved. You have not yet made any entries in your user description. Under Settings => Description, enter a description with a contact option (e.g. an email address or telephone number).`
        }
    },
};


