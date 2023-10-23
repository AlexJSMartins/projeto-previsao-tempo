
import { Routes, BrowserRouter, Route } from 'react-router-dom';



import './App.css'
import Home from './pages/home';


function App() {
 

  return (
 <BrowserRouter>
<Routes>
    <Route path='/' Component={Home}/>
    


  </Routes>

  </BrowserRouter>
    

   
  )
}

export default App
