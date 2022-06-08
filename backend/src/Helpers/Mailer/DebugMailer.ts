import { IMailer, EmailReceiver, EmailContent } from "./IMailer";




export class DebugMailer implements IMailer {

    async sendMail(receiver: EmailReceiver, content: EmailContent): Promise<boolean> {
        console.log("Recieved email:", {
            receiver, content
        })
        return new Promise(x => x(true))

    }
}