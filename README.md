 ☕ Café Ordering 

A full-stack web application for digital café ordering, menu management, and real-time order tracking. Built for **Café Point, College Road, Nadiad, Gujarat**, the system provides a streamlined ordering experience for customers and an integrated dashboard for café administrators.

Customers can explore the menu, customize orders, choose their dining method, apply discount coupons, and track order progress. Administrators can manage menu items, monitor incoming orders, and coordinate kitchen operations through a dedicated management dashboard.



 🎯 Project Overview

The Café Ordering and Management System digitizes the café ordering process by connecting customers and administrators through a single web application.

Traditional manual ordering can lead to long queues, communication errors, inefficient menu updates, and difficulties tracking order progress. This project addresses these challenges by providing a centralized platform for menu browsing, order placement, order management, and status updates.

The application implements role-based access separation, a responsive user interface, a MongoDB-backed data layer, and automatic order-status synchronization between customer and administrator views.

**Project Details**

- **Project Name:** Café Ordering and Management System
- **Café:** Café Point
- **Location:** College Road, Student Hub, Nadiad, Kheda, Gujarat, India – 387001
- **Application Type:** Full-stack web application
- **Primary Users:** Customers and Administrators
- **Currency:** Indian Rupee (₹ INR)

🎯 Project Objectives

- Digitize the café's menu browsing and ordering process.
- Provide separate interfaces and permissions for customers and administrators.
- Simplify menu creation, editing, availability management, and removal.
- Automate order-status updates and customer order tracking.
- Calculate order totals, taxes, delivery charges, and applicable discounts.
- Support multiple dining options and common Indian payment methods.
- Provide a maintainable architecture that can be extended with additional features.

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| React 18 | Component-based frontend development |
| Vite | Frontend development server and build tooling |
| React Context API | Shared application state management |
| Lucide React | Interface icons |
| HTML5 and CSS3 | Page structure, styling, and responsive layouts |
| CSS Variables | Consistent design tokens and theming |
| Node.js | JavaScript runtime for the backend |
| Express.js | REST API and HTTP request handling |
| MongoDB | Persistent storage for application data |
| Mongoose | MongoDB schemas, models, and database operations |
| Dotenv | Environment-variable configuration |
| CORS | Cross-origin request configuration |
| Morgan | HTTP request logging |
| Crypto | Password hashing and salt generation using the implemented PBKDF2 approach |
| Concurrently | Running multiple development processes together, if configured |

---

## ✨ Key Features

### 1. 🔐 Authentication and Role Separation

- Branded authentication gateway for visitors who are not logged in.
- Separate customer and administrator access flows.
- Customer registration and login.
- Restricted administrative management functionality.
- Role-based interface separation to prevent customers from accessing administrative controls.
- Administrator accounts intended for authorized café staff.

**Role separation:** Administrators use the management dashboard rather than customer checkout, while customers access the menu, cart, ordering, and tracking functionality.

### 2. 👑 Administrator Dashboard

#### Menu Management

The dashboard provides menu-item CRUD operations:

- **Create:** Add menu items with names, categories, prices, preparation times, images, and dietary labels.
- **Read:** View the café's menu catalog and current stock availability.
- **Update:** Edit item information, adjust prices, and change availability.
- **Delete:** Remove menu items that are no longer offered.

The application includes a preset image selector with café images and supports vegetarian and non-vegetarian labels.

#### Order Management

- View incoming customer orders in a centralized dashboard.
- Identify order status using status labels.
- Advance orders through the supported kitchen workflow.
- Modify order items and quantities when supported by the application.
- Recalculate subtotals, GST, and order totals following changes.

**Order status flow:**

`Placed → Preparing → Ready → Completed`

Orders may also be marked as `Cancelled`, where supported.

### 3. ☕ Customer Menu and Ordering

#### Menu Discovery

