import nodemailer from 'nodemailer'
import hbs from 'nodemailer-express-handlebars'
import exphbs from 'express-handlebars'
import config from '../../config'

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.secure,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.password,
  },
})

transporter.use(
  'compile',
  hbs({
    viewEngine: exphbs.create({
      layoutsDir: `${__dirname}/views`,
      extname: '.hbs',
    }),
    viewPath: `${__dirname}/views`,
    extName: '.hbs',
  })
)

export async function sendContactFormEmail(context: {
  email: string
  topic: string
  message: string
}) {
  const mail = {
    from: `UPchieve ${config.mail.senders.noreply}`,
    sender: config.mail.senders.noreply,
    replyTo: config.mail.senders.noreply,
    to: config.mail.receivers.contact,
    subject: 'New contact form submission',
    template: 'ContactUs',
    context,
  }
  try {
    return transporter.sendMail(mail)
  } catch (err) {
    throw err
  }
}
