import FeedingTracker from './components/FeedingTracker';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Baby Feeding Tracker
        </h1>
        <FeedingTracker />
      </main>
    </div>
  );
}

export const metadata = {
  title: 'Baby Feeding Tracker',
  description: 'Track your baby\'s feeding schedule and patterns',
}