- Browse a catalog of 29+ café items.
- Explore coffee, cold beverages, burgers, Maggi, pizzas, shakes, and desserts.
- Search for items by keyword.
- Filter items by category.
- Sort items by price or rating.
- View product images, prices, dietary labels, and preparation information where available.

#### Shopping Cart and Billing

- Add items and adjust quantities.
- Remove unwanted items.
- View the current order summary.
- Calculate subtotal, GST, delivery charges, and applicable discounts.
- Display the final payable amount before checkout.

**GST calculation:** The application is configured to calculate 5% GST, split into 2.5% CGST and 2.5% SGST, as implemented in the project.

#### Dining Options

Customers can choose from the supported dining modes:

- **Dine-In:** Select a table number.
- **Takeaway:** Collect the order at the café counter.
- **Home Delivery:** Provide delivery address details.

#### Discounts and Delivery

- Promotional coupon codes: `POINT10`, `CAFE10`, and `BREW20`.
- Free delivery for eligible orders of ₹199 or more.
- No delivery charge for dine-in and takeaway orders, according to the configured rules.

Coupon eligibility and discount calculations depend on the application's implementation.

### 4. 💳 Checkout and Payment Options

The checkout interface supports the following payment methods as configured in the application:

- **UPI:** Google Pay, PhonePe, Paytm, and other compatible UPI applications.
- **Cards:** RuPay, Visa, and Mastercard.
- **Cash:** Cash at the counter or Cash on Delivery, depending on the selected dining mode.

**Payment note:** Listing a payment method in the interface does not necessarily mean a live payment gateway is integrated. Actual payment processing, transaction verification, and refunds depend on the implemented payment integration. Demo payment options should be identified clearly as simulations.

### 5. 📦 Automatic Order Tracking

Customers can follow the progress of their orders through a visual four-stage progress indicator.

| Stage | Description |
|---|---|
| Placed | The order has been received |
| Preparing | The kitchen is preparing the order |
| Ready | The order is ready for collection or serving |
| Completed | The order has been completed |

Additional functionality includes:

- Automatic order-status refresh approximately every three seconds.
- Updates visible without manually reloading the page.
- Toast notifications when order statuses change.
- Audio chime notifications where supported by the browser.
- A ready-order alert to help customers identify orders awaiting collection.

The automatic refresh mechanism uses periodic API requests rather than necessarily requiring a persistent WebSocket connection.

---



### Architecture Components

- **Frontend:** Renders the user interface and manages client-side interactions.
- **REST API:** Exchanges data between the frontend and backend over HTTP.
- **Backend:** Handles requests, validates input, enforces permissions, and executes business logic.
- **Mongoose:** Defines data models and interacts with MongoDB.
- **MongoDB:** Stores application data persistently.

*The diagram is a logical overview. Actual routes, database collections, and authentication mechanisms should be verified against the source code.*

---

## 🔄 Order Workflow

1. A customer opens the application and signs in or creates an account.
2. The customer browses the menu and selects food or beverages.
3. Items are added to the cart, and the application calculates the order total.
4. The customer chooses a dining mode and an available payment option.
5. The order is submitted and recorded by the backend.
6. An administrator views the incoming order in the management dashboard.
7. The administrator updates the order status as preparation progresses.
8. The customer dashboard refreshes the order information automatically.
9. The order moves to completion or cancellation, as applicable.

---

## 🔒 Security Considerations

The project uses a password-hashing approach based on PBKDF2 with salt, as indicated by its technology stack.

Important security principles for this application include:

- Store password hashes rather than plaintext passwords.
- Use unique salts and appropriate PBKDF2 parameters.
- Validate and sanitize incoming request data.
- Enforce authorization on the backend, not only by hiding frontend controls.
- Protect sensitive configuration through environment variables.
- Avoid exposing database credentials, API keys, or private information in the repository.
- Configure CORS for trusted frontend origins in production.
- Use HTTPS when deploying the application publicly.

**Important:** These are security requirements and recommendations. They should not all be interpreted as already implemented features. Verify the actual authentication, authorization, and validation code before claiming complete protection.

