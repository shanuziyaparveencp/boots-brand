import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div>
      <section className="container-site py-16 sm:py-24">
        <div className="max-w-2xl">
          <p className="eyebrow mb-4">About Northbound</p>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Built with purpose. Made to last.
          </h1>
          <p className="mt-6 text-base leading-relaxed text-ink/65">
            We make a small range of boots in materials we can stand behind, for people who would
            rather own one good pair than replace a cheap one every winter.
          </p>
        </div>
      </section>

      <section className="container-site">
        <div className="grid gap-5 sm:grid-cols-3 sm:gap-6">
          <div className="bg-sand sm:col-span-2">
            <img
              src="/images/about/workshop.jpg"
              alt="A pair of brown leather boots resting on a wooden floor"
              width={1200}
              height={900}
              className="aspect-[16/10] w-full object-cover sm:aspect-[16/11]"
            />
          </div>
          <div className="bg-sand">
            <img
              src="/images/about/lifestyle.jpg"
              alt="A well-worn pair of tan leather boots"
              width={1200}
              height={900}
              loading="lazy"
              className="aspect-[16/10] w-full object-cover sm:aspect-auto sm:h-full"
            />
          </div>
        </div>
      </section>

      <section className="container-site py-16 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Our Story</h2>
            <div className="mt-5 space-y-4 text-sm leading-relaxed text-ink/65">
              <p>
                Northbound began in 2019 in a small workshop, repairing boots that had been thrown
                away far too early. Seeing the same failures again and again — split seams, glued
                soles, linings that wore through in a season — told us exactly what to build
                differently.
              </p>
              <p>
                We started with one lace-up boot and sold it to people we knew. It is still in the
                collection today, largely unchanged.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Our Philosophy</h2>
            <div className="mt-5 space-y-4 text-sm leading-relaxed text-ink/65">
              <p>
                We keep the range deliberately small. Fewer styles means we can spend longer on each
                one — the shape of the last, the weight of the leather, where the stitching needs
                reinforcing.
              </p>
              <p>
                Nothing here is designed to expire. We avoid seasonal colours and hardware that
                dates, so a pair bought this year still looks right in five.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-ink/10 bg-sand">
        <div className="container-site grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:gap-20">
          <div className="order-2 lg:order-1">
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Quality &amp; Craftsmanship
            </h2>
            <div className="mt-5 space-y-4 text-sm leading-relaxed text-ink/65">
              <p>
                Every pair is built on a welted construction, which means the sole is stitched
                rather than glued — and can be replaced when it finally wears down.
              </p>
              <p>
                We use full-grain leather because it ages well: it takes on the shape of your foot
                and develops a patina instead of cracking. Hardware is solid brass or steel, chosen
                so it does not fail before the upper does.
              </p>
              <p>
                Each boot is checked by hand before it is boxed. If something is not right, it does
                not ship.
              </p>
            </div>
            <Link to="/boots" className="btn-secondary mt-8">
              Shop the Collection
            </Link>
          </div>

          <div className="order-1 bg-beige lg:order-2">
            <img
              src="/images/about/craft.jpg"
              alt="Close-up of polished leather footwear"
              width={1200}
              height={900}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
