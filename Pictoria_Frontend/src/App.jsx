import {BrowserRouter,Routes,Route} from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Home3 from './components/Home3';
import Profile from './components/Profile';
import PhotopeaEditor from './components/Edit';
import GenerateImage from './components/Generate';
import Gallery from './components/Gallery';
import SharedCollection from './components/SharedCollection';

function App() {
  return (
    <>
     <BrowserRouter>
       <Routes>
         <Route path='/' element={<Home3 />}/>
         <Route path='/login' element={<Login />}/>
         <Route path='/signup' element={<Signup />}/>
         <Route path='/home3' element={<Home3 />}/>
         <Route path="/profile" element={<Profile/>}/>
         <Route path="/edit" element={<PhotopeaEditor/>}/>
         <Route path="/generate" element={<GenerateImage/>}/>
         <Route path='/gallery' element={<Gallery/>}/>
         <Route path='/shared-collection/:collectionId' element={<SharedCollection/>}/>
       </Routes>
     </BrowserRouter>
    </>
  )
}

export default App;