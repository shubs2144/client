import { useState, useEffect} from 'react';
import axios from 'axios';
import moment from 'moment-timezone';

const ChefDashboard = () => {
  const [officeCount, setOfficeCount] = useState(0);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchOfficeCount = async () => {
      try {
        const res = await axios.get('/api/v1/attendance/office-count');
        setOfficeCount(res.data.count);
      } catch (err) {
        console.error('Error fetching office count:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOfficeCount();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold mb-6">Chef Dashboard</h2>
        
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-blue-800 mb-2">Today's Office Attendance</h3>
          <p className="text-4xl font-bold text-blue-600">{officeCount}</p>
          <p className="mt-2 text-sm text-blue-700">
            As of {moment.tz('Asia/Kolkata').format('h:mm A')} on {moment.tz('Asia/Kolkata').format('MMMM D, YYYY')}
          </p>
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-700">Instructions:</h3>
          <p className="mt-1 text-gray-600">
            This count represents the number of employees working from office today.
            Please plan lunch accordingly.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Note: You will receive a daily notification at 9:30 AM with this count.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChefDashboard;