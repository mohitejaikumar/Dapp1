

import { Route, Routes } from 'react-router'
import './App.css'
import Navbar from './components/Navbar'
import Swap from './components/Swap'
import LaunchPad from './components/LaunchPad'


function App() {

    return (
      <>
        <Navbar />
        <Routes>
          <Route path="/" element={<Swap/>} ></Route>
          <Route path="/launchPad" element={<LaunchPad/>}></Route>
        </Routes>
      </>
    )
}

export default App
