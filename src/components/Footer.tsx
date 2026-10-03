import { Link } from 'react-router-dom';
import { Facebook, Instagram, MessageCircle } from 'lucide-react';
import { shop, storeLocations } from '../data/shop';

const quickLinks = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

const departmentLinks = [
  { to: '/shop?filter=footwear', label: 'Footwear' },
  { to: '/shop?filter=bags', label: 'Bags' },
  { to: '/shop?filter=trolleys', label: 'Trolleys' },
];

const supportLinks = [
  { to: '/track', label: 'Track Order' },
  { to: '/contact', label: 'Shipping' },
  { to: '/contact', label: 'Returns' },
  { to: '/contact', label: 'Contact' },
];

const socials = [
  { href: 'https://instagram.com', label: 'Instagram', Icon: Instagram },
  { href: 'https://facebook.com', label: 'Facebook', Icon: Facebook },
  { href: shop.whatsapp, label: 'WhatsApp', Icon: MessageCircle },
];

export default function Footer() {
  return (
    <footer className="mt-24 bg-brand text-cream">
      <div className="container-site grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
        <div className="sm:col-span-2">
          <img
            src="/images/logo.png"
            alt="Boots Hyper Market"
            width={936}
            height={400}
            loading="lazy"
            className="h-12 w-auto"
          />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-cream/60">
            Footwear, bags and trolleys for the whole family. Serving our neighbourhood since 1980.
          </p>
          <p className="mt-4 max-w-xs text-xs leading-relaxed text-cream/45">
            {storeLocations.join(' · ')}
          </p>
          <p className="mt-2 text-xs text-cream/45">{shop.hours}</p>
        </div>

        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cream/50">
            Shop
          </h2>
          <ul className="mt-5 space-y-3">
            {departmentLinks.map((link) => (
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

          <div className="mt-7 flex items-center gap-3">
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
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="container-site flex flex-col gap-2 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-cream/50">
            © 2026 Boots Hyper Market. All rights reserved.
          </p>
          <p className="text-xs text-cream/50">
            {shop.email} · {shop.phoneDisplay}
          </p>
        </div>
      </div>
    </footer>
  );
}
