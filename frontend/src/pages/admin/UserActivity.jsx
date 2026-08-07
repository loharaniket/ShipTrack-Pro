import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Button from '../../components/ui/Button';
import { formatDateTime } from '../../utils/dateFormatter';
import { ArrowLeft, Clock } from 'lucide-react';

const UserActivity = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchActivity();
  }, [id]);

  const fetchActivity = async () => {
    try {
      // Assuming GET /api/v1/admin/{id}/activity returns a Page<AuditLogDto>
      const response = await api.get(`/admin/${id}/activity`);
      setLogs(response.data.data.content || []);
    } catch (err) {
      setError('Failed to load user activity.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 mt-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" className="px-2" onClick={() => navigate('/admin/users')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Activity</h1>
          <p className="text-gray-500 dark:text-gray-400">System audit logs for this user.</p>
        </div>
      </div>

      <div className="glass p-6 rounded-2xl shadow-sm">
        {error && <div className="p-4 mb-4 bg-[var(--color-status-error)]/10 text-[var(--color-status-error)] rounded-md text-sm">{error}</div>}
        
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading activity logs...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-gray-500 flex flex-col items-center">
            <Clock className="h-12 w-12 text-gray-300 mb-3" />
            <p>No activity logs found for this user.</p>
          </div>
        ) : (
          <div className="relative border-l border-gray-200 dark:border-gray-800 ml-3 space-y-8">
            {logs.map((log) => (
              <div key={log.id} className="relative pl-6">
                <div className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-[var(--color-brand)] border-2 border-white dark:border-gray-900" />
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{log.action}</h3>
                  <time className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDateTime(log.timestamp)}
                  </time>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{log.details}</p>
                {log.ipAddress && (
                  <p className="text-xs text-gray-400 mt-1">IP: {log.ipAddress}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserActivity;
