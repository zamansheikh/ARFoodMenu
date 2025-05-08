import React from 'react';

import { Routes, Route, Link, BrowserRouter } from 'react-router-dom';
import Home from './page/Home';
import AllFood from './page/AllFood';
import ARView from './page/ARView';
import CategoryFoodPage from './page/CategoryFoodPage';
import NotFound from './page/admin/NotFound';

import './App.css';
function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/all-food" element={<AllFood />} />
				<Route path="/ar-view" element={<ARView />} />
				<Route path="/category-food/:category" element={<CategoryFoodPage />} />
				<Route path="*" element={<NotFound />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
