import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Edit, Trash2, Save, Upload, X, Eye, Tag, Percent } from 'lucide-react';

interface PlayerCard {
  id?: number;
  image: string;
  category: 'managers' | 'defenders' | 'midfielders' | 'forwards';
}

interface Account {
  id?: number;
  name: string;
  price: number;
  promo_price?: number;
  rating: number;
  image_normal: string;
  image_hover: string;
  image_detail: string;
  description: string;
  player_cards?: PlayerCard[];
  is_new: boolean;
  is_promo: boolean;
}

const AdminPanel: React.FC = () => {
  const { token } = useParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [whatsappLink, setWhatsappLink] = useState('');
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [playerCards, setPlayerCards] = useState<{[key: string]: File[]}>({
    managers: [],
    defenders: [],
    midfielders: [],
    forwards: []
  });
  const [showForm, setShowForm] = useState(false);
  const [showPlayerCards, setShowPlayerCards] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewImages, setPreviewImages] = useState<{[key: string]: string}>({});

  const categories = [
    { key: 'managers', label: 'Managers' },
    { key: 'defenders', label: 'Defenders' },
    { key: 'midfielders', label: 'Midfielders' },
    { key: 'forwards', label: 'Forwards' }
  ];

  useEffect(() => {
    verifyToken();
  }, [token]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAccounts();
      fetchWhatsappLink();
    }
  }, [isAuthenticated]);

  const verifyToken = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/verify-admin/${token}/`);
      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        // For development, accept any token
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      // For development, accept any token
      setIsAuthenticated(true);
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/accounts/');
      if (response.ok) {
        const data = await response.json();
        setAccounts(data);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setAccounts([]);
    }
  };

  const fetchWhatsappLink = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/whatsapp-link/');
      if (response.ok) {
        const data = await response.json();
        setWhatsappLink(data.link || '');
      }
    } catch (error) {
      console.error('Error fetching WhatsApp link:', error);
      setWhatsappLink('');
    }
  };

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Handle image file selection
  const handleImageSelect = async (field: string, file: File) => {
    if (!editingAccount) return;
    
    try {
      const base64 = await fileToBase64(file);
      setEditingAccount({
        ...editingAccount,
        [field]: base64
      });
      
      setPreviewImages({
        ...previewImages,
        [field]: base64
      });
    } catch (error) {
      console.error('Error converting file to base64:', error);
      alert('Error processing image. Please try again.');
    }
  };

  const handleSaveAccount = async (account: Account) => {
    // Validation côté frontend
    if (!account.name.trim()) {
      alert('Account name is required');
      return;
    }
    if (!account.price || account.price <= 0) {
      alert('Price must be greater than 0');
      return;
    }
    if (account.is_promo && account.promo_price && account.promo_price >= account.price) {
      alert('Promotional price must be lower than regular price');
      return;
    }
    if (!account.image_normal) {
      alert('Normal image is required');
      return;
    }
    if (!account.image_hover) {
      alert('Hover image is required');
      return;
    }
    if (!account.image_detail) {
      alert('Detail image is required');
      return;
    }
    if (!account.description.trim()) {
      alert('Description is required');
      return;
    }

    setIsLoading(true);
    
    try {
      // Vérifier d'abord si le serveur est accessible
      const healthCheck = await fetch('http://localhost:8000/', { 
        method: 'GET',
        mode: 'cors'
      }).catch(() => null);
      
      if (!healthCheck) {
        alert('❌ Backend server is not running!\n\nPlease start your Django server:\npython manage.py runserver');
        setIsLoading(false);
        return;
      }

      // Préparer les données - garder base64 tel quel pour l'instant
      const accountData = {
        name: account.name.trim(),
        price: parseFloat(account.price.toString()),
        promo_price: account.is_promo && account.promo_price ? parseFloat(account.promo_price.toString()) : null,
        rating: parseInt(account.rating.toString()) || 5,
        image_normal: account.image_normal,
        image_hover: account.image_hover,
        image_detail: account.image_detail,
        description: account.description.trim(),
        is_new: account.is_new || false,
        is_promo: account.is_promo || false,
        player_cards: (account.player_cards || []).filter(card => card.image)
      };

      console.log('🚀 Sending account data:', {
        ...accountData,
        image_normal: accountData.image_normal.substring(0, 50) + '...',
        image_hover: accountData.image_hover.substring(0, 50) + '...',
        image_detail: accountData.image_detail.substring(0, 50) + '...'
      });

      const url = account.id 
        ? `http://localhost:8000/api/accounts/${account.id}/`
        : 'http://localhost:8000/api/accounts/';
      
      const method = account.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        mode: 'cors',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(accountData)
      });

      console.log('📡 Response status:', response.status);

      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ Account saved successfully:', responseData);
        await fetchAccounts();
        setEditingAccount(null);
        setShowForm(false);
        setPreviewImages({});
        alert('✅ Account saved successfully!');
      } else {
        const errorText = await response.text();
        console.error('❌ Save error:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.detail) {
            alert(`❌ Error: ${errorData.detail}`);
          } else if (typeof errorData === 'object') {
            const errors = Object.entries(errorData).map(([key, value]) => `${key}: ${value}`);
            alert(`❌ Validation errors:\n${errors.join('\n')}`);
          } else {
            alert('❌ Unknown server error');
          }
        } catch {
          alert(`❌ Server error (${response.status}): ${errorText.substring(0, 200)}`);
        }
      }
    } catch (error) {
      console.error('🔥 Network error:', error);
      
      if (error.message.includes('fetch')) {
        alert('🔥 Network error: Cannot reach the server.\n\n✅ Solutions:\n1. Make sure Django server is running (python manage.py runserver)\n2. Check if localhost:8000 is accessible\n3. Check CORS settings in Django');
      } else {
        alert(`🔥 Unexpected error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        const response = await fetch(`http://localhost:8000/api/accounts/${id}/`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          await fetchAccounts();
          alert('Account deleted successfully!');
        } else {
          alert('Error deleting account.');
        }
      } catch (error) {
        console.error('Error deleting account:', error);
        alert('Error deleting account.');
      }
    }
  };

  const handleSaveWhatsappLink = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/whatsapp-link/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link: whatsappLink })
      });

      if (response.ok) {
        alert('WhatsApp link updated successfully!');
      } else {
        alert('Error updating WhatsApp link.');
      }
    } catch (error) {
      console.error('Error updating WhatsApp link:', error);
      alert('Error updating WhatsApp link.');
    }
  };

  const handlePlayerCardImageSelect = async (category: string, index: number, file: File) => {
    try {
      const base64 = await fileToBase64(file);
      
      if (editingAccount) {
        const updatedCards = [...(editingAccount.player_cards || [])];
        const cardIndex = updatedCards.findIndex(card => 
          card.category === category && 
          updatedCards.filter(c => c.category === category).indexOf(card) === index
        );
        
        if (cardIndex >= 0) {
          updatedCards[cardIndex].image = base64;
        } else {
          updatedCards.push({
            category: category as any,
            image: base64
          });
        }
        
        setEditingAccount({
          ...editingAccount,
          player_cards: updatedCards
        });
      }
    } catch (error) {
      console.error('Error processing player card image:', error);
      alert('Error processing image. Please try again.');
    }
  };

  const addPlayerCard = (category: string) => {
    if (editingAccount) {
      const updatedCards = [...(editingAccount.player_cards || [])];
      updatedCards.push({
        category: category as any,
        image: ''
      });
      
      setEditingAccount({
        ...editingAccount,
        player_cards: updatedCards
      });
    }
  };

  const removePlayerCard = (category: string, index: number) => {
    if (editingAccount) {
      const updatedCards = [...(editingAccount.player_cards || [])];
      const categoryCards = updatedCards.filter(card => card.category === category);
      const cardToRemove = categoryCards[index];
      const cardIndex = updatedCards.indexOf(cardToRemove);
      
      if (cardIndex > -1) {
        updatedCards.splice(cardIndex, 1);
        setEditingAccount({
          ...editingAccount,
          player_cards: updatedCards
        });
      }
    }
  };

  const getPlayerCardsByCategory = (category: string) => {
    if (!editingAccount?.player_cards) return [];
    return editingAccount.player_cards.filter(card => card.category === category);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg text-center">
          <h2 className="text-white text-2xl mb-4">Access Denied</h2>
          <p className="text-gray-300">Invalid admin token</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Bergomi Store Admin Panel</h1>
          <div className="w-32 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto rounded-full"></div>
        </div>

        {/* WhatsApp Link Section */}
        <div className="bg-gray-800 rounded-2xl p-6 mb-8 border border-gray-700">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <span className="bg-green-600 w-3 h-3 rounded-full mr-3"></span>
            WhatsApp Group Link
          </h2>
          <div className="flex space-x-4">
            <input
              type="url"
              value={whatsappLink}
              onChange={(e) => setWhatsappLink(e.target.value)}
              placeholder="https://chat.whatsapp.com/..."
              className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-yellow-400 focus:outline-none transition-colors"
            />
            <button
              onClick={handleSaveWhatsappLink}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-3 rounded-lg font-bold hover:from-orange-500 hover:to-yellow-400 transition-all duration-300"
            >
              Save Link
            </button>
          </div>
        </div>

        {/* Accounts Management */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold flex items-center">
              <span className="bg-blue-600 w-3 h-3 rounded-full mr-3"></span>
              Accounts Management
            </h2>
            <button
              onClick={() => {
                setEditingAccount({
                  name: '',
                  price: 0,
                  promo_price: 0,
                  rating: 5,
                  image_normal: '',
                  image_hover: '',
                  image_detail: '',
                  description: '',
                  player_cards: [],
                  is_new: false,
                  is_promo: false
                });
                setShowForm(true);
                setPreviewImages({});
              }}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-3 rounded-lg font-bold hover:from-orange-500 hover:to-yellow-400 transition-all duration-300 flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add New Account</span>
            </button>
          </div>

          {/* Accounts List */}
          <div className="space-y-4">
            {accounts.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-lg">No accounts found.</p>
                <p className="text-sm">Add your first account to get started.</p>
              </div>
            ) : (
              accounts.map((account) => (
                <div key={account.id} className="bg-gray-700 rounded-lg p-4 flex justify-between items-center hover:bg-gray-650 transition-colors">
                  <div className="flex items-center space-x-4">
                    {account.image_normal && (
                      <img 
                        src={account.image_normal} 
                        alt={account.name}
                        className="w-16 h-16 object-cover rounded-lg border-2 border-gray-600"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-lg">{account.name}</h3>
                        {/* Étiquettes NEW et PROMO dans la liste */}
                        {account.is_new && (
                          <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
                            <Tag className="w-3 h-3 mr-1" />
                            NEW
                          </span>
                        )}
                        {account.is_promo && (
                          <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
                            <Percent className="w-3 h-3 mr-1" />
                            PROMO
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {account.is_promo && account.promo_price ? (
                          <>
                            <span className="text-red-400 font-bold">${account.promo_price}</span>
                            <span className="text-gray-400 line-through">${account.price}</span>
                          </>
                        ) : (
                          <span className="text-yellow-400 font-bold">${account.price}</span>
                        )}
                      </div>
                      <div className="flex items-center text-yellow-400 text-sm">
                        {[...Array(account.rating || 5)].map((_, i) => (
                          <span key={i}>⭐</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingAccount(account);
                        setShowPlayerCards(true);
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Cards</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditingAccount(account);
                        setShowForm(true);
                        setPreviewImages({
                          image_normal: account.image_normal,
                          image_hover: account.image_hover,
                          image_detail: account.image_detail
                        });
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAccount(account.id!)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Account Form Modal */}
        {showForm && editingAccount && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-gray-700">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">
                  {editingAccount.id ? 'Edit Account' : 'Add New Account'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingAccount(null);
                    setPreviewImages({});
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Account Name</label>
                    <input
                      type="text"
                      placeholder="Enter account name"
                      value={editingAccount.name}
                      onChange={(e) => setEditingAccount({...editingAccount, name: e.target.value})}
                      className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-yellow-400 focus:outline-none transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Price ($)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={editingAccount.price}
                      onChange={(e) => setEditingAccount({...editingAccount, price: parseFloat(e.target.value) || 0})}
                      className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-yellow-400 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* NEW: Section Étiquettes et Promotions */}
                  <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                    <h4 className="text-lg font-semibold mb-4 text-yellow-400">Labels & Promotions</h4>
                    
                    {/* Étiquette NEW */}
                    <div className="flex items-center space-x-3 mb-4">
                      <input
                        type="checkbox"
                        id="is_new"
                        checked={editingAccount.is_new}
                        onChange={(e) => setEditingAccount({...editingAccount, is_new: e.target.checked})}
                        className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                      />
                      <label htmlFor="is_new" className="flex items-center space-x-2">
                        <Tag className="w-4 h-4 text-green-400" />
                        <span className="text-sm font-medium">Mark as NEW</span>
                        <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">NEW</span>
                      </label>
                    </div>

                    {/* Étiquette PROMO */}
                    <div className="flex items-center space-x-3 mb-4">
                      <input
                        type="checkbox"
                        id="is_promo"
                        checked={editingAccount.is_promo}
                        onChange={(e) => setEditingAccount({...editingAccount, is_promo: e.target.checked})}
                        className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
                      />
                      <label htmlFor="is_promo" className="flex items-center space-x-2">
                        <Percent className="w-4 h-4 text-red-400" />
                        <span className="text-sm font-medium">Enable Promotion</span>
                        <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">PROMO</span>
                      </label>
                    </div>

                    {/* Prix promotionnel (affiché seulement si promotion activée) */}
                    {editingAccount.is_promo && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium mb-2 text-red-400">
                          Promotional Price ($)
                        </label>
                        <input
                          type="number"
                          placeholder="Enter promotional price"
                          value={editingAccount.promo_price || ''}
                          onChange={(e) => setEditingAccount({
                            ...editingAccount, 
                            promo_price: parseFloat(e.target.value) || 0
                          })}
                          className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-red-400 focus:border-red-300 focus:outline-none transition-colors"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          Must be lower than regular price (${editingAccount.price})
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Rating</label>
                    <select
                      value={editingAccount.rating}
                      onChange={(e) => setEditingAccount({...editingAccount, rating: parseInt(e.target.value)})}
                      className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-yellow-400 focus:outline-none transition-colors"
                    >
                      {[1, 2, 3, 4, 5].map(rating => (
                        <option key={rating} value={rating}>
                          {rating} Star{rating > 1 ? 's' : ''} {'⭐'.repeat(rating)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      placeholder="Enter account description..."
                      value={editingAccount.description}
                      onChange={(e) => setEditingAccount({...editingAccount, description: e.target.value})}
                      className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-yellow-400 focus:outline-none transition-colors h-32 resize-none"
                    />
                  </div>
                </div>

                {/* Middle Column - Images */}
                <div className="space-y-4">
                  {/* Normal Image */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Normal Image</label>
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center hover:border-gray-500 transition-colors">
                      {previewImages.image_normal ? (
                        <div className="relative">
                          <img 
                            src={previewImages.image_normal} 
                            alt="Preview" 
                            className="w-full h-32 object-cover rounded-lg mb-2"
                          />
                          <button
                            onClick={() => {
                              setPreviewImages({...previewImages, image_normal: ''});
                              setEditingAccount({...editingAccount, image_normal: ''});
                            }}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Remove Image
                          </button>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-400 mb-2">Upload Normal Image</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageSelect('image_normal', file);
                            }}
                            className="hidden"
                            id="normal-image"
                          />
                          <label
                            htmlFor="normal-image"
                            className="bg-gray-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-gray-500 transition-colors inline-block"
                          >
                            Choose File
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hover Image */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Hover Image</label>
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center hover:border-gray-500 transition-colors">
                      {previewImages.image_hover ? (
                        <div className="relative">
                          <img 
                            src={previewImages.image_hover} 
                            alt="Preview" 
                            className="w-full h-32 object-cover rounded-lg mb-2"
                          />
                          <button
                            onClick={() => {
                              setPreviewImages({...previewImages, image_hover: ''});
                              setEditingAccount({...editingAccount, image_hover: ''});
                            }}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Remove Image
                          </button>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-400 mb-2">Upload Hover Image</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageSelect('image_hover', file);
                            }}
                            className="hidden"
                            id="hover-image"
                          />
                          <label
                            htmlFor="hover-image"
                            className="bg-gray-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-gray-500 transition-colors inline-block"
                          >
                            Choose File
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Detail Image */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Detail Image (Large)</label>
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center hover:border-gray-500 transition-colors">
                      {previewImages.image_detail ? (
                        <div className="relative">
                          <img 
                            src={previewImages.image_detail} 
                            alt="Preview" 
                            className="w-full h-32 object-cover rounded-lg mb-2"
                          />
                          <button
                            onClick={() => {
                              setPreviewImages({...previewImages, image_detail: ''});
                              setEditingAccount({...editingAccount, image_detail: ''});
                            }}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Remove Image
                          </button>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-400 mb-2">Upload Detail Image</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageSelect('image_detail', file);
                            }}
                            className="hidden"
                            id="detail-image"
                          />
                          <label
                            htmlFor="detail-image"
                            className="bg-gray-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-gray-500 transition-colors inline-block"
                          >
                            Choose File
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Preview */}
                <div className="space-y-4">
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <h4 className="text-lg font-semibold mb-4 text-center">Live Preview</h4>
                    
                    {/* Preview Card */}
                    <div className="bg-black/40 backdrop-blur-sm border border-gray-600 rounded-2xl overflow-hidden hover:border-yellow-400 hover:shadow-lg transition-all duration-300">
                      <div className="relative overflow-hidden h-48">
                        <img 
                          src={previewImages.image_normal || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Ob3JtYWwgSW1hZ2U8L3RleHQ+PC9zdmc+'}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Preview Étiquettes */}
                        <div className="absolute top-2 left-2 flex flex-col space-y-1">
                          {editingAccount.is_new && (
                            <div className="bg-green-500 text-white px-2 py-1 rounded-full font-bold text-xs uppercase tracking-wider shadow-lg animate-pulse">
                              NEW
                            </div>
                          )}
                          {editingAccount.is_promo && editingAccount.promo_price && editingAccount.promo_price < editingAccount.price && (
                            <div className="bg-red-500 text-white px-2 py-1 rounded-full font-bold text-xs uppercase tracking-wider shadow-lg animate-pulse">
                              PROMO
                            </div>
                          )}
                        </div>
                        
                        {/* Preview Price */}
                        <div className="absolute top-2 right-2">
                          {editingAccount.is_promo && editingAccount.promo_price && editingAccount.promo_price < editingAccount.price ? (
                            <div className="flex flex-col items-end space-y-1">
                              <div className="bg-red-500 text-white px-2 py-1 rounded-full font-bold text-sm">
                                ${editingAccount.promo_price}
                              </div>
                              <div className="bg-gray-600 text-white px-2 py-1 rounded-full text-xs line-through opacity-75">
                                ${editingAccount.price}
                              </div>
                            </div>
                          ) : (
                            <div className="bg-yellow-400 text-black px-2 py-1 rounded-full font-bold text-sm">
                              ${editingAccount.price}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="text-white text-lg font-bold mb-2">
                          {editingAccount.name || 'Account Name'}
                        </h3>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            {editingAccount.is_promo && editingAccount.promo_price && editingAccount.promo_price < editingAccount.price ? (
                              <>
                                <span className="text-red-400 text-xl font-bold">${editingAccount.promo_price}</span>
                                <span className="text-gray-400 text-sm line-through">${editingAccount.price}</span>
                              </>
                            ) : (
                              <span className="text-yellow-400 text-xl font-bold">${editingAccount.price}</span>
                            )}
                          </div>
                          
                          <div className="flex items-center text-yellow-400">
                            {[...Array(editingAccount.rating || 5)].map((_, i) => (
                              <span key={i} className="text-sm">⭐</span>
                            ))}
                          </div>
                        </div>
                        
                        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                          {editingAccount.description || 'Account description will appear here...'}
                        </p>
                        
                        <button className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black py-2 rounded-full font-bold text-sm">
                          Check it Now
                        </button>
                      </div>
                    </div>
                    
                    {/* Validation Messages */}
                    <div className="mt-4 space-y-2">
                      {editingAccount.is_promo && editingAccount.promo_price && editingAccount.promo_price >= editingAccount.price && (
                        <div className="bg-red-900/50 border border-red-500 text-red-300 px-3 py-2 rounded-lg text-sm">
                          ⚠️ Promotional price must be lower than regular price
                        </div>
                      )}
                      {(!editingAccount.name.trim() || !editingAccount.description.trim()) && (
                        <div className="bg-yellow-900/50 border border-yellow-500 text-yellow-300 px-3 py-2 rounded-lg text-sm">
                          ⚠️ Name and description are required
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 mt-8">
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingAccount(null);
                    setPreviewImages({});
                  }}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveAccount(editingAccount)}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-3 rounded-lg font-bold hover:from-orange-500 hover:to-yellow-400 transition-all duration-300 flex items-center space-x-2 disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  <span>{isLoading ? 'Saving...' : 'Save Account'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Player Cards Management Modal */}
        {showPlayerCards && editingAccount && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-7xl max-h-[90vh] overflow-y-auto border border-gray-700">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">
                  Manage Player Cards - {editingAccount.name}
                </h3>
                <button
                  onClick={() => {
                    setShowPlayerCards(false);
                    setEditingAccount(null);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-8">
                {categories.map(category => (
                  <div key={category.key} className="bg-gray-700 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 rounded-lg px-6 py-3">
                        <h4 className="text-xl font-bold capitalize text-white uppercase tracking-wider">{category.label}</h4>
                      </div>
                      <button
                        onClick={() => addPlayerCard(category.key)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Card</span>
                      </button>
                    </div>
                    
                    <div className="overflow-x-auto pb-4">
                      <div className="flex space-x-6 min-w-max px-4">
                        {getPlayerCardsByCategory(category.key).map((card, index) => (
                          <div key={index} className="group cursor-pointer flex-shrink-0">
                            <div className="bg-gradient-to-b from-green-400 to-green-600 rounded-xl overflow-hidden hover:from-green-300 hover:to-green-500 transition-all duration-300 shadow-xl hover:shadow-2xl border-2 border-green-500 hover:border-green-300 relative">
                              {card.image ? (
                                <>
                                  <img 
                                    src={card.image} 
                                    alt={`${category.label} Card`}
                                    className="w-48 h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyIiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNGFmNTNhO3N0b3Atb3BhY2l0eToxIiAvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzE2YTM0YTtzdG9wLW9wYWNpdHk6MSIgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTkyIiBoZWlnaHQ9IjI1NiIgZmlsbD0idXJsKCNnKSIvPjx0ZXh0IHg9Ijk2IiB5PSIxMjgiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5DQVJEPC90ZXh0Pjwvc3ZnPg==';
                                    }}
                                  />
                                  <button
                                    onClick={() => removePlayerCard(category.key, index)}
                                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-700 shadow-lg"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                              ) : (
                                <div className="w-48 h-64 flex flex-col items-center justify-center border-2 border-dashed border-green-300 bg-green-50/10">
                                  <Upload className="w-12 h-12 text-green-300 mb-4" />
                                  <p className="text-green-300 text-sm mb-4 text-center px-4">Add Card Image</p>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handlePlayerCardImageSelect(category.key, index, file);
                                    }}
                                    className="hidden"
                                    id={`card-${category.key}-${index}`}
                                  />
                                  <label
                                    htmlFor={`card-${category.key}-${index}`}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm cursor-pointer hover:bg-green-700 transition-colors"
                                  >
                                    Choose File
                                  </label>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {getPlayerCardsByCategory(category.key).length > 3 && (
                        <div className="text-center mt-4">
                          <p className="text-white/60 text-sm">← Scroll horizontally to see more cards →</p>
                        </div>
                      )}
                    </div>
                    
                    {getPlayerCardsByCategory(category.key).length === 0 && (
                      <div className="text-center py-12 text-gray-400">
                        <p>No {category.label.toLowerCase()} cards added yet.</p>
                        <p className="text-sm">Click "Add Card" to get started.</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end space-x-4 mt-8">
                <button
                  onClick={() => {
                    setShowPlayerCards(false);
                    setEditingAccount(null);
                  }}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={async () => {
                    if (editingAccount) {
                      await handleSaveAccount(editingAccount);
                    }
                    setShowPlayerCards(false);
                    setEditingAccount(null);
                  }}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-3 rounded-lg font-bold hover:from-orange-500 hover:to-yellow-400 transition-all duration-300"
                >
                  Save All Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;