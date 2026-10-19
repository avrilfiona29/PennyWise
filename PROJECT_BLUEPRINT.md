# PennyWise — Project Blueprint

**Version:** 1.0  
**Project Type:** Solo Full-Stack Web Application  
**Target Completion:** One day  
**Status:** Initial Development

---

## 1. Project Overview

### Project Name
PennyWise — Student Expense Tracker

### Problem Statement
Students and young adults often struggle to track their daily expenses, income, and monthly budgets. They may not know where their money goes or whether they are overspending.

### Proposed Solution
PennyWise is a full-stack personal finance application that allows users to record income and expenses, manage a monthly budget, and visualize spending through a dashboard.

### Target Users
- College students
- Young adults
- Individuals managing personal finances

### Primary Objective
Build a working, responsive, secure, and deployable full-stack application that demonstrates frontend development, backend development, database integration, authentication, REST APIs, and software testing.

---

## 2. Technology Stack

### Frontend
- React
- Vite
- JavaScript (ES modules)
- React Router DOM
- Axios
- CSS
- Recharts for data visualization
- Lucide React for icons

### Backend
- Node.js
- Express.js
- JavaScript ES modules
- REST API architecture

### Database
- MongoDB Atlas
- Mongoose

### Authentication and Security
- JSON Web Tokens (JWT)
- bcryptjs for password hashing
- Authentication middleware
- Server-side validation
- User-specific database queries

### Development Tools
- Visual Studio Code
- Kiro AI
- Git and GitHub
- Postman
- npm

### Deployment
- Frontend: Vercel or Netlify
- Backend: Render or another compatible hosting provider
- Database: MongoDB Atlas

Do not introduce another framework, database, or authentication library without approval.

---

## 3. Core Features

### 3.1 User Authentication
- Register using name, email, and password.
- Log in using email and password.
- Log out securely.
- Access protected dashboard routes.
- Retrieve the currently authenticated user's profile.
- Handle invalid credentials and expired tokens.

### 3.2 Transaction Management
- Add income transactions.
- Add expense transactions.
- View transaction history.
- Edit existing transactions.
- Delete transactions after confirmation.
- Search transactions by title or category.
- Filter transactions by type.
- Display transaction dates, categories, amounts, and notes.

### 3.3 Dashboard
Display the following:
- Total income across all recorded transactions.
- Total expenses across all recorded transactions.
- All-time balance.
- Current month's income.
- Current month's expenses.
- Monthly budget.
- Remaining monthly budget.
- Category-wise expense breakdown.
- Recent transaction history.

### 3.4 Monthly Budget
- Set or update a monthly spending limit.
- Calculate current-month expenses.
- Display the remaining budget.
- Display budget utilization as a percentage.
- Show an overspending warning when expenses exceed the budget.

The monthly budget is a spending limit, not a bank balance.

### 3.5 Responsive User Interface
- Support desktop, tablet, and mobile screens.
- Display loading indicators.
- Display useful error messages.
- Provide empty states when no transactions exist.
- Include clear form validation and confirmation before deletion.

---

## 4. Features Excluded From Version 1

To finish the MVP within one day, do not implement:
- AI or machine learning.
- Bank account integrations.
- Payment processing.
- Automatic bank transaction imports.
- Recurring transactions.
- Email notifications.
- PDF or Excel exports.
- Multiple currencies.
- Shared family accounts.
- Complex financial forecasting.

These features may be considered for future versions.

---

## 5. Project Directory Structure

PennyWise/
├── PROJECT_BLUEPRINT.md
├── README.md
├── .gitignore
├── client/
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── StatCard.jsx
│       │   ├── TransactionForm.jsx
│       │   ├── TransactionList.jsx
│       │   ├── BudgetCard.jsx
│       │   └── ExpenseChart.jsx
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   └── Dashboard.jsx
│       ├── services/
│       │   └── api.js
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
└── server/
    ├── .env.example
    ├── package.json
    ├── server.js
    ├── config/
    │   └── db.js
    ├── models/
    │   ├── User.js
    │   └── Transaction.js
    ├── middleware/
    │   └── authMiddleware.js
    ├── controllers/
    │   ├── authController.js
    │   ├── transactionController.js
    │   └── budgetController.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── transactionRoutes.js
    │   └── budgetRoutes.js
    └── utils/
        └── validators.js

Kiro may create additional files when necessary, but must not reorganize the project without approval.

---

## 6. Database Design

### 6.1 User Collection

Collection: `users`

