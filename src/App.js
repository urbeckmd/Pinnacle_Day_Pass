import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Home_Screen from './Components/Home_Page/Home_Screen';
import Add_Guest_Screen from './Components/Add_Guest_Page/Add_Guest_Screen_copy';
import Forgot_Password_Screen from './Components/Forgot_Password_Page/Forgot_Password_Screen';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
            <Route exact path="/" element={<Home_Screen />} />
            <Route exact path="/add_guest" element={<Add_Guest_Screen />} />
            <Route exact path="/forgot_password" element={<Forgot_Password_Screen />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
