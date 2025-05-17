import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import moment from 'moment-timezone';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';

const EmployeeDashboard = () => {
  const [attendanceStatus, setAttendanceStatus] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [todaysStatus, setTodaysStatus] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
  const fetchTodaysAttendance = async () => {
    try {
      const today = moment.tz('Asia/Kolkata').startOf('day').toISOString();
      // Change from analytics endpoint to user-specific endpoint
      const res = await axios.get(`/api/v1/attendance?date=${today}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (res.data.data) {
        setTodaysStatus(res.data.data.status);
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
    }
  };

  fetchTodaysAttendance();
}, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!attendanceStatus) {
      toast.error('Please select an attendance status');
      return;
    }

    // Parse the selected date or use today's date
    let date = selectedDate ? new Date(selectedDate) : new Date();
    date = moment.tz(date, 'Asia/Kolkata').startOf('day').toDate();
    
    // Check if it's a weekend
    const dayOfWeek = moment.tz(date, 'Asia/Kolkata').day();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      toast.warning('Cannot mark attendance for weekends. Please select a weekday.');
      return;
    }

    try {
      const res = await axios.post('/api/v1/attendance', {
        status: attendanceStatus,
        forDate: date
      });
      
      toast.success(res.data.message);
      setTodaysStatus(attendanceStatus);
    } catch (err) {
      if (err.response?.data?.error?.includes('weekend')) {
        toast.warning('Cannot mark attendance for weekends');
      } else {
        toast.error(err.response?.data?.error || 'Error marking attendance');
      }
    }
  };

  const now = moment.tz('Asia/Kolkata');
  const cutoffTime = moment.tz('Asia/Kolkata').set({ hour: 9, minute: 30, second: 0 });
  const isAfterCutoff = now.isAfter(cutoffTime);
  const isWeekend = [0, 6].includes(moment.tz('Asia/Kolkata').day());

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold mb-6">Mark Your Attendance</h2>
        
        {isAfterCutoff && !selectedDate && (
          <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded">
            It's after 9:30 AM. Your attendance will be marked for tomorrow.
          </div>
        )}
        
        {isWeekend && !selectedDate && (
          <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded">
            Today is a weekend. You can mark attendance for future weekdays.
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Date (optional)
            </label>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => {
                const day = moment.tz(date, 'Asia/Kolkata').day();
                if (day === 0 || day === 6) {
                  toast.warning('Weekend selection not allowed');
                  return;
                }
                setSelectedDate(date);
              }}
              minDate={new Date()}
              filterDate={(date) => {
                const day = moment.tz(date, 'Asia/Kolkata').day();
                return day !== 0 && day !== 6; // Disable weekends
              }}
              className="border border-gray-300 rounded p-2 w-full"
              placeholderText="Today (default)"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attendance Status
            </label>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  id="office"
                  name="status"
                  type="radio"
                  value="office"
                  checked={attendanceStatus === 'office'}
                  onChange={() => setAttendanceStatus('office')}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="office" className="ml-2 block text-sm text-gray-700">
                  Working from Office
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="home"
                  name="status"
                  type="radio"
                  value="home"
                  checked={attendanceStatus === 'home'}
                  onChange={() => setAttendanceStatus('home')}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="home" className="ml-2 block text-sm text-gray-700">
                  Working from Home
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="leave"
                  name="status"
                  type="radio"
                  value="leave"
                  checked={attendanceStatus === 'leave'}
                  onChange={() => setAttendanceStatus('leave')}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="leave" className="ml-2 block text-sm text-gray-700">
                  On Leave
                </label>
              </div>
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={!attendanceStatus}
            >
              Submit Attendance
            </button>
          </div>
        </form>
        
        {todaysStatus && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-700">Today's Status:</h3>
            <p className="capitalize mt-1 text-gray-900">
              {todaysStatus === 'office' && 'Working from Office'}
              {todaysStatus === 'home' && 'Working from Home'}
              {todaysStatus === 'leave' && 'On Leave'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;