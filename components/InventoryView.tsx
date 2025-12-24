import React, { useState } from 'react';
import { Product } from '../types';
import { Plus, Minus, Trash2, Edit2, Search, Image as ImageIcon, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface InventoryViewProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ products, setProducts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    category: '',
    price: 0,
    quantity: 0,
    sku: '',
    image: ''
  });

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      quantity: product.quantity,
      sku: product.sku,
      image: product.image
    });
    setIsModalOpen(true);
  };

  const handleUpdateStock = (id: string, delta: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const newQuantity = Math.max(0, p.quantity + delta);
        return { ...p, quantity: newQuantity };
      }
      return p;
    }));
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: '',
      price: 0,
      quantity: 0,
      sku: `ELC-${Math.floor(Math.random() * 10000)}`,
      image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=200&q=80'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...formData, id: p.id } : p));
    } else {
      const newProduct: Product = {
        ...formData,
        id: crypto.randomUUID(),
      };
      setProducts(prev => [...prev, newProduct]);
    }
    setIsModalOpen(false);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const totalValue = products.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    const totalItems = products.reduce((acc, curr) => acc + curr.quantity, 0);
    const date = new Date().toLocaleDateString();

    // Header Background
    doc.setFillColor(30, 41, 59); // Slate 900
    doc.rect(0, 0, 210, 40, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("NexusInv", 14, 20);
    doc.setFontSize(12);
    doc.text("Electronics Inventory Report", 14, 30);

    // Date
    doc.setFontSize(10);
    doc.text(`Generated on: ${date}`, 150, 30);

    // Summary Stats
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(12);
    doc.text(`Total SKU Count: ${products.length}`, 14, 50);
    doc.text(`Total Stock Quantity: ${totalItems}`, 14, 56);
    doc.text(`Total Inventory Value: ₹${totalValue.toLocaleString('en-IN')}`, 14, 62);

    const tableData = products.map(p => [
      p.sku,
      p.name,
      p.category,
      p.quantity.toString(),
      `₹${p.price.toLocaleString('en-IN')}`,
      `₹${(p.price * p.quantity).toLocaleString('en-IN')}`
    ]);

    autoTable(doc, {
      head: [['SKU', 'Product Name', 'Category', 'Qty', 'Unit Price', 'Total Value']],
      body: tableData,
      startY: 70,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: 255 }, // Blue 500
      alternateRowStyles: { fillColor: [248, 250, 252] }, // Slate 50
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 30 }, // SKU
        1: { cellWidth: 'auto' }, // Name
        5: { halign: 'right' }, // Total Value
      },
      foot: [['', '', 'TOTAL', totalItems.toString(), '', `₹${totalValue.toLocaleString('en-IN')}`]],
      footStyles: { fillColor: [241, 245, 249], textColor: 0, fontStyle: 'bold' }
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text('NexusInv - AI Powered Electronics Inventory System', 14, 285);
        doc.text(`Page ${i} of ${pageCount}`, 190, 285, { align: 'right' });
    }

    doc.save(`electronics-inventory-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search electronics..." 
            className="w-full pl-9 pr-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <button 
            type="button"
            onClick={generatePDF}
            className="flex items-center gap-2 px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors"
          >
            <FileText className="w-4 h-4" />
            Export Report
          </button>
          <button 
            type="button"
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-4">Image</th>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    No products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">{product.name}</td>
                    <td className="px-6 py-4 font-mono text-xs">{product.sku}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleUpdateStock(product.id, -1); }}
                            className="w-7 h-7 flex items-center justify-center rounded-full border border-slate-300 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-white"
                            disabled={product.quantity <= 0}
                            title="Decrease Stock"
                        >
                            <Minus className="w-3 h-3" />
                        </button>
                        <span className={`min-w-[2rem] text-center font-semibold ${product.quantity < 10 ? 'text-red-600' : 'text-slate-700'}`}>
                            {product.quantity}
                        </span>
                        <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleUpdateStock(product.id, 1); }}
                            className="w-7 h-7 flex items-center justify-center rounded-full border border-slate-300 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors bg-white"
                            title="Increase Stock"
                        >
                            <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">₹{product.price.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(product);
                          }} 
                          className="p-1.5 text-slate-500 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors cursor-pointer"
                          aria-label="Edit product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(product.id);
                          }} 
                          className="p-1.5 text-slate-500 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete"
                          aria-label="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden relative">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-lg text-slate-900">
                {editingProduct ? 'Edit Product' : 'New Product'}
              </h3>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                   <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                   <input 
                     required
                     type="text" 
                     value={formData.name}
                     onChange={e => setFormData({...formData, name: e.target.value})}
                     className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                   />
                </div>
                
                <div className="col-span-1 md:col-span-2">
                   <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
                   <input 
                     type="text" 
                     value={formData.image}
                     onChange={e => setFormData({...formData, image: e.target.value})}
                     placeholder="https://..."
                     className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                   />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <input 
                    required
                    type="text" 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    placeholder="e.g. Smartphones, Laptops"
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
                  <input 
                    required
                    type="text" 
                    value={formData.sku}
                    onChange={e => setFormData({...formData, sku: e.target.value})}
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price (₹)</label>
                  <input 
                    required
                    type="number" 
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                  <input 
                    required
                    type="number" 
                    min="0"
                    value={formData.quantity}
                    onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg text-sm font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};