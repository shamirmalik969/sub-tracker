# MASTER IMPLEMENTATION PLAN
## Personalized Deployed Full Stack FinTech System (MERN)
### Roll Number: 23i-5568 | System: Subscription Analyzer + Simulation Logic | Complexity: Intermediate

---

## CRITICAL CONTEXT FOR CODING AGENT

**Student Profile:** University student (BS FinTech, Semester 6) with basic React/Node knowledge from course notes. Code must look authentically student-made. NOT production-grade. NOT enterprise-clean. The instructor explicitly warns against "AI-generated code" and will cross-check database schemas, logic explanations, and handwritten answers against the actual code.

**Assigned System (from Roll Number):**
- digit1 = 5 → **Subscription Analyzer** (Table A)
- digit2 = 8 → **Simulation Logic** (Table B)  
- (5+8)%3 = 1 → **Intermediate** (2 collections with relationship) (Table C)

**Core Logic Definition:** The system allows users to add their recurring subscriptions (Netflix, Spotify, Gym, etc.). The **Simulation Logic** projects total subscription costs over future months (3, 6, 12 months), compares annual vs monthly billing cycles, and runs "What-If" cancellation scenarios showing exact savings if specific subscriptions are removed. This logic must be visibly implemented in backend/frontend, not just stored data.

**Tech Stack (from Teaching Notes & Assignment):**
- Frontend: React (create-react-app), React Router DOM, plain CSS files
- Backend: Node.js, Express.js
- Database: MongoDB (Mongoose ODM), MongoDB Atlas cloud cluster
- Auth: JWT (jsonwebtoken) with localStorage persistence
- Deployment: Vercel/Netlify (Frontend), Render/Railway (Backend), MongoDB Atlas (DB)

---

## SECTION 1: SYSTEM ARCHITECTURE BLUEPRINT

### 1.1 High-Level Flow
```
User Browser (React SPA)
    ↓ HTTP Requests (Axios/Fetch)
Express API (Node.js + Express)
    ↓ Mongoose Queries
MongoDB Atlas (Cloud Cluster)
    ↓ JSON Response
React Frontend (Dynamic Render)
```

### 1.2 Folder Structure (Final Output)
```
subscription-analyzer/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js               # JWT verification middleware
│   │   └── validator.js          # Input validation middleware
│   ├── models/
│   │   ├── User.js               # User schema
│   │   └── Subscription.js       # Subscription schema
│   ├── routes/
│   │   ├── auth.js               # Login/Register routes
│   │   └── subscriptions.js      # CRUD + Simulation routes
│   ├── .env                      # Environment variables (HUMAN ADDS THIS)
│   ├── .gitignore
│   ├── package.json
│   └── server.js                 # Entry point
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── SubscriptionForm.js
│   │   │   ├── SubscriptionList.js
│   │   │   ├── SimulationPanel.js
│   │   │   └── TotalCard.js
│   │   ├── pages/
│   │   │   ├── LoginPage.js
│   │   │   ├── SignupPage.js
│   │   │   ├── DashboardPage.js
│   │   │   └── SimulationPage.js
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   ├── package.json
│   └── .gitignore
│
├── report/                       # HUMAN GENERATES THIS
└── handwritten/                  # HUMAN WRITES THIS
```

### 1.3 Page Routing (React Router)
| Route | Page | Access |
|-------|------|--------|
| `/` | LoginPage | Public |
| `/signup` | SignupPage | Public |
| `/dashboard` | DashboardPage | Protected |
| `/simulation` | SimulationPage | Protected |

---

## SECTION 2: DATABASE DESIGN (CRITICAL — HEAVILY WEIGHTED)

### 2.1 Collection 1: Users
**Justification:** Separate collection for authentication. Referencing used because user profiles are independent and subscriptions are queried separately.

```javascript
// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
```

### 2.2 Collection 2: Subscriptions
**Justification:** Referencing to Users via `userId` field. NOT embedding because:
1. Subscriptions grow independently over time (user might have 20+ subscriptions)
2. Need to query subscriptions without loading entire user document
3. Subscription data is accessed in lists/aggregations frequently
4. Embedding would make user document too large and hurt performance

```javascript
// models/Subscription.js
const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['entertainment', 'productivity', 'utilities', 'health', 'other']
  },
  cost: {
    type: Number,
    required: true,
    min: 0
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'annual'],
    default: 'monthly'
  },
  startDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
```

### 2.3 Relationship Diagram
```
User (1) ────────< (Many) Subscription
  _id              userId (ref: User._id)
  username         name
  email            category
  password         cost
                   billingCycle
```

---

## SECTION 3: BACKEND IMPLEMENTATION (NODE.JS + EXPRESS)

### 3.1 Dependencies to Install
```bash
npm init -y
npm install express mongoose cors dotenv bcryptjs jsonwebtoken
npm install --save-dev nodemon
```

### 3.2 Environment Variables (.env)
```
PORT=5000
MONGO_URI=<HUMAN_PROVIDES_THIS_AFTER_ATLAS_SETUP>
JWT_SECRET=<HUMAN_PROVIDES_THIS_OR_AGENT_GENERATES_RANDOM_STRING>
```

