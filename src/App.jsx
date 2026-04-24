import { useEffect, useEffectEvent, useMemo, useRef, useState } from 'react'
import jsQR from 'jsqr'
import logo from './Socialicons.png'
import './App.css'

const _brand = {
  name: 'WedDee’s Signature Bistro',
  location: 'Calabar, Cross River State, Nigeria',
  highlight: 'Warm pours. Sweet moments.',
}

const categories = ['All', 'Pastries', 'Drinks', 'Combos', 'Specials']

const initialMenu = [
  {
    id: 'croissant-bliss',
    name: 'Signature Butter Croissant',
    category: 'Pastries',
    price: 1700,
    description: 'Flaky, golden, and layered with signature butter.',
    image:
      'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'cinnamon-roll',
    name: 'Cinnamon Spice Roll',
    category: 'Pastries',
    price: 1500,
    description: 'Soft dough with warm cinnamon sugar and caramel glaze.',
    image:
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'latte-smooth',
    name: 'Velvet Cardamom Latte',
    category: 'Drinks',
    price: 1400,
    description: 'Creamy espresso with nutty cardamom and golden milk foam.',
    image:
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'matcha-cool',
    name: 'Iced Matcha Shake',
    category: 'Drinks',
    price: 1300,
    description: 'Bright green matcha, milk, and a splash of honey.',
    image:
      'https://images.unsplash.com/photo-1521305916504-4a1121188589?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'pastry-pair',
    name: 'Morning Pastry Pair',
    category: 'Combos',
    price: 3200,
    description: 'Two pastries and your choice of latte or juice.',
    image:
      'https://images.unsplash.com/photo-1512058564366-c9e2f6833d87?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'sunrise-box',
    name: 'Sunrise Brunch Box',
    category: 'Combos',
    price: 5200,
    description: 'Croissant, fruit parfait, espresso, plus special juice.',
    image:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'weekend-slice',
    name: 'Weekend Cheesecake Slice',
    category: 'Specials',
    price: 2200,
    description: 'Rich cheesecake with caramel drizzle and roasted nuts.',
    image:
      'https://images.unsplash.com/photo-1546554137-f86b9593a222?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'ginger-espresso',
    name: 'Ginger Espresso Tonic',
    category: 'Specials',
    price: 1800,
    description: 'Sparkling tonic, espresso shot, and fresh ginger twist.',
    image:
      'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=700&q=80',
  },
]

const taxRate = 0.075

const deliveryFeesByArea = [
  { names: ['marian'], fee: 1000 },
  { names: ['ekorinim', 'mcc', 'old odukpani road', 'ikot ishie', 'mcc mobil', 'effio ete', 'moore road', 'parliamentary road', 'ikot ansa', 'watt', 'asari eso', 'akai effa'], fee: 1000 },
  { names: ['akai effa after orange resort'], fee: 1200 },
  { names: ['ettagbor', 'mary slessor', 'calabar calabar', 'satellite town', 'ibb', 'atu', 'mayne avenue', 'amika otuk', 'orok orok', 'goldie', 'uwanse', 'parliamentary extension', 'edibe edibe', 'anantiga'], fee: 1500 },
  { names: ['palm street', 'army junction', 'esuk otu/nta', 'cicc', 'habor', 'federal housing', 't junction', 'unical', 'atimbo', 'atamunu', 'ekpo abasi', 'musaha', 'technical round about', 'nyagasa', 'jebs', 'lemna', '8miles', '8 miles', 'ikot effanga', 'cent apartment', 'scanobo', 'tinapa'], fee: 2000 },
]

function getDeliveryFee(area) {
  if (!area) return 0

  const normalized = area.trim().toLowerCase()
  for (const zone of deliveryFeesByArea) {
    if (zone.names.some((name) => normalized.includes(name))) {
      return zone.fee
    }
  }

  return 2000
}

function formatNaira(value) {
  return `₦${value.toLocaleString('en-NG')}`
}

function _generateOrderId() {
  return `WD-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`
}

