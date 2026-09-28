import { useState } from 'react';
import type { FormEvent } from 'react';
import { Clock, Facebook, Instagram, Mail, MessageCircle, Phone } from 'lucide-react';
import Toast from '../components/Toast';
import { cn } from '../lib/format';

interface FormValues {
  name: string;
  email: string;
  phone: string;
  message: string;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

const emptyForm: FormValues = { name: '', email: '', phone: '', message: '' };

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.name.trim()) {
    errors.name = 'Please enter your name.';
  }

  if (!values.email.trim()) {
    errors.email = 'Please enter your email.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  if (values.phone.trim() && !/^[\d\s+()-]{7,16}$/.test(values.phone.trim())) {
    errors.phone = 'Please enter a valid phone number.';
  }

  if (!values.message.trim()) {
    errors.message = 'Please enter a message.';
  }

  return errors;
}

const socials = [
  { href: 'https://instagram.com', label: 'Instagram', Icon: Instagram },
  { href: 'https://facebook.com', label: 'Facebook', Icon: Facebook },
  { href: 'https://wa.me/919800000000', label: 'WhatsApp', Icon: MessageCircle },
];

export default function Contact() {
  const [values, setValues] = useState<FormValues>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [toast, setToast] = useState<string | null>(null);

  function handleChange(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    // No backend yet — this is where the API call will go.
    setValues(emptyForm);
    setToast('Thanks — your message has been sent.');
  }

  const fieldClass = (field: keyof FormValues) =>
    cn('field-input', errors[field] && 'border-brand focus:border-brand');

  return (
    <div className="container-site py-14 sm:py-20">
      <header className="max-w-xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Get in Touch</h1>
        <p className="mt-4 text-sm leading-relaxed text-ink/60">
          Questions about sizing, stock or an order? Send us a message and we will get back to
          you within two business days.
        </p>
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_20rem] lg:gap-20">
        <form onSubmit={handleSubmit} noValidate className="max-w-xl">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="field-label">
                Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={values.name}
                onChange={(event) => handleChange('name', event.target.value)}
                className={fieldClass('name')}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && (
                <p id="name-error" className="mt-1.5 text-xs text-brand">
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="field-label">
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={values.email}
                onChange={(event) => handleChange('email', event.target.value)}
                className={fieldClass('email')}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <p id="email-error" className="mt-1.5 text-xs text-brand">
                  {errors.email}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="phone" className="field-label">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={values.phone}
              onChange={(event) => handleChange('phone', event.target.value)}
              className={fieldClass('phone')}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? 'phone-error' : undefined}
            />
            {errors.phone && (
              <p id="phone-error" className="mt-1.5 text-xs text-brand">
                {errors.phone}
              </p>
            )}
          </div>

          <div className="mt-6">
            <label htmlFor="message" className="field-label">
              Message *
            </label>
            <textarea
              id="message"
              name="message"
              rows={6}
              value={values.message}
              onChange={(event) => handleChange('message', event.target.value)}
              className={cn(fieldClass('message'), 'resize-y')}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={errors.message ? 'message-error' : undefined}
            />
            {errors.message && (
              <p id="message-error" className="mt-1.5 text-xs text-brand">
                {errors.message}
              </p>
            )}
          </div>

          <button type="submit" className="btn-primary mt-8 w-full sm:w-auto sm:min-w-[14rem]">
            Send Message
          </button>
        </form>

        <aside className="space-y-8 lg:pt-1">
          <div>
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em]">Email</h2>
            <p className="mt-3 flex items-center gap-2.5 text-sm text-ink/70">
              <Mail size={16} strokeWidth={1.6} className="shrink-0 text-stone" />
              hello@bootshypermarket.in
            </p>
          </div>

          <div>
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em]">Phone</h2>
            <p className="mt-3 flex items-center gap-2.5 text-sm text-ink/70">
              <Phone size={16} strokeWidth={1.6} className="shrink-0 text-stone" />
              +91 98000 00000
            </p>
          </div>

          <div>
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em]">
              Business Hours
            </h2>
            <div className="mt-3 flex gap-2.5 text-sm text-ink/70">
              <Clock size={16} strokeWidth={1.6} className="mt-0.5 shrink-0 text-stone" />
              <div className="space-y-1">
                <p>Monday – Friday: 10am – 7pm</p>
                <p>Saturday: 10am – 4pm</p>
                <p>Sunday: Closed</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em]">Follow</h2>
            <div className="mt-3 flex items-center gap-3">
              {socials.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="border border-ink/15 p-2.5 text-ink/70 transition-colors hover:border-ink hover:text-ink"
                >
                  <Icon size={17} strokeWidth={1.6} />
                </a>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}

