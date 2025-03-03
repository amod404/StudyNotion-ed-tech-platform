const nodemailer = require('nodemailer');

const mailSender = async(email,title,body) => {
    try{

        let transported =  nodemailer.createTransport({
            host:process.env.MAIL_HOST,
            auth:{
                user:process.env.MAIL_USER,
                pass:process.env.MAIL_PASS,
            }
        })

        let info = await transported.sendMail({
            from: 'StudyNotion | Your Learning Platform',
            to:`${email}`,
            subject:`${title}`,
            html:`${body}`
        })

    } catch(err){
        console.log(err.message);
    }
}

module.exports = mailSender;