import Order from '../models/Order.js';

// Helper to generate readable Order Numbers like ORD-72941
const generateOrderNumber = () => {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  return `ORD-${randomSuffix}`;
};

// @desc    Place a new customer order
// @route   POST /api/orders
export const createOrder = async (req, res) => {
  try {
    const {
      customer,
      items,
      subtotal,
      tax = 0,
      deliveryFee = 0,
      discount = 0,
      totalAmount,
      paymentMethod = 'Credit/Debit Card',
    } = req.body;

    // Validate customer info
    if (!customer || !customer.name || !customer.email || !customer.phone) {
      return res.status(400).json({
        success: false,
        message: 'Customer name, email, and phone number are required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer.email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    // Validate items
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item',
      });
    }

    for (const item of items) {
      if (!item.name || typeof item.price !== 'number' || !item.quantity || item.quantity < 1) {
        return res.status(400).json({
          success: false,
          message: `Invalid order item: ${item.name || 'unnamed'}. Name, price, and valid quantity are required.`,
        });
      }
    }

    // Compute subtotal if not provided or verify
    const calculatedSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const finalSubtotal = subtotal !== undefined ? Number(subtotal) : calculatedSubtotal;
    const finalTotal = totalAmount !== undefined ? Number(totalAmount) : Number((finalSubtotal + tax + deliveryFee - discount).toFixed(2));

    const orderNumber = generateOrderNumber();

    const order = await Order.create({
      orderNumber,
      customer: {
        name: customer.name.trim(),
        email: customer.email.trim().toLowerCase(),
        phone: customer.phone.trim(),
        diningOption: customer.diningOption || 'Dine-In',
        tableNumber: customer.tableNumber ? customer.tableNumber.trim() : '',
        deliveryAddress: customer.deliveryAddress ? customer.deliveryAddress.trim() : '',
        notes: customer.notes ? customer.notes.trim() : '',
      },
      items,
      subtotal: Number(finalSubtotal.toFixed(2)),
      tax: Number(Number(tax).toFixed(2)),
      deliveryFee: Number(Number(deliveryFee).toFixed(2)),
      discount: Number(Number(discount).toFixed(2)),
      totalAmount: Number(finalTotal.toFixed(2)),
      status: 'Pending',
      paymentMethod,
      paymentStatus: 'Paid',
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      data: order,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to place order',
      error: error.message,
    });
  }
};

// @desc    Get all orders (with optional status, email, ids, or search filter)
// @route   GET /api/orders
export const getOrders = async (req, res) => {
  try {
    const { status, email, phone, ids, search } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    // Support matching by customer email or session order IDs
    if (email && ids) {
      const idList = ids.split(',').map((id) => id.trim()).filter(Boolean);
      query.$or = [
        { 'customer.email': email.toLowerCase().trim() },
        { _id: { $in: idList } },
      ];
    } else if (email) {
      query['customer.email'] = email.toLowerCase().trim();
    } else if (ids) {
      const idList = ids.split(',').map((id) => id.trim()).filter(Boolean);
      query._id = { $in: idList };
    }

    if (phone) {
      query['customer.phone'] = phone.trim();
    }

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search.trim(), $options: 'i' } },
        { 'customer.name': { $regex: search.trim(), $options: 'i' } },
        { 'customer.email': { $regex: search.trim(), $options: 'i' } },
        { 'customer.phone': { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve orders',
      error: error.message,
    });
  }
};

// @desc    Get single order by ID or orderNumber
// @route   GET /api/orders/:id
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    let order = null;
    if (id.startsWith('ORD-')) {
      order = await Order.findOne({ orderNumber: id });
    } else {
      order = await Order.findById(id);
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order not found with identifier: ${id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve order',
      error: error.message,
    });
  }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Placed', 'Pending', 'Brewing', 'Preparing', 'Ready', 'Completed', 'Cancelled'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order not found with id: ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message,
    });
  }
};

// @desc    Update order items or details (Admin add, update, remove items from customer order)
// @route   PUT /api/orders/:id
export const updateOrder = async (req, res) => {
  try {
    const { items, customer, status, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order not found with id: ${req.params.id}`,
      });
    }

    if (items && Array.isArray(items)) {
      if (items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Order must contain at least one item',
        });
      }

      order.items = items.map((item) => ({
        menuItem: item.menuItem,
        name: item.name,
        price: Number(item.price),
        quantity: Math.max(1, Number(item.quantity) || 1),
        image: item.image || '',
      }));

      // Recalculate subtotal, 5% GST, and total
      const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      order.subtotal = subtotal;

      const tax = Math.round(subtotal * 0.05); // 5% GST
      order.tax = tax;

      let deliveryFee = 0;
      if (order.customer?.diningOption === 'Delivery') {
        deliveryFee = subtotal >= 199 ? 0 : 25;
      }
      order.deliveryFee = deliveryFee;

      const discount = order.discount || 0;
      order.totalAmount = Math.max(0, subtotal + tax + deliveryFee - discount);
    }

    if (customer) {
      order.customer = { ...order.customer.toObject(), ...customer };
    }

    if (status) {
      order.status = status;
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    const updated = await order.save();

    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update order',
      error: error.message,
    });
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order not found with id: ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully',
      data: { id: req.params.id, orderNumber: order.orderNumber },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete order',
      error: error.message,
    });
  }
};
