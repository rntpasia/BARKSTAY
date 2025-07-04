// js/auditlogs.js
import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', fetchAuditLogs);

async function fetchAuditLogs() {
  const { data, error } = await supabase
    .from('logs')
    .select('*')
    .order('timestamp', { ascending: false });

  if (error) {
    console.error('Error fetching audit logs:', error.message);
    return;
  }

  const tbody = document.querySelector('#logsTable tbody');
  tbody.innerHTML = ''; // Clear existing rows

  data.forEach(log => {
    const row = document.createElement('tr');

    const formattedTimestamp = log.timestamp
      ? new Date(log.timestamp).toLocaleString()
      : '—';

    row.innerHTML = `
      <td>${log.user_id || '—'}</td>
      <td>${log.action_type || '—'}</td>
      <td>${log.description || '—'}</td>
      <td>${formattedTimestamp}</td>
    `;

    tbody.appendChild(row);
  });

  console.log("✅ Rendered", data.length, "log entries.");
}
