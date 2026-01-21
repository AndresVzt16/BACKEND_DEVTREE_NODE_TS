import FormData from "form-data";
import Mailgun from "mailgun.js";
import { IUser } from "../models/User";


export interface EmailMessage extends IUser {
    subject:string,
    token:string,
    dateRegister:Date
}


const sendMessage = async (messageData:EmailMessage) => {

  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY,
  });
  try {
    const data = await mg.messages.create("codeinfinity.me", {
      from: 'Devtree<postmaster@codeinfinity.me>',
      to: messageData.email,
      subject: messageData.subject,
      template: "welcome_user",
      "h:X-Mailgun-Variables": JSON.stringify({
        name:messageData.name,
        link:messageData.token,
        user:messageData.handle,
        DateRegister:messageData.dateRegister

      }),
    });
    return true
  } catch (error) {
    return false
  }
};
export {sendMessage}