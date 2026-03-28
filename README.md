# Smart Grievance Portal 🎓

The **Smart Grievance Portal** is a full-stack, role-based web application designed for educational institutions. It allows students to submit, track, and provide feedback on grievances, while ensuring transparency and automated accountability through SLA-based escalations.

## ✨ Key Features
- **Role-Based Access Control:** Dedicated, dynamic dashboards for **Students**, **Teachers**, and **Admins**.
- **Automated SLA Escalation:** Student complaints are initially assigned to Teachers. If a complaint is not resolved within 24 hours, it is **automatically escalated** to the Administration with a "High" priority flag.
- **Privacy Controls:** Students can choose between "Public" or "Protected" identity modes when filing a grievance.
- **4-Step Resolution Tracker:** Teachers can acknowledge, mark action taken, and formally resolve complaints through an intuitive UI tracker.
- **Live Analytics:** The Admin Dashboard features live-updating Recharts visualizations showing the distribution of grievance statuses.
- **File Evidence:** Supports image/document uploads (converted to base64 or stored locally) to provide context for complaints.

## 🛠️ Technology Stack
- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Database:** [SQLite](https://sqlite.org/) managed via [Prisma ORM](https://www.prisma.io/)
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/) (Persisted)
- **Data Fetching:** [React Query](https://tanstack.com/query/latest)
- **Charts:** [Recharts](https://recharts.org/)

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Generate Prisma Client and Push Schema
Initialize the SQLite database with the Prisma schema:
```bash
npx prisma generate
npx prisma db push
```

### 3. Start the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to explore the portal.

## 🧑‍💻 Default Accounts for Testing
The application uses a simulated authentication system for demonstration purposes. Use the following emails to log in as different roles:
- **Admin**: `admin@tsec.edu`
- **Teacher**: `teacher@tsec.edu`
- **Student**: Any other email address (e.g., `student@tsec.edu`)
