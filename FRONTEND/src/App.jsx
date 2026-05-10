import './App.css';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import LandingPage from './pages/landing';
import Authentication from './pages/authentication';
import { AuthProvider } from './contexts/AuthContext';
import VideoMeetComponent from './pages/VideoMeet';
import HomeComponent from './pages/home';
import History from './pages/history';
import withAuth from './utils/withAuth';
import ProfilePage from './pages/profile';
import SchedulePage from './pages/schedule';

const ProtectedVideoMeet = withAuth(VideoMeetComponent);

function App() {
  return (
    <div className="App">

      <Router>

        <AuthProvider>


          <Routes>

            <Route path='/' element={<LandingPage />} />

            <Route path='/auth' element={<Authentication />} />

            <Route path='/home' element={<HomeComponent />} />
            <Route path='/history' element={<History />} />
            <Route path='/profile' element={<ProfilePage />} />
            <Route path='/schedule' element={<SchedulePage />} />
            <Route path='/meeting/:roomId' element={<ProtectedVideoMeet />} />
          </Routes>
        </AuthProvider>

      </Router>
    </div>
  );
}

export default App;