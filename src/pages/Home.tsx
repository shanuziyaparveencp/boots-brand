import { Link } from 'react-router-dom';
import { Award, PackageCheck, ShieldCheck, Store } from 'lucide-react';
import SectionHeading from '../components/SectionHeading';
import ProductGrid from '../components/ProductGrid';
import { getFeaturedProducts } from '../data/products';
import { departmentCards } from '../data/filters';

const features = [
  {
    Icon: Award,
    title: 'Trusted Since 1980',
    text: 'Four decades serving the same neighbourhood, and a lot of customers we now know by name.',
  },
  {
    Icon: Store,
    title: 'Everything in One Place',
    text: 'Footwear, bags and travel trolleys under one roof, for the whole family.',
  },
  {
    Icon: ShieldCheck,
    title: 'Quality You Can Check',
    text: 'We stock brands we would use ourselves, and you are welcome to inspect before you buy.',
  },
  {
    Icon: PackageCheck,
    title: 'Easy Exchange',
    text: 'Sizes not right? Exchange within 30 days, in store or by post, with the receipt.',
  },
];

export default function Home() {
  const featured = getFeaturedProducts(8);

  return (
    <>
      <section className="relative isolate">
        <img
          src="/images/hero.jpg"
          alt="Lacing a pair of leather boots"
          width={1800}
          height={1200}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-dark/90 via-brand-dark/70 to-brand-dark/30" />

        <div className="container-site flex min-h-[520px] items-center py-20 sm:min-h-[580px] lg:min-h-[640px]">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cream/70">
              Since 1980
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-[1.05] tracking-tight text-cream sm:text-5xl lg:text-6xl">
              EVERY STEP. EVERY JOURNEY.
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-cream/85">
              Footwear, bags and trolleys for the whole family - chosen carefully, priced fairly.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to="/shop" className="btn-light">
                Shop Now
              </Link>
              <Link
                to="/about"
                className="btn border border-cream/40 text-cream hover:bg-cream hover:text-brand"
              >
                Our Story
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container-site py-20 sm:py-24">
        <SectionHeading eyebrow="Shop by Department" title="Three departments, one shop." />
        <div className="mt-12 grid gap-6 sm:grid-cols-3 lg:gap-8">
          {departmentCards.map((department) => (
            <Link
              key={department.department}
              to={`/shop?filter=${department.filter}`}
              className="group block"
            >
              <div className="overflow-hidden bg-sand">
                <img
                  src={department.image}
                  alt={department.label}
                  width={800}
                  height={1000}
                  loading="lazy"
                  className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <h3 className="mt-4 text-base font-medium">{department.label}</h3>
              <p className="mt-1 text-sm text-ink/55">{department.blurb}</p>
              <span className="mt-2 inline-block border-b border-brand/30 pb-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand transition-colors group-hover:border-brand">
                Shop {department.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-ink/10 bg-sand">
        <div className="container-site py-20 sm:py-24">
          <SectionHeading
            eyebrow="Picked for You"
            title="Featured This Month"
            action={
              <Link
                to="/shop"
                className="border-b border-brand/30 pb-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand transition-colors hover:border-brand"
              >
                View All
              </Link>
            }
          />
          <ProductGrid products={featured} className="mt-12" />
        </div>
      </section>

      <section className="container-site py-20 sm:py-24">
        <SectionHeading
          eyebrow="Why Boots Hyper Market"
          title="A shop built on repeat customers."
          align="center"
        />
        <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {features.map(({ Icon, title, text }) => (
            <div key={title}>
              <Icon size={22} strokeWidth={1.5} className="text-brand" />
              <h3 className="mt-5 text-sm font-semibold tracking-tight">{title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-ink/60">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-site pb-20 sm:pb-24">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
          <div className="bg-sand">
            <img
              src="/images/story.jpg"
              alt="Footwear on display in the shop"
              width={1100}
              height={1300}
              loading="lazy"
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
          <div className="lg:pr-6">
            <p className="eyebrow mb-3">Our Story</p>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
              Serving our neighbourhood since 1980.
            </h2>
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink/65">
              <p>
                Boots Hyper Market opened as a single footwear counter in 1980. Customers kept
                asking where to find a school bag or a suitcase for the season, so we made room and
                started stocking those too.
              </p>
              <p>
                Today we carry footwear for every member of the family, bags for school, work and
                weekends, and travel trolleys built to survive more than one trip.
              </p>
              <p>
                What has not changed is how we buy: we pick stock we would use ourselves, keep
                prices honest, and stand behind what leaves the shop.
              </p>
            </div>
            <Link to="/about" className="btn-secondary mt-8">
              More About Us
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-brand">
        <div className="container-site flex flex-col items-center py-20 text-center sm:py-24">
          <h2 className="text-2xl font-semibold tracking-tight text-cream sm:text-3xl">
            Find What You Need.
          </h2>
          <p className="mt-3 max-w-md text-sm text-cream/70">
            Browse the full range of footwear, bags and trolleys.
          </p>
          <Link to="/shop" className="btn-light mt-8">
            Shop All Products
          </Link>
        </div>
      </section>
    </>
  );
}
