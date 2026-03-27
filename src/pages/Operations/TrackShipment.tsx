import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Truck, Package, Building2, MapPin } from 'lucide-react';
import api from '../../services/api';

const TrackShipment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [shipment, setShipment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 🔄 REAL-TIME POLLING LOGIC
  useEffect(() => {
    const fetchShipment = async () => {
      try {
        const response = await api.get(`/shipments/${id}`);
        setShipment(response.data);
      } catch (error) {
        console.error("Failed to fetch live shipment data:", error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch immediately on load
    fetchShipment();

    // Set up the interval to fetch new data every 5 seconds
    const intervalId = setInterval(fetchShipment, 5000);

    // Cleanup the interval when the user leaves the page
    return () => clearInterval(intervalId);
  }, [id]);

  // 🧠 SMART TIMELINE GENERATOR
  // This converts your database 'status' into the visual timeline steps
  const generateTimeline = (currentStatus: string) => {
    const statusLower = currentStatus?.toLowerCase() || 'pending';
    
    // Define the logic for what steps are complete based on the current status
    const isPickedUp = ['picked_up', 'in_transit', 'arrived_at_hub', 'handed_over', 'delivered'].includes(statusLower);
    const isInTransit = ['in_transit', 'arrived_at_hub', 'handed_over', 'delivered'].includes(statusLower);
    const isDelivered = statusLower === 'delivered';

    return [
      { 
        id: 1, 
        title: 'Shipment Created', 
        location: shipment?.pickup_city || 'Origin', 
        status: isPickedUp ? 'completed' : 'current', 
        icon: Package 
      },
      { 
        id: 2, 
        title: 'Picked Up by Transporter', 
        location: 'Local Hub', 
        status: isPickedUp ? (isInTransit ? 'completed' : 'current') : 'pending', 
        icon: Building2 
      },
      { 
        id: 3, 
        title: 'In Transit', 
        location: 'On the road', 
        status: isInTransit ? (isDelivered ? 'completed' : 'current') : 'pending', 
        icon: Truck 
      },
      { 
        id: 4, 
        title: 'Successfully Delivered', 
        location: shipment?.receiver_city || 'Destination', 
        status: isDelivered ? 'completed' : 'pending', 
        icon: CheckCircle2 
      },
    ];
  };

  if (loading) return <div className="p-10 text-center text-gray-500 font-medium">Connecting to live satellite tracking...</div>;
  if (!shipment) return <div className="p-10 text-center text-red-500 font-medium">Shipment not found.</div>;

  const trackingEvents = generateTimeline(shipment.status);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header & Back Button */}
      <div className="flex items-center space-x-4 border-b border-gray-200 pb-4">
        <Link 
          to="/operations" 
          className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-[#1B2A4A]">
          Live Tracking Dashboard
        </h1>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-xl shadow-sm border border-gray-200">
        
        {/* Shipment Info Banner */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 p-4 rounded-lg border border-gray-200 mb-10">
          <div>
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Tracking ID
            </h2>
            <p className="text-base sm:text-lg font-bold text-[#D97706] break-all">{id}</p>
          </div>
          <div className="mt-4 sm:mt-0 text-left sm:text-right">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Current Status
            </h2>
            <p className="text-base sm:text-lg font-bold text-[#1B2A4A] uppercase">
              {shipment.status || 'PENDING'}
            </p>
          </div>
        </div>

        {/* ⏳ THE FIXED TIMELINE UI (FLEXBOX) */}
        <div className="relative pl-2 sm:pl-4">
          
          {/* The solid gray line running behind the icons */}
          <div className="absolute top-4 bottom-8 left-[26px] sm:left-[34px] w-0.5 bg-gray-200 z-0"></div>

          {trackingEvents.map((event) => {
            const Icon = event.icon;
            
            // Dynamic Styling Colors
            let iconBgColor = 'bg-gray-100';
            let iconColor = 'text-gray-400';
            let titleColor = 'text-gray-400';
            let ringColor = 'ring-white';

            if (event.status === 'completed') {
              iconBgColor = 'bg-green-100';
              iconColor = 'text-green-600';
              titleColor = 'text-gray-900';
            } else if (event.status === 'current') {
              iconBgColor = 'bg-[#D97706]';
              iconColor = 'text-white';
              titleColor = 'text-[#D97706]';
              ringColor = 'ring-orange-50'; // Subtle glow effect
            }

            return (
              <div key={event.id} className="relative flex items-start mb-10 last:mb-0 z-10">
                
                {/* 1. The Icon Column */}
                <div className={`flex-shrink-0 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full ring-8 ${ringColor} ${iconBgColor}`}>
                  <Icon size={20} className={iconColor} />
                </div>
                
                {/* 2. The Text Column (safely pushed to the right) */}
                <div className="ml-6 pt-1 sm:pt-2">
                  <h3 className={`text-base sm:text-lg font-bold ${titleColor}`}>
                    {event.title}
                  </h3>
                  <p className={`text-sm font-medium mt-1 ${event.status === 'pending' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {event.location}
                  </p>
                </div>

              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
};

export default TrackShipment;