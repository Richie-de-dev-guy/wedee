import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import nodemailer from 'nodemailer'
import fetch from 'node-fetch'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import multer from 'multer'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dbPath = path.join(__dirname, 'db.json')
const adapter = new JSONFile(dbPath)
const db = new Low(adapter, {
  products: [],
  orders: [],
})

const uploadDir = path.join(__dirname, 'uploads')
fs.mkdirSync(uploadDir, { recursive: true })
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed.'), false)
    }
  },
})

const PORT = process.env.PORT || 4000
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD?.trim() || 'Wed1234@'
const ADMIN_TOKEN = process.env.ADMIN_TOKEN?.trim() || 'weddee-admin-token'
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY?.trim() || ''
const PAYSTACK_CALLBACK_URL = process.env.PAYSTACK_CALLBACK_URL?.trim() || 'http://localhost:5173/'
const EMAIL_HOST = process.env.EMAIL_HOST?.trim() || ''
const EMAIL_PORT = Number(process.env.EMAIL_PORT || 587)
const EMAIL_SECURE = process.env.EMAIL_SECURE === 'true'
const EMAIL_USER = process.env.EMAIL_USER?.trim() || ''
const EMAIL_PASS = process.env.EMAIL_PASS?.trim() || ''
const EMAIL_FORCE_IPV4 = process.env.EMAIL_FORCE_IPV4 !== 'false'
const EMAIL_ALLOW_SELF_SIGNED = process.env.EMAIL_ALLOW_SELF_SIGNED === 'true'

const PLACEHOLDER_EMAIL_VALUES = new Set([
  'smtp.example.com',
  'your-smtp-user',
  'your-smtp-password',
])

function buildCallbackUrl(baseUrl, reference) {
  const trimmed = baseUrl.replace(/[?&]$/, '')
  const separator = trimmed.includes('?') ? '&' : '?'
  return `${trimmed}${separator}reference=${encodeURIComponent(reference)}`
}

let transporterPromise = null
let hasLoggedEmailSkipReason = false

function logEmailSkipReason(message) {
  if (hasLoggedEmailSkipReason) return
  hasLoggedEmailSkipReason = true
  console.warn(message)
}

function hasConfiguredEmailCredentials() {
  return Boolean(EMAIL_HOST && EMAIL_USER && EMAIL_PASS)
}

function hasPlaceholderEmailConfig() {
  return [EMAIL_HOST, EMAIL_USER, EMAIL_PASS].some((value) => PLACEHOLDER_EMAIL_VALUES.has(value))
}

async function createEmailTransporter() {
  if (hasConfiguredEmailCredentials() && !hasPlaceholderEmailConfig()) {
    const transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: EMAIL_PORT,
      secure: EMAIL_SECURE,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
      family: EMAIL_FORCE_IPV4 ? 4 : undefined,
      tls: {
        servername: EMAIL_HOST,
        rejectUnauthorized: !EMAIL_ALLOW_SELF_SIGNED,
      },
    })

    await transporter.verify()
    console.log(`SMTP email transport ready on ${EMAIL_HOST}:${EMAIL_PORT}.`)
    if (EMAIL_ALLOW_SELF_SIGNED) {
      console.warn('SMTP is accepting a self-signed certificate because EMAIL_ALLOW_SELF_SIGNED=true.')
    }
    return transporter
  }

  if (hasPlaceholderEmailConfig()) {
    logEmailSkipReason('Email disabled: replace placeholder SMTP values in .env before sending order emails.')
    return null
  }

  logEmailSkipReason('Email disabled: set real SMTP credentials in .env to send customer receipts.')
  return null
}

async function getEmailTransporter() {
  if (!transporterPromise) {
    transporterPromise = createEmailTransporter().catch((error) => {
      console.warn(`Email transport setup failed: ${error.message}`)
      return null
    })
  }

  return transporterPromise
}