/* async function createReceiptPdf(order) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const margin = 40
  let y = 50

  try {
    const imageDataUrl = await loadImageAsDataUrl(logo)
    doc.addImage(imageDataUrl, 'PNG', 470, 20, 80, 40)
  } catch (error) {
    console.warn('Unable to add logo to receipt:', error)
  }

  try {
    const qrValue = order.id || order.receiptNumber || ''
    if (qrValue) {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qrValue)}`
      const qrDataUrl = await loadImageAsDataUrl(qrUrl)
      doc.addImage(qrDataUrl, 'PNG', 450, 90, 90, 90)
    }
  } catch (error) {
    console.warn('Unable to add QR code to receipt:', error)
  }

  doc.setFontSize(22)
  doc.text('Payment Receipt', margin, y)
  doc.setFontSize(10)
  doc.text('WedDee’s Signature Bistro', margin, y + 24)
  doc.text('Marian, Calabar, Cross River State, Nigeria', margin, y + 38)
  doc.text('Phone: +234 803 123 4567', margin, y + 52)
  doc.text('Email: support@weddee.com', margin, y + 66)

  doc.setLineWidth(0.5)
  doc.line(margin, y + 74, 555, y + 74)
  y += 90

  doc.setFontSize(12)
  doc.text(`Receipt No: ${order.receiptNumber || order.id}`, margin, y)
  doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`, 350, y)
  y += 18
  doc.text(`Payment Ref: ${order.paymentReference || 'N/A'}`, margin, y)
  doc.text(`Payment Method: ${order.paymentMethod === 'cod' ? 'Pay on Delivery' : (order.paymentMethod || 'Paystack')}`, 350, y)
  y += 18
  doc.text(`Status: ${order.status === 'payment_received' || (order.paymentMethod === 'cod' && order.status === 'confirmed') ? 'CONFIRMED' : order.status}`, margin, y)
  y += 18
  doc.text(`Customer: ${order.customer.name}`, margin, y)
  y += 18
  doc.text(`Contact: ${order.customer.contact}`, margin, y)
  y += 18
  if (order.checkoutMode === 'delivery') {
    doc.text(`Delivery area: ${order.deliveryAddress || 'Not provided'}`, margin, y)
    y += 18
    if (order.deliveryNotes) {
      doc.text(`Exact address: ${order.deliveryNotes}`, margin, y)
      y += 18
    }
  }

  y += 10
  doc.setLineWidth(0.5)
  doc.line(margin, y, 555, y)
  y += 16

  doc.setFontSize(11)
  doc.text('Item', margin, y)
  doc.text('Qty', 330, y)
  doc.text('Unit', 405, y)
  doc.text('Total', 490, y)
  y += 14
  doc.line(margin, y, 555, y)
  y += 12

  order.items.forEach((item) => {
    doc.text(item.name, margin, y)
    doc.text(String(item.quantity), 330, y)
    doc.text(formatNaira(item.price), 405, y)
    doc.text(formatNaira(item.price * item.quantity), 490, y)
    y += 16
  })

  y += 10
  doc.line(margin, y, 555, y)
  y += 18

  doc.text(`Subtotal`, 405, y)
  doc.text(formatNaira(order.subtotal), 490, y)
  y += 16
  doc.text(`VAT / Taxes`, 405, y)
  doc.text(formatNaira(order.taxes), 490, y)
  y += 16
  if (order.deliveryFee) {
    doc.text(`Delivery fee`, 405, y)
    doc.text(formatNaira(order.deliveryFee), 490, y)
    y += 16
  }

  doc.setFontSize(13)
  doc.text(`Total`, 405, y)
  doc.text(formatNaira(order.total), 490, y)
  y += 28

  doc.setFontSize(10)
  doc.text('Thank you for choosing WedDee’s. We hope you enjoy your meal.', margin, y)
  y += 14
  doc.text('Non-refundable once prepared. Please contact support for questions.', margin, y)

  doc.save(`${order.receiptNumber || order.id}-receipt.pdf`)
} */

