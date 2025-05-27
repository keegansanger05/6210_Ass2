import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import NavMenu from "./NavMenu";
import ItemsDetail from './ItemDetail';
import AdminPanel from './AdminPanel';


function App() {
  return (
    <Router>
      <div>
        <h1>Welcome to the SCP Database</h1> {/* Always shown */}
        <NavMenu />                            {/* Always shown */}
        <Routes>
          <Route
  path="/"
  element={
    <div>
      <h4>This database contains information regarding the SCP 010 to SCP 029 in order</h4>
      <br></br>
      <h4>Continue at OWN risk...</h4>
      <div class="image">
        <img src="images/warning.jpg" alt="warning" />
      </div>
    </div>
  }
/>

          <Route path="/item/:id" element={<ItemsDetail />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
