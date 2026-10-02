import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  UtensilsCrossed, Plus, ShoppingBag, Clock, CheckCircle2, 
  Trash2, Edit3, Sparkles, AlertCircle, Search, Filter, 
  ChefHat, Layers, Check, X, ArrowRight
} from 'lucide-react';

export default function CanteenModule({ mode = 'student' }) { // 'student' or 'staff'
  const { token, user } = useAuth();
  const [menuItems, setMenuItems] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(mode === 'staff' ? 'orders' : 'menu'); // 'menu', 'my-orders', 'orders', 'manage-menu'
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // Cart State (for students)
  const [cart, setCart] = useState({}); // { [itemId]: { item, quantity } }
  const [orderNotes, setOrderNotes] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);

  // Staff Modals
  const [showAddFoodModal, setShowAddFoodModal] = useState(false);
  const [showEditFoodModal, setShowEditFoodModal] = useState(false);
  const [selectedFoodItem, setSelectedFoodItem] = useState(null);

  const [foodForm, setFoodForm] = useState({
    name: '',
    description: '',
    price: 50,
    category: 'Main Course',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    isAvailable: 1
  });

  const categories = ['All', 'Main Course', 'Breakfast', 'Snacks', 'Beverages', 'Dessert'];

  const loadMenu = async () => {
    try {
      const res = await fetch(`/api/canteen/menu?category=${categoryFilter}&search=${encodeURIComponent(searchQuery)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMenuItems(data.items || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadMyOrders = async () => {
    try {
      const res = await fetch('/api/canteen/my-orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMyOrders(data.orders || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadAllOrders = async () => {
    try {
      const res = await fetch('/api/canteen/all-orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAllOrders(data.orders || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const reloadData = async () => {
    setLoading(true);
    await Promise.all([
      loadMenu(),
      mode === 'student' ? loadMyOrders() : loadAllOrders()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    reloadData();
  }, [categoryFilter, searchQuery]);

  // Cart operations
  const addToCart = (item) => {
    setCart(prev => {
      const currentQty = prev[item.id]?.quantity || 0;
      return {
        ...prev,
        [item.id]: { item, quantity: currentQty + 1 }
      };
    });
  };

  const updateCartQuantity = (itemId, qty) => {
    if (qty <= 0) {
      setCart(prev => {
        const updated = { ...prev };
        delete updated[itemId];
        return updated;
      });
    } else {
      setCart(prev => ({
        ...prev,
        [itemId]: { ...prev[itemId], quantity: qty }
      }));
    }
  };

  const cartItems = Object.values(cart);
  const cartTotal = cartItems.reduce((sum, entry) => sum + (entry.item.price * entry.quantity), 0);

  // Place Order
  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;
    setPlacingOrder(true);
    setStatusMessage('');

    try {
      const payload = {
        items: cartItems.map(c => ({ itemId: c.item.id, quantity: c.quantity })),
        orderNotes,
        paymentMode: 'Campus Pay Card'
      };

      const res = await fetch('/api/canteen/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStatusMessage(`Order #${data.orderNumber} placed successfully! Total: ₹${data.totalAmount}`);
      setCart({});
      setOrderNotes('');
      setActiveTab('my-orders');
      loadMyOrders();
    } catch (err) {
      alert(err.message);
    } finally {
      setPlacingOrder(false);
    }
  };

  // Staff: Advance Order Status
  const handleUpdateOrderStatus = async (orderId, nextStatus) => {
    try {
      const res = await fetch(`/api/canteen/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStatusMessage(data.message);
      loadAllOrders();
    } catch (err) {
      alert(err.message);
    }
  };

  // Staff: Add Food Item
  const handleAddFood = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/canteen/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(foodForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStatusMessage(data.message);
      setShowAddFoodModal(false);
      setFoodForm({ name: '', description: '', price: 50, category: 'Main Course', imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400', isAvailable: 1 });
      loadMenu();
    } catch (err) {
      alert(err.message);
    }
  };

  // Staff: Edit Food Item
  const handleEditFood = async (e) => {
    e.preventDefault();
    if (!selectedFoodItem) return;
    try {
      const res = await fetch(`/api/canteen/items/${selectedFoodItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(selectedFoodItem)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStatusMessage(data.message);
      setShowEditFoodModal(false);
      loadMenu();
    } catch (err) {
      alert(err.message);
    }
  };

  // Staff: Toggle Availability
  const handleToggleAvailability = async (item) => {
    try {
      const res = await fetch(`/api/canteen/items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ isAvailable: item.is_available ? 0 : 1 })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      loadMenu();
    } catch (err) {
      alert(err.message);
    }
  };

  // Staff: Delete Food
  const handleDeleteFood = async (item) => {
    if (!confirm(`Delete "${item.name}" from canteen menu?`)) return;
    try {
      const res = await fetch(`/api/canteen/items/${item.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStatusMessage(data.message);
      loadMenu();
    } catch (err) {
      alert(err.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <span className="badge badge-parent"><Clock size={12} /> Pending</span>;
      case 'Confirmed':
        return <span className="badge badge-teacher"><Check size={12} /> Confirmed</span>;
      case 'Preparing':
        return <span className="badge" style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#facc15', borderColor: 'rgba(234, 179, 8, 0.3)' }}><ChefHat size={12} /> Preparing</span>;
      case 'Ready':
        return <span className="badge badge-student" style={{ animation: 'pulse 1.5s infinite' }}>🔔 Ready for Pickup</span>;
      case 'Completed':
        return <span className="badge badge-student"><CheckCircle2 size={12} /> Completed</span>;
      case 'Cancelled':
        return <span className="badge badge-overdue"><X size={12} /> Cancelled</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Sub-Navigation Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          {mode === 'student' ? (
            <>
              <button
                type="button"
                onClick={() => setActiveTab('menu')}
                className={`btn ${activeTab === 'menu' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: '10px' }}
              >
                <UtensilsCrossed size={16} />
                <span>Food Menu</span>
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('my-orders'); loadMyOrders(); }}
                className={`btn ${activeTab === 'my-orders' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: '10px', position: 'relative' }}
              >
                <Clock size={16} />
                <span>My Orders ({myOrders.length})</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => { setActiveTab('orders'); loadAllOrders(); }}
                className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: '10px' }}
              >
                <Clock size={16} />
                <span>Incoming Orders ({allOrders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled').length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('manage-menu')}
                className={`btn ${activeTab === 'manage-menu' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: '10px' }}
              >
                <Layers size={16} />
                <span>Menu Manager ({menuItems.length})</span>
              </button>
            </>
          )}
        </div>

        {mode === 'staff' && activeTab === 'manage-menu' && (
          <button
            type="button"
            onClick={() => setShowAddFoodModal(true)}
            className="btn btn-primary"
            style={{ borderRadius: '10px' }}
          >
            <Plus size={16} />
            <span>Add Food Item</span>
          </button>
        )}
      </div>

      {/* Success Notification */}
      {statusMessage && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '12px',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#34d399',
          fontSize: '0.9rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage('')} style={{ background: 'none', border: 'none', color: '#34d399', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* TAB 1: STUDENT FOOD MENU & CART */}
      {activeTab === 'menu' && (
        <div style={{ display: 'grid', gridTemplateColumns: cartItems.length > 0 ? '1fr 340px' : '1fr', gap: '24px', alignItems: 'start' }}>
          {/* Menu Catalog */}
          <div>
            {/* Category Pills & Search */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '38px' }}
                  placeholder="Search food by name..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {categories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className="btn"
                    style={{
                      padding: '6px 14px',
                      fontSize: '0.8rem',
                      borderRadius: '99px',
                      background: categoryFilter === cat ? 'var(--primary)' : 'rgba(255,255,255,0.04)',
                      color: categoryFilter === cat ? '#fff' : 'var(--text-muted)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Grid */}
            <div className="canteen-grid">
              {menuItems.map(item => {
                const inCartQty = cart[item.id]?.quantity || 0;
                return (
                  <div key={item.id} className="food-card">
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
                      alt={item.name}
                      className="food-card-img"
                    />
                    <div className="food-card-body">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>{item.name}</h4>
                        <span style={{ fontWeight: 800, color: '#f97316', fontSize: '1.05rem', whiteSpace: 'nowrap' }}>
                          ₹{item.price}
                        </span>
                      </div>

                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', flex: 1, marginBottom: '14px', lineHeight: 1.4 }}>
                        {item.description || 'Freshly prepared at the college canteen.'}
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="badge badge-secondary" style={{ fontSize: '0.68rem' }}>
                          {item.category}
                        </span>

                        {item.is_available ? (
                          inCartQty > 0 ? (
                            <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(249, 115, 22, 0.15)', borderRadius: '8px', padding: '2px 6px', gap: '8px' }}>
                              <button
                                type="button"
                                onClick={() => updateCartQuantity(item.id, inCartQty - 1)}
                                style={{ background: 'none', border: 'none', color: '#f97316', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer' }}
                              >
                                −
                              </button>
                              <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.88rem' }}>{inCartQty}</span>
                              <button
                                type="button"
                                onClick={() => updateCartQuantity(item.id, inCartQty + 1)}
                                style={{ background: 'none', border: 'none', color: '#f97316', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer' }}
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => addToCart(item)}
                              className="btn btn-primary"
                              style={{ padding: '6px 14px', fontSize: '0.8rem', borderRadius: '8px', background: '#f97316', borderColor: '#f97316' }}
                            >
                              <Plus size={14} /> Add
                            </button>
                          )
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600 }}>Sold Out</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cart Drawer Panel */}
          {cartItems.length > 0 && (
            <div className="glass-panel" style={{ padding: '22px', borderRadius: '18px', position: 'sticky', top: '90px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShoppingBag size={18} color="#f97316" /> My Food Cart
                </h3>
                <button
                  type="button"
                  onClick={() => setCart({})}
                  style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '0.78rem', cursor: 'pointer' }}
                >
                  Clear
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto', marginBottom: '16px' }}>
                {cartItems.map(({ item, quantity }) => (
                  <div key={item.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px'
                  }}>
                    <div style={{ minWidth: 0, flex: 1, paddingRight: '8px' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>₹{item.price} each</div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#1e293b', padding: '2px 6px', borderRadius: '6px' }}>
                        <button onClick={() => updateCartQuantity(item.id, quantity - 1)} style={{ background: 'none', border: 'none', color: '#f97316', cursor: 'pointer' }}>−</button>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>{quantity}</span>
                        <button onClick={() => updateCartQuantity(item.id, quantity + 1)} style={{ background: 'none', border: 'none', color: '#f97316', cursor: 'pointer' }}>+</button>
                      </div>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.88rem', minWidth: '45px', textAlign: 'right' }}>
                        ₹{item.price * quantity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="input-group" style={{ marginBottom: '14px' }}>
                <input
                  type="text"
                  className="form-control"
                  style={{ fontSize: '0.82rem' }}
                  placeholder="Order notes (e.g. extra spicy)..."
                  value={orderNotes}
                  onChange={e => setOrderNotes(e.target.value)}
                />
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>
                  <span>Total Amount</span>
                  <span style={{ color: '#f97316' }}>₹{cartTotal}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={placingOrder}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '10px', borderRadius: '10px', background: '#f97316', borderColor: '#f97316' }}
              >
                {placingOrder ? 'Placing Order...' : `Place Order (₹${cartTotal})`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: STUDENT MY ORDERS */}
      {activeTab === 'my-orders' && (
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>My Canteen Orders</h3>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Placed At</th>
                  <th>Items & Quantities</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {myOrders.map(o => (
                  <tr key={o.id}>
                    <td><strong style={{ color: 'var(--primary-light)' }}>{o.order_number}</strong></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{o.created_at}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {o.items?.map(i => (
                          <div key={i.id} style={{ fontSize: '0.84rem', color: '#fff' }}>
                            {i.item_name} <span style={{ color: '#f97316', fontWeight: 700 }}>×{i.quantity}</span> (₹{i.subtotal})
                          </div>
                        ))}
                      </div>
                    </td>
                    <td><strong style={{ color: '#34d399', fontSize: '0.95rem' }}>₹{o.total_amount}</strong></td>
                    <td>{getStatusBadge(o.status)}</td>
                  </tr>
                ))}
                {myOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      You have not placed any canteen orders yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: STAFF INCOMING ORDERS DESK */}
      {activeTab === 'orders' && (
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem' }}>Canteen Kitchen & Counter Orders Desk</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Track live orders and advance them: Pending $\rightarrow$ Confirmed $\rightarrow$ Preparing $\rightarrow$ Ready $\rightarrow$ Completed
              </p>
            </div>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Student & Section</th>
                  <th>Ordered Items</th>
                  <th>Total</th>
                  <th>Current Status</th>
                  <th style={{ textAlign: 'right' }}>Advance Workflow</th>
                </tr>
              </thead>
              <tbody>
                {allOrders.map(o => (
                  <tr key={o.id}>
                    <td><code style={{ color: 'var(--primary-light)', fontWeight: 700 }}>{o.order_number}</code></td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{o.student_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{o.class_name}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {o.items?.map(i => (
                          <div key={i.id} style={{ fontSize: '0.84rem', color: '#e2e8f0' }}>
                            {i.item_name} <strong style={{ color: '#f97316' }}>×{i.quantity}</strong>
                          </div>
                        ))}
                        {o.order_notes && (
                          <div style={{ fontSize: '0.75rem', color: '#fbbf24', fontStyle: 'italic', marginTop: '2px' }}>
                            Note: {o.order_notes}
                          </div>
                        )}
                      </div>
                    </td>
                    <td><strong style={{ color: '#34d399' }}>₹{o.total_amount}</strong></td>
                    <td>{getStatusBadge(o.status)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        {o.status === 'Pending' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateOrderStatus(o.id, 'Confirmed')}
                            className="btn btn-secondary"
                            style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                          >
                            Confirm
                          </button>
                        )}
                        {o.status === 'Confirmed' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateOrderStatus(o.id, 'Preparing')}
                            className="btn btn-secondary"
                            style={{ padding: '5px 10px', fontSize: '0.78rem', color: '#facc15' }}
                          >
                            Start Preparing
                          </button>
                        )}
                        {o.status === 'Preparing' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateOrderStatus(o.id, 'Ready')}
                            className="btn btn-primary"
                            style={{ padding: '5px 10px', fontSize: '0.78rem', background: '#f97316', borderColor: '#f97316' }}
                          >
                            Mark Ready 🔔
                          </button>
                        )}
                        {o.status === 'Ready' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateOrderStatus(o.id, 'Completed')}
                            className="btn btn-success"
                            style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                          >
                            Complete & Handover
                          </button>
                        )}
                        {o.status !== 'Completed' && o.status !== 'Cancelled' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateOrderStatus(o.id, 'Cancelled')}
                            className="btn btn-danger"
                            style={{ padding: '5px 8px', fontSize: '0.78rem' }}
                            title="Cancel Order"
                          >
                            <X size={12} />
                          </button>
                        )}
                        {o.status === 'Completed' && (
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Archived</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {allOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      No incoming canteen orders.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: STAFF MENU MANAGER */}
      {activeTab === 'manage-menu' && (
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px' }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Food Item</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Availability</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
                          alt={item.name}
                          style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, color: '#fff' }}>{item.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.description}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-secondary">{item.category}</span></td>
                    <td><strong style={{ color: '#f97316', fontSize: '0.95rem' }}>₹{item.price}</strong></td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleToggleAvailability(item)}
                        className={`btn ${item.is_available ? 'btn-success' : 'btn-danger'}`}
                        style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '6px' }}
                      >
                        {item.is_available ? 'In Stock' : 'Sold Out'}
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFoodItem({ ...item });
                            setShowEditFoodModal(true);
                          }}
                          className="btn btn-secondary"
                          style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                        >
                          <Edit3 size={13} /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteFood(item)}
                          className="btn btn-danger"
                          style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD FOOD MODAL */}
      {showAddFoodModal && (
        <div className="modal-overlay" onClick={() => setShowAddFoodModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.3rem' }}>Add Food Item to Canteen Menu</h3>
              <button onClick={() => setShowAddFoodModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleAddFood}>
              <div className="input-group">
                <label className="input-label">Food Name</label>
                <input type="text" className="form-control" placeholder="e.g. Paneer Butter Masala" value={foodForm.name} onChange={e => setFoodForm({ ...foodForm, name: e.target.value })} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label className="input-label">Price (₹)</label>
                  <input type="number" min="1" className="form-control" value={foodForm.price} onChange={e => setFoodForm({ ...foodForm, price: parseFloat(e.target.value) })} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Category</label>
                  <select className="form-control" value={foodForm.category} onChange={e => setFoodForm({ ...foodForm, category: e.target.value })}>
                    <option value="Main Course">Main Course</option>
                    <option value="Breakfast">Breakfast</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Dessert">Dessert</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Food Image URL</label>
                <input type="text" className="form-control" value={foodForm.imageUrl} onChange={e => setFoodForm({ ...foodForm, imageUrl: e.target.value })} />
              </div>

              <div className="input-group">
                <label className="input-label">Description</label>
                <textarea className="form-control" rows={2} placeholder="Brief ingredient or serving details..." value={foodForm.description} onChange={e => setFoodForm({ ...foodForm, description: e.target.value })} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowAddFoodModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Add Item</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT FOOD MODAL */}
      {showEditFoodModal && selectedFoodItem && (
        <div className="modal-overlay" onClick={() => setShowEditFoodModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.3rem' }}>Edit Food Item</h3>
              <button onClick={() => setShowEditFoodModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleEditFood}>
              <div className="input-group">
                <label className="input-label">Food Name</label>
                <input type="text" className="form-control" value={selectedFoodItem.name} onChange={e => setSelectedFoodItem({ ...selectedFoodItem, name: e.target.value })} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label className="input-label">Price (₹)</label>
                  <input type="number" min="1" className="form-control" value={selectedFoodItem.price} onChange={e => setSelectedFoodItem({ ...selectedFoodItem, price: parseFloat(e.target.value) })} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Category</label>
                  <select className="form-control" value={selectedFoodItem.category} onChange={e => setSelectedFoodItem({ ...selectedFoodItem, category: e.target.value })}>
                    <option value="Main Course">Main Course</option>
                    <option value="Breakfast">Breakfast</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Dessert">Dessert</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Food Image URL</label>
                <input type="text" className="form-control" value={selectedFoodItem.image_url} onChange={e => setSelectedFoodItem({ ...selectedFoodItem, image_url: e.target.value })} />
              </div>

              <div className="input-group">
                <label className="input-label">Description</label>
                <textarea className="form-control" rows={2} value={selectedFoodItem.description} onChange={e => setSelectedFoodItem({ ...selectedFoodItem, description: e.target.value })} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowEditFoodModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-success">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