function App() {
  const [menuItems, setMenuItems] = useState(() => {
    const stored = localStorage.getItem('weddee-menu')
    return stored ? JSON.parse(stored) : initialMenu
  })
  const [category, setCategory] = useState('All')
  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem('weddee-cart')
    return stored ? JSON.parse(stored) : []
  })
  const [view, setView] = useState('menu')
  const [showCart, setShowCart] = useState(false)
  const [_guestMode, _setGuestMode] = useState(true)
  const [user, setUser] = useState({ name: '', email: '', phone: '' })
  const [checkoutMode, setCheckoutMode] = useState('delivery')
  const [pickupTime, setPickupTime] = useState('10:00 AM')
  const [deliveryInfo, setDeliveryInfo] = useState({ area: '', details: '' })
  const [paymentStatus, setPaymentStatus] = useState('idle')
  const [orderResult, setOrderResult] = useState(null)
  const [receiptEmailStatus, setReceiptEmailStatus] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('online')
  const [orders, setOrders] = useState(() => {
    const stored = localStorage.getItem('weddee-orders')
    return stored ? JSON.parse(stored) : []
  })
  const [adminTab, setAdminTab] = useState('orders')
  const [menuEdit, setMenuEdit] = useState({ name: '', category: 'Pastries', price: '', description: '', imageFile: null })
  const [searchTerm, setSearchTerm] = useState('')
  const [adminToken, setAdminToken] = useState(null)
  const [adminPassword, setAdminPassword] = useState('')
  const [adminLoginError, setAdminLoginError] = useState('')
  const [adminLoading, setAdminLoading] = useState(false)
  const [adminNotifications, setAdminNotifications] = useState(() => Number(localStorage.getItem('weddee-admin-notifications') || 0))
  const [_notificationPermission, _setNotificationPermission] = useState(() => (typeof Notification !== 'undefined' ? Notification.permission : 'default'))
  const [_paymentReference, _setPaymentReference] = useState(null)
  const [showSuccessBanner, setShowSuccessBanner] = useState(false)
  const [customerOrders, setCustomerOrders] = useState([])
  const [showQrScanner, setShowQrScanner] = useState(false)
  const [scannerMessage, setScannerMessage] = useState('')
  const [scannerError, setScannerError] = useState('')
  const [scanResultOrder, setScanResultOrder] = useState(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const scanFrameRequestRef = useRef(null)
  const cameraStreamRef = useRef(null)

  const stopQrScanner = () => {
    if (scanFrameRequestRef.current) {
      cancelAnimationFrame(scanFrameRequestRef.current)
      scanFrameRequestRef.current = null
    }
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop())
      cameraStreamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  const normalizeScanValue = (value) => {
    const trimmed = String(value || '').trim()
    if (!trimmed) {
      return ''
    }
    if (trimmed.startsWith('http')) {
      try {
        const url = new URL(trimmed)
        return url.searchParams.get('data') || url.searchParams.get('q') || url.pathname || trimmed
      } catch {
        return trimmed
      }
    }
    return trimmed
  }

  const verifyScannedOrder = async (rawValue) => {
    const orderId = normalizeScanValue(rawValue)
    if (!orderId) {
      setScannerError('Scanned data is not a valid order identifier.')
      setScannerMessage('')
      return
    }

    setScannerError('')
    setScannerMessage(`Scanned order ${orderId}. Verifying payment...`)
    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}`)
      if (!response.ok) {
        setScannerError('Order not found for this QR code.')
        setScannerMessage('')
        return
      }
      const data = await response.json().catch(() => null)
      const order = data?.order
      if (!order) {
        setScannerError('Unable to read order details from the server.')
        setScannerMessage('')
        return
      }

      const verified = order.paymentConfirmed || ['payment_received', 'confirmed', 'ready', 'completed'].includes(order.status)
      setScanResultOrder(order)
      setScannerMessage(
        verified
          ? 'Payment verified for this order.'
          : 'Payment has not yet been completed for this order.'
      )
      if (adminToken && verified) {
        // Mark order as completed when QR is scanned and payment is verified
        await updateOrderStatus(order.id, 'Completed')
        setScannerMessage('Order marked as completed. Customer has received their order.')
      }
      if (adminToken) {
        await fetchAdminOrders()
      }
    } catch (error) {
      console.error('Verification error:', error)
      setScannerError('Unable to verify order. Please try again.')
      setScannerMessage('')
    }
  }

  const startQrScanner = useEffectEvent(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setScannerError('Camera access is not supported in this browser.')
      setScannerMessage('')
      return
    }

    setScannerError('')
    setScannerMessage('Starting camera. Point it at the receipt QR code.')
    setScanResultOrder(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      cameraStreamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.setAttribute('playsinline', 'true')
        await videoRef.current.play()
      }

      const scanLoop = () => {
        if (!videoRef.current || !canvasRef.current) {
          scanFrameRequestRef.current = requestAnimationFrame(scanLoop)
          return
        }

        const video = videoRef.current
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')
        if (!context) {
          setScannerError('Unable to initialize scanner.')
          setScannerMessage('')
          return
        }

        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          context.drawImage(video, 0, 0, canvas.width, canvas.height)
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
          const code = jsQR(imageData.data, imageData.width, imageData.height)
          if (code?.data) {
            stopQrScanner()
            verifyScannedOrder(code.data)
            return
          }
        }
        scanFrameRequestRef.current = requestAnimationFrame(scanLoop)
      }

      scanFrameRequestRef.current = requestAnimationFrame(scanLoop)
    } catch (error) {
      console.error('Camera error:', error)
      setScannerError('Camera access denied or unavailable.')
      setScannerMessage('')
      stopQrScanner()
    }
  })

  useEffect(() => {
    if (!showQrScanner) {
      stopQrScanner()
      return
    }

    startQrScanner()
    return () => {
      stopQrScanner()
    }
  }, [showQrScanner])

  useEffect(() => {
    localStorage.setItem('weddee-cart', JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    localStorage.setItem('weddee-orders', JSON.stringify(orders))
  }, [orders])

  useEffect(() => {
    localStorage.setItem('weddee-admin-notifications', String(adminNotifications))
  }, [adminNotifications])

  useEffect(() => {
    if (view === 'admin' && adminTab === 'orders' && adminNotifications > 0) {
      setAdminNotifications(0)
    }
  }, [view, adminTab, adminNotifications])

  useEffect(() => {
    if (showSuccessBanner) {
      const timer = setTimeout(() => setShowSuccessBanner(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [showSuccessBanner])

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/products')
      if (!response.ok) return
      const data = await response.json()
      setMenuItems(data.products)
    } catch (error) {
      console.error('Failed to fetch menu items', error)
    }
  }

  const requestNotificationPermission = async () => {
    if (typeof Notification === 'undefined') return 'denied'
    if (Notification.permission === 'granted') return 'granted'
    if (Notification.permission === 'denied') return 'denied'
    return Notification.requestPermission()
  }

  const showAdminOrderNotification = async (order) => {
    if (typeof Notification === 'undefined') return
    const permission = await requestNotificationPermission()
    if (permission !== 'granted') return

    try {
      new Notification('New order placed', {
        body: `${order.receiptNumber || order.id} • ${formatNaira(order.total)}`,
        icon: logo,
      })
    } catch (error) {
      console.error('Unable to show notification', error)
    }
  }

  const registerAdminOrderAlert = async (order) => {
    setAdminNotifications((count) => count + 1)
    if (!adminToken || view !== 'admin' || adminTab !== 'orders') {
      await showAdminOrderNotification(order)
    }
  }

  const fetchCustomerOrders = async () => {
    const customerEmail = localStorage.getItem('weddee-customer-email')
    if (!customerEmail) return

    try {
      const response = await fetch(`/api/customer/orders?email=${encodeURIComponent(customerEmail)}`)
      if (!response.ok) return
      const data = await response.json()
      setCustomerOrders(data.orders || [])
    } catch (error) {
      console.error('Failed to fetch customer orders', error)
    }
  }

  const fetchAdminOrders = async () => {
    if (!adminToken) return
    try {
      const response = await fetch('/api/admin/orders', {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      })
      if (!response.ok) {
        console.error('Failed to load admin orders', response.status)
        return
      }
      const data = await response.json()
      setOrders((data.orders || []).filter((order) => order.status !== 'completed'))
    } catch (error) {
      console.error('Failed to load admin orders', error)
    }
  }

  useEffect(() => {
    fetchMenuItems()
    fetchCustomerOrders()
    const params = new URLSearchParams(window.location.search)
    const reference = params.get('reference') || params.get('trxref') || localStorage.getItem('weddee-pending-reference')
    if (reference) {
      verifyPayment(reference)
    }
  }, [])

  useEffect(() => {
    if (view === 'admin' && adminToken) {
      fetchAdminOrders()
    }
    // fetchAdminOrders is also used from event handlers, so this effect intentionally
    // keys off the admin view/auth state instead of the function identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, adminToken])

  const filteredItems = useMemo(() => {
    let filtered = menuItems
    if (category !== 'All') {
      filtered = filtered.filter((item) => item.category === category)
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          item.description.toLowerCase().includes(term)
      )
    }
    return filtered
  }, [category, menuItems, searchTerm])

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const taxes = +(subtotal * taxRate).toFixed(0)
  const deliveryFee = checkoutMode === 'delivery' ? getDeliveryFee(deliveryInfo.area) : 0
  const total = subtotal + taxes + deliveryFee
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const addToCart = (menuItem) => {
    setCart((current) => {
      const existing = current.find((entry) => entry.id === menuItem.id)
      if (existing) {
        return current.map((entry) =>
          entry.id === menuItem.id
            ? { ...entry, quantity: entry.quantity + 1 }
            : entry,
        )
      }
      return [...current, { ...menuItem, quantity: 1 }]
    })
    setShowCart(true)
  }

  const updateQuantity = (id, value) => {
    if (value < 1) return
    setCart((current) =>
      current.map((entry) =>
        entry.id === id ? { ...entry, quantity: value } : entry,
      ),
    )
  }

  const removeFromCart = (id) => {
    setCart((current) => current.filter((entry) => entry.id !== id))
  }

  const verifyPayment = useEffectEvent(async (reference) => {
    setPaymentStatus('processing')
    try {
      const response = await fetch(`/api/paystack/verify?reference=${encodeURIComponent(reference)}`)
      const data = await response.json().catch(() => null)
      if (!response.ok || !data?.order) {
        console.error('Verify error', response.status, data)
        setPaymentStatus('idle')
        return
      }
      // Store customer email for order tracking
      localStorage.setItem('weddee-customer-email', data.order.customer.email)
      setOrderResult(data.order)
      setReceiptEmailStatus(data.emailDelivery || null)
      setOrders((current) => [data.order, ...current])
      setCart([])
      localStorage.removeItem('weddee-cart')
      setView('orders')
      setShowSuccessBanner(true)
      fetchCustomerOrders()
      const url = window.location.origin + window.location.pathname
      window.history.replaceState({}, '', url)
      localStorage.removeItem('weddee-pending-reference')
    } catch (error) {
      console.error('Payment verify failed', error)
      alert('Payment verification failed. Please try again.')
    } finally {
      setPaymentStatus('idle')
    }
  })

  const handleOrderSubmit = async () => {
    if (!cart.length) return
    if (!user.name.trim()) {
      return alert('Please enter your full name.')
    }
    if (!user.email.trim()) {
      return alert('Please enter your email address.')
    }
    if (!user.phone.trim()) {
      return alert('Please enter your phone number.')
    }
    if (checkoutMode === 'delivery' && !deliveryInfo.area.trim()) {
      return alert('Please select a delivery area from the notable locations.')
    }

    setPaymentStatus('processing')
    setReceiptEmailStatus(null)

    const payload = {
      customer: {
        name: user.name,
        email: user.email,
        contact: user.phone,
      },
      items: cart,
      checkoutMode,
      pickupTime: checkoutMode === 'pickup' ? pickupTime : null,
      deliveryAddress: checkoutMode === 'delivery' ? deliveryInfo.area : null,
      deliveryNotes: checkoutMode === 'delivery' ? deliveryInfo.details : null,
      paymentMethod,
      subtotal,
      taxes,
      deliveryFee,
      total,
    }

    const finalizeSuccessfulOrder = async (order, emailDelivery = null) => {
      setOrderResult(order)
      setReceiptEmailStatus(emailDelivery)
      setOrders((current) => [order, ...current])
      setCart([])
      localStorage.setItem('weddee-customer-email', order.customer.email)
      setView('confirmation')
      setShowCart(false)
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...payload,
          callbackUrl: window.location.origin,
        }),
      })
      if (!response.ok) {
        const errData = await response.json().catch(() => null)
        console.error('Order submit failed', errData)
        alert(errData?.error || 'Unable to place order. Please try again.')
        setPaymentStatus('idle')
        return
      }
      const data = await response.json()

      if (data.order) {
        registerAdminOrderAlert(data.order)
      }

      if (paymentMethod === 'cod') {
        // For pay on delivery, order is confirmed immediately
        await finalizeSuccessfulOrder(data.order, data.emailDelivery || null)
        fetchCustomerOrders()
      } else {
        // Online payment - redirect to Paystack
        if (data.authorization_url) {
          localStorage.setItem('weddee-pending-reference', data.reference)
          window.location.href = data.authorization_url
          return
        }
        await finalizeSuccessfulOrder(data.order, data.emailDelivery || null)
      }
    } catch (error) {
      console.error('Order submit error', error)
      alert('Unable to place order. Please try again.')
    } finally {
      setPaymentStatus('idle')
    }
  }

  const _toggleAuthMode = () => _setGuestMode((value) => !value)

  const checkoutButtonLabel = paymentStatus === 'processing' ? 'Processing…' : paymentMethod === 'cod' ? 'Place Order' : 'Pay securely'

  const orderVerificationUrl = orderResult
    ? `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(orderResult.id)}`
    : ''

  const addMenuItem = async () => {
    if (!menuEdit.name.trim() || !menuEdit.price.trim()) return

    let imageUrl = 'https://images.unsplash.com/photo-1512058564366-c9e2f6833d87?auto=format&fit=crop&w=700&q=80'

    if (menuEdit.imageFile) {
      if (!adminToken) {
        alert('You must be logged in as admin to upload images.')
        return
      }
      const formData = new FormData()
      formData.append('image', menuEdit.imageFile.file)
      try {
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
          body: formData,
        })
        if (!uploadResponse.ok) {
          const err = await uploadResponse.json().catch(() => null)
          console.error('Upload failed', err)
          alert(err?.error || 'Failed to upload image. Please try again.')
          return
        }
        const uploadData = await uploadResponse.json()
        imageUrl = uploadData.imageUrl
      } catch (error) {
        console.error('Upload error', error)
        alert('Failed to upload image. Please try again.')
        return
      }
    }

    const newMenu = {
      id: `${menuEdit.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
      name: menuEdit.name,
      category: menuEdit.category,
      description: menuEdit.description,
      price: Number(menuEdit.price),
      image: imageUrl,
    }

    if (adminToken) {
      try {
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify(newMenu),
        })
        if (!response.ok) {
          const err = await response.json().catch(() => null)
          console.error('Add product failed', err)
          alert(err?.error || 'Unable to save product. Please try again.')
          return
        }
        await fetchMenuItems()
      } catch (error) {
        console.error('Add product error', error)
        alert('Unable to save product. Please try again.')
        return
      }
    } else {
      setMenuItems((current) => [newMenu, ...current])
    }

    setMenuEdit({ name: '', category: 'Pastries', price: '', description: '', imageFile: null })
  }

  const updateOrderStatus = async (id, status) => {
    if (!adminToken) {
      alert('You must be logged in as admin to update order status.')
      return
    }

    try {
      const response = await fetch(`/api/orders/${id}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status: status.toLowerCase() }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        console.error('Update status failed', errorData)
        alert(errorData?.error || 'Unable to update order status.')
        return
      }

      const data = await response.json()
      if (status.toLowerCase() === 'completed') {
        setOrders((current) => current.filter((order) => order.id !== id))
      } else {
        setOrders((current) =>
          current.map((order) => (order.id === id ? { ...order, status: data.order.status } : order)),
        )
      }

      setCustomerOrders((current) =>
        current.map((order) => (order.id === id ? { ...order, status: data.order.status } : order)),
      )
      if (localStorage.getItem('weddee-customer-email')) {
        fetchCustomerOrders()
      }
    } catch (error) {
      console.error('Update order status error:', error)
      alert('Error updating order status')
    }
  }

  const deleteMenuItem = async (id) => {
    if (!adminToken) {
      alert('You must be logged in as admin to delete products.')
      return
    }
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      })
      if (response.ok) {
        await fetchMenuItems()
      } else {
        const errorData = await response.json().catch(() => null)
        console.error('Delete failed', errorData)
        alert(errorData?.error || 'Failed to delete product')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Error deleting product')
    }
  }

  const handleAdminLogin = async (e) => {
    e.preventDefault()
    setAdminLoading(true)
    setAdminLoginError('')
    const passwordValue = adminPassword.trim()
    if (!passwordValue) {
      setAdminLoginError('Enter your access key to continue.')
      setAdminLoading(false)
      return
    }
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordValue }),
      })
      if (!response.ok) {
        setAdminLoginError('Invalid access key. Please try again.')
        setAdminPassword('')
        return
      }
      const data = await response.json()
      setAdminToken(data.token)
      setAdminPassword('')
      setView('admin')
      await fetchAdminOrders()
    } catch (error) {
      setAdminLoginError('Unable to reach the admin server. Start the backend on port 4000 and try again.')
      setAdminPassword('')
      console.error(error)
    } finally {
      setAdminLoading(false)
    }
  }

  const handleAdminLogout = () => {
    setAdminToken(null)
    setAdminPassword('')
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <img className="brand-logo" src={logo} alt="WedDee’s signature logo" />
          <div>
            <p className="eyebrow">WedDee’s Signature Bistro</p>
            <p className="subtext">Menu-first ordering for warm cafés and sweet tables.</p>
          </div>
        </div>
        <nav className="top-actions">
          <button className="nav-button" onClick={() => {
            handleAdminLogout()
            setView('menu')
          }}>
            Menu
          </button>
          <button className="nav-button" onClick={() => setView('orders')}>
            My Orders
          </button>
          <button className="nav-button" onClick={() => setShowCart((value) => !value)}>
            Cart ({cartCount})
          </button>
          <button className="nav-button admin-button" onClick={() => {
            if (adminToken) {
              setView('admin')
            } else {
              setView('admin-login')
            }
          }}>
            Owner Dashboard
          </button>
        </nav>
      </header>

      <div className="hero-banner">
        <div>
          <p className="eyebrow">Calabar’s cozy pastry destination</p>
          <h1>
            Sweet ordering, speedy pickup, and calm delivery from WedDee’s.
          </h1>
          <p className="hero-copy">
            Start with the menu, build your order, and checkout with a receipt-ready confirmation.
          </p>
        </div>
        <div className="hero-panel">
          <span>Open today</span>
          <strong>7:00 AM – 8:30 PM</strong>
          <span>Location: Marian, Calabar</span>
        </div>
      </div>

      <main className="page-shell">
        {view === 'menu' && (
          <section className="menu-page">
            <div className="menu-headline">
              <div>
                <p className="eyebrow">Menu</p>
                <h2>Pick your favorites first.</h2>
              </div>
              <div className="menu-controls">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search menu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="category-tabs">
                {categories.map((item) => (
                  <button
                    key={item}
                    className={item === category ? 'filter-pill active' : 'filter-pill'}
                    onClick={() => setCategory(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            {showSuccessBanner && (
              <div className="success-banner">
                <p>🎉 Payment successful! Your order has been confirmed.</p>
                <button onClick={() => setShowSuccessBanner(false)}>×</button>
              </div>
            )}
            <div className="grid-list">
              {filteredItems.map((item) => (
                <article key={item.id} className="menu-card">
                  <div className="menu-image" style={{ backgroundImage: `url(${item.image})` }} />
                  <div className="menu-content">
                    <div>
                      <p className="category-tag">{item.category}</p>
                      <h3>{item.name}</h3>
                      <p className="item-copy">{item.description}</p>
                    </div>
                    <div className="menu-footer">
                      <strong>{formatNaira(item.price)}</strong>
                      <button className="add-button" onClick={() => addToCart(item)}>
                        Add to cart
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {view === 'checkout' && (
          <section className="checkout-page">
            <div className="checkout-intro">
              <p className="eyebrow">Checkout</p>
              <h2>Confirm your order and complete payment.</h2>
            </div>
            <div className="checkout-grid">
              <section className="checkout-panel">
                <div className="option-row">
                  <button
                    className="option-pill"
                    onClick={() => setCheckoutMode('pickup')}
                  >
                    Pickup
                  </button>
                  <button
                    className={checkoutMode === 'delivery' ? 'option-pill active' : 'option-pill'}
                    onClick={() => setCheckoutMode('delivery')}
                  >
                    Delivery
                  </button>
                </div>
                <p className="help-text" style={{ marginTop: '8px' }}>
                  Pickup is currently unavailable. Please use delivery and check back later.
                </p>
                <div className="checkout-card">
                  <div className="checkout-section">
                    <p className="section-label">Customer Details</p>
                    <div className="field-grid">
                      <label>
                        Full Name *
                        <input
                          type="text"
                          value={user.name}
                          onChange={(event) => setUser({ ...user, name: event.target.value })}
                          placeholder="Enter your full name"
                          required
                        />
                      </label>
                      <label>
                        Email Address *
                        <input
                          type="email"
                          value={user.email}
                          onChange={(event) => setUser({ ...user, email: event.target.value })}
                          placeholder="you@example.com"
                          required
                        />
                      </label>
                      <label>
                        Phone Number *
                        <input
                          type="tel"
                          value={user.phone}
                          onChange={(event) => setUser({ ...user, phone: event.target.value })}
                          placeholder="08012345678"
                          required
                        />
                      </label>
                    </div>
                    <p className="help-text">Required for order confirmation and delivery contact.</p>
                  </div>

                  {checkoutMode === 'pickup' && (
                    <div className="checkout-section pickup-info">
                      <p className="section-label">Pickup time</p>
                      <select value={pickupTime} onChange={(event) => setPickupTime(event.target.value)}>
                        <option>10:00 AM</option>
                        <option>10:30 AM</option>
                        <option>11:00 AM</option>
                        <option>11:30 AM</option>
                        <option>12:00 PM</option>
                        <option>12:30 PM</option>
                      </select>
                      <p className="help-text">Collect from Marian, Calabar at your scheduled time.</p>
                    </div>
                  )}

                  {checkoutMode === 'delivery' && (
                    <div className="checkout-section pickup-info">
                      <p className="section-label">Delivery details</p>
                      <label>
                        Delivery area
                        <input
                          type="text"
                          value={deliveryInfo.area}
                          onChange={(event) =>
                            setDeliveryInfo({ ...deliveryInfo, area: event.target.value })
                          }
                          placeholder="E.g. Marian, Ekorinim, Satellite Town"
                        />
                      </label>
                      <label>
                        Exact address / landmark
                        <textarea
                          value={deliveryInfo.details}
                          onChange={(event) =>
                            setDeliveryInfo({ ...deliveryInfo, details: event.target.value })
                          }
                          placeholder="House number, street, building, or landmark"
                        />
                      </label>
                      <p className="help-text">
                        These areas are the notable delivery zones. Use the exact address field to describe the full location.
                      </p>
                    </div>
                  )}

                  <div className="checkout-section payment-method-card">
                    <p className="section-label">Payment Method</p>
                    <div className="option-row">
                      <button
                        className={paymentMethod === 'online' ? 'option-pill active' : 'option-pill'}
                        onClick={() => setPaymentMethod('online')}
                      >
                        Pay Online
                      </button>
                      <button
                        className={paymentMethod === 'cod' ? 'option-pill active' : 'option-pill'}
                        onClick={() => setPaymentMethod('cod')}
                      >
                        Pay on Delivery
                      </button>
                    </div>
                    <p className="help-text">
                      {paymentMethod === 'online' 
                        ? 'Secure payment powered by Paystack' 
                        : 'Pay cash when your order is delivered or picked up'
                      }
                    </p>
                  </div>

                  <div className="checkout-section payment-card">
                    <p className="section-label">Complete Order</p>
                    <button className="primary-button" onClick={handleOrderSubmit} disabled={paymentStatus === 'processing'}>
                      {checkoutButtonLabel}
                    </button>
                  </div>
                </div>
              </section>

              <aside className="order-summary-card">
                <h3>Order summary</h3>
                {cart.map((item) => (
                  <div key={item.id} className="summary-line">
                    <div>
                      <strong>{item.name}</strong>
                      <p>{item.quantity} × {formatNaira(item.price)}</p>
                    </div>
                    <span>{formatNaira(item.price * item.quantity)}</span>
                  </div>
                ))}
                <div className="summary-divider" />
                <div className="summary-line total-line">
                  <span>Subtotal</span>
                  <strong>{formatNaira(subtotal)}</strong>
                </div>
                <div className="summary-line">
                  <span>Taxes</span>
                  <strong>{formatNaira(taxes)}</strong>
                </div>
                {checkoutMode === 'delivery' && deliveryFee > 0 && (
                  <div className="summary-line">
                    <span>Delivery fee</span>
                    <strong>{formatNaira(deliveryFee)}</strong>
                  </div>
                )}
                <div className="summary-line total-line">
                  <span>Total</span>
                  <strong>{formatNaira(total)}</strong>
                </div>
              </aside>
            </div>
          </section>
        )}

        {view === 'orders' && (
          <section className="orders-page">
            <div className="orders-container">
              <div className="orders-header">
                <p className="eyebrow">Order History</p>
                <h2>Your orders from WedDee’s</h2>
                <p>Track your order status and view past purchases.</p>
              </div>

              {customerOrders.length ? (
                <div className="orders-list">
                  {customerOrders.map((order) => (
                    <article key={order.id} className="order-history-card">
                      <div className="order-header">
                        <div>
                          <h3>Order {order.receiptNumber || order.id}</h3>
                          <p>{new Date(order.createdAt).toLocaleString()}</p>
                        </div>
                        <div className={`status-chip ${order.status === 'payment_received' || (order.paymentMethod === 'cod' && order.status === 'confirmed') ? 'paid' : order.status.toLowerCase()}`}>
                          {order.status === 'payment_received' || (order.paymentMethod === 'cod' && order.status === 'confirmed') ? 'CONFIRMED' : order.status}
                        </div>
                      </div>

                      <div className="order-items">
                        {order.items.map((item) => (
                          <div key={item.id} className="order-item">
                            <div>
                              <strong>{item.name}</strong>
                              <p>{item.quantity} × {formatNaira(item.price)}</p>
                            </div>
                            <span>{formatNaira(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="order-footer">
                        <div className="order-meta">
                          <span>{order.checkoutMode}</span>
                          <span>Total: {formatNaira(order.total)}</span>
                        </div>
                        <div className="order-actions">
                          <button className="secondary-button" onClick={() => {
                            setOrderResult(order)
                            setView('confirmation')
                          }}>
                            View Details
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-orders">
                  <p>No orders yet.</p>
                  <p>Your successful orders will appear here.</p>
                  <button className="primary-button" onClick={() => setView('menu')}>
                    Start Ordering
                  </button>
                </div>
              )}

              <div className="orders-actions">
                <button className="secondary-button" onClick={() => setView('menu')}>
                  Back to Menu
                </button>
              </div>
            </div>
          </section>
        )}

        {view === 'confirmation' && orderResult && (
          <section className="confirmation-page">
            <div className="confirmation-card">
              <div className={`status-chip ${orderResult.paymentMethod === 'cod' ? 'confirmed' : 'paid'}`}>
                {orderResult.paymentMethod === 'cod' ? 'ORDER CONFIRMED' : 'PAID'}
              </div>
              <h2>Order confirmed.</h2>
              <p>
                {orderResult.checkoutMode === 'pickup'
                  ? `Your order is ready for pickup at Marian, Calabar. ${orderResult.paymentMethod === 'cod' ? 'Please pay cash when you collect your order.' : ''}`
                  : `Your dispatch team will contact you shortly to complete delivery. ${orderResult.paymentMethod === 'cod' ? 'Please have cash ready for payment upon delivery.' : ''}`}
              </p>
              {receiptEmailStatus?.status === 'sent' && (
                <p className="help-text" style={{ marginTop: '8px' }}>
                  Your receipt has been sent to <strong>{orderResult.customer?.email}</strong>.
                </p>
              )}
              {receiptEmailStatus?.status === 'failed' && (
                <p className="help-text" style={{ marginTop: '8px' }}>
                  We confirmed your order, but the receipt email could not be delivered right now.
                </p>
              )}
              {receiptEmailStatus?.status === 'skipped' && (
                <p className="help-text" style={{ marginTop: '8px' }}>
                  Your order is confirmed, but email receipts are not configured on the server yet.
                </p>
              )}
              <div className="receipt-grid">
                <div>
                  <p className="receipt-label">Receipt No.</p>
                  <strong>{orderResult.receiptNumber || orderResult.id}</strong>
                </div>
                <div>
                  <p className="receipt-label">Payment ref</p>
                  <strong>{orderResult.paymentReference}</strong>
                </div>
                <div>
                  <p className="receipt-label">Amount {orderResult.paymentMethod === 'cod' ? 'due' : 'paid'}</p>
                  <strong>{formatNaira(orderResult.total)}</strong>
                </div>
                <div>
                  <p className="receipt-label">Payment method</p>
                  <strong>{orderResult.paymentMethod === 'cod' ? 'Pay on Delivery' : (orderResult.paymentMethod || 'Paystack')}</strong>
                </div>
              </div>
              <div className="receipt-actions">
                <button className="secondary-button" onClick={() => setView('orders')}>
                  View My Orders
                </button>
                <button className="secondary-button" onClick={() => setView('menu')}>
                  Back to menu
                </button>
              </div>
              <div className="verification-panel">
                <div>
                  <p className="receipt-label">Pickup / Delivery</p>
                  <strong>{orderResult.checkoutMode === 'pickup' ? 'Pickup' : 'Delivery'}</strong>
                </div>
                <img src={orderVerificationUrl} alt="Order QR code" />
              </div>
            </div>
          </section>
        )}

        {showQrScanner && (
          <div className="scanner-overlay">
            <div className="scanner-card">
              <div className="scanner-header">
                <div>
                  <p className="eyebrow">Receipt QR verification</p>
                  <h3>Scan customer receipt</h3>
                </div>
                <button className="close-button" onClick={() => setShowQrScanner(false)}>
                  ×
                </button>
              </div>
              <video ref={videoRef} className="scanner-video" playsInline muted />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              <p className="scanner-message">{scannerError || scannerMessage || 'Point the camera at the receipt QR code.'}</p>
              {scanResultOrder && (
                <div className="scanner-result">
                  <h4>Order scanned</h4>
                  <p><strong>Order:</strong> {scanResultOrder.receiptNumber || scanResultOrder.id}</p>
                  <p><strong>Status:</strong> {scanResultOrder.status}</p>
                  <p><strong>Total:</strong> {formatNaira(scanResultOrder.total)}</p>
                  <p><strong>Payment confirmed:</strong> {scanResultOrder.paymentConfirmed ? 'Yes' : 'No'}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'admin-login' && !
          adminToken && (
          <section className="admin-login-section">
            <div className="admin-login-container">
              <div className="admin-login-card">
                <h2>Owner Dashboard Login</h2>
                <p className="login-hint">Enter your access key to manage orders and menu</p>
                <form onSubmit={handleAdminLogin}>
                  <label>
                    Access Key
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Enter your key"
                      disabled={adminLoading}
                    />
                  </label>
                  {adminLoginError && (
                    <div className="error-message">{adminLoginError}</div>
                  )}
                  <button type="submit" className="primary-button" disabled={adminLoading}>
                    {adminLoading ? 'Verifying...' : 'Unlock Dashboard'}
                  </button>
                </form>
                <button
                  className="secondary-button"
                  onClick={() => setView('menu')}
                  style={{ marginTop: '12px' }}
                >
                  Back to menu
                </button>
              </div>
            </div>
          </section>
        )}

        {view === 'admin' && adminToken && (
          <section className="admin-page">
            <div className="admin-header">
              <div>
                <p className="eyebrow">Owner dashboard</p>
                <h2>Manage orders and menu items.</h2>
              </div>
              <div className="admin-header-actions">
                <button className="secondary-button" onClick={() => {
                  setScannerError('')
                  setScannerMessage('')
                  setScanResultOrder(null)
                  setShowQrScanner(true)
                }}>
                  Verify receipt QR
                </button>
                <button className="secondary-button" onClick={() => {
                  handleAdminLogout()
                  setView('menu')
                }}>
                  Return to storefront
                </button>
                <button className="danger-button" onClick={handleAdminLogout}>
                  Logout
                </button>
              </div>
            </div>
            {adminNotifications > 0 && (
              <div className="admin-notification-banner">
                {adminNotifications} new order{adminNotifications > 1 ? 's' : ''} placed while you were away. Check the Orders tab to review them.
              </div>
            )}
            <div className="admin-grid">
              <div className="admin-panel">
                <div className="admin-tabs">
                  <button className={adminTab === 'orders' ? 'tab active' : 'tab'} onClick={() => setAdminTab('orders')}>
                    Orders
                  </button>
                  <button className={adminTab === 'menu' ? 'tab active' : 'tab'} onClick={() => setAdminTab('menu')}>
                    Menu management
                  </button>
                </div>
                {adminTab === 'orders' ? (
                  <div className="order-list">
                    {orders.length ? orders.map((order) => (
                      <article key={order.id} className="order-card">
                        <div>
                          <h3>{order.id}</h3>
                          <p>{new Date(order.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="order-meta">
                          <span>{order.checkoutMode}</span>
                          <span>{order.status}</span>
                        </div>
                        <div className="order-actions">
                          {['Pending', 'Preparing', 'Ready', 'Completed'].map((status) => (
                            <button key={status} onClick={() => updateOrderStatus(order.id, status)}>
                              {status}
                            </button>
                          ))}
                        </div>
                      </article>
                    )) : <p className="empty-state">No orders yet. Orders appear here when customers pay.</p>}
                  </div>
                ) : (
                  <div className="menu-management">
                    <div className="menu-add-card">
                      <h3>Add new menu item</h3>
                      <label>
                        Name
                        <input value={menuEdit.name} onChange={(event) => setMenuEdit({ ...menuEdit, name: event.target.value })} />
                      </label>
                      <label>
                        Category
                        <select value={menuEdit.category} onChange={(event) => setMenuEdit({ ...menuEdit, category: event.target.value })}>
                          <option>Pastries</option>
                          <option>Drinks</option>
                          <option>Combos</option>
                          <option>Specials</option>
                        </select>
                      </label>
                      <label>
                        Price
                        <input type="number" value={menuEdit.price} onChange={(event) => setMenuEdit({ ...menuEdit, price: event.target.value })} />
                      </label>
                      <label>
                        Description
                        <textarea value={menuEdit.description} onChange={(event) => setMenuEdit({ ...menuEdit, description: event.target.value })} />
                      </label>
                      <label>
                        Upload image
                        <input
                          type="file"
                          accept="image/png, image/jpeg"
                          onChange={(event) => {
                            const file = event.target.files?.[0] || null
                            if (file) {
                              const reader = new FileReader()
                              reader.onload = (e) => {
                                setMenuEdit((current) => ({
                                  ...current,
                                  imageFile: { file, preview: e.target.result },
                                }))
                              }
                              reader.readAsDataURL(file)
                            } else {
                              setMenuEdit((current) => ({ ...current, imageFile: null }))
                            }
                          }}
                        />
                      </label>
                      <button className="primary-button" onClick={addMenuItem}>
                        Add item
                      </button>
                    </div>
                    <div className="existing-menu">
                      <h3>Current menu</h3>
                      {menuItems.map((item) => (
                        <div key={item.id} className="menu-item-row">
                          <div className="menu-item-info">
                            <strong>{item.name}</strong>
                            <span>{item.category}</span>
                            <span>{formatNaira(item.price)}</span>
                          </div>
                          <button className="delete-button" onClick={() => deleteMenuItem(item.id)}>
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      <aside className={showCart ? 'cart-drawer open' : 'cart-drawer'}>
        <div className="drawer-header">
          <div>
            <p className="eyebrow">Your Cart</p>
            <strong>{cartCount} items</strong>
          </div>
          <button className="close-button" onClick={() => setShowCart(false)}>
            ×
          </button>
        </div>
        <div className="drawer-body">
          {cart.length ? (
            cart.map((item) => (
              <div key={item.id} className="drawer-item">
                <div>
                  <p className="drawer-name">{item.name}</p>
                  <p className="drawer-copy">{formatNaira(item.price)} × {item.quantity}</p>
                </div>
                <div className="drawer-actions">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  <button className="remove-link" onClick={() => removeFromCart(item.id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-cart">
              <p>Your cart is empty.</p>
              <p>Tap any pastry or drink to add it.</p>
            </div>
          )}
        </div>
        {orderResult && (
          <div className="drawer-order-tracker">
            <h3>Order status</h3>
            <p><strong>Tracking ID:</strong> {orderResult.receiptNumber || orderResult.id}</p>
            <p><strong>Status:</strong> {orderResult.status}</p>
            <p><strong>Total:</strong> {formatNaira(orderResult.total)}</p>
            <button className="secondary-button" onClick={() => {
              setView('orders')
              setShowCart(false)
            }}>
              View all orders
            </button>
          </div>
        )}
        <div className="drawer-footer">
          <div className="summary-row">
            <span>Subtotal</span>
            <strong>{formatNaira(subtotal)}</strong>
          </div>
          <div className="summary-row">
            <span>Taxes</span>
            <strong>{formatNaira(taxes)}</strong>
          </div>
          <div className="summary-row total-row">
            <span>Total</span>
            <strong>{formatNaira(total)}</strong>
          </div>
          <button className="primary-button" disabled={!cart.length} onClick={() => {
            setView('checkout')
            setShowCart(false)
          }}>
            View cart & checkout
          </button>
        </div>
      </aside>
    </div>
  )
}

export default App
