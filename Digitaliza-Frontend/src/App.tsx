import { BrowserRouter as Router, Routes, Route, Navigate, } from "react-router-dom";
import Login from "./Containers/Login";
import Inicio from "./Containers/Inicio";
import Actuaciones from "./Containers/Actuaciones";

function App() {


  return (

    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={ <Login/> } />
        <Route path="/inicio" element={ <Inicio/> } />
        <Route path="/actuaciones" element={ <Actuaciones/> } />
      </Routes>
    </Router>

  )
}

export default App
