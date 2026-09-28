import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container-site py-28 text-center sm:py-36">
      <p className="eyebrow">Error 404</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
        This page could not be found.
      </h1>
      <p className="mt-4 text-sm text-ink/60">
        The page you are looking for may have moved or no longer exists.
      </p>
      <Link to="/" className="btn-primary mt-8">
        Back to Home
      </Link>
    </div>
  );
}
