import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Monitor Your ENS Domains
            </h1>
            <p className="text-xl text-gray-600">
              Get notified before your ENS domains expire
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>🔍 Discover Domains</CardTitle>
                <CardDescription>
                  Automatically find all ENS domains owned by your wallet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Connect your wallet to see all your ENS domains and their expiry dates.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>⏰ Track Expiry</CardTitle>
                <CardDescription>
                  Monitor expiry dates with color-coded status indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Green: &gt;30 days, Yellow: 15-30 days, Red: &lt;15 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>📧 Get Notified</CardTitle>
                <CardDescription>
                  Receive email reminders before domains expire
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Subscribe to notifications for domains you want to monitor.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Ready to get started?</CardTitle>
                <CardDescription>
                  Connect your wallet using the button in the header to begin monitoring your ENS domains.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Your ENS domains will appear here once you connect your wallet.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
