import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Mail, Key, Calendar, MapPin, Search, Download, Edit, Archive, Trash2, RotateCcw } from 'lucide-react';
import Navigation from '@/react-app/components/Navigation';
import Footer from '@/react-app/components/Footer';

// If running on Netlify, use the Cloudflare Workers API host; otherwise use a relative URL.
const getApiBaseUrl = () => {
  if (window.location.hostname.includes('netlify.app')) {
    return 'https://emigration-pro.aiservices4biz.workers.dev';
  }
  return '';
};

interface Purchaser {
  id: number;
  email: string;
  session_code: string;
  assessment_id: number;
  purchase_confirmed: number;
  is_active: number;
  is_archived: number;
  created_at: string;
  expires_at: string;
  preferred_country: string;
  preferred_city: string | null;
  overall_score: number;
  stripe_confirmed_at: string | null;
}

const toFlag = (value: unknown): number => {
  if (value === true || value === 1 || value === '1' || value === 'true') return 1;
  return 0;
};

const normalizePurchaser = (value: Record<string, unknown>): Purchaser => ({
  ...value,
  id: Number(value.id),
  assessment_id: Number(value.assessment_id),
  purchase_confirmed: toFlag(value.purchase_confirmed),
  is_active: toFlag(value.is_active),
  is_archived: toFlag(value.is_archived),
} as Purchaser);

