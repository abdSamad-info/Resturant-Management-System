import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { Product } from '../types';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  UtensilsCrossed, 
  ToggleLeft, 
  ToggleRight, 
  Sparkle, 
  Coffee, 
  Flame,
  CheckCircle,
  XCircle,
  DollarSign,
  Undo2,
  X
} from 'lucide-react';

export default function Products() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'Main Course' | 'Beverages' | 'Bread' | 'Special'>('All');

  // Form toggles
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Deletion Custom Modal State
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);
  const [deleteConfirmationName, setDeleteConfirmationName] = useState('');

  // Add Product states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Main Course');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');

  // Edit Product states
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('Main Course');
  const [editPrice, setEditPrice] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIsAvailable, setEditIsAvailable] = useState(true);

  // Queries
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: apiService.getProducts,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: apiService.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      showSuccess(`Dish registered in Bistro menu registry.`);
      setIsAdding(false);
      resetAddForm();
    },
    onError: (err: any) => showError(err?.response?.data?.message || 'Failed to add product')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Product> }) => apiService.updateProduct(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      showSuccess(`Menu product was updated successfully.`);
      setEditingProduct(null);
    },
    onError: (err: any) => showError(err?.response?.data?.message || 'Failed to update product')
  });

  const deleteMutation = useMutation({
    mutationFn: apiService.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      showSuccess(`Product deleted permanently.`);
    },
    onError: (err: any) => showError(err?.response?.data?.message || 'Failed to delete product')
  });

  const resetAddForm = () => {
    setName('');
    setCategory('Main Course');
    setPrice('');
    setDescription('');
  };

  const startEdit = (prod: Product) => {
    setEditingProduct(prod);
    setEditName(prod.name);
    setEditCategory(prod.category);
    setEditPrice(String(prod.price));
    setEditDescription(prod.description || '');
    setEditIsAvailable(prod.isAvailable);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = Number(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      showError('Price must be a valid positive number.');
      return;
    }
    createMutation.mutate({
      name,
      category,
      price: parsedPrice,
      description
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const parsedPrice = Number(editPrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      showError('Price must be a valid positive number.');
      return;
    }
    updateMutation.mutate({
      id: editingProduct._id,
      payload: {
        name: editName,
        category: editCategory,
        price: parsedPrice,
        description: editDescription,
        isAvailable: editIsAvailable
      }
    });
  };

  const handleToggleAvailable = (prod: Product) => {
    updateMutation.mutate({
      id: prod._id,
      payload: { isAvailable: !prod.isAvailable }
    });
  };

  const handleDelete = (id: string, prodName: string) => {
    setDeleteConfirmationId(id);
    setDeleteConfirmationName(prodName);
  };

  const confirmDelete = () => {
    if (deleteConfirmationId) {
      deleteMutation.mutate(deleteConfirmationId, {
        onSuccess: () => {
          setDeleteConfirmationId(null);
          setDeleteConfirmationName('');
        }
      });
    }
  };

  // Perform memoized filtering logic natively to bypass server refetch overhead (High Performance useMemo)
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const matchSearch = prod.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (prod.description && prod.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchTab = activeTab === 'All' || prod.category === activeTab;
      return matchSearch && matchTab;
    });
  }, [products, searchTerm, activeTab]);

  const tabs: ('All' | 'Main Course' | 'Beverages' | 'Bread' | 'Special')[] = [
    'All',
    'Main Course',
    'Beverages',
    'Bread',
    'Special'
  ];

  return (
    <div className="space-y-8">
      {/* Delete confirmation custom modal overlay dialog */}
      {deleteConfirmationId && (
        <div id="delete-product-modal" className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1.5px] z-50 flex items-center justify-center animate-fade-in">
          <div className="bg-white p-6.5 rounded-3xl max-w-sm w-full border border-slate-100 shadow-xl space-y-4">
            <h3 className="font-display font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-rose-600 shrink-0" />
              <span>Remove Product?</span>
            </h3>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed font-sans">
              Are you sure you want to remove <strong className="text-slate-800">{deleteConfirmationName}</strong> permanently from the Bistro menu registry? This will affect current order lists using this item.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                id="btn-confirm-delete-cancel"
                onClick={() => {
                  setDeleteConfirmationId(null);
                  setDeleteConfirmationName('');
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-250 text-slate-700 text-xs font-bold rounded-xl py-2.5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-delete-purge"
                onClick={confirmDelete}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl py-2.5 transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Yes, Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-display font-extrabold text-slate-900 tracking-tight text-3xl">Menu & Dishes Registry</h1>
          <p className="text-xs text-slate-500 font-medium mt-1.5">Configure dish prices, category classifications, descriptions, and kitchen availability.</p>
        </div>
        <button
          id="btn-trigger-add-product"
          onClick={() => {
            setIsAdding(!isAdding);
            setEditingProduct(null);
          }}
          className="bg-[#166534] text-white rounded-xl px-4 py-2.5 hover:bg-[#11552a] active:bg-[#0c3e1e] shadow-sm text-xs font-bold flex items-center gap-2 self-start cursor-pointer transition-colors"
        >
          {isAdding ? <X className="h-4 w-4 shrink-0" /> : <Plus className="h-4 w-4 shrink-0" />}
          <span>{isAdding ? 'Close Panel' : 'Register Dish'}</span>
        </button>
      </div>

      {/* Add Product Drawer */}
      {isAdding && (
        <div id="add-product-panel" className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="font-display font-bold text-slate-800 text-base mb-4">Register New Dish</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Dish Name</label>
              <input
                id="input-product-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Mutton Biryani (Single Plate)"
                className="w-full text-sm border border-slate-200 hover:border-slate-300 focus:border-[#166534] focus:ring-1 focus:ring-[#166534]/15 rounded-xl p-2.5 outline-none transition-colors font-medium bg-slate-50/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Categorization</label>
              <select
                id="select-product-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-sm border border-slate-200 hover:border-slate-300 focus:border-[#166534] focus:ring-1 focus:ring-[#166534]/15 rounded-xl p-2.5 outline-none bg-white font-semibold transition-colors animate-none"
              >
                <option value="Main Course">Main Course</option>
                <option value="Beverages">Beverages</option>
                <option value="Bread">Bread</option>
                <option value="Special">Special</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Base Price (Rs.)</label>
              <input
                id="input-product-price"
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="650"
                className="w-full text-sm border border-slate-200 hover:border-slate-300 focus:border-[#166534] focus:ring-1 focus:ring-[#166534]/15 rounded-xl p-2.5 outline-none font-semibold transition-colors"
              />
            </div>
            <div className="space-y-1.5 md:col-span-3">
              <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Description (Optional)</label>
              <input
                id="input-product-desc"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe spices, serving style, ingredients..."
                className="w-full text-sm border border-slate-200 hover:border-slate-300 focus:border-[#166534] focus:ring-1 focus:ring-[#166534]/15 rounded-xl p-2.5 outline-none transition-colors font-medium"
              />
            </div>
            <div className="flex items-end">
              <button
                id="btn-submit-new-product"
                type="submit"
                className="w-full bg-[#166534] hover:bg-[#11552a] text-white rounded-xl py-2.5 shadow-sm font-bold text-xs cursor-pointer transition-colors"
              >
                Insert Dish Item
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Product Drawer */}
      {editingProduct && (
        <div id="edit-product-panel" className="bg-white p-6 rounded-3xl border-2 border-[#166534]/15 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-bold text-slate-800 text-base">Modify Dish Parameters: {editingProduct.name}</h3>
            <button onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-slate-655 p-1.5 hover:bg-slate-50 rounded-lg transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Dish Name</label>
              <input
                id="input-edit-product-name"
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full text-sm border border-slate-200 hover:border-slate-300 focus:border-[#166534] focus:ring-1 focus:ring-[#166534]/15 rounded-xl p-2.5 outline-none font-medium transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Category</label>
              <select
                id="select-edit-product-category"
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="w-full text-sm border border-slate-200 hover:border-slate-300 focus:border-[#166534] focus:ring-1 focus:ring-[#166534]/15 rounded-xl p-2.5 outline-none bg-white font-semibold transition-colors"
              >
                <option value="Main Course">Main Course</option>
                <option value="Beverages">Beverages</option>
                <option value="Bread">Bread</option>
                <option value="Special">Special</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Base Price (Rs.)</label>
              <input
                id="input-edit-product-price"
                type="number"
                required
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                className="w-full text-sm border border-slate-200 hover:border-slate-300 focus:border-[#166534] focus:ring-1 focus:ring-[#166534]/15 rounded-xl p-2.5 outline-none font-semibold transition-colors"
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Description</label>
              <input
                id="input-edit-product-desc"
                type="text"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full text-sm border border-slate-200 hover:border-slate-300 focus:border-[#166534] focus:ring-1 focus:ring-[#166534]/15 rounded-xl p-2.5 outline-none font-medium transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Kitchen Availability</label>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setEditIsAvailable(true)}
                  className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all cursor-pointer ${editIsAvailable ? 'bg-[#166534] text-white shadow-xs' : 'text-slate-550 hover:text-slate-700'}`}
                >
                  In stock
                </button>
                <button
                  type="button"
                  onClick={() => setEditIsAvailable(false)}
                  className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all cursor-pointer ${!editIsAvailable ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-550 hover:text-slate-700'}`}
                >
                  Out of stock
                </button>
              </div>
            </div>
            <div className="flex items-end">
              <button
                id="btn-edit-product-submit"
                type="submit"
                className="w-full bg-[#166534] hover:bg-[#11552a] text-white rounded-xl py-2.5 shadow-sm font-bold text-xs cursor-pointer transition-colors"
              >
                Apply Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Controls Container */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4 shrink-0" />
          <input
            id="product-search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search dish, description spice ratios..."
            className="w-full text-xs border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 outline-none hover:border-slate-350 focus:border-[#166534] focus:ring-1 focus:ring-[#166534]/10 transition-colors bg-slate-50/10 font-medium"
          />
        </div>
        
        {/* Responsive Horizontal Category Tabs */}
        <div id="product-tabs" className="flex overflow-x-auto w-full sm:w-auto gap-1 border-slate-100 pb-1 sm:pb-0">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-xs px-4 py-2 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${activeTab === tab ? 'bg-[#166534] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Products list grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(idx => (
            <div key={idx} className="bg-slate-50/10 border border-slate-200 rounded-3xl h-44 animate-pulse p-6" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white p-16 text-center border border-slate-200 rounded-3xl flex flex-col items-center justify-center shadow-xs">
          <UtensilsCrossed className="h-12 w-12 text-slate-300 mb-3 shrink-0" />
          <h4 className="font-bold text-slate-700 text-sm">No dishes match active search criteria.</h4>
          <p className="text-xs text-slate-400 max-w-sm mt-1">Verify filters or register a brand-new dish using the top header button.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((prod) => (
            <div 
              id={`product-card-${prod._id}`}
              key={prod._id} 
              className={`bg-white border p-6 rounded-3xl transition-all flex flex-col justify-between h-full min-h-[170px] relative ${!prod.isAvailable ? 'opacity-85 bg-slate-50/40 border-slate-200 shadow-none' : 'border-slate-205 shadow-sm hover:shadow-md'}`}
            >
              <div className="space-y-4">
                {/* Product header info */}
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-[#166534] font-bold bg-[#166534]/5 px-2 py-0.5 rounded-lg border border-[#166534]/10">
                      {prod.category}
                    </span>
                    <h4 className="font-display font-bold text-slate-900 text-base leading-tight mt-2.5 flex items-center gap-2">
                      <span>{prod.name}</span>
                    </h4>
                  </div>

                  {/* Actions Trash & Edit */}
                  <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 p-1 rounded-xl shrink-0">
                    <button
                      id={`btn-edit-product-${prod._id}`}
                      onClick={() => startEdit(prod)}
                      className="p-1.5 text-slate-500 hover:text-[#166534] hover:bg-white rounded-lg transition-colors cursor-pointer"
                      title="Edit dish"
                    >
                      <Edit3 className="h-4 w-4 shrink-0" />
                    </button>
                    <button
                      id={`btn-delete-product-${prod._id}`}
                      onClick={() => handleDelete(prod._id, prod.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-white rounded-lg transition-colors cursor-pointer"
                      title="Delete dish"
                    >
                      <Trash2 className="h-4 w-4 shrink-0" />
                    </button>
                  </div>
                </div>

                {prod.description ? (
                  <p className="text-xs text-slate-500 leading-relaxed font-sans font-medium">
                    {prod.description}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 italic font-medium">No description details logged.</p>
                )}
              </div>

              {/* Price & availability bar */}
              <div className="border-t border-slate-100 pt-4 mt-4 flex items-center justify-between gap-4">
                <div>
                  <span className="text-[9px] uppercase text-slate-400 font-bold tracking-wider block leading-none">Net Cost</span>
                  <span className="font-display font-extrabold text-slate-900 text-base mt-1 block">Rs. {prod.price}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold flex items-center gap-1 border rounded-lg px-2 py-0.5 ${prod.isAvailable ? 'text-[#166534] bg-[#166534]/5 border-[#166534]/10' : 'text-rose-600 bg-rose-50 border-rose-100'}`}>
                    {prod.isAvailable ? <CheckCircle className="h-3 w-3 inline shrink-0" /> : <XCircle className="h-3 w-3 inline shrink-0" />}
                    <span>{prod.isAvailable ? 'In stock' : 'OOS'}</span>
                  </span>

                  {/* quick toggle switch */}
                  <button
                    id={`toggle-availability-${prod._id}`}
                    onClick={() => handleToggleAvailable(prod)}
                    className="text-slate-400 hover:text-[#166534] transition-colors p-1"
                    title={prod.isAvailable ? "Set Out of Stock" : "Set In Stock"}
                  >
                    {prod.isAvailable ? (
                      <ToggleRight className="h-6 w-6 text-[#166534] shrink-0" />
                    ) : (
                      <ToggleLeft className="h-6 w-6 text-slate-300 shrink-0" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
