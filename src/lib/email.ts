import { APP_NAME } from '@/lib/settings';
/* import { env } from '@/env'; */
/* import Plunk from '@plunk/node'; */
import type { EmailProps } from '@/types/email';

export const sendEmail = async ({
  name = APP_NAME,
  from,
  to,
  subject,
  body,
  subscribed = false,
}: EmailProps) => {
  /* const mailer = new Plunk(env.PLUNK_API_KEY); */
  /* await mailer.emails.send({ name, from, to, subject, body, subscribed }); */
};
