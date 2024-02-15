import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from './components/home/navBar';
import Create from './components/home/create';
import List from './components/home/list';

function App() {
  return (
    <BrowserRouter>
      <div>
        <NavBar />
        <Routes> 
          <Route index element={<Create />} />
          <Route path="/list" element={<List />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
