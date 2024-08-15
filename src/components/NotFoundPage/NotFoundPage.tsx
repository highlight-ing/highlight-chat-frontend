import Button from "../Button/Button";

export default function NotFoundPage() {
  return (
    <div className="bg-bg-layer-1 min-h-screen flex flex-col justify-center items-center px-4">
      <h1 className="text-6xl font-bold text-light-80 mb-4">404</h1>
      <p className="text-2xl text-light-60 mb-8">Oops! Page not found.</p>
      <div className="max-w-md text-center">
        <p className="text-light-60 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
    </div>
  );
}
