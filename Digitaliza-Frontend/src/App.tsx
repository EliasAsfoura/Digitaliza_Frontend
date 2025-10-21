import { BrowserRouter as Router, Routes, Route, Navigate, } from "react-router-dom";
import Login from "./Containers/Login";
import Inicio from "./Containers/Inicio";

function App() {


  return (

    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={ <Login/> } />
        <Route path="/inicio" element={ <Inicio/> } />
      </Routes>
    </Router>

  )
}

export default App
