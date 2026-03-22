import React from 'react';
import StatusBadge from './StatusBadge';
import { StatusUpdate } from '../../types';

interface TimelineProps {
  updates: StatusUpdate[];
}

const Timeline: React.FC<TimelineProps> = ({ updates }) => {
  if (!updates || updates.length === 0) {
    return <div className="text-gray-500 text-sm italic">No status updates yet. Shipment is waiting to be processed.</div>;
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {updates.map((update, eventIdx) => (
          <li key={update.id}>
            <div className="relative pb-8">
              {eventIdx !== updates.length - 1 ? (
                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center ring-8 ring-white border border-gray-200">
                    <div className="h-2.5 w-2.5 rounded-full bg-[#D97706]" />
                  </span>
                </div>
                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      <StatusBadge status={update.status} />
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {update.location || update.city || 'Unknown Location'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      By ID: {update.updated_by.substring(0, 8)}...
                    </p>
                  </div>
                  <div className="text-right text-sm whitespace-nowrap text-gray-500">
                    <time dateTime={update.created_at}>
                      {new Date(update.created_at).toLocaleString([], {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Timeline;