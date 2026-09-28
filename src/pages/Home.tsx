import { Link } from 'react-router-dom';
import { Footprints, Hammer, Layers, ShieldCheck } from 'lucide-react';
import SectionHeading from '../components/SectionHeading';
import ProductGrid from '../components/ProductGrid';
import { getFeaturedProducts } from '../data/products';
import { categoryCards } from '../data/filters';

const features = [
  {
    Icon: Layers,
    title: 'Premium Materials',
    text: 'Full-grain leather and oiled nubuck sourced from tanneries we have worked with for years.',
  },
  {
    Icon: Footprints,
    title: 'Built for Comfort',
    text: 'Cushioned footbeds and a broader toe box, so a new pair feels right from the first day.',
  },
  {
    Icon: Hammer,
    title: 'Durable Construction',
    text: 'Welted soles and reinforced stitching at every stress point on the upper.',
  },
  {
    Icon: ShieldCheck,
    title: 'Designed to Last',
    text: 'Resolable, repairable and finished in colours that stay in your wardrobe for years.',
  },
];

export default function Home() {
  const featured = getFeaturedProducts();

  return (
    <>
      {/* Hero */}
      <section className="relative isolate">
        <img
          src="/images/hero.jpg"
          alt="Lacing a pair of leather boots outdoors"
          width={1800}
          height={1200}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/80 via-ink/55 to-ink/25" />

        <div className="container-site flex min-h-[520px] items-center py-20 sm:min-h-[580px] lg:min-h-[660px]">
          <div className="max-w-xl">
            <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-cream sm:text-5xl lg:text-6xl">
              BUILT FOR EVERY STEP.
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-cream/80">
              Durable boots designed for everyday comfort, confidence and style.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to="/boots" className="btn-light">
                Shop Boots
              </Link>
              <Link
                to="/boots"
                className="btn border border-cream/40 text-cream hover:bg-cream hover:text-ink"
              >
                Explore Collection
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="container-site py-20 sm:py-24">
        <SectionHeading
          eyebrow="The Collection"
          title="Featured Boots"
          action={
            <Link
              to="/boots"
              className="border-b border-ink/30 pb-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors hover:border-ink"
            >
              View All
            </Link>
          }
        />
        <ProductGrid products={featured} className="mt-12" />
      </section>

      {/* Why choose us */}
      <section className="border-y border-ink/10 bg-sand">
        <div className="container-site py-20 sm:py-24">
          <SectionHeading
            eyebrow="Why Northbound"
            title="Made properly, from the sole up."
            align="center"
          />
          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {features.map(({ Icon, title, text }) => (
              <div key={title}>
                <Icon size={22} strokeWidth={1.5} className="text-clay" />
                <h3 className="mt-5 text-sm font-semibold tracking-tight">{title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-ink/60">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand story */}
      <section className="container-site py-20 sm:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
          <div className="bg-sand">
            <img
              src="/images/story.jpg"
              alt="Walking in a pair of tan Chelsea boots"
              width={1100}
              height={1300}
              loading="lazy"
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
          <div className="lg:pr-6">
            <p className="eyebrow mb-3">Our Story</p>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
              Made for the way you move.
            </h2>
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink/65">
              <p>
                Northbound started with a simple frustration: boots that looked good rarely lasted,
                and boots that lasted rarely looked good. We set out to make one pair that did both.
              </p>
              <p>
                Every style begins with the material. We work with full-grain leathers that soften
                with wear instead of cracking, and we build them on lasts shaped around how feet
                actually sit — not around a trend.
              </p>
              <p>
                The result is a small collection of quiet, hard-wearing boots you can resole, repair
                and keep wearing long after the season has moved on.
              </p>
            </div>
            <Link to="/about" className="btn-secondary mt-8">
              Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container-site pb-20 sm:pb-24">
        <SectionHeading eyebrow="Shop by Category" title="Find your pair." />
        <div className="mt-12 grid grid-cols-2 gap-5 sm:gap-6 lg:grid-cols-4 lg:gap-8">
          {categoryCards.map((category) => (
            <Link
              key={category.filter}
              to={`/boots?filter=${category.filter}`}
              className="group block"
            >
              <div className="overflow-hidden bg-sand">
                <img
                  src={category.image}
                  alt={category.label}
                  width={800}
                  height={1000}
                  loading="lazy"
                  className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <h3 className="mt-4 text-sm font-medium">{category.label}</h3>
              <span className="mt-1 inline-block text-xs text-ink/50 transition-colors group-hover:text-ink">
                Shop now
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-ink">
        <div className="container-site flex flex-col items-center py-20 text-center sm:py-24">
          <h2 className="text-2xl font-semibold tracking-tight text-cream sm:text-3xl">
            Find Your Everyday Boot.
          </h2>
          <Link to="/boots" className="btn-light mt-8">
            Shop All Boots
          </Link>
        </div>
      </section>
    </>
  );
}
