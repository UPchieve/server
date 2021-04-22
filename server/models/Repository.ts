import * as mongoose from 'mongoose'
import { ContactFormSubmission} from "./ContactFormSubmission";

class Repository {
  private conn: mongoose.Mongoose
  private ContactFormSubmission: ContactFormSubmission

  async constructor(connString: string) {
    this.conn = await mongoose.connect(connString, {
      poolSize: 50,
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    this.ContactFormSubmission = new ContactFormSubmission()
  }

  async saveContactFormSubmission(content, topic, email?, userId?: string) {
    return this.ContactFormSubmission.saveContactFormSubmission(content, topic, email, userId)
  }
}