Fields:

- `name`: String, required, trimmed.
- `email`: String, required, unique, lowercase, trimmed.
- `password`: String, required, bcrypt hash only.
- `monthlyBudget`: Number, default 5000, minimum 0.
- `createdAt`: Date.
- `updatedAt`: Date.

Requirements:
- Never store plaintext passwords.
- Never return password hashes in API responses.
- Normalize email addresses before checking uniqueness.
- Handle duplicate-email errors.

### 6.2 Transaction Collection

Collection: `transactions`

Fields:

- `user`: ObjectId referencing User, required.
- `type`: String, either `income` or `expense`.
- `title`: String, required, maximum 100 characters.
- `amount`: Number, positive, stored in INR.
- `category`: String, required.
- `date`: Date, required.
- `notes`: String, optional, maximum 500 characters.
- `createdAt`: Date.
- `updatedAt`: Date.

Requirements:
- Every transaction must belong to an authenticated user.
- Add an index on user and date for efficient transaction queries.
- Do not accept an arbitrary user ID from the client as the transaction owner.
- Validate all transaction fields on the backend.
- Use MongoDB aggregation for dashboard totals.

### 6.3 Allowed Categories

Expense categories:
- Food
- Travel
- Shopping
- Education
- Bills
- Entertainment
- Health
- Other

Income categories:
- Salary
- Allowance
- Other

Reject categories that do not match the rules for the selected transaction type.

---

## 7. Business Logic

### All-Time Balance

Balance = All-Time Income − All-Time Expenses

### Monthly Expenses

Sum the amounts of all expense transactions whose dates fall within the current calendar month.

### Monthly Income

Sum the amounts of all income transactions whose dates fall within the current calendar month.

### Remaining Budget

Remaining Budget = Monthly Budget − Current-Month Expenses

The remaining budget may be negative if the user exceeds the spending limit.

### Budget Utilization

Budget Utilization = Current-Month Expenses / Monthly Budget × 100

If the budget is zero, avoid division by zero and show a suitable message.

### Category Breakdown

Group current-month expense transactions by category and calculate the total amount spent in each category.

### Date Handling
- Use a consistent date format in API requests.
- Validate dates on the server.
- Calculate month boundaries consistently.
- Avoid off-by-one-day errors caused by mixing local dates and UTC timestamps.
- Display dates in a user-friendly format.

### Financial Precision
- Reject non-finite amounts, zero, and negative amounts.
- Do not use floating-point arithmetic carelessly for financial calculations.
- Format currency as INR using the `en-IN` locale.
- Keep the stored transaction amount positive; use the transaction type to determine its meaning.

---

## 8. API Contract

Base URL: `/api`

### Authentication Routes

#### POST /api/auth/register
Purpose: Create a user account.

Request:
- name
- email
- password

Success: HTTP 201.

#### POST /api/auth/login
Purpose: Authenticate a user.

Request:
- email
- password

Success: HTTP 200 with a JWT and public user details.

#### GET /api/auth/me
Authentication: Required.

Purpose: Retrieve the authenticated user's profile.

Success: HTTP 200.

### Transaction Routes

All transaction routes require authentication.

#### GET /api/transactions
Purpose: Retrieve the authenticated user's transactions.

Optional query parameters:
- type
- category

#### POST /api/transactions
Purpose: Create a transaction.

Request:
- type
- title
- amount
- category
- date
- notes

Success: HTTP 201.

#### PUT /api/transactions/:id
Purpose: Update a transaction belonging to the authenticated user.

Success: HTTP 200.

#### DELETE /api/transactions/:id
Purpose: Delete a transaction belonging to the authenticated user.

Success: HTTP 200.

### Dashboard Summary

#### GET /api/transactions/summary

Purpose: Retrieve calculated financial summaries.

Response structure:

{
  "allTime": {
    "income": 0,
    "expenses": 0,
    "balance": 0
  },
  "monthly": {
    "income": 0,
    "expenses": 0,
    "budget": 5000,
    "remaining": 5000,
    "categoryBreakdown": []
  }
}

The values above illustrate the response structure, not hardcoded dashboard data.

### Budget Route

#### PUT /api/transactions/budget

Authentication: Required.

Request:
- monthlyBudget

Purpose: Update the authenticated user's monthly spending limit.

Success: HTTP 200.

### API Error Handling

Use appropriate status codes:
- 400: Invalid request data.
- 401: Missing, invalid, or expired authentication.
- 404: Requested resource not found or not owned by the authenticated user.
- 409: Duplicate email.
- 500: Unexpected server error.

