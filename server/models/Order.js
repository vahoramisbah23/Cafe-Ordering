import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: false,
    },
    name: {
      type: String,
      required: [true, 'Item name is required'],
    },
    price: {
      type: Number,
      required: [true, 'Item price is required'],
      min: 0,
    },
    quantity: {
      type: Number,
      required: [true, 'Item quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    image: {
      type: String,
      default: '',
    },
  },
  { _id: true }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customer: {
      name: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true,
      },
      email: {
        type: String,
        required: [true, 'Customer email is required'],
        trim: true,
        lowercase: true,
      },
      phone: {
        type: String,
        required: [true, 'Customer phone number is required'],
        trim: true,
      },
      diningOption: {
        type: String,
        enum: ['Dine-In', 'Takeaway', 'Delivery'],
        default: 'Dine-In',
      },
      tableNumber: {
        type: String,
        default: '',
      },
      deliveryAddress: {
        type: String,
        default: '',
      },
      notes: {
        type: String,
        default: '',
      },
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'Order must contain at least one item',
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: 0,
    },
    status: {
      type: String,
      enum: ['Placed', 'Pending', 'Brewing', 'Preparing', 'Ready', 'Completed', 'Cancelled'],
      default: 'Placed',
    },
    paymentMethod: {
      type: String,
      default: 'UPI (GPay / PhonePe / Paytm)',
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid'],
      default: 'Paid',
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;
