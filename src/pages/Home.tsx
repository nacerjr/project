import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { API_URL } from '../config/api.ts'; // AJOUTÉ : Import de la configuration API

interface Account {
  id: number;
  name: string;
  price: number;
  promo_price?: number;
  image_normal: string;
  image_hover: string;
  image_detail: string;
  description: string;
  rating?: number;
  is_new: boolean;
  is_promo: boolean;
  effective_price: number;
  has_discount: boolean;
  is_recently_created: boolean;
}

const Home: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [hoveredAccount, setHoveredAccount] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAccounts();
    
    // Handle scroll for logo animation
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setScrolled(scrollTop > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchAccounts = async () => {
    try {
      // MODIFIÉ : Utilisation de API_URL au lieu de l'URL hardcodée
      const response = await fetch(`${API_URL}/accounts/`);
      const data = await response.json();
      setAccounts(data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setAccounts([]);
    }
  };

  const handleAccountClick = (accountId: number) => {
    navigate(`/account/${accountId}`);
  };

  const handleExploreClick = () => {
    document.getElementById('latest-accounts')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  return (
    <div className="min-h-screen">
      {/* Video Background */}
      <div className="fixed inset-0 z-0">
        <video 
          autoPlay 
          muted 
          loop 
          className="w-full h-full object-cover"
        >
          <source src="https://cdn.pixabay.com/video/2017/07/23/10783-226624891_large.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Fixed Logo that moves with scroll - Image agrandie pour remplir le cercle */}
      <div className={`fixed left-1/2 transform -translate-x-1/2 z-30 transition-all duration-500 ${
        scrolled ? 'top-4' : 'top-32'
      }`}>
        <div className={`rounded-full border-4 border-white/90 bg-black/30 backdrop-blur-sm overflow-hidden transition-all duration-500 ${
          scrolled ? 'w-28 h-28' : 'w-56 h-56'
        }`}>
          <img 
            src="/image-removebg-preview-removebg-preview.png" 
            alt="Bergomi Store Logo" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="h-screen flex items-center justify-center text-center">
          <div className="max-w-2xl mx-auto px-6">
            {/* Space for logo - espace réduit pour rapprocher le logo du texte */}
            <div className="mb-12 h-48"></div>
            
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl">
              Bergomi Store
            </h1>
            <p className="text-2xl text-white/90 mb-12 drop-shadow-lg">
              Own the Game
            </p>
            <button 
              onClick={handleExploreClick}
              className="bg-transparent border-3 border-white text-white px-10 py-4 text-lg hover:bg-white hover:text-black transition-all duration-300 font-bold rounded-full backdrop-blur-sm hover:scale-105"
            >
              EXPLORE
            </button>
          </div>
          
          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
            <div className="flex flex-col items-center">
              <span className="text-sm mb-2">Scroll Down</span>
              <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
                <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Latest Accounts Section */}
        <div id="latest-accounts" className="bg-gradient-to-br from-gray-900 via-black to-gray-800 py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold text-white mb-6">Latest Accounts</h2>
              <div className="w-32 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto rounded-full"></div>
            </div>

            {accounts.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-white/60 text-xl">No accounts available yet.</div>
                <div className="text-white/40 text-sm mt-2">Please check back later or contact admin.</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {accounts.map((account) => (
                  <div 
                    key={account.id}
                    className="group bg-black/40 backdrop-blur-sm border border-gray-700 rounded-2xl overflow-hidden hover:border-yellow-400 hover:shadow-2xl hover:shadow-yellow-400/20 transition-all duration-500 cursor-pointer hover:scale-105"
                    onMouseEnter={() => setHoveredAccount(account.id)}
                    onMouseLeave={() => setHoveredAccount(null)}
                    onClick={() => handleAccountClick(account.id)}
                  >
                    <div className="relative overflow-hidden h-64">
                      <img 
                        src={hoveredAccount === account.id ? account.image_hover : account.image_normal}
                        alt={account.name}
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Étiquettes NEW et PROMO */}
                      <div className="absolute top-4 left-4 flex flex-col space-y-2">
                        {/* Étiquette NEW */}
                        {account.is_new && (
                          <div className="bg-green-500 text-white px-3 py-1 rounded-full font-bold text-xs uppercase tracking-wider shadow-lg animate-pulse">
                            NEW
                          </div>
                        )}
                        
                        {/* Étiquette PROMO */}
                        {account.is_promo && account.has_discount && (
                          <div className="bg-red-500 text-white px-3 py-1 rounded-full font-bold text-xs uppercase tracking-wider shadow-lg animate-pulse">
                            PROMO
                          </div>
                        )}
                      </div>
                      
                      {/* Price overlay on hover */}
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        {account.has_discount ? (
                          <div className="flex flex-col items-end space-y-1">
                            <div className="bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm">
                              ${account.promo_price}
                            </div>
                            <div className="bg-gray-600 text-white px-2 py-1 rounded-full text-xs line-through opacity-75">
                              ${account.price}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-yellow-400 text-black px-3 py-1 rounded-full font-bold text-sm">
                            ${account.effective_price}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-white text-xl font-bold mb-3 group-hover:text-yellow-400 transition-colors duration-300">
                        {account.name}
                      </h3>
                      
                      <div className="flex items-center justify-between mb-6">
                        {/* Affichage du prix avec promotion */}
                        <div className="flex items-center space-x-2">
                          {account.has_discount ? (
                            <>
                              <span className="text-red-400 text-2xl font-bold">${account.promo_price}</span>
                              <span className="text-gray-400 text-lg line-through">${account.price}</span>
                            </>
                          ) : (
                            <span className="text-yellow-400 text-2xl font-bold">${account.effective_price}</span>
                          )}
                        </div>
                        
                        <div className="flex items-center text-yellow-400">
                          {[...Array(account.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-current" />
                          ))}
                        </div>
                      </div>
                      
                      <button 
                        className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black py-3 rounded-full font-bold hover:from-orange-500 hover:to-yellow-400 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAccountClick(account.id);
                        }}
                      >
                        Check it Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;