async function initDb() {
  try {
    await db.read()
  } catch (error) {
    console.warn('Failed to read db.json. Reinitializing the database file.', error.message)
    await fs.promises.writeFile(dbPath, JSON.stringify({ products: [], orders: [] }, null, 2))
    db.data = { products: [], orders: [] }
  }

  if (!db.data || typeof db.data !== 'object') {
    db.data = { products: [], orders: [] }
  }

  db.data ||= {
    products: [
      {
        id: 'croissant-bliss',
        name: 'Signature Butter Croissant',
        category: 'Pastries',
        price: 1700,
        description: 'Flaky, golden, and layered with signature butter.',
        image:
          'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=700&q=80',
        available: true,
      },
      {
        id: 'cinnamon-roll',
        name: 'Cinnamon Spice Roll',
        category: 'Pastries',
        price: 1500,
        description: 'Soft dough with warm cinnamon sugar and caramel glaze.',
        image:
          'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=700&q=80',
        available: true,
      },
      {
        id: 'latte-smooth',
        name: 'Velvet Cardamom Latte',
        category: 'Drinks',
        price: 1400,
        description: 'Creamy espresso with nutty cardamom and golden milk foam.',
        image:
          'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=700&q=80',
        available: true,
      },
      {
        id: 'matcha-cool',
        name: 'Iced Matcha Shake',
        category: 'Drinks',
        price: 1300,
        description: 'Bright green matcha, milk, and a splash of honey.',
        image:
          'https://images.unsplash.com/photo-1521305916504-4a1121188589?auto=format&fit=crop&w=700&q=80',
        available: true,
      },
      {
        id: 'pastry-pair',
        name: 'Morning Pastry Pair',
        category: 'Combos',
        price: 3200,
        description: 'Two pastries and your choice of latte or juice.',
        image:
          'https://images.unsplash.com/photo-1512058564366-c9e2f6833d87?auto=format&fit=crop&w=700&q=80',
        available: true,
      },
      {
        id: 'sunrise-box',
        name: 'Sunrise Brunch Box',
        category: 'Combos',
        price: 5200,
        description: 'Croissant, fruit parfait, espresso, plus special juice.',
        image:
          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=700&q=80',
        available: true,
      },
      {
        id: 'weekend-slice',
        name: 'Weekend Cheesecake Slice',
        category: 'Specials',
        price: 2200,
        description: 'Rich cheesecake with caramel drizzle and roasted nuts.',
        image:
          'https://images.unsplash.com/photo-1546554137-f86b9593a222?auto=format&fit=crop&w=700&q=80',
        available: true,
      },
      {
        id: 'ginger-espresso',
        name: 'Ginger Espresso Tonic',
        category: 'Specials',
        price: 1800,
        description: 'Sparkling tonic, espresso shot, and fresh ginger twist.',
        image:
          'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=700&q=80',
        available: true,
      },
    ],
    orders: [],
  }
  await db.write()
}

function getOrderStatusLabel(status) {
  switch (status) {
    case 'pending':
      return 'Pending payment'
    case 'payment_received':
      return 'Payment received'
    case 'confirmed':
      return 'Confirmed'
    case 'ready':
      return 'Ready for pickup'
    case 'completed':
      return 'Completed'
    default:
      return status
  }
}

function formatCurrency(amount) {
  return `₦${Number(amount).toLocaleString('en-NG')}`
}

function buildOrderItemsHtml(items) {
  if (!items || !items.length) return '<p>No items listed.</p>'
  const rows = items
    .map(
      (item) => `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.name}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatCurrency(item.price)}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatCurrency(item.price * item.quantity)}</td>
        </tr>
      `,
    )
    .join('')

  return `
    <table style="border-collapse: collapse; width: 100%; margin-top: 16px;">
      <thead>
        <tr>
          <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Item</th>
          <th style="padding: 8px; border: 1px solid #ddd;">Qty</th>
          <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Unit</th>
          <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `
}

async function sendOrderConfirmationEmail(order) {
  const to = order.customer?.email
  if (!to) {
    return { status: 'skipped', reason: 'missing-recipient' }
  }
  const transporter = await getEmailTransporter()
  if (!transporter) {
    return { status: 'skipped', reason: 'email-not-configured' }
  }
  const subject = `WedDee’s Bistro Order ${order.receiptNumber || order.id} Receipt`
  const html = `
    <div style="font-family: Arial, sans-serif; color: #343a40;">
      <h2>WedDee’s Signature Bistro</h2>
      <p>Your order <strong>${order.receiptNumber || order.id}</strong> has been received.</p>
      <p>Status: <strong>${getOrderStatusLabel(order.status)}</strong></p>
      <p>Payment method: <strong>${order.paymentMethod === 'cod' ? 'Pay on Delivery' : order.paymentMethod || 'Online payment'}</strong></p>
      <p>Delivery method: <strong>${order.checkoutMode === 'pickup' ? 'Pickup' : 'Delivery'}</strong></p>
      <p>Customer email: <strong>${order.customer.email}</strong></p>
      <p>Customer phone: <strong>${order.customer.contact}</strong></p>
      <p>Order receipt is below for your records.</p>
      <div style="margin: 16px 0; padding: 16px; background: #f8f9fa; border-radius: 8px;">
        <p><strong>Receipt Number:</strong> ${order.receiptNumber || order.id}</p>
        <p><strong>Order total:</strong> ${formatCurrency(order.total)}</p>
        <p><strong>Taxes:</strong> ${formatCurrency(order.taxes)}</p>
        <p><strong>Delivery fee:</strong> ${formatCurrency(order.deliveryFee || 0)}</p>
        ${order.checkoutMode === 'delivery' ? `<p><strong>Delivery address:</strong> ${order.deliveryAddress || 'Not provided'}</p>` : ''}
        ${order.deliveryNotes ? `<p><strong>Delivery notes:</strong> ${order.deliveryNotes}</p>` : ''}
      </div>
      ${buildOrderItemsHtml(order.items)}
      <div style="margin-top: 16px;">
        <p><strong>Thank you for ordering from WedDee’s Signature Bistro.</strong></p>
        <p>If you have any questions about your order, reply to this email or contact our team.</p>
      </div>
    </div>
  `

  try {
    const info = await transporter.sendMail({
      from: 'WedDee’s Signature Bistro <no-reply@weddee.com>',
      to,
      subject,
      html,
    })

    if (nodemailer.getTestMessageUrl(info)) {
      console.log('Preview email:', nodemailer.getTestMessageUrl(info))
    }
    return { status: 'sent' }
  } catch (error) {
    console.warn(`Order email could not be sent for ${order.receiptNumber || order.id}: ${error.message}`)
    return { status: 'failed', reason: error.message }
  }
}

