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
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

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

### 🚧 Upcoming Milestones
- [ ] ENS domain discovery via The Graph
- [ ] Expiry date calculation and display
- [ ] Supabase database integration
- [ ] Email notification system
- [ ] Farcaster Mini App support

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
