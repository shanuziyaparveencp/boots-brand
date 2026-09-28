import { Link } from 'react-router-dom';
import { Facebook, Instagram, MessageCircle } from 'lucide-react';

const quickLinks = [
  { to: '/', label: 'Home' },
  { to: '/boots', label: 'Boots' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

const supportLinks = [
  { to: '/contact', label: 'Shipping' },
  { to: '/contact', label: 'Returns' },
  { to: '/contact', label: 'Contact' },
];

const socials = [
  { href: 'https://instagram.com', label: 'Instagram', Icon: Instagram },
  { href: 'https://facebook.com', label: 'Facebook', Icon: Facebook },
  { href: 'https://wa.me/919800000000', label: 'WhatsApp', Icon: MessageCircle },
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-ink/10 bg-ink text-cream">
      <div className="container-site grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        <div className="sm:col-span-2 lg:col-span-1">
          <p className="text-base font-bold uppercase tracking-[0.22em]">Northbound</p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/60">
            Durable boots made from honest materials, built to be worn every day and repaired
            rather than replaced.
          </p>
        </div>

        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cream/50">
            Quick Links
          </h2>
          <ul className="mt-5 space-y-3">
            {quickLinks.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  className="text-sm text-cream/75 transition-colors hover:text-cream"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cream/50">
            Customer Support
          </h2>
          <ul className="mt-5 space-y-3">
            {supportLinks.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  className="text-sm text-cream/75 transition-colors hover:text-cream"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cream/50">
            Follow
          </h2>
          <div className="mt-5 flex items-center gap-3">
            {socials.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="border border-cream/20 p-2.5 text-cream/75 transition-colors hover:border-cream/50 hover:text-cream"
              >
                <Icon size={17} strokeWidth={1.6} />
              </a>
            ))}
          </div>
          <p className="mt-6 text-sm text-cream/60">hello@northbound.in</p>
          <p className="text-sm text-cream/60">+91 98000 00000</p>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="container-site py-6">
          <p className="text-xs text-cream/50">© 2026 Northbound. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
