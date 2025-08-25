# ZİRAVE - Digital Agricultural Ecosystem (Supabase Edition)

**ZİRAVE** is a comprehensive digital platform designed to revolutionize the agricultural sector by connecting farmers, suppliers, agricultural workers, and engineers in a unified ecosystem, powered by Supabase.

## 🌱 Vision
To create the most comprehensive and user-friendly agricultural platform that leverages cutting-edge technology to solve real-world farming challenges while fostering community collaboration.

## 🏗️ Architecture (Supabase-Centric)

### Core Components
- **Mobile App** (React Native + TypeScript) - Primary user interface
- **Web Dashboard** (Next.js + TypeScript) - Administrative and analytics interface  
- **Backend Core** (Supabase) - Database, Auth, Storage, Edge Functions
- **Custom Backend** (NestJS + TypeScript) - Complex business logic and AI integration
- **AI Service** (Python + FastAPI) - Agricultural diagnostics and recommendations

### Key Features
- **Identity & Authentication** - Phone-based OTP verification via Supabase Auth
- **Secure Communications** - Real-time chat using Supabase Realtime
- **Smart Marketplace** - Agricultural product and service trading
- **AI Diagnostics** - Plant disease detection and treatment recommendations
- **Logistics Management** - Supply chain and delivery coordination
- **Multi-language Support** - Turkish language support with i18n ready architecture

## 🚀 Development Status

Currently in **Phase 1: Foundation** - setting up Supabase integration and core infrastructure.

See [PROJECT_STATUS.md](./PROJECT_STATUS.md) for detailed roadmap and current progress.

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- React Native CLI
- Android Studio / Xcode (for mobile development)
- Supabase CLI

### Quick Start
```bash
# Clone and setup the project
git clone <repository-url>
cd zirave

# Install dependencies for all sub-projects
npm run install:all

# Start development environment
npm run dev:all
```

## 📁 Project Structure
```
zirave/
├── mobile/           # React Native mobile application
├── web-dashboard/    # Next.js web dashboard
├── backend-custom/   # NestJS custom backend logic
├── ai-service/       # Python FastAPI AI service
├── supabase/         # Supabase migrations and functions
├── docs/            # Documentation and specifications
└── PROJECT_STATUS.md # Live project roadmap and status
```

## 🤝 Contributing

This project follows a structured development approach. Please refer to `PROJECT_STATUS.md` for current development focus and priorities.

## 📄 License

[License details to be added]

---

**Built with 💚 for the agricultural community**