const app = express()
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(uploadDir))

function requireAdmin(req, res, next) {
  const auth = req.headers.authorization || ''
  const [, token] = auth.split(' ')
  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  next()
}

app.post('/api/upload', requireAdmin, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' })
  }
  const imageUrl = `/uploads/${req.file.filename}`
  res.json({ imageUrl })
})

app.use((err, req, res, next) => {
  if (err && (err instanceof multer.MulterError || err.message === 'Only image files are allowed.')) {
    return res.status(400).json({ error: err.message })
  }
  next(err)
})

app.get('/api/products', async (req, res) => {
  await db.read()
  const category = req.query.category || 'All'
  const search = (req.query.search || '').toLowerCase()
  let products = db.data.products.filter((item) => item.available !== false)
  if (category && category !== 'All') {
    products = products.filter((item) => item.category === category)
  }
  if (search) {
    products = products.filter(
      (item) =>
        item.name.toLowerCase().includes(search) ||
        item.description.toLowerCase().includes(search) ||
        item.category.toLowerCase().includes(search),
    )
  }
  res.json({ products })
})

app.post('/api/products', requireAdmin, async (req, res) => {
  const { name, category, price, description, image } = req.body
  if (!name || !category || !price) {
    return res.status(400).json({ error: 'Name, category and price are required.' })
  }
  await db.read()
  const id = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`
  const product = {
    id,
    name,
    category,
    price: Number(price),
    description: description || '',
    image:
      image ||
      'https://images.unsplash.com/photo-1512058564366-c9e2f6833d87?auto=format&fit=crop&w=700&q=80',
    available: true,
  }
  db.data.products.unshift(product)
  await db.write()
  res.status(201).json({ product })
})

app.delete('/api/products/:id', requireAdmin, async (req, res) => {
  await db.read()
  const id = req.params.id
  const existing = db.data.products.find((item) => item.id === id)
  if (!existing) {
    return res.status(404).json({ error: 'Product not found.' })
  }
  db.data.products = db.data.products.filter((item) => item.id !== id)
  await db.write()
  res.json({ success: true })
})

app.post('/api/admin/login', async (req, res) => {
  const { password } = req.body
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  return res.json({ token: ADMIN_TOKEN })
})

app.get('/api/admin/orders', requireAdmin, async (req, res) => {
  await db.read()
  const status = req.query.status
  let orders = db.data.orders
  if (status) {
    orders = orders.filter((order) => order.status === status)
  }
  res.json({ orders })
})

app.get('/api/orders/:id', async (req, res) => {
  await db.read()
  const order = db.data.orders.find((order) => order.id === req.params.id)
  if (!order) {
    return res.status(404).json({ error: 'Order not found.' })
  }
  res.json({ order })
})

app.get('/api/customer/orders', async (req, res) => {
  const { email } = req.query
  if (!email) {
    return res.status(400).json({ error: 'Customer email is required.' })
  }

  await db.read()
  const customerOrders = db.data.orders.filter((order) =>
    order.customer?.email === email && order.paymentConfirmed
  ).sort((a, b) => b.createdAt - a.createdAt)

  res.json({ orders: customerOrders })
})

app.post('/api/orders', async (req, res) => {
  const { customer, items, checkoutMode, pickupTime, deliveryAddress, deliveryNotes, paymentMethod, subtotal, taxes, deliveryFee, total } = req.body
  if (!customer?.name || !customer?.email || !customer?.contact || !items?.length) {
    return res.status(400).json({ error: 'Customer name, email, contact, and items are required.' })
  }

  await db.read()
  const reference = `WD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
  const receiptNumber = `WSB-${new Date().getFullYear()}-${String(db.data.orders.length + 1).padStart(3, '0')}`
  const order = {
    id: `ORD-${Date.now().toString(36).toUpperCase()}`,
    receiptNumber,
    createdAt: Date.now(),
    checkoutMode,
    pickupTime: checkoutMode === 'pickup' ? pickupTime : null,
    deliveryAddress: checkoutMode === 'delivery' ? deliveryAddress : null,
    deliveryNotes: checkoutMode === 'delivery' ? deliveryNotes : null,
    customer,
    items,
    subtotal,
    taxes,
    deliveryFee: deliveryFee || 0,
    total,
    paymentMethod,
    paymentConfirmed: paymentMethod === 'cod', // Pay on delivery is confirmed immediately
    paymentReference: reference,
    status: paymentMethod === 'cod' ? 'confirmed' : 'pending', // Pay on delivery starts as confirmed
    lastStatusEmailSent: paymentMethod === 'cod' ? 'confirmed' : null,
  }
  db.data.orders.unshift(order)
  await db.write()

  // Send receipt email for pay on delivery immediately
  if (paymentMethod === 'cod') {
    const emailDelivery = await sendOrderConfirmationEmail(order)
    return res.json({ order, emailDelivery })
  }

  
  
  
  if (!PAYSTACK_SECRET_KEY) {
    order.paymentConfirmed = true
    order.status = 'payment_received'
    order.lastStatusEmailSent = order.status
    await db.write()
    const emailDelivery = await sendOrderConfirmationEmail(order)
    return res.json({
      order,
      emailDelivery,
      authorization_url: null,
      message:
        'Paystack is not configured. Set PAYSTACK_SECRET_KEY in .env to enable live payment integration.',
    })
  }

  const callbackUrl = buildCallbackUrl(req.body.callbackUrl || PAYSTACK_CALLBACK_URL, reference)
  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: customer.email,
      amount: Math.round(total * 100),
      reference,
      callback_url: callbackUrl,
      metadata: {
        order_id: order.id,
        account_name: 'Opay Richmond Effiom, Henshaw',
        account_number: '7079332442',
      },
    }),
  })

  const data = await response.json()
  if (!data.status) {
    return res.status(502).json({ error: 'Paystack initialization failed', detail: data })
  }

  return res.json({ order, authorization_url: data.data.authorization_url, reference })
})

