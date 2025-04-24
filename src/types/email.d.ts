export type EmailProps = {
  name?: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  subscribed?: boolean;
};

export interface EmailVerificationProps {
  name: string;
  url: string;
}
