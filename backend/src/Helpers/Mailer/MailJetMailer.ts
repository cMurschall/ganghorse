import { EmailReceiver, EmailContent, IMailer } from "./IMailer"

const mailjet = require('node-mailjet')
    .connect(process.env.Mailjet_APIKEY_PUBLIC, process.env.Mailjet_APIKEY_PRIVATE)



export class MailJetMailer implements IMailer {
    sendMail(receiver: EmailReceiver, content: EmailContent): Promise<boolean> {

        console.log({content})


        const request = mailjet
            .post("send", { 'version': 'v3.1' })
            .request({
                "Messages": [
                    {
                        "From": {
                            "Email": "no-reply@gang.horse",
                            "Name": "gang.horse"
                        },
                        "To": [
                            {
                                "Email": receiver.email,
                                "Name": receiver.name
                            }
                        ],
                        "Subject": content.subject,
                        "TextPart": content.text,
                        "HTMLPart": content.html,
                        //"CustomID": content.customID
                    }
                ]
            })
        return new Promise((resolve, reject) => {
            request
                .then((result: any) => {
                    console.log(result.body)
                    resolve(true);
                })
                .catch((err: any) => {
                    console.log(err.statusCode)
                    reject(err)
                })

        })
    }

}




