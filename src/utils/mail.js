import Mailgen from "mailgen";
import nodemailer from "nodemailer";


const sendEmail = async (options)=>{
    const mailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "Task Manager",
            link: "https://taskmanagelink.com"
        }
    });

    const textEmail = mailGenerator.generatePlaintext(options.mailgenContent);
    const htmlEmail = mailGenerator.generate(options.mailgenContent);

    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: process.env.MAILTRAP_SMTP_PORT,
        auth: {
            user: process.env.MAILTRAP_SMTP_USERNAME,
            pass: process.env.MAILTRAP_SMTP_PASSWORD,
        }
    });

    const mail = {
        from: "mail.taskmanager@example.com",
        to: options.email,
        subject: options.subject,
        text: textEmail,
        html: htmlEmail,
    }

    try{
        await transporter.sendMail(mail);
        console.log("email sent successfully");
    }catch(error){
        console.error("email service failed with error: ", error);
    }
}


const emailVerificationMailGenContent = (username, verificationUrl) => {
    return {
        body: {
            name: username,
            intro: `Welcome to this app mad by Nawaz , We are excited to have you on board`,
            action: {
                instructions: `to verify your email, please click the following button:`,
                button: {
                    color: `#22BC66`,
                    text: `Verify your email`,
                    link: verificationUrl,
                },
            },
            outro: "Need help, or have questions? just reply to this email, we'd love to help.",
        }
    };
};

const forgotPasswordMailGenContent = (username, passwordResetUrl) => {
    return {
        body: {
            name: username,
            intro: `We received a request to reset your password.`,
            action: {
                instructions: `to reset your password, click on the following button:`,
                button: {
                    color: `#DC4D2F`,
                    text: `Reset Password`,
                    link: passwordResetUrl,
                },
            },
            outro: "Need help, or have questions? just reply to this email, we'd love to help.",
        }
    };
};

export {
    emailVerificationMailGenContent,
    forgotPasswordMailGenContent,
    sendEmail
};

