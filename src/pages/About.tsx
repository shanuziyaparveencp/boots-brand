import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div>
      <section className="container-site py-16 sm:py-24">
        <div className="max-w-2xl">
          <p className="eyebrow mb-4">About Boots Hyper Market</p>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Built with purpose. Made to last.
          </h1>
          <p className="mt-6 text-base leading-relaxed text-ink/65">
            A family-run shop stocking footwear, bags and travel trolleys for every member of the
            household - in the same neighbourhood since 1980.
          </p>
        </div>
      </section>

      <section className="container-site">
        <div className="grid gap-5 sm:grid-cols-3 sm:gap-6">
          <div className="bg-sand sm:col-span-2">
            <img
              src="/images/about/heritage.jpg"
              alt="A stack of travel cases"
              width={1200}
              height={900}
              className="aspect-[16/10] w-full object-cover sm:aspect-[16/11]"
            />
          </div>
          <div className="bg-sand">
            <img
              src="/images/about/range.jpg"
              alt="An open suitcase packed for a trip"
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
                We opened in 1980 as a single footwear counter. The range grew the way most family
                shops grow - customers asked for something we did not stock, and if enough people
                asked, we found a supplier and made space on the shelf.
              </p>
              <p>
                Bags came first, then school trolleys, then a full travel range. Three departments
                later, we are still on the same street, often serving the children of our first
                customers.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Our Philosophy</h2>
            <div className="mt-5 space-y-4 text-sm leading-relaxed text-ink/65">
              <p>
                We would rather stock fewer things well than fill the shop with everything. Each
                line is chosen by someone who has handled it, checked the stitching and asked what
                happens when it wears out.
              </p>
              <p>
                Prices stay honest because we expect you back next season. That has been the whole
                business plan since 1980.
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
                In footwear we look for welted or properly cemented soles, full-grain leather where
                it matters, and linings that survive a full season of daily wear.
              </p>
              <p>
                In bags and trolleys we check the parts that fail first: zips, wheels, handles and
                seams. A trolley is only as good as its wheels, so those are the first thing we
                test.
              </p>
              <p>
                If something does go wrong, bring it in. We would rather repair or exchange it than
                lose a customer over it.
              </p>
            </div>
            <Link to="/shop" className="btn-secondary mt-8">
              Shop the Range
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