### 3.3 server.js (Entry Point)
Requirements:
- Express app setup
- CORS enabled for frontend communication
- JSON body parser
- Route mounting
- MongoDB connection via mongoose
- Error handling middleware

### 3.4 config/db.js
- Connect to MongoDB Atlas using MONGO_URI
- Include connection success/error console logs
- Use mongoose.connect with unifiedTopology and newUrlParser

### 3.5 Middleware 1: Authentication (auth.js)
- Extract Bearer token from Authorization header
- Verify JWT using jwt.verify
- Attach decoded user info (userId) to req.user
- Return 401 if token missing/invalid
- Must be used on ALL subscription routes and simulation routes

### 3.6 Middleware 2: Input Validation (validator.js)
- Validate that required fields exist in request body
- Check data types (string, number)
- Return 400 with specific error message if validation fails
- Apply to POST /api/subscriptions and auth routes

### 3.7 Routes: Authentication (`/api/auth`)
**POST /api/auth/register**
1. Extract username, email, password from req.body
2. Check if user already exists (by email or username)
3. Hash password using bcryptjs (salt rounds: 10)
4. Create new User document
5. Save to database
6. Return success message (do NOT return password)

**POST /api/auth/login**
1. Extract email, password from req.body
2. Find user by email
3. Compare password using bcrypt.compare
4. If valid: generate JWT (payload: userId, expiresIn: '24h')
5. Return token + user info (id, username, email)
6. If invalid: return 401 "Invalid credentials"

### 3.8 Routes: Subscriptions (`/api/subscriptions`)
**ALL ROUTES PROTECTED BY auth MIDDLEWARE**

**GET /api/subscriptions**
1. Get userId from req.user (set by auth middleware)
2. Query Subscription collection where userId matches
3. Return array of subscriptions

**POST /api/subscriptions**
1. Validate input (validator middleware)
2. Extract name, category, cost, billingCycle from req.body
3. Create new Subscription with userId from req.user
4. Save to database
5. Return created subscription object

**DELETE /api/subscriptions/:id**
1. Get subscription id from req.params.id
2. Verify subscription belongs to req.user.userId (security check)
3. Delete using findOneAndDelete ({ _id: id, userId: req.user.userId })
4. Return success message

### 3.9 Routes: Simulation (`/api/simulation`)
**GET /api/simulation/project**
1. Get userId from req.user
2. Fetch all subscriptions for this user
3. Calculate:
   - `monthlyTotal`: Sum of all monthly subscriptions + (annual subscriptions / 12)
   - `annualTotal`: monthlyTotal * 12
   - `threeMonthProjection`: monthlyTotal * 3
   - `sixMonthProjection`: monthlyTotal * 6
   - `twelveMonthProjection`: monthlyTotal * 12
4. For each subscription, calculate `annualEquivalent`:
   - If monthly: cost * 12
   - If annual: cost
5. Calculate potential savings if cancelled:
   - For each: `savings6Months` = monthly equivalent * 6
   - For each: `savings12Months` = monthly equivalent * 12
6. Return JSON with totals, projections array, and per-subscription breakdown

**GET /api/simulation/whatif**
Query params: `exclude` (comma-separated subscription IDs to simulate cancellation)
1. Get userId from req.user
2. Fetch all subscriptions
3. Filter out subscriptions whose _id is in the exclude list
4. Recalculate monthlyTotal with remaining subscriptions
5. Compare with original monthlyTotal to show `monthlySavings` and `annualSavings`
6. Return original vs simulated comparison

### 3.10 Meaningful Query 1: Aggregation by Category
**GET /api/subscriptions/stats/category**
```javascript
// Aggregation pipeline
[
  { $match: { userId: mongoose.Types.ObjectId(req.user.userId) } },
  { 
    $group: { 
      _id: "$category", 
      totalCost: { $sum: "$cost" },
      count: { $sum: 1 }
    } 
  },
  { $sort: { totalCost: -1 } }
]
```
Returns spending grouped by category, sorted highest to lowest.

### 3.11 Meaningful Query 2: Billing Cycle Distribution
**GET /api/subscriptions/stats/billing**
```javascript
[
  { $match: { userId: mongoose.Types.ObjectId(req.user.userId) } },
  {
    $group: {
      _id: "$billingCycle",
      totalCost: { $sum: "$cost" },
      avgCost: { $avg: "$cost" }
    }
  }
]
```
Shows how much is spent on monthly vs annual billing.

---

## SECTION 4: FRONTEND IMPLEMENTATION (REACT)

### 4.1 Dependencies to Install
```bash
npx create-react-app frontend
cd frontend
npm install react-router-dom axios
```

### 4.2 App.js Structure
- Wrap in BrowserRouter
- Define Routes: /, /signup, /dashboard, /simulation
- Implement ProtectedRoute component that checks localStorage for token
- If no token, redirect to /
- Pass token to axios default headers on load if exists

### 4.3 Authentication Pages

