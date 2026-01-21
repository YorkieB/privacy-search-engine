import React from 'react';

const RefreshSettings = ({ autoRefresh, refreshInterval, onChange }) => {
  const intervalOptions = [
    { value: 60000, label: '1 min' },
    { value: 300000, label: '5 min' },
    { value: 900000, label: '15 min' },
    { value: 1800000, label: '30 min' }
  ];

  const handleToggleAutoRefresh = () => {
    onChange(!autoRefresh, refreshInterval);
  };

  const handleIntervalChange = (newInterval) => {
    onChange(autoRefresh, newInterval);
  };

  return (
    <div className="settings-panel">
      <h4>Auto-refresh Settings</h4>
      
      <div style={{ marginBottom: '0.5rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={handleToggleAutoRefresh}
            style={{ marginRight: '0.5rem' }}
          />
          Enable auto-refresh for positive news
        </label>
      </div>
      
      {autoRefresh && (
        <div>
          <div style={{ marginBottom: '0.25rem', fontSize: '0.9rem', color: '#495057' }}>
            Refresh every:
          </div>
          <div className="refresh-options">
            {intervalOptions.map(option => (
              <button
                key={option.value}
                type="button"
                className={`refresh-option ${refreshInterval === option.value ? 'active' : ''}`}
                onClick={() => handleIntervalChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RefreshSettings;