Return consistent JSON error messages.

---

## 9. Security Requirements

1. Hash passwords with bcryptjs.
2. Never expose JWT secrets or MongoDB credentials.
3. Keep environment variables out of Git.
4. Verify JWT signatures and expiration on protected endpoints.
5. Obtain the owner ID from the verified token.
6. Filter all transaction reads, updates, and deletions by the authenticated user.
7. Validate request data on the server.
8. Never trust client-side validation alone.
9. Configure CORS for the intended frontend origin.
10. Avoid returning stack traces or sensitive internal information to clients.
11. Never claim that authentication is secure merely because a frontend route is protected.
12. Do not log passwords, JWTs, or connection strings.

For a public production deployment, review rate limiting, cookie security, CSRF protection where applicable, secure transport, and additional request validation.

---

## 10. Frontend Requirements

### Login Page
- Email and password fields.
- Form validation.
- Loading state.
- Error feedback.
- Link to registration.

### Registration Page
- Name, email, and password fields.
- Validation and duplicate-account feedback.
- Loading state.
- Link to login.

### Dashboard Page
- Welcome message.
- Total balance card.
- Monthly income card.
- Monthly expense card.
- Budget progress card.
- Category breakdown chart.
- Transaction form.
- Transaction history.
- Search and type filters.
- Edit and delete actions.
- Logout button.

### Component Responsibilities

`Navbar.jsx`
- Brand and navigation.
- User greeting.
- Logout action.

`StatCard.jsx`
- Reusable financial summary card.

`TransactionForm.jsx`
- Create and edit transactions.
- Client-side input validation.

`TransactionList.jsx`
- Display, search, filter, edit, and delete transactions.

`BudgetCard.jsx`
- Display and update the monthly budget.

`ExpenseChart.jsx`
- Display current-month expense totals by category.

`services/api.js`
- Configure Axios.
- Attach authentication credentials.
- Centralize the API base URL.

Keep business logic separate from presentation wherever practical.

---

## 11. Authentication Flow

1. The user submits registration or login credentials.
2. The backend validates the request.
3. The backend hashes a new password or compares an existing password hash.
4. The backend issues a signed JWT.
5. The frontend uses the token for protected API requests.
6. Express middleware verifies the token and sets the authenticated user ID.
7. Controllers use the authenticated user ID to access only that user's records.
8. Logout clears the local authentication state.

For the MVP, sessionStorage may be used for the JWT. This is a prototype trade-off, not a claim that browser storage is fully secure. A production deployment should use a carefully designed authentication mechanism.

---

## 12. UI/UX Design Direction

### Visual Identity
- Style: Minimal, polished, modern personal finance dashboard.
- Primary color: Forest green.
- Background: Warm ivory or light neutral.
- Accent: Muted sage and mint.
- Text: Dark charcoal.
- Cards: White, rounded corners, subtle borders.
- Typography: Clean, readable sans-serif.

### Design Principles
- Clear visual hierarchy.
- Consistent spacing.
- Responsive layout.
- Accessible form labels.
- Visible focus states.
- Readable financial numbers.
- Meaningful empty states.
- Clear success and error feedback.
- Avoid unnecessary animations and decorative clutter.

The design should look portfolio-ready without sacrificing functionality.

---

## 13. Development Milestones

### M0 — Foundation
- Create the directory structure.
- Initialize React + Vite.
- Initialize Express.
- Configure scripts and environment templates.
- Add the health endpoint.

Completion criteria:
Both applications start successfully.

### M1 — Database and Authentication
- Connect MongoDB.
- Create the User model.
- Implement registration and login.
- Implement JWT middleware.
- Implement the current-user endpoint.

Completion criteria:
Registration and login work, and protected routes reject missing or invalid tokens.

### M2 — Backend Features
- Create the Transaction model.
- Implement transaction CRUD.
- Implement budget updates.
- Implement dashboard aggregation.
- Validate requests and enforce record ownership.

Completion criteria:
API requests pass basic functional and authorization tests.

### M3 — Authentication Frontend
- Create login and registration pages.
- Connect forms to the API.
- Implement protected navigation.
- Implement logout and expired-token handling.

Completion criteria:
A user can register and reach the dashboard.

### M4 — Dashboard
- Create summary cards.
- Implement transaction creation and editing.
- Implement transaction history.
- Add search and filters.
- Add budget management.
- Add expense visualization.

