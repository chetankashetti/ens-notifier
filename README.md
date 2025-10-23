# ENS Expiry Notifier

A lightweight web application that monitors ENS domain expiry dates and sends automated email reminders to users.

## Features

- 🔍 **Automatic Domain Discovery**: Find all ENS domains owned by your wallet
- ⏰ **Expiry Tracking**: Monitor expiry dates with color-coded status indicators
- 📧 **Email Notifications**: Receive reminders before domains expire
- 🔗 **Wallet Integration**: Connect with MetaMask, WalletConnect, and other wallets
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Wallet Integration**: Privy, Wagmi, Viem
- **Database**: Supabase (PostgreSQL)
- **Email Service**: Resend
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Privy App ID (get from [privy.io](https://privy.io))

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ens-notifier.git
cd ens-notifier
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your configuration:
```env
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here
DATABASE_URL="postgresql://username:password@localhost:5432/ens-notifier?schema=public"
```

4. Set up the database:
```bash
# Create PostgreSQL database
createdb ens-notifier

# Run database migrations
npx prisma migrate dev --name init
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   └── Header.tsx      # Main header component
├── lib/                # Utility functions and configurations
│   ├── config.ts       # Environment configuration
│   └── providers.tsx   # React providers (Privy, Wagmi, etc.)
└── types/              # TypeScript type definitions
```

## Development Status

### ✅ Milestone 1: Project Foundation & Wallet Integration
- [x] Next.js 15 project setup with TypeScript and Tailwind
- [x] shadcn/ui component library integration
- [x] Privy wallet authentication
- [x] Responsive header with wallet connection
- [x] Basic landing page with feature overview

### ✅ Milestone 2: ENS Discovery & Expiry Calculation
- [x] The Graph integration for ENS domain discovery
- [x] ENS contract instances and expiry lookup logic
- [x] ENS table component with color-coded expiry status
- [x] Real-time domain fetching and expiry calculation
- [x] API endpoint for ENS data testing
- [x] Address verifier component for testing without wallet connection

### ✅ Milestone 3: Database & Subscription System
- [x] PostgreSQL database setup with Prisma ORM
- [x] User management and ENS record storage
- [x] Subscription API endpoints (POST, GET, DELETE)
- [x] Email collection modal with validation
- [x] Subscription status tracking and management
- [x] Database schema with proper relationships and constraints

### 🚧 Upcoming Milestones
- [ ] Email notification system
- [ ] Farcaster Mini App support

## API Endpoints

### ENS Data
- `GET /api/ens?address=0x...` - Get ENS domains for an address

### Subscriptions
- `POST /api/subscribe` - Subscribe to domain notifications
- `GET /api/subscribe?walletAddress=0x...` - Get user subscriptions
- `DELETE /api/subscribe?walletAddress=0x...&ensName=domain.eth` - Unsubscribe

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you have any questions or need help, please open an issue on GitHub.
