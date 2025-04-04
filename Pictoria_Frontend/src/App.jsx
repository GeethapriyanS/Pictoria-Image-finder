import {BrowserRouter,Routes,Route} from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Home3 from './components/Home3';
import Profile from './components/Profile';
function App() {
  return (
    <>
     <BrowserRouter>
       <Routes>
         <Route path='/login' element={<Login />}/>
         <Route path='/signup' element={<Signup />}/>
         <Route path='/home3' element={<Home3 />}/>
         <Route path="/profile" element={<Profile/>}/>
       </Routes>
     </BrowserRouter>
    </>
  )
}

export default App
