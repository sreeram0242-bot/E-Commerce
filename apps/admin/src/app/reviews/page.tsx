'use client';

import { useEffect, useState } from 'react';
import { Search, CheckCircle, XCircle, Star } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState(''); // '', PENDING, APPROVED, REJECTED
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const query = filter ? `?status=${filter}` : '';
      const res = await fetch(`${API_URL}/reviews/admin/all${query}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('luxecart_token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setReviews(data.data);
      } else {
        setError(data.error || 'Failed to load reviews');
      }
    } catch (err) {
      console.error(err);
      setError('Network error loading reviews');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`${API_URL}/reviews/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('luxecart_token')}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        setReviews(reviews.map(r => r.id === id ? { ...r, status } : r));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredReviews = reviews.filter(r => 
    r.product.name.toLowerCase().includes(search.toLowerCase()) ||
    r.user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold text-brand-text-primary">Review Moderation</h1>
        
        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-brand-bg border border-brand-border rounded-lg px-4 py-2 text-sm text-brand-text-primary focus:outline-none focus:border-brand-primary"
        >
          <option value="">All Reviews</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {error && (
        <div className="p-4 bg-brand-error/10 border border-brand-error/20 text-brand-error rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-brand-surface rounded-xl border border-brand-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-brand-border flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-secondary" />
            <input
              type="text"
              placeholder="Search by product or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-brand-bg border border-brand-border rounded-lg text-sm focus:outline-none focus:border-brand-primary text-brand-text-primary"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-brand-bg border-b border-brand-border text-brand-text-secondary font-medium">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4 w-1/3">Review</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-brand-text-secondary">Loading reviews...</td>
                </tr>
              ) : filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-brand-text-secondary">No reviews found.</td>
                </tr>
              ) : (
                filteredReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-brand-bg/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-brand-text-primary">
                      {review.product.name}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-brand-text-primary">{review.user.firstName} {review.user.lastName}</p>
                      <p className="text-xs text-brand-text-secondary">{review.user.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-brand-warning">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-current' : 'text-brand-border fill-transparent'}`} />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {review.title && <p className="font-semibold text-brand-text-primary mb-1">{review.title}</p>}
                      <p className="text-brand-text-secondary line-clamp-2">{review.comment}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {review.status === 'PENDING' ? (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => updateStatus(review.id, 'APPROVED')}
                            className="p-1.5 text-brand-text-secondary hover:text-brand-success rounded hover:bg-brand-success/10 transition-colors" title="Approve"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => updateStatus(review.id, 'REJECTED')}
                            className="p-1.5 text-brand-text-secondary hover:text-brand-error rounded hover:bg-brand-error/10 transition-colors" title="Reject"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          review.status === 'APPROVED' ? 'bg-brand-success/10 text-brand-success' : 'bg-brand-error/10 text-brand-error'
                        }`}>
                          {review.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