app.get('/api/paystack/verify', async (req, res) => {
  const { reference } = req.query
  if (!reference) {
    return res.status(400).json({ error: 'Missing reference' })
  }
  if (!PAYSTACK_SECRET_KEY) {
    return res.status(500).json({ error: 'Paystack secret not configured' })
  }

  const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    },
  })
  const data = await response.json()
  if (!data.status) {
    return res.status(502).json({ error: 'Paystack verification failed', detail: data })
  }
  const paymentInfo = data.data
  if (paymentInfo.status !== 'success') {
    return res.status(400).json({ error: 'Payment is not completed', paymentInfo })
  }

  await db.read()
  let order = db.data.orders.find((order) => order.paymentReference === reference)
  if (!order && paymentInfo.metadata?.order_id) {
    order = db.data.orders.find((order) => order.id === paymentInfo.metadata.order_id)
  }

  if (!order) {
    return res.status(404).json({ error: 'Order not found for reference' })
  }

  order.paymentConfirmed = true
  order.status = 'payment_received'
  order.paymentReference = paymentInfo.reference || order.paymentReference
  order.paymentMethod = paymentInfo.authorization
    ? `${paymentInfo.authorization.channel} (${paymentInfo.authorization.brand || 'Card'} ending in ${paymentInfo.authorization.last4})`
    : `Paid via ${paymentInfo.gateway || 'Paystack'}`
  order.paidAt = paymentInfo.paid_at || Date.now()
  order.lastStatusEmailSent = order.status
  await db.write()

  const emailDelivery = await sendOrderConfirmationEmail(order)

  res.json({ order, emailDelivery })
})

app.post('/api/orders/:id/status', requireAdmin, async (req, res) => {
  const { status } = req.body
  if (!status) {
    return res.status(400).json({ error: 'Status is required' })
  }
  await db.read()
  const order = db.data.orders.find((order) => order.id === req.params.id)
  if (!order) {
    return res.status(404).json({ error: 'Order not found' })
  }
  order.status = status
  const shouldSendEmail =
    order.paymentConfirmed &&
    ['confirmed', 'ready', 'completed'].includes(status) &&
    order.lastStatusEmailSent !== status

  if (shouldSendEmail) {
    await sendOrderConfirmationEmail(order)
    order.lastStatusEmailSent = status
  }

  await db.write()
  res.json({ order })
})

const server = app.listen(PORT, async () => {
  await initDb()
  console.log(`Backend running on http://localhost:${PORT}`)
})

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please stop the process using that port or set a different PORT in your .env file.`)
  } else {
    console.error('Server failed to start:', error)
  }
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason)
})

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error)
  process.exit(1)
})
