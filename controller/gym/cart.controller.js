const Cart = require("../../model/Cart.model.js");
const Accessories = require("../../model/Accessories.model.js");

// accessories Enrollment
const addToCart = async (req, res) => {
  const { userId, accessoriesId, quantity } = req.body;

  try {
    // Validate input
    if (!userId || !accessoriesId || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "All fields are required and quantity must be positive",
      });
    }

    // Fetch accessories if accessoriesId is provided
    if (accessoriesId) {
      const accessories = await Accessories.findById(accessoriesId);
      if (!accessories) {
        return res.status(404).json({
          success: false,
          message: "Accessories not found",
        });
      }
    }

    // Find or create the cart
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }
    // Add accessories to cart if accessoriesId is provided
    if (accessoriesId) {
      const accessoriesIndex = cart.items.findIndex(
        (item) => item.accessoriesId?.toString() === accessoriesId?._id
      );

      if (accessoriesIndex === -1) {
        // Add new accessories to cart
        cart.items.push({ accessoriesId, quantity });
      } else {
        // Update quantity of existing accessories
        cart.items[accessoriesIndex].quantity += quantity;
      }
    }

    // Save the cart
    await cart.save();
    
    // Populate accessories details for response
    let populatedCart = await Cart.findById(cart._id).populate({
      path: "items.accessoriesId",
      select: "image title price offerPrice",
    });

    const cartItems = populatedCart.items.map((item) => ({
      accessoriesId: item.accessoriesId._id,
      image: item.accessoriesId.image,
      title: item.accessoriesId.title,
      price: item.accessoriesId.price,
      offerPrice: item.accessoriesId.offerPrice,
      quantity: item.quantity,
    }));

    res.status(201).json({
      success: true,
      cart: cartItems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "An error occurred",
    });
  }
};

//  fetch to cart for accessories
const fetchToCartAccessories = async (req, res) => {
  const { userId } = req.params;
  try {
    if (!userId) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const checkCart = await Cart.findOne({ userId });
    if (checkCart?._id) {
      const check = await Cart.find({
        "items.accessoriesId": { $exists: true },
      });
      let cart = await Cart.findOne({ userId }).populate({
        path: "items.accessoriesId",
        select: "image title price offerPrice",
      });
      if (!cart) {
        return res.status(404).json({
          success: false,
          message: "Cart not found",
        });
      }
      const validCartItems = cart.items.filter(
        (accessoriesItem) => accessoriesItem.accessoriesId
      );

      if (validCartItems.length < cart.items.length) {
        cart.items = validCartItems;
        await cart.save();
      }
      const populateCartItem = validCartItems.map((item) => ({
        accessoriesId: item.accessoriesId._id,
        image: item.accessoriesId.image,
        title: item.accessoriesId.title,
        price: item.accessoriesId.price,
        offerPrice: item.accessoriesId.offerPrice,
        quantity: item.quantity,
      }));
      res.status(200).json({
        success: true,
        data: {
          ...cart._doc,
          items: populateCartItem,
        },
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Some error are happend",
    });
  }
};

// update to cart
const updateToCart = async (req, res) => {
  const { userId, accessoriesId, quantity } = req.body;
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }
    const findCurrentProductIndex = cart.items.findIndex(
      (item) => item.accessoriesId._id.toString() === accessoriesId
    );
    if (findCurrentProductIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found!!",
      });
    }
    cart.items[findCurrentProductIndex].quantity = quantity;
    await cart.save();
    await cart.populate({
      path: "items.accessoriesId",
      select: "image title price offerPrice",
    });
    const populateCartItem = cart.items.map((item) => ({
      accessoriesId: item.accessoriesId ? item.accessoriesId._id : null,
      image: item.accessoriesId ? item.accessoriesId.image : null,
      title: item.accessoriesId
        ? item.accessoriesId.title
        : "Product not found",
      price: item.accessoriesId ? item.accessoriesId.price : null,
      offerPrice: item.accessoriesId ? item.accessoriesId.offerPrice : null,
      quantity: item.quantity,
    }));
    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populateCartItem,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Some error are happend",
    });
  }
};
// delete to cart
const deleteToCart = async (req, res) => {
  const { userId, accessoriesId } = req.params;
  try {
    if (!userId || !accessoriesId) {
      return res.status(404).json({
        success: false,
        message: "All fields are required",
      });
    }

    const cart = await Cart.findOne({ userId }).populate({
      path: "items.accessoriesId",
      select: "image title price offerPrice",
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Filter items
    cart.items = cart.items.filter(
      (item) =>
        item.accessoriesId &&
        item.accessoriesId._id.toString() !== accessoriesId
    );
    // Save the cart
    await cart.save();

    // Populate again after saving
    await cart.populate({
      path: "items.accessoriesId",
      select: "image title price offerPrice",
    });

    // Map populated cart items
    const populateCartItem = cart.items.map((item) => ({
      accessoriesId: item.accessoriesId ? item.accessoriesId._id : null,
      image: item.accessoriesId ? item.accessoriesId.image : null,
      title: item.accessoriesId
        ? item.accessoriesId.title
        : "Product not found",
      price: item.accessoriesId ? item.accessoriesId.price : null,
      offerPrice: item.accessoriesId ? item.accessoriesId.offerPrice : null,
      quantity: item.quantity,
    }));

    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populateCartItem,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "An error occurred",
    });
  }
};

module.exports = {
  addToCart,
  updateToCart,
  deleteToCart,
  fetchToCartAccessories,
};