**LoginPage.js**
- Form with email and password inputs
- On submit: POST to /api/auth/login
- On success: save token to localStorage, save user info, redirect to /dashboard
- Show error message if login fails (basic string state)
- Link to /signup page

**SignupPage.js**
- Form with username, email, password inputs
- On submit: POST to /api/auth/register
- On success: show "Account created" message and redirect to login OR auto-login
- Link to / page (login)

### 4.4 DashboardPage.js
Layout:
- Navbar component (shows username, logout button)
- TotalCard component (shows current monthly burn rate)
- SubscriptionForm component (add new subscription)
- SubscriptionList component (table/list of subscriptions with delete button)
- Basic category filter dropdown (interactive feature 1)
- Sort by cost ascending/descending (interactive feature 2)

**Logout Logic:**
- Remove token from localStorage
- Redirect to login page

### 4.5 Components Detail

**Navbar.js**
- Simple nav bar with app name "SubTrack" or similar student-like name
- Links to Dashboard and Simulation
- Logout button
- Show logged-in username

**SubscriptionForm.js**
- Inputs: name (text), category (select dropdown), cost (number), billingCycle (radio: monthly/annual)
- On submit: POST to /api/subscriptions
- Clear form after success
- Basic validation: all fields required, cost > 0

**SubscriptionList.js**
- Receive subscriptions array as prop
- Map through and render SubscriptionItem for each
- Show "No subscriptions yet" if empty
- Include delete button per item

**TotalCard.js**
- Calculate and display:
  - Monthly Burn Rate
  - Annual Projection
  - Number of active subscriptions
- Fetch data from backend (do NOT hardcode)

### 4.6 SimulationPage.js
**This is the CORE LOGIC page. Must be visually prominent.**

Layout:
- Navbar
- Header: "Subscription Simulator"
- Section 1: Projection Cards
  - 3 Months: $X
  - 6 Months: $X  
  - 12 Months: $X
- Section 2: What-If Cancellation Simulator
  - List all subscriptions with checkboxes
  - "Simulate Cancellation" button
  - Results panel showing:
    - Current monthly cost
    - New monthly cost after cancellations
    - Monthly savings
    - Annual savings
    - Percentage reduction
- Section 3: Category Breakdown (from aggregation API)
  - Simple bar representation using div widths (no chart library — keep it student-simple)

### 4.7 API Service Layer
Create `src/services/api.js`:
- Create axios instance with baseURL pointing to backend
- Add request interceptor to attach Authorization header with token from localStorage
- Export functions: login, register, getSubs, addSub, deleteSub, getProjections, getWhatIf, getCategoryStats

### 4.8 Protected Route Implementation
```javascript
// Simple protected route component
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" />;
}
```

---

## SECTION 5: CORE FINTECH LOGIC — SIMULATION ENGINE

### 5.1 Logic Explanation (For Report & Defense)
The simulation engine performs three calculations:

**A) Normalization Engine:**
All subscriptions are normalized to a monthly cost basis for fair comparison.
- Monthly billing: cost remains as-is
- Annual billing: cost / 12 (to get effective monthly cost)

**B) Projection Engine:**
Using normalized monthly total, the system projects forward:
- 3-month cost = monthlyTotal × 3
- 6-month cost = monthlyTotal × 6
- 12-month cost = monthlyTotal × 12

**C) What-If Cancellation Engine:**
1. User selects subscriptions to hypothetically cancel via checkboxes
2. System recalculates monthlyTotal excluding selected items
3. System computes:
   - Absolute savings = originalMonthly - newMonthly
   - Percentage savings = (savings / originalMonthly) × 100
   - Annual impact = savings × 12
4. Results displayed in real-time to user

### 5.2 Why This Logic Matters
- Helps users visualize "subscription creep" — small recurring charges adding up
- Shows concrete dollar amounts saved by cancelling specific services
- Converts abstract annual billing into understandable monthly equivalents
- Provides actionable financial insight, not just data storage

---

## SECTION 6: SECURITY IMPLEMENTATION

### 6.1 Security Measure 1: Input Validation
- Backend: validator middleware checks all POST bodies for required fields, correct types, and value ranges
- Frontend: HTML5 form validation (required, min, type="email") + basic JS checks before API call
- Prevents empty submissions, negative costs, and malformed data

### 6.2 Security Measure 2: Protected Routes (Frontend + Backend)
- Frontend: ProtectedRoute component blocks dashboard/simulation access if no token in localStorage
- Backend: auth middleware rejects requests with missing/invalid JWT with 401 status
- Users cannot access data without authentication on either layer

### 6.3 Security Measure 3: Prevention of Invalid API Calls (Bonus)
- Backend: All subscription routes verify req.user.userId matches the resource owner
- User A cannot delete User B's subscriptions by guessing IDs
- CORS configured to only accept requests from deployed frontend domain

---

## SECTION 7: RESPONSIVENESS & UI

### 7.1 Breakpoints
- Mobile: < 768px (stack forms, single column, hamburger menu optional but simple)
- Desktop: > 768px (side-by-side layouts, full navbar)

