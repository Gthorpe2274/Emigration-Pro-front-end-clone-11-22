import { useState, useEffect } from 'react';
import { Users, Mail, Key, Calendar, MapPin, Search, Download } from 'lucide-react';
import Navigation from '@/react-app/components/Navigation';
import Footer from '@/react-app/components/Footer';
import SystemLogin from '@/react-app/components/SystemLogin';

interface Purchaser {
  id: number;
  email: string;
  session_code: string;
  assessment_id: number;
  purchase_confirmed: number;
  is_active: number;
  created_at: string;
  expires_at: string;
  preferred_country: string;
  preferred_city: string | null;
  overall_score: number;
}

export default function CRM() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [purchasers, setPurchasers] = useState<Purchaser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    // Check if user is authenticated
    const authenticated = sessionStorage.getItem('systemLoginAuthenticated') === 'true';
    setIsAuthenticated(authenticated);
    
    if (authenticated) {
      fetchPurchasers();
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    fetchPurchasers();
  };

  const fetchPurchasers = async () => {
    try {
      const response = await fetch('/api/admin/crm/purchasers');
      const data = await response.json();
      
      if (data.success) {
        setPurchasers(data.purchasers);
      }
    } catch (error) {
      console.error('Error fetching purchasers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPurchasers = purchasers.filter(purchaser => {
    const matchesSearch = 
      purchaser.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchaser.session_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchaser.preferred_country?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = 
      filterActive === 'all' ||
      (filterActive === 'active' && purchaser.is_active === 1) ||
      (filterActive === 'inactive' && purchaser.is_active === 0);

    return matchesSearch && matchesFilter;
  });

  const exportToCSV = () => {
    const headers = ['Email', 'Session Code', 'Country', 'City', 'Score', 'Active', 'Purchased', 'Created', 'Expires'];
    const rows = filteredPurchasers.map(p => [
      p.email,
      p.session_code,
      p.preferred_country || '',
      p.preferred_city || '',
      p.overall_score || '',
      p.is_active ? 'Yes' : 'No',
      p.purchase_confirmed ? 'Yes' : 'No',
      new Date(p.created_at).toLocaleDateString(),
      new Date(p.expires_at).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `purchasers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // If not authenticated, show login component
  if (!isAuthenticated) {
    return <SystemLogin onLoginSuccess={handleLoginSuccess} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading CRM data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navigation />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Customer Relationship Management</h1>
                  <p className="text-gray-600">View and manage all purchaser records</p>
                </div>
              </div>
              <button
                onClick={exportToCSV}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                <div className="text-sm text-gray-600 mb-1">Total Purchasers</div>
                <div className="text-2xl font-bold text-gray-900">{purchasers.length}</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                <div className="text-sm text-gray-600 mb-1">Active Accounts</div>
                <div className="text-2xl font-bold text-green-600">
                  {purchasers.filter(p => p.is_active === 1).length}
                </div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                <div className="text-sm text-gray-600 mb-1">Confirmed Purchases</div>
                <div className="text-2xl font-bold text-blue-600">
                  {purchasers.filter(p => p.purchase_confirmed === 1).length}
                </div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                <div className="text-sm text-gray-600 mb-1">This Month</div>
                <div className="text-2xl font-bold text-purple-600">
                  {purchasers.filter(p => {
                    const created = new Date(p.created_at);
                    const now = new Date();
                    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                  }).length}
                </div>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by email, session code, or country..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterActive('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterActive === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterActive('active')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterActive === 'active'
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setFilterActive('inactive')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterActive === 'inactive'
                      ? 'bg-red-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Inactive
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Session Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Destination
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPurchasers.map((purchaser) => (
                    <tr key={purchaser.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">{purchaser.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Key className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900 font-mono">{purchaser.session_code}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                          <div className="text-sm">
                            <div className="text-gray-900">{purchaser.preferred_country || 'N/A'}</div>
                            {purchaser.preferred_city && (
                              <div className="text-gray-500 text-xs">{purchaser.preferred_city}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{purchaser.overall_score || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            purchaser.is_active === 1
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {purchaser.is_active === 1 ? 'Active' : 'Inactive'}
                          </span>
                          {purchaser.purchase_confirmed === 1 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Confirmed
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900">
                            {new Date(purchaser.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredPurchasers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No purchasers found matching your criteria</p>
              </div>
            )}
          </div>

          {/* Results count */}
          <div className="mt-4 text-center text-sm text-gray-600">
            Showing {filteredPurchasers.length} of {purchasers.length} total purchasers
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
