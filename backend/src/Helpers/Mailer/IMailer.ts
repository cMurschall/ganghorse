export interface EmailReceiver {
    email: string,
    name: string
}

export interface EmailContent {
    subject: string,
    text: string,
    html?: string,
    customID?: string,
}

//export const sendMail = async (receiver: EmailReceiver, content: EmailContent): Promise<boolean> => {

export interface IMailer {
    sendMail(receiver: EmailReceiver, content: EmailContent): Promise<boolean>
}