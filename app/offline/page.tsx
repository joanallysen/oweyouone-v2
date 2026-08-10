export default function OfflinePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">
          You're offline
        </h1>

        <p className="mt-2 text-gray-600">
          Please reconnect to the internet and try again.
        </p>
      </div>
    </main>
  );
}