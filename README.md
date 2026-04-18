# WedDee’s Signature Bistro

A modern, full-stack ordering system for WedDee’s Signature Bistro in Calabar, Cross River State, Nigeria. Built with React, Node.js, and Paystack integration for seamless café ordering experiences.

## 🌟 Features

### Customer-Facing Features

- **Interactive Menu Display**: Browse pastries, drinks, combos, and specials with beautiful image cards
- **Advanced Search**: Real-time search through menu items by name or description
- **Category Filtering**: Filter menu items by categories (All, Pastries, Drinks, Combos, Specials)
- **Smart Cart System**: Add/remove items, adjust quantities, persistent cart storage
- **Flexible Checkout**: Choose between pickup and delivery options
- **Paystack Payment Integration**: Secure payment processing with real-time verification
- **Order Confirmation**: Detailed receipts with QR codes and PDF downloads
- **Success Notifications**: Visual success banners after successful payments
- **Responsive Design**: Optimized for desktop and mobile devices

### Admin Dashboard Features

- **Secure Admin Login**: Password-protected admin access with automatic logout on storefront return
- **Menu Management**: Add, edit, and delete menu items with image uploads
- **Image Upload System**: Upload PNG and JPG images directly (no external links required)
- **Order Management**: View all orders with status tracking
- **Product Deletion**: Remove menu items with confirmation
- **Real-time Updates**: Changes reflect immediately in the storefront

### Payment & Order Features

- **Live Paystack Integration**: Process real payments (requires live API keys)
- **Payment Verification**: Automatic verification and order confirmation
- **Receipt Generation**: Professional PDF receipts with order details
- **Order Status Tracking**: Monitor order lifecycle from pending to completed
- **Email Notifications**: Automated order confirmations (configurable)

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern UI framework with hooks
- **Vite** - Fast build tool and development server
- **CSS3** - Custom styling with responsive design
- **jsPDF** - PDF receipt generation
- **FileReader API** - Image preview and upload handling

### Backend
- **Node.js** - Server runtime
- **Express.js** - RESTful API framework
- **LowDB** - JSON file-based database
- **Multer** - File upload handling
- **Nodemailer** - Email notifications
- **CORS** - Cross-origin resource sharing

### Payment Integration
- **Paystack API** - Nigerian payment gateway
- **Real-time Verification** - Payment status checking

### Development Tools
- **ESLint** - Code linting
- **Vite** - Development server and build tool

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Paystack account with live API keys (for real payments)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd my-react-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   ADMIN_PASSWORD=your-admin-password
   ADMIN_TOKEN=weddee-admin-token
   PAYSTACK_SECRET_KEY=sk_live_your-live-secret-key
   PAYSTACK_PUBLIC_KEY=pk_live_your-live-public-key
   PAYSTACK_CALLBACK_URL=https://yourdomain.com/
   ```

4. **Create uploads directory**
   ```bash
   mkdir uploads
   ```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ADMIN_PASSWORD` | Password for admin login | Yes |
| `ADMIN_TOKEN` | JWT-like token for admin authentication | Yes |
| `PAYSTACK_SECRET_KEY` | Paystack live secret key | Yes (for live payments) |
| `PAYSTACK_PUBLIC_KEY` | Paystack live public key | Yes (for live payments) |
| `PAYSTACK_CALLBACK_URL` | URL for payment callbacks | Yes |

### Email Configuration (Optional)

For email notifications, add these variables:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## 🏃‍♂️ Running the Application

### Development Mode

1. **Start the backend server**
   ```bash
   npm run server
   ```
   Server runs on `http://localhost:4000`

2. **Start the frontend (in a new terminal)**
   ```bash
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

### Production Build

1. **Build the frontend**
   ```bash
   npm run build
   ```

2. **Start the server**
   ```bash
   npm run server
   ```

## 📖 Usage Guide

### For Customers

1. **Browse Menu**: View all available items with images and descriptions
2. **Search Items**: Use the search bar to find specific items
3. **Filter by Category**: Click category buttons to filter items
4. **Add to Cart**: Click items to add them to your cart
5. **Manage Cart**: Adjust quantities or remove items from the cart icon
6. **Checkout**: Choose pickup/delivery, enter details, and proceed to payment
7. **Pay Securely**: Complete payment via Paystack's secure gateway
8. **Get Receipt**: Download PDF receipt after successful payment

### For Admins

1. **Login**: Click "Owner Dashboard" and enter admin password
2. **Add Menu Items**: Upload images (PNG/JPG only), fill details, and add items
3. **Manage Orders**: View all orders and their statuses
4. **Delete Items**: Remove menu items from the current menu
5. **Logout**: Automatically logged out when returning to storefront

## 🔌 API Documentation

### Products Endpoints

- `GET /api/products` - Get all menu items (with optional category/search filters)
- `POST /api/products` - Add new menu item (admin only)
- `DELETE /api/products/:id` - Delete menu item (admin only)

### Order Endpoints

- `POST /api/orders` - Create new order and initialize payment
- `GET /api/orders/:id` - Get order details
- `GET /api/admin/orders` - Get all orders (admin only)

### Payment Endpoints

- `GET /api/paystack/verify` - Verify payment status

### File Upload

- `POST /api/upload` - Upload product images (admin only)

### Admin

- `POST /api/admin/login` - Admin authentication

## 🎨 Customization

### Branding
- Update `brand` object in `src/App.jsx` for name, location, and tagline
- Replace logo in `src/Socialicons.png`
- Modify colors in `src/App.css`

### Menu Categories
- Edit `categories` array in `src/App.jsx`
- Update category options in admin form

### Taxes and Pricing
- Modify `taxRate` in `src/App.jsx`
- Update currency formatting in `formatNaira` function

## 🚀 Deployment

### Environment Setup
1. Set up a production server (Heroku, DigitalOcean, AWS, etc.)
2. Configure environment variables with live values
3. Update `PAYSTACK_CALLBACK_URL` to your production domain
4. Ensure `uploads/` directory is writable

### Build Process
```bash
npm run build
npm run server
```

### Recommended Hosting
- **Frontend**: Netlify, Vercel, or any static hosting
- **Backend**: Heroku, Railway, or VPS with Node.js support
- **Database**: LowDB (file-based) or upgrade to MongoDB/PostgreSQL for production scale

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint rules
- Test payment flows with test keys before live deployment
- Ensure responsive design on mobile devices
- Add proper error handling for API calls

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support or questions:
- Email: support@weddee.com
- Location: Marina, Calabar, Cross River State, Nigeria
- Phone: +234 803 123 4567

## 🙏 Acknowledgments

- Built with love for WedDee’s Signature Bistro
- Paystack for secure payment processing
- Unsplash for initial menu images
- React community for excellent documentation
