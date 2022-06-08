import nodemailer from "nodemailer"
import { IMailer, EmailReceiver, EmailContent } from "./IMailer";




export class GangHorseMailer implements IMailer {

    constructor(private transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USERNAME,
            pass: process.env.SMTP_PASSWORD,
        },
    })) { }



    async sendMail(receiver: EmailReceiver, content: EmailContent): Promise<boolean> {
        // send mail with defined transport object
        let info = await this.transporter.sendMail({
            from: process.env.SMTP_USERNAME,

            to: receiver.email,
            subject: content.subject,
            text: content.text,
            html: content.html,
        });

        console.log(info)

        return info.accepted.length > 0;
    }
}