---

## 📁 Project Structure

The following is an illustrative structure. Adjust it to match the actual folders in the repository.

```text


## 💻 Prerequisites

Install the following tools before running the project:

- [Node.js](https://nodejs.org/) — use a version compatible with the project's dependencies.
- npm — typically included with Node.js.
- [Git](https://git-scm.com/) — for cloning the repository.
- MongoDB — either a local MongoDB instance or a configured MongoDB service.
- A modern web browser.

Verify the Node.js and npm installations:

```bash
node --version
npm --version
```

---

## ⚙️ Installation and Setup

### 1. Clone the Repository

Replace the placeholder with the actual GitHub repository URL.

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd YOUR_PROJECT_FOLDER
```

### 2. Install Backend Dependencies

If the backend is in a folder named `backend`:

```bash
cd backend
npm install
```

### 3. Configure Backend Environment Variables

Create a local `.env` file using the provided `.env.example` as a reference.

Set the MongoDB connection string and any other variables required by the backend.

### 4. Install Frontend Dependencies

Open a second terminal and navigate to the frontend directory:

```bash
cd frontend
npm install
```

If the actual repository uses a different directory structure, adjust these commands accordingly.

---

## 🔑 Environment Configuration

The `.env.example` file documents the configuration variables required by the application.

For example, the backend might require variables such as:

```dotenv
PORT=5000
MONGODB_URI=your_mongodb_connection_string
```

**This is only an example.** Confirm the actual variable names by checking the backend source code and configuration files. Do not copy these names blindly if the project uses different names.

Create a local `.env` file with the correct values. Keep `.env` out of version control and commit `.env.example` with placeholder values only.

---

## ▶️ Running the Application

Start the backend using the script defined in its `package.json`. For example, if a `dev` script exists:

```bash
npm run dev
```

Start the frontend in a separate terminal using the script defined in its `package.json`:

```bash
npm run dev
```

Vite will display the local frontend URL in the terminal, commonly `http://localhost:5173`.

The backend URL and port depend on the application's configuration. Confirm both URLs and any required frontend API settings before testing.

---


## 🧪 Testing the Application

Perform the following manual checks before submission:

- [ ] Open the application and verify the authentication gateway.
- [ ] Register a customer account and sign in.
- [ ] Verify that customer accounts cannot access administrative operations.
- [ ] Sign in with an authorized administrator account.
- [ ] Add, edit, and remove a menu item.
- [ ] Change stock availability and verify the menu reflects the change.
- [ ] Add items to the cart and modify quantities.
- [ ] Verify subtotal, GST, delivery charges, discounts, and final total.
- [ ] Place a test order using an available demo payment option.
- [ ] Change the order status from the admin dashboard.
- [ ] Verify that the customer tracking screen displays the updated status.
- [ ] Confirm that the README screenshots load correctly on GitHub.

These are suggested verification steps, not a claim that every test has already passed.

---

## 🚀 Future Enhancements

Potential improvements for future versions include:

- Integration with a verified payment gateway for live payments.
- Email or SMS notifications for order confirmation and readiness.
- More detailed sales reports and analytics for administrators.
- Inventory alerts and low-stock notifications.
- Secure password recovery and account management.
- Automated unit, integration, and end-to-end testing.
- Deployment to a production hosting environment with HTTPS.
- Accessibility improvements and further mobile-responsive refinements.
- Persistent audit logs for sensitive administrative actions.

---

## 👥 Intended Users

**Customers:** Browse the menu, place orders, choose dining options, and track order progress.

**Administrators:** Manage the menu, monitor customer orders, and coordinate order preparation.

---

## 📄 Project Status

Developed as a full-stack café ordering and management project. The application can be evaluated using the setup instructions and manual test checklist above.

## 📜 License

Add the applicable license if one has been selected. If this project is for academic submission and no license has been chosen, do not claim a specific open-source license.
