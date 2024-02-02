import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Home_Screen from './Components/Home_Page/Home_Screen';
import Add_Guest_Screen from './Components/Add_Guest_Page/Add_Guest_Screen_copy';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
            <Route exact path="/" element={<Home_Screen />} />
            <Route exact path="/add_guest" element={<Add_Guest_Screen />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