Completion criteria:
The frontend displays real backend data and refreshes after successful changes.

### M5 — Integration and Testing
- Test all user flows.
- Test validation.
- Test cross-user access.
- Test persistence.
- Check responsive layouts.
- Fix critical bugs.

Completion criteria:
The main application workflow operates correctly.

### M6 — Portfolio Delivery
- Write README.md.
- Add screenshots.
- Document environment setup.
- Document API routes.
- Push code to GitHub.
- Deploy if time permits.

Completion criteria:
The repository is understandable, reproducible, and suitable for a portfolio demonstration.

---

## 14. Collaboration Protocol

### Product Owner
The user is responsible for:
- Approving product and design decisions.
- Providing environment configuration locally.
- Running and testing the application.
- Reviewing generated code.
- Maintaining the GitHub repository.
- Understanding the final implementation.

### Architect and Reviewer
ChatGPT is responsible for:
- Maintaining this blueprint.
- Breaking work into milestones.
- Reviewing Kiro's summaries and code when shared.
- Diagnosing integration issues.
- Explaining technical decisions.
- Helping prepare the project for placements.

### Implementation Partner
Kiro AI is responsible for:
- Inspecting the existing workspace.
- Implementing the assigned milestone.
- Preserving agreed APIs, schemas, and directory structure.
- Running available checks.
- Reporting modified files, test results, errors, and blockers.

### Rules
1. Complete one milestone at a time.
2. Read this blueprint before implementing a milestone.
3. Inspect existing code before editing.
4. Do not regenerate working files unnecessarily.
5. Do not change API contracts or schemas without approval.
6. Do not add unapproved features.
7. Do not expose secrets.
8. Report tests honestly as PASS, FAIL, or NOT RUN.
9. Create Git checkpoints after working milestones.
10. Explain important implementation decisions in beginner-friendly language.

---

## 15. Testing Checklist

### Authentication
- Registration succeeds with valid data.
- Duplicate email is rejected.
- Invalid credentials are rejected.
- Passwords are stored as hashes.
- Protected routes reject missing tokens.
- Expired tokens are rejected.

### Transactions
- Valid transactions can be created.
- Invalid amounts are rejected.
- Invalid categories are rejected.
- Transactions can be updated and deleted.
- A user cannot access another user's transaction.
- Records persist after restarting the application.

### Dashboard
- All-time balance is correct.
- Monthly income and expenses are correct.
- Category breakdown includes only current-month expenses.
- Budget updates persist.
- Remaining budget updates after transaction changes.
- Zero-budget and over-budget states work.
- Empty states display correctly.

### Frontend
- Forms validate required fields.
- Loading and error states are visible.
- Search and filters work.
- Logout clears authentication.
- Refreshing the dashboard preserves database records.
- The layout works on desktop and mobile.

### Delivery
- Frontend production build succeeds.
- Backend starts successfully.
- README instructions are accurate.
- Environment secrets are not committed.
- The GitHub repository contains the expected files.

---

## 16. Definition of Done

PennyWise is complete when:

- Users can register, log in, and log out.
- Users can create, view, edit, and delete their own transactions.
- All records persist in MongoDB.
- Dashboard summaries are calculated correctly.
- Monthly budgets work.
- Category visualization uses real data.
- Cross-user access is prevented.
- The frontend is responsive.
- Core tests pass.
- The README contains setup instructions and screenshots.
- The project is pushed to GitHub without secrets.

Deployment is desirable but secondary to a working, tested MVP.

---

## 17. Future Improvements

Possible version 2 features:
- Recurring transactions.
- CSV export.
- Date-range filters.
- Advanced spending reports.
- Savings goals.
- Email reminders.
- Improved authentication and session management.

Do not implement these features during the initial one-day MVP unless the core requirements are already complete.

---

## 18. Instructions to Kiro AI

You are the implementation partner for PennyWise.

Before every task:
1. Read this file.
2. Inspect the existing project.
3. Identify which milestone is currently active.
4. Implement only the requested milestone.
5. Preserve existing working functionality.
6. Run relevant tests and checks.
7. Report changed files, commands executed, test results, blockers, and next steps.

Do not claim tests passed unless they were executed successfully.

Do not change the technology stack, API contracts, database schema, or feature scope without approval.

If a requirement is ambiguous or conflicts with the existing code, stop and explain the conflict before making a major architectural change.

The priority is a working, secure, understandable MVP that the project owner can demonstrate and explain during placement interviews.

**End of Project Blueprint**