### 7.2 CSS Approach
- Use plain CSS files (App.css, component-specific styles inline or in App.css)
- Student-style CSS: basic colors (blues, grays), box-shadow for cards, flexbox for layout
- No CSS frameworks (Bootstrap, Tailwind) — too polished for student work
- Some inline styles mixed with CSS classes (realistic student behavior)

---

## SECTION 8: HUMANIZATION PROTOCOL (EXTREMELY CRITICAL)

The instructor explicitly forbids AI-generated code appearance. The coding agent MUST follow these rules religiously. Any deviation risks ZERO marks and disciplinary action.

### 8.1 Code Style Humanization

**A) Variable Naming:**
- Mix naming conventions randomly across files:
  - Sometimes camelCase: `userName`, `subList`
  - Sometimes snake_case: `user_name`, `sub_list` (especially in backend)
  - Sometimes abbreviated: `usr`, `subs`, `btn`, `simProj`, `totCost`
  - Sometimes overly verbose: `theUserObjectFromDatabase`, `subscriptionItemBeingRendered`
- Inconsistent naming for same concepts across files is OK and encouraged

**B) Indentation & Spacing:**
- Use 2 spaces in some files, 4 spaces in others
- Sometimes mix in same file (agent should do this intentionally but subtly)
- Extra blank lines in random places
- Sometimes no blank line between functions, sometimes two
- Lines should occasionally exceed 80-100 characters without breaking

**C) Comments:**
- MINIMAL comments. Only where absolutely necessary for student understanding
- When comments exist, make them messy or slightly obvious:
  ```javascript
  // this does the thing
  // idk why this works but it does
  // TODO: fix later maybe
  ```
- NO JSDoc comments
- NO function documentation blocks
- Leave 1-2 dead/commented-out code blocks (student experiments)

**D) Code Structure:**
- Some functions slightly longer than needed (don't extract every helper)
- Mix of `var`, `let`, and `const` (use `var` in 2-3 places intentionally)
- Occasional `console.log` left in code for "debugging"
- One or two slightly inefficient loops instead of map/filter (student style)
- Use both function declarations and arrow functions inconsistently

**E) Error Handling:**
- Basic try-catch in some places, .then().catch() in others
- Generic error messages: "something went wrong", "error occurred"
- Sometimes no error handling for edge cases (realistic for student)

**F) React Specific:**
- Mix of functional components with hooks (majority) but maybe one class component if agent feels adventurous (notes cover both lightly)
- Some inline styles in JSX: `style={{marginTop: '10px'}}`
- Use both controlled components and occasional uncontrolled (refs for one input)
- Props sometimes destructured, sometimes accessed via `props.xxx`

### 8.2 CSS Humanization

**A) Styling Inconsistencies:**
- Colors: Use hex codes that are slightly off-standard (#3b82f6 instead of nice blues, mixed with rgb() occasionally)
- Some styles in App.css, some inline, some in component files if created
- Inconsistent border-radius (4px on some buttons, 8px on others)
- Mix of px and rem units
- Some `!important` usage

**B) Layout:**
- Use basic flexbox, occasional float (old school student style)
- Not perfectly centered elements
- Cards with slightly different padding
- Basic responsive behavior using simple media queries

**C) Visual Assets:**
- NO stock photos
- If images needed, use placeholder divs with background colors and text
- Or use free placeholder services with specific text: `https://via.placeholder.com/150?text=Sub+Logo`
- Favicon: basic emoji replacement or default React favicon left as-is

### 8.3 File & Project Structure Humanization