export default function CRM() {
  // Authentication state - token issued by the server on successful login.
  const [adminToken, setAdminToken] = useState(() =>
    sessionStorage.getItem('adminToken') || sessionStorage.getItem('blogAdminToken') || ''
  );
  const isAuthenticated = Boolean(adminToken);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [purchasers, setPurchasers] = useState<Purchaser[]>([]);
  const [loading, setLoading] = useState(() => Boolean(sessionStorage.getItem('adminToken') || sessionStorage.getItem('blogAdminToken')));
  const [loadError, setLoadError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive' | 'archived'>('all');

  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPurchaser, setEditingPurchaser] = useState<Purchaser | null>(null);
  const [editForm, setEditForm] = useState({
    email: '',
    session_code: '',
    is_active: 1,
    is_archived: 0,
    purchase_confirmed: 0
  });

  // Handle login - authenticates against the server; no password is ever compared client-side.
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (!response.ok || !data.token) {
        throw new Error(data.error || 'Incorrect password. Please try again.');
      }
      sessionStorage.setItem('adminToken', data.token);
      sessionStorage.setItem('blogAdminToken', data.token);
      sessionStorage.setItem('adminAuth', 'true');
      setAdminToken(data.token);
      setPassword('');
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Unable to sign in.');
      setPassword('');
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('blogAdminToken');
    sessionStorage.removeItem('adminAuth');
    setAdminToken('');
    setPassword('');
  };

  useEffect(() => {
    if (adminToken) {
      fetchPurchasers();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminToken]);

  const fetchPurchasers = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/admin/crm/purchasers`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (response.status === 401) {
        handleLogout();
        return;
      }
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to load CRM data');
      }
      setPurchasers(Array.isArray(data.purchasers) ? data.purchasers.map(normalizePurchaser) : []);
    } catch (error) {
      console.error('Error fetching purchasers:', error);
      setLoadError(error instanceof Error ? error.message : 'Failed to load CRM data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (purchaser: Purchaser) => {
    setEditingPurchaser(purchaser);
    setEditForm({
      email: purchaser.email,
      session_code: purchaser.session_code,
      is_active: purchaser.is_active,
      is_archived: purchaser.is_archived,
      purchase_confirmed: purchaser.purchase_confirmed
    });
    setShowEditModal(true);
  };

  const handleArchivePurchaser = async (purchaser: Purchaser, archive: boolean) => {
    if (!confirm(`Are you sure you want to ${archive ? 'archive' : 'unarchive'} this purchaser?`)) return;

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/admin/crm/purchasers/${purchaser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          ...purchaser,
          is_archived: archive ? 1 : 0
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert(`Purchaser ${archive ? 'archived' : 'unarchived'} successfully!`);
        setPurchasers(current => current.map(item =>
          item.id === purchaser.id ? { ...item, is_archived: archive ? 1 : 0 } : item
        ));
      } else {
        alert('Error: ' + (data.error || 'Failed to update purchaser'));
      }
    } catch (error) {
      console.error('Error archiving purchaser:', error);
      alert('Failed to archive purchaser');
    }
  };

  const handleDeletePurchaser = async (purchaser: Purchaser) => {
    if (!confirm(`Permanently delete ${purchaser.email}? This action cannot be undone.`)) return;

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/admin/crm/purchasers/${purchaser.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      const data = await response.json().catch(() => ({ success: false, error: `Delete request failed (${response.status})` }));

      if (response.ok && data.success) {
        alert('Purchaser deleted permanently!');
        setPurchasers(current => current.filter(item => item.id !== purchaser.id));
      } else {
        alert('Error: ' + (data.error || 'Failed to delete purchaser'));
      }
    } catch (error) {
      console.error('Error deleting purchaser:', error);
      alert('Failed to delete purchaser');
    }
  };

  const handleUpdatePurchaser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPurchaser) return;

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/admin/crm/purchasers/${editingPurchaser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(editForm)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('Purchaser updated successfully!');
        setShowEditModal(false);
        setEditingPurchaser(null);
        fetchPurchasers();
      } else {
        alert('Error: ' + (data.error || 'Failed to update purchaser'));
      }
    } catch (error) {
      console.error('Error updating purchaser:', error);
      alert('Failed to update purchaser: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const normalizedSearch = searchTerm.trim().toLocaleLowerCase();
  const filteredPurchasers = purchasers.filter(purchaser => {
    // Search every customer field visible in the table.
    const searchText = [
      purchaser.email,
      purchaser.session_code,
      purchaser.preferred_country,
      purchaser.preferred_city,
      purchaser.overall_score,
      purchaser.is_archived === 1 ? 'archived restore' : purchaser.is_active === 1 ? 'active' : 'inactive',
      purchaser.purchase_confirmed === 1 ? 'confirmed sale' : '',
      purchaser.created_at ? new Date(purchaser.created_at).toLocaleDateString() : ''
    ].map(value => String(value ?? '')).join(' ').toLocaleLowerCase();
    const matchesSearch = !normalizedSearch || searchText.includes(normalizedSearch);

    // Filter by active/archived status
    let matchesFilter = true;
    if (filterActive === 'active') {
      matchesFilter = purchaser.is_active === 1 && purchaser.is_archived === 0;
    } else if (filterActive === 'inactive') {
      matchesFilter = purchaser.is_active === 0 && purchaser.is_archived === 0;
    } else if (filterActive === 'archived') {
      matchesFilter = purchaser.is_archived === 1;
    } else {
      // "All" is the unfiltered CRM list, including archived customers.
      matchesFilter = true;
    }

    // Dates are optional. Blank bounds include the entire history.
    const createdDate = purchaser.created_at?.slice(0, 10) || '';
    const matchesDate = (!dateFrom || createdDate >= dateFrom) && (!dateTo || createdDate <= dateTo);

    return matchesSearch && matchesFilter && matchesDate;
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

  // If not authenticated, show login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">CRM Management</h1>
            <p className="text-gray-600">Enter password to access</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Enter admin password"
                required
              />
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loginLoading ? 'Signing in…' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-blue-600 hover:text-blue-700">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
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
        <div className="w-full mx-auto">
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
              <div className="flex items-center space-x-4">
                <button
                  onClick={exportToCSV}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                <div className="text-sm text-gray-600 mb-1">CRM Contacts</div>
                <div className="text-2xl font-bold text-gray-900">{purchasers.length}</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                <div className="text-sm text-gray-600 mb-1">Active CRM Records</div>
                <div className="text-2xl font-bold text-green-600">
                  {purchasers.filter(p => p.is_active === 1 && p.is_archived === 0).length}
                </div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                <div className="text-sm text-gray-600 mb-1">Archived</div>
                <div className="text-2xl font-bold text-gray-500">
                  {purchasers.filter(p => p.is_archived === 1).length}
                </div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                <div className="text-sm text-gray-600 mb-1">Total Sales</div>
                <div className="text-2xl font-bold text-blue-600">
                  {purchasers.filter(p => Boolean(p.stripe_confirmed_at)).length}
                </div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                <div className="text-sm text-gray-600 mb-1">Sales This Month</div>
                <div className="text-2xl font-bold text-purple-600">
                  {purchasers.filter(p => {
                    if (!p.stripe_confirmed_at) return false;
                    const created = new Date(p.stripe_confirmed_at);
                    const now = new Date();
                    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                  }).length}
                </div>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Email/Session Code Search */}
                <div className="relative col-span-1 md:col-span-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Optional date range */}
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    aria-label="Created from (optional)"
                    title="Created from (optional)"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    aria-label="Created through (optional)"
                    title="Created through (optional)"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Status Filter */}
                <div className="flex gap-2 col-span-1 md:col-span-2">
                  <button
                    onClick={() => setFilterActive('all')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filterActive === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterActive('active')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filterActive === 'active'
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setFilterActive('inactive')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filterActive === 'inactive'
                      ? 'bg-red-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    Inactive
                  </button>
                  <button
                    onClick={() => setFilterActive('archived')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filterActive === 'archived'
                      ? 'bg-gray-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    Archived
                  </button>
                </div>
              </div>

              {/* Clear all filters button */}
              {(searchTerm || dateFrom || dateTo || filterActive !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setDateFrom('');
                    setDateTo('');
                    setFilterActive('all');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          {loadError && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 flex items-center justify-between gap-4">
              <span>{loadError}</span>
              <button onClick={fetchPurchasers} className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800">
                Retry
              </button>
            </div>
          )}
          <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="w-[19%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="w-[18%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Session Code
                    </th>
                    <th className="w-[15%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Destination
                    </th>
                    <th className="w-[7%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="w-[10%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="w-[12%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="w-[19%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPurchasers.map((purchaser) => (
                    <tr key={purchaser.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-3 py-4 min-w-0">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="truncate text-sm font-medium text-gray-900" title={purchaser.email}>{purchaser.email}</span>
                        </div>
                      </td>
                      <td className="px-3 py-4 min-w-0">
                        <div className="flex items-center">
                          <Key className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="truncate text-sm text-gray-900 font-mono" title={purchaser.session_code}>{purchaser.session_code}</span>
                        </div>
                      </td>
                      <td className="px-3 py-4 min-w-0">
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
                      <td className="px-3 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{purchaser.overall_score || 'N/A'}</span>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${purchaser.is_active === 1
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
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900">
                            {new Date(purchaser.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(purchaser)}
                            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
                            title="Edit purchaser"
                          >
                            <Edit className="w-4 h-4" />
                            <span className="hidden 2xl:inline text-sm">Edit</span>
                          </button>
                          
                          <button
                            onClick={() => handleArchivePurchaser(purchaser, purchaser.is_archived === 0)}
                            className={`flex items-center space-x-1 ${purchaser.is_archived === 1 ? 'text-green-600 hover:text-green-800' : 'text-gray-600 hover:text-gray-800'} transition-colors`}
                            title={purchaser.is_archived === 1 ? "Unarchive" : "Archive"}
                          >
                            {purchaser.is_archived === 1 ? <RotateCcw className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                            <span className="hidden 2xl:inline text-sm">{purchaser.is_archived === 1 ? 'Restore' : 'Archive'}</span>
                          </button>

                          <button
                            onClick={() => handleDeletePurchaser(purchaser)}
                            className="flex items-center space-x-1 text-red-600 hover:text-red-800 transition-colors"
                            title="Delete permanently"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="hidden 2xl:inline text-sm">Delete</span>
                          </button>
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

      {/* Edit Modal */}
      {showEditModal && editingPurchaser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Edit Purchaser</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingPurchaser(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdatePurchaser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session Code</label>
                <input
                  type="text"
                  value={editForm.session_code}
                  onChange={(e) => setEditForm({ ...editForm, session_code: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  required
                />
              </div>

              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editForm.is_active === 1}
                    onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked ? 1 : 0 })}
                    className="mr-2 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editForm.is_archived === 1}
                    onChange={(e) => setEditForm({ ...editForm, is_archived: e.target.checked ? 1 : 0 })}
                    className="mr-2 w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Archived</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editForm.purchase_confirmed === 1}
                    onChange={(e) => setEditForm({ ...editForm, purchase_confirmed: e.target.checked ? 1 : 0 })}
                    className="mr-2 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Purchase Confirmed</span>
                </label>
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingPurchaser(null);
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
