# Efficient Task Planner for Departmental Staff Management

A production-ready task management web application built with Next.js, TypeScript, and Firebase. Designed for efficient departmental staff coordination with role-based access control and real-time updates.

## 🚀 Features

- **Role-Based Authentication**: Separate dashboards for Admins and Faculty.
- **Admin Dashboard**: Create, assign, update, and delete tasks.
- **Faculty Dashboard**: View assigned tasks, update status, and add progress comments.
- **Real-Time Updates**: Firestore listeners ensure data sync across all clients instantly.
- **Audit Logs**: Comprehensive history of all task operations with timestamps.
- **Security**: Granular Firestore security rules enforcing role-based access.
- **Premium UI**: Modern, responsive design with Tailwind CSS and smooth animations.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend/Database**: Firebase Firestore
- **Authentication**: Firebase Authentication (Email/Password + Google Sign-In)
- **State Management**: React Context API
- **Utilities**: Firebase Admin SDK, Lucide Icons (Emoji equivalents used), Tailwind Merge

## 📋 Prerequisites

- Node.js 18.x or later
- npm or yarn
- A Firebase project

## ⚙️ Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Task-manager
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory (refer to `.env.local.example`):
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

   # For Server Actions (Admin SDK)
   FIREBASE_ADMIN_PROJECT_ID=your_project_id
   FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account_email
   FIREBASE_ADMIN_PRIVATE_KEY="your_private_key"
   ```

4. **Firebase Setup**:
   - Enable **Email/Password** and **Google** providers in Firebase Auth.
   - Create a **Firestore Database** in production mode.
   - Deploy security rules from `firestore.rules`.

5. **Run locally**:
   ```bash
   npm run dev
   ```

6. **Build for production**:
   ```bash
   npm run build
   ```

## 🔒 Security Rules

The application uses robust security rules located in `firestore.rules`:
- Admins have full CRUD access to all collections.
- Faculty can only see tasks assigned to them.
- Faculty can only update `status` and `comments` of their assigned tasks.
- Audit logs are read-only for Admins and immutable once created.

## 👥 Demo Credentials

- **Admin**: `admin@example.com` / `admin123` (Note: User must have `role: 'admin'` in Firestore `users` collection)
- **Faculty**: Use Google Sign-in to automatically register as faculty.

## 📄 License

This project is licensed under the MIT License.
