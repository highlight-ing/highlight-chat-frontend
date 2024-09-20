export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-layer-1 px-4">
      <h1 className="mb-4 text-6xl font-bold text-light-80">404</h1>
      <p className="mb-8 text-2xl text-light-60">Oops! Page not found.</p>
      <div className="max-w-md text-center">
        <p className="mb-6 text-light-60">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
      </div>
    </div>
  )
}
