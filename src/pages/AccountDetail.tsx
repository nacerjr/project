import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Tag, Percent } from 'lucide-react';
import { API_URL } from '../config/api.ts';

interface PlayerCard {
  id: number;
  image: string;
  category: 'managers' | 'defenders' | 'midfielders' | 'forwards';
}

interface Account {
  id: number;
  name: string;
  price: number;
  promo_price?: number;
  rating: number;
  image_detail: string;
  description: string;
  player_cards: PlayerCard[];
  is_new: boolean;
  is_promo: boolean;
  effective_price: number;
  has_discount: boolean;
  is_recently_created: boolean;
}

const AccountDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState<Account | null>(null);
  const [whatsappLink, setWhatsappLink] = useState<string>('');

  const categories = [
    { key: 'managers', label: 'Managers' },
    { key: 'defenders', label: 'Defenders' },
    { key: 'midfielders', label: 'Midfielders' },
    { key: 'forwards', label: 'Forwards' }
  ];

  useEffect(() => {
    fetchAccount();
    fetchWhatsappLink();
  }, [id]);

  const fetchAccount = async () => {
    try {
      const response = await fetch(`${API_URL}/accounts/${id}/`);
      const data = await response.json();
      setAccount(data);
    } catch (error) {
      console.error('Error fetching account:', error);
      navigate('/');
    }
  };

  const fetchWhatsappLink = async () => {
    try {
      const response = await fetch(`${API_URL}/whatsapp-link/`);
      const data = await response.json();
      setWhatsappLink(data.link);
    } catch (error) {
      console.error('Error fetching WhatsApp link:', error);
      setWhatsappLink('');
    }
  };

  const handleBuyNow = () => {
    if (whatsappLink) {
      window.open(whatsappLink, '_blank');
    }
  };

  const getCardsByCategory = (category: string) => {
    if (!account) return [];
    return account.player_cards.filter(card => card.category === category);
  };

  if (!account) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-4 md:p-6 border-b border-gray-800">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-white hover:text-yellow-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm md:text-base">Back to Store</span>
        </button>
        <div className="flex items-center space-x-2">
          <img 
            src="/image-removebg-preview-removebg-preview.png" 
            alt="Bergomi Store Logo" 
            className="w-8 h-8 md:w-10 md:h-10 rounded-full"
          />
          <span className="text-white text-sm md:text-lg font-bold">Bergomi Store</span>
        </div>
      </nav>

      {/* Account Detail */}
      <div className="container mx-auto px-4 md:px-6 py-4 md:py-8">
        {/* Main Image avec étiquettes */}
        <div className="mb-8 md:mb-12 relative">
          <img 
            src={account.image_detail} 
            alt={account.name}
            className="w-full object-contain rounded-lg shadow-2xl bg-gray-800"
            style={{ maxHeight: '400px' }}
          />
          
          {/* Étiquettes sur l'image principale */}
          <div className="absolute top-3 md:top-6 left-3 md:left-6 flex flex-col space-y-2 md:space-y-3">
            {account.is_new && (
              <div className="bg-green-500 text-white px-2 md:px-4 py-1 md:py-2 rounded-full font-bold text-xs md:text-sm uppercase tracking-wider shadow-lg animate-pulse flex items-center space-x-1 md:space-x-2">
                <Tag className="w-3 h-3 md:w-4 md:h-4" />
                <span>NEW</span>
              </div>
            )}
            
            {account.is_promo && account.has_discount && (
              <div className="bg-red-500 text-white px-2 md:px-4 py-1 md:py-2 rounded-full font-bold text-xs md:text-sm uppercase tracking-wider shadow-lg animate-pulse flex items-center space-x-1 md:space-x-2">
                <Percent className="w-3 h-3 md:w-4 md:h-4" />
                <span>PROMO</span>
              </div>
            )}
          </div>
        </div>

        {/* Description Section avec prix mis à jour */}
        <div className="mb-8 md:mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-2 md:mb-4">{account.name}</h1>
              
              {/* Prix avec gestion des promotions */}
              <div className="flex items-center space-x-2 md:space-x-4">
                {account.has_discount ? (
                  <>
                    <span className="text-2xl md:text-4xl font-bold text-red-400">${account.promo_price}</span>
                    <span className="text-lg md:text-2xl text-gray-400 line-through">${account.price}</span>
                    <div className="bg-red-500 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-bold">
                      SAVE ${(account.price - (account.promo_price || 0)).toFixed(2)}
                    </div>
                  </>
                ) : (
                  <span className="text-2xl md:text-4xl font-bold text-yellow-400">${account.effective_price}</span>
                )}
              </div>
            </div>
            
            <div className="text-left md:text-right">
              <div className="flex items-center text-yellow-400 mb-2">
                {[...Array(account.rating || 5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 md:w-6 md:h-6 fill-current" />
                ))}
              </div>
              <div className="text-gray-400 text-xs md:text-sm">
                {account.rating}/5 Stars
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Description</h2>
            <p className="text-gray-300 leading-relaxed text-sm md:text-base">{account.description}</p>
          </div>
        </div>

        {/* Best Players Section - Version responsive pour mobile */}
        <div className="mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8">Best Players</h2>
          
          {/* Affichage de toutes les catégories */}
          {categories.map((category) => {
            const cards = getCardsByCategory(category.key);
            
            if (cards.length === 0) return null;
            
            return (
              <div key={category.key} className="mb-8 md:mb-12">
                {/* En-tête de catégorie avec style jaune et texte noir */}
                <div className="mb-4 md:mb-6">
                  <div className="bg-yellow-400 rounded-lg p-3 md:p-4 text-center shadow-lg">
                    <h3 className="text-xl md:text-2xl font-bold text-black uppercase tracking-wider">
                      {category.label}
                    </h3>
                  </div>
                </div>

                {/* Grille responsive pour mobile et scroll horizontal pour desktop */}
                <div className="relative">
                  {/* Version mobile : grille 2 colonnes */}
                  <div className="md:hidden grid grid-cols-2 gap-3 px-2">
                    {cards.map((card) => (
                      <div key={card.id} className="group cursor-pointer">
                        <div className="bg-gradient-to-b from-green-400 to-green-600 rounded-xl overflow-hidden hover:from-green-300 hover:to-green-500 transition-all duration-300 shadow-xl hover:shadow-2xl border-2 border-green-500 hover:border-green-300">
                          <img 
                            src={card.image} 
                            alt="Player Card"
                            className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyIiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNGFmNTNhO3N0b3Atb3BhY2l0eToxIiAvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzE2YTM0YTtzdG9wLW9wYWNpdHk6MSIgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTkyIiBoZWlnaHQ9IjI1NiIgZmlsbD0idXJsKCNnKSIvPjx0ZXh0IHg9Ijk2IiB5PSIxMjgiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5DQVJEPC90ZXh0Pjwvc3ZnPg==';
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Version desktop : scroll horizontal */}
                  <div className="hidden md:block">
                    <div 
                      className="flex space-x-6 overflow-x-auto px-4 pb-4"
                      style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        WebkitScrollbar: { display: 'none' }
                      }}
                    >
                      <style jsx>{`
                        div::-webkit-scrollbar {
                          display: none;
                        }
                      `}</style>
                      {cards.map((card) => (
                        <div key={card.id} className="group cursor-pointer flex-shrink-0">
                          <div className="bg-gradient-to-b from-green-400 to-green-600 rounded-xl overflow-hidden hover:from-green-300 hover:to-green-500 transition-all duration-300 shadow-xl hover:shadow-2xl border-2 border-green-500 hover:border-green-300">
                            <img 
                              src={card.image} 
                              alt="Player Card"
                              className="w-48 h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyIiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNGFmNTNhO3N0b3Atb3BhY2l0eToxIiAvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzE2YTM0YTtzdG9wLW9wYWNpdHk6MSIgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTkyIiBoZWlnaHQ9IjI1NiIgZmlsbD0idXJsKCNnKSIvPjx0ZXh0IHg9Ijk2IiB5PSIxMjgiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5DQVJEPC90ZXh0Pjwvc3ZnPg==';
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Indicateur de scroll si nécessaire */}
                    {cards.length > 4 && (
                      <div className="text-center mt-4">
                        <p className="text-white/60 text-sm">← Scroll horizontally to see more cards →</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Message si aucune carte dans toutes les catégories */}
          {account.player_cards.length === 0 && (
            <div className="text-center py-8 md:py-12">
              <div className="text-white/60 text-lg">No player cards available for this account.</div>
              <div className="text-white/40 text-sm mt-2">Cards will be displayed here once available.</div>
            </div>
          )}
        </div>

        {/* Buy Now Button avec prix dynamique - version responsive */}
        <div className="text-center">
          <div className="bg-gray-800 rounded-2xl p-4 md:p-8 mb-4 md:mb-6 max-w-md mx-auto">
            <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Ready to Buy?</h3>
            
            {/* Récapitulatif du prix */}
            <div className="mb-4 md:mb-6">
              {account.has_discount ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm md:text-base">Original Price:</span>
                    <span className="text-gray-400 line-through text-sm md:text-base">${account.price}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold text-sm md:text-base">Promo Price:</span>
                    <span className="text-red-400 text-lg md:text-xl font-bold">${account.promo_price}</span>
                  </div>
                  <div className="border-t border-gray-600 pt-2 flex justify-between items-center">
                    <span className="text-green-400 font-semibold text-sm md:text-base">You Save:</span>
                    <span className="text-green-400 font-bold text-sm md:text-base">${(account.price - (account.promo_price || 0)).toFixed(2)}</span>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <span className="text-white font-semibold text-sm md:text-base">Total Price:</span>
                  <span className="text-yellow-400 text-lg md:text-xl font-bold">${account.effective_price}</span>
                </div>
              )}
            </div>
            
            <button 
              onClick={handleBuyNow}
              disabled={!whatsappLink}
              className={`w-full flex items-center justify-center gap-2 md:gap-3 px-4 md:px-8 py-3 md:py-4 text-lg md:text-xl font-bold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl ${
                whatsappLink 
                  ? account.has_discount 
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-yellow-400 text-black hover:bg-yellow-500'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {whatsappLink ? (
                <>
                  <span className="text-sm md:text-xl">
                    {account.has_discount ? `Buy Now - $${account.promo_price}` : `Buy Now - $${account.effective_price}`}
                  </span>
                  <svg 
                    className="w-5 h-5 md:w-6 md:h-6 fill-current" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.085"/>
                  </svg>
                </>
              ) : (
                'Contact info not available'
              )}
            </button>
          </div>
          
          {whatsappLink && (
            <p className="text-white/60 text-xs md:text-sm">
              Click to contact us on WhatsApp and complete your purchase
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountDetail;