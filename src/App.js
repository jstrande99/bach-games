import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Members from './Components/Members';
import ScoreCard from './Components/ScoreCard';
import Map from './Components/Map';

function App() {
  const [firstName, setFirstName] = useState(""); 
  const [name, setName] = useState("");
  return (
    <Router>
      <Routes>
        <Route path='/' element={name ? <ScoreCard name={name} /> : < Members firstName={firstName} setFirstName={setFirstName} setName={setName} name={name}/> } />
        <Route path='/Map' element={<Map />}/>
      </Routes>
    </Router>

  );
}

export default App;