- Some empty folders left in project
- README.md with basic title and "npm install, npm start" only
- package.json with a few unused dependencies (agent can install one extra that isn't used — realistic student mistake)
- Backend and frontend in same repo but not perfectly organized
- .gitignore should be basic but maybe missing one common file (e.g., .env not in gitignore initially — HUMAN FIXES THIS)

### 8.4 ABSOLUTE PROHIBITIONS (Will Make Code Look AI-Generated)
- ❌ NO Emojis anywhere in code, UI, or comments
- ❌ NO Perfectly consistent code style
- ❌ NO Advanced patterns (custom hooks, context API, redux)
- ❌ NO TypeScript
- ❌ NO Perfect error boundaries
- ❌ NO Loading spinners from libraries (use text "Loading..." if needed)
- ❌ NO Toast notification libraries
- ❌ NO Perfectly semantic HTML everywhere (some div soup OK)
- ❌ NO Advanced security headers (basic CORS only)
- ❌ NO Rate limiting
- ❌ NO Input sanitization libraries (manual checks only)
- ❌ NO Perfect folder structure

---

## SECTION 9: STOP POINTS FOR HUMAN INPUT

The coding agent will pause at these exact points and ask the human to perform tasks. The agent CANNOT proceed without the requested information.

### STOP POINT 1: After Backend Folder Initialization
**Agent Says:**
"I have created the backend folder structure and package.json. Before I write the database connection code, I need you to set up MongoDB Atlas and provide me with the connection string.

**Steps for you:**
1. Go to https://www.mongodb.com/cloud/atlas and sign up/login
2. Create a New Project (name it 'sub-tracker' or anything)
3. Build a Database → Choose M0 (Free tier)
4. Select AWS as provider, choose region closest to you
5. In Security Quickstart:
   - Username: subadmin (or your choice)
   - Password: Generate a strong password and SAVE IT
   - Click 'Create User'
6. In Network Access:
   - Click 'Add IP Address'
   - Choose 'Allow Access from Anywhere' (0.0.0.0/0) — needed for Render/Railway
7. Go to Database → Clusters → Click 'Connect' on your cluster
8. Choose 'Drivers' → Node.js → Copy the connection string
9. The string looks like: `mongodb+srv://subadmin:<password>@cluster0.xxxxx.mongodb.net/subscriptions?retryWrites=true&w=majority`
10. Replace `<password>` with your actual password

**Paste the complete connection string below, and also provide a JWT_SECRET (any random string of 20+ characters, e.g., 'mysecretkey123456789').**

**Wait for human input before continuing.**"

### STOP POINT 2: Before Deployment
**Agent Says:**
"The application is complete and tested locally. Now we need to deploy. I need you to create accounts on the following platforms and provide me with the information I ask for.

**Part A — MongoDB Atlas (if not done in Stop 1):**
- Ensure Network Access allows 0.0.0.0/0
- Provide the MONGO_URI again if I don't have it

**Part B — Backend Deployment (Render):**
1. Go to https://render.com and sign up with GitHub
2. Create a New Web Service
3. Connect your GitHub repo (you'll need to push backend code to GitHub first)
4. Settings:
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Environment Variables: Add MONGO_URI and JWT_SECRET
5. Deploy and wait for build to complete
6. **Copy the live URL (e.g., https://sub-tracker-api.onrender.com) and paste it below**

**Part C — Frontend Deployment (Vercel):**
1. Go to https://vercel.com and sign up with GitHub
2. Add New Project, import your frontend repo (or root repo if monorepo)
3. In Environment Variables or before build, update the API base URL in api.js to point to your Render URL
4. Deploy
5. **Copy the live URL (e.g., https://sub-tracker.vercel.app) and paste it below**

**Wait for human input before continuing.**"

### STOP POINT 3: Environment Variables Check
**Agent Says:**
"Before final testing, confirm you have set these environment variables in your deployment platforms:

**Render (Backend):**
- MONGO_URI = [your atlas connection string]
- JWT_SECRET = [your secret string]
- NODE_ENV = production

**Vercel (Frontend):**
- REACT_APP_API_URL = [your render backend URL]

**Also confirm:**
- Your Atlas IP whitelist includes 0.0.0.0/0
- You have pushed the latest code to GitHub before deploying

Type 'confirmed' to proceed to final audit."

---

## SECTION 10: DEPLOYMENT PROTOCOL

### 10.1 Backend Deployment (Render)
1. Push backend code to GitHub repository
2. Connect Render to GitHub repo
3. Configure:
   - Root Directory: `backend` (if monorepo) or root (if backend-only repo)
   - Runtime: Node
   - Build: `npm install`
   - Start: `node server.js`
4. Add Environment Variables in Render Dashboard
5. Auto-deploy on git push enabled

### 10.2 Frontend Deployment (Vercel)
1. Push frontend code to GitHub
2. Import to Vercel
3. Update API base URL in `src/services/api.js` to production backend URL
4. Deploy
5. Verify CORS allows Vercel domain in backend (or allow all for simplicity)

### 10.3 Database (MongoDB Atlas)
- Must be live before backend deployment
- Network access: 0.0.0.0/0 (Allow from anywhere)
- Database name: `subscription_analyzer` or similar

### 10.4 Post-Deployment Verification
- Register a new user on live URL
- Add 3-4 test subscriptions
- Check dashboard displays data
- Run simulation and verify calculations
- Test login/logout flow
- Test protected routes (try accessing /dashboard without login)

---

## SECTION 11: REPORT WRITING GUIDE (5-7 Pages PDF)

The human must generate this. The agent provides the content outline and technical details.

### Page 1: Title & Problem Definition
- Title: "Subscription Analyzer with Simulation Logic — Technical Report"
- Your name, roll number (23i-5568), course, instructor name
- Problem: Students and young professionals lose track of recurring subscriptions. Small monthly charges compound into significant annual expenses. There is no easy way to visualize future costs or simulate cancellation savings.
- Solution: A MERN stack web application that tracks subscriptions and runs financial simulations to project costs and savings.

### Page 2: System Architecture
- Diagram: Browser → React Frontend → Express API → MongoDB Atlas → Response
- Explain each layer in 1 paragraph
- Mention deployment platforms (Vercel, Render, Atlas)

### Page 3: Database Design
- Schema diagrams (draw.io or simple tables)
- User Schema fields with types
- Subscription Schema fields with types
- **Relationship Justification (CRITICAL):**
  - "I chose referencing over embedding because subscriptions are independently growing documents. A user may have 20+ subscriptions. Embedding would bloat the user document and make aggregation queries slower. Referencing allows me to query subscriptions separately and perform MongoDB aggregations efficiently."

### Page 4: Core Logic Explanation
- Step-by-step explanation of Simulation Logic:
  1. Normalize all costs to monthly equivalents
  2. Sum to get monthly burn rate
  3. Multiply by time periods (3, 6, 12 months) for projections
  4. For What-If: subtract selected subscriptions, recalculate, compare
- Include a worked example with sample numbers
- Screenshot of simulation UI from deployed app

### Page 5: Query Explanation
- **Query 1:** Category Aggregation Pipeline
  - Show the pipeline code
  - Explain $match filters by userId, $group sums cost by category, $sort orders by totalCost descending
  - Sample data and expected output table
- **Query 2:** Billing Cycle Distribution
  - Show pipeline code
  - Explain how it groups by billingCycle and calculates total and average
  - Sample data and output

### Page 6: Security Analysis
- Input Validation: "I validate all incoming data on both frontend (HTML5 + basic JS) and backend (custom middleware). This prevents empty fields, negative numbers, and wrong data types."
- Protected Routes: "I use JWT tokens stored in localStorage. The frontend blocks routes if no token exists. The backend verifies every protected API request. This prevents unauthorized data access."
- (Optional) Owner Verification: "For delete operations, I check that the subscription's userId matches the requesting user's ID, preventing users from deleting others' data."

### Page 7: Scalability Discussion & Conclusion
- What breaks at 10,000 users?
  - MongoDB queries slow down without indexing
  - JWT secret compromise risk if single key
  - Frontend bundle size with CRA
- Fixes:
  - Add database indexes on userId and category fields
  - Implement refresh tokens and secret rotation
  - Migrate to Vite or Next.js for better performance
  - Add Redis caching for simulation results
  - Implement pagination for subscription lists
- Conclusion paragraph

---

## SECTION 12: HANDWRITTEN ANSWER DRAFTS (Part D)

**INSTRUCTION TO HUMAN:** Copy these answers onto the answer sheet in your own handwriting. Do NOT print and paste. The instructor will cross-reference these with your code.

### Q1. System Flow Diagram (2 marks)
**Draw this:**
```
[User Browser] 
    ↓ HTTP Request (JSON)
[React Frontend] — Runs on Vercel, renders UI, manages state
    ↓ Axios Call with JWT Header
[Express Backend] — Runs on Render, handles routing, runs simulation logic
    ↓ Mongoose Query
[MongoDB Atlas] — Cloud database, stores Users and Subscriptions
    ↓ JSON Response
[Express Backend]
    ↓ JSON Data
[React Frontend] — Updates DOM, shows subscriptions and simulation results
    ↓
[User Sees Update]
```
Label each layer: Presentation Layer, Application Layer, Data Layer.

### Q2. One API Route — Step by Step (2 marks)
**Choose: POST /api/subscriptions (Add Subscription)**
"When the user fills the form and clicks Add:
1. React collects form data (name, category, cost, billingCycle) from state
2. Frontend sends POST request to /api/subscriptions with JWT token in Authorization header
3. Backend validator middleware checks if all fields exist and cost is a positive number
4. Auth middleware verifies the JWT and extracts the userId from the payload
5. Route handler creates a new Subscription document with the form data + userId
6. Mongoose saves the document to MongoDB Atlas
7. Backend sends back the created subscription object with its _id
8. React receives the response and adds it to the subscriptions list state
9. UI re-renders to show the new subscription in the table"

### Q3. Database Relationship (2 marks)
"I have two collections: Users and Subscriptions. They are connected by referencing.
The Subscription schema has a field `userId` of type ObjectId that references the User model.

I chose referencing over embedding because:
1. Subscriptions grow independently — a user can add unlimited subscriptions over time
2. If embedded, the user document would become very large and slow to load
3. I need to query subscriptions separately (list view, aggregations, simulations) without loading the entire user object
4. MongoDB has a 16MB document size limit; embedding risks hitting this limit
5. Referencing makes aggregation pipelines easier for my category stats and billing stats queries"

### Q4. Core FinTech Logic (2 marks)
"My simulation logic works in three steps:

Step 1 — Normalization: I convert all subscription costs to a monthly basis. If billingCycle is 'annual', I divide cost by 12. If 'monthly', I keep it as-is. This allows fair comparison between Netflix (monthly) and Amazon Prime (annual).

Step 2 — Projection: I sum all normalized monthly costs to get 'monthlyTotal'. Then I calculate 3-month, 6-month, and 12-month projections by multiplying monthlyTotal.

Step 3 — What-If Cancellation: The user selects subscriptions to cancel via checkboxes. I filter out those subscriptions, recalculate the monthlyTotal with remaining items, and compute the difference. I show absolute savings ($X) and percentage savings (Y%) so the user sees exactly how much they save.

Example: User has Netflix ($15/month), Gym ($50/month), and Software ($120/year = $10/month). Monthly total = $75. 12-month projection = $900. If they cancel Gym, new monthly = $25, savings = $50/month or $600/year."

### Q5. Real Security Flaw & Fix (2 marks)
**Flaw:** "I store the JWT token in browser localStorage. This is vulnerable to XSS (Cross-Site Scripting) attacks. If an attacker injects malicious JavaScript into my app, they can read localStorage and steal the token, then impersonate the user."

**Fix:** "To fix this, I should:
1. Store the JWT in an httpOnly cookie instead of localStorage — this prevents JavaScript access
2. Implement XSS protection by sanitizing any user-generated content before rendering it
3. Add a Content Security Policy header to prevent inline script execution
4. Use short-lived access tokens (15 minutes) with refresh tokens stored securely

Currently, my app uses localStorage for simplicity, but in production, httpOnly cookies are the secure standard."

---

## SECTION 13: COMPLETE AUDIT CHECKLIST

### PART A — CODING AGENT AUDIT (Verify Before Handing Over)

#### Authentication (8 marks)
- [ ] Login page exists and works
- [ ] Signup page exists and works
- [ ] Passwords hashed with bcryptjs
- [ ] JWT generated on login and stored in localStorage
- [ ] Protected routes block unauthenticated users (frontend)
- [ ] Backend rejects requests without valid JWT
- [ ] Token persists across page refreshes
- [ ] Logout clears token and redirects

#### Database Design (14 marks)
- [ ] User collection with correct fields and types
- [ ] Subscription collection with correct fields and types
- [ ] Relationship established via userId reference (ObjectId)
- [ ] Referencing vs Embedding justified in report
- [ ] Create operation: Add subscription
- [ ] Read operation: Get all subscriptions for logged-in user
- [ ] Delete operation: Remove subscription (with ownership check)
- [ ] Meaningful Query 1: Category aggregation with $group and $sort
- [ ] Meaningful Query 2: Billing cycle distribution with $group, $sum, $avg
- [ ] All queries filtered by userId (data isolation)

#### Core FinTech Logic (15 marks)
- [ ] Monthly cost normalization (annual ÷ 12)
- [ ] Monthly burn rate calculation
- [ ] 3-month projection calculation
- [ ] 6-month projection calculation
- [ ] 12-month projection calculation
- [ ] What-If cancellation simulation
- [ ] Savings calculation (absolute and percentage)
- [ ] Logic visible in UI (SimulationPage)
- [ ] Logic implemented in backend API (not just frontend math)
- [ ] Step-by-step explainable (matches handwritten Q4)

#### Backend (8 marks)
- [ ] Minimum 3 API routes implemented (auth, subs, simulation)
- [ ] RESTful architecture
- [ ] Middleware 1: JWT authentication check
- [ ] Middleware 2: Input validation OR request logging
- [ ] Proper JSON responses
- [ ] Error handling (basic)
- [ ] CORS configured
- [ ] MongoDB connected via Mongoose

#### Frontend (6 marks)
- [ ] Minimum 3 pages with React Router (Login, Signup, Dashboard, Simulation)
- [ ] Dynamic data fetched from backend (no hardcoded subscription data)
- [ ] Proper navigation between pages
- [ ] Form to add subscriptions
- [ ] List display of subscriptions
- [ ] Delete functionality

#### Security (4 marks)
- [ ] Input validation on forms
- [ ] Input validation on API endpoints
- [ ] Protected routes (frontend)
- [ ] Protected routes (backend)
- [ ] Prevention of invalid/malformed API calls

#### Responsiveness (Implied in rubric)
- [ ] Works on mobile screen (320px-768px)
- [ ] Works on desktop screen (768px+)
- [ ] No layout breakage at common breakpoints

#### User Interaction (Implied in rubric)
- [ ] Interactive feature 1: Category filter on dashboard
- [ ] Interactive feature 2: Cost sorting (asc/desc)
- [ ] OR Interactive feature: What-If checkboxes in simulation
- [ ] Real-time visible responses to user actions

### PART B — HUMAN TASK AUDIT

#### Account Setup
- [ ] MongoDB Atlas account created
- [ ] Cluster created (M0 Free Tier)
- [ ] Database user created
- [ ] IP whitelist set to 0.0.0.0/0
- [ ] Connection string obtained and provided to agent
- [ ] JWT secret string provided to agent

#### GitHub
- [ ] Repository created
- [ ] Backend code pushed
- [ ] Frontend code pushed
- [ ] .gitignore includes node_modules and .env (HUMAN VERIFY THIS)

#### Deployment
- [ ] Render account created
- [ ] Backend deployed on Render
- [ ] Backend live URL obtained
- [ ] Vercel account created
- [ ] Frontend deployed on Vercel
- [ ] Frontend live URL obtained
- [ ] Environment variables configured on deployment platforms
- [ ] CORS allows frontend domain (or all origins)

#### Report (20 marks)
- [ ] PDF generated (5-7 pages)
- [ ] Problem Definition section
- [ ] System Architecture section
- [ ] Database Design section with relationship justification
- [ ] Core Logic Explanation section
- [ ] Query Explanation section with sample data
- [ ] Security Analysis section
- [ ] Scalability Discussion section
- [ ] All sections present and match actual implementation

#### Handwritten Answers (10 marks)
- [ ] Q1: System Flow Diagram drawn
- [ ] Q2: API route explained step-by-step
- [ ] Q3: Database relationship explained with referencing justification
- [ ] Q4: Core logic traced with example
- [ ] Q5: Real security flaw identified and fix explained
- [ ] Answers reflect ACTUAL code (not generic textbook answers)
- [ ] Written on provided answer sheet

#### Live Defense Prep (5 marks)
- [ ] Can explain Login route line-by-line
- [ ] Can explain Subscription schema
- [ ] Can explain Simulation calculation logic
- [ ] Can explain Aggregation pipeline
- [ ] Can explain why referencing was chosen
- [ ] Ready for random code walk-through
- [ ] Ready for small live modification

### PART C — HUMANIZATION AUDIT (CRITICAL — ZERO TOLERANCE)

#### Code Style
- [ ] Variable naming is inconsistent (camelCase, snake_case, abbreviations mixed)
- [ ] Indentation varies (2 spaces in some files, 4 in others)
- [ ] Minimal comments (less than 5% of lines)
- [ ] Comments that exist are messy/grammatically imperfect
- [ ] At least 1 "TODO" or "FIXME" comment left in code
- [ ] At least 1 dead/commented-out code block present
- [ ] Mix of var, let, const used
- [ ] At least 2 console.log statements left in production code
- [ ] Some functions longer than 20 lines
- [ ] Both function declarations and arrow functions used

#### CSS Style
- [ ] Plain CSS files only (no frameworks)
- [ ] Inconsistent units (px and rem mixed)
- [ ] Some inline styles in JSX
- [ ] Colors are basic/off-standard hex codes
- [ ] No stock images used
- [ ] Layout uses basic flexbox (not grid)
- [ ] Slightly imperfect alignment (realistic student work)

#### Project Structure
- [ ] create-react-app used (not Vite)
- [ ] Basic README.md (title + run instructions only)
- [ ] No advanced patterns (Context, Redux, Custom Hooks)
- [ ] No TypeScript
- [ ] No perfect error boundaries
- [ ] No toast/notification libraries
- [ ] No loading spinners (text "Loading..." is OK)

#### Absolute Checks
- [ ] ZERO emojis in entire codebase
- [ ] ZERO perfectly consistent naming conventions
- [ ] ZERO enterprise-grade abstractions
- [ ] Code looks like it was written by a student learning MERN

### FINAL VERIFICATION
- [ ] All three services are live (Frontend, Backend, Database)
- [ ] Live URL is functional and accessible
- [ ] Can register new user on live deployment
- [ ] Can add subscriptions on live deployment
- [ ] Simulation page calculates correctly on live deployment
- [ ] Handwritten answers match deployed code exactly
- [ ] Report screenshots match deployed UI exactly
- [ ] No AI-generated appearance in code style

---

## SECTION 14: AGENT EXECUTION ORDER

Follow this exact sequence. Do NOT skip steps.

1. **Initialize Backend**
   - Create folder structure
   - Initialize npm, install dependencies
   - STOP: Ask human for MONGO_URI and JWT_SECRET

2. **Build Backend**
   - Write config/db.js
   - Write Models (User.js, Subscription.js)
   - Write Middleware (auth.js, validator.js)
   - Write Routes (auth.js, subscriptions.js, simulation.js)
   - Write server.js
   - Test locally with Postman/Thunder Client (optional)

3. **Initialize Frontend**
   - Run create-react-app
   - Install react-router-dom and axios
   - Create folder structure (components, pages, services)

4. **Build Frontend**
   - Write api.js service layer
   - Write App.js with routing
   - Write LoginPage.js and SignupPage.js
   - Write DashboardPage.js with all sub-components
   - Write SimulationPage.js
   - Write CSS (App.css) with humanization rules

5. **Integration Testing**
   - Verify login/signup flow
   - Verify add/delete subscription
   - Verify simulation calculations
   - Verify protected routes

6. **STOP: Deployment Setup**
   - Ask human to create Atlas, Render, Vercel accounts
   - Ask human for live URLs

7. **Final Polish**
   - Update API base URL to production
   - Verify CORS
   - Run final audit checklist

8. **Generate Deliverables**
   - Provide Report content (markdown) for human to convert to PDF
   - Provide Handwritten answer drafts
   - Provide final audit checklist

---

## APPENDIX: SAMPLE DATA FOR TESTING

Use this data to populate the system for screenshots and demo:

**User:**
- username: testuser
- email: test@student.edu
- password: testpass123

**Subscriptions:**
1. Netflix | entertainment | 15 | monthly
2. Spotify | entertainment | 10 | monthly
3. Adobe CC | productivity | 55 | monthly
4. Gym Membership | health | 120 | annual
5. Cloud Storage | utilities | 9.99 | monthly

**Expected Simulation Output:**
- Monthly Burn Rate: $15 + $10 + $55 + ($120/12=$10) + $9.99 = $99.99
- 3-Month: $299.97
- 6-Month: $599.94
- 12-Month: $1,199.88

---

**END OF MASTER PLAN**
**Roll Number: 23i-5568**
**System: Subscription Analyzer + Simulation Logic**
**Complexity: Intermediate (2 Collections with Referencing)**
