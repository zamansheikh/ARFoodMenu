import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaStar, FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import { FaPencilAlt, FaTrashAlt } from 'react-icons/fa';
import Sidebar from '../../component/admin/Sidebar';
import axiosInstance from '../../component/axiosInstance';
// Sample food data (replace with API data)

export default function Menu() {
	const { categoryName } = useParams();
	const navigate = useNavigate();
	const [foods, setFoods] = useState([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [newFood, setNewFood] = useState({
		category_id: '',
		category: ' ',
		name: '',
		imageFile: null,
		modelFile: null,
		description: '',
		price: '',
	});
	const [error, setError] = useState(null);
	const [categories, setCategories] = useState([]); // For the category dropdown

	// Fetch categories for the dropdown
	useEffect(() => {
		const fetchCategory = async () => {
			try {
				const response = await axiosInstance.get('restaurant/get_categories/');
				if (response.status === 200) {
					console.log('✅ Category List Fetched:', response.data);

					setCategories([...new Set(response.data)]);
				} else {
					console.error(
						'❌ Error fetching category list:',
						response.data.error
					);
				}
			} catch (error) {
				console.error('❌ Error fetching category list:', error.message);
				setError('Failed to load categories. Please try again.');
			}
		};

		fetchCategory();
		fetchFood();
	}, []);
	const fetchFood = async () => {
		try {
			const response = await axiosInstance.get('restaurant/get_all_foods/');
			if (response.status === 200) {
				console.log('✅ Food List Fetched:', response.data);
				setFoods(response.data);
			} else {
				console.error('❌ Error fetching food list:', response.data.error);
			}
		} catch (error) {
			console.error('❌ Error fetching food list:', error.message);
			setError('Failed to load foods. Please try again.');
		}
	};

	// Fetch foods for the category (placeholder for now)
	useEffect(() => {
		// In a real app, fetch foods for the category from an API
		// axiosInstance.get(`restaurant/get_foods/${categoryName}`)
		//   .then(response => setFoods(response.data))
		//   .catch(err => console.error('Error fetching foods:', err));
	}, [categoryName]);

	const handleAddFood = () => {
		setIsModalOpen(true);
	};

	const handleModalSubmit = async (e) => {
		e.preventDefault();
		setError(null);
		setIsLoading(true);

		// Validate that both files are selected
		if (!newFood.imageFile || !newFood.modelFile) {
			setError('Please upload both an image and a 3D model.');
			return;
		}

		try {
			// Create a FormData object
			const formData = new FormData();
			formData.append('category', newFood.category);
			formData.append('item_name', newFood.name);
			formData.append('normal_picture', newFood.imageFile); // Append the image file
			formData.append('three_d_picture', newFood.modelFile); // Append the 3D model file
			formData.append('description', newFood.description);
			formData.append('price', parseFloat(newFood.price));

			// Send the FormData to the API
			const response = await axiosInstance.post(
				`restaurant/add_food/${newFood.category}/`,
				formData,
				{
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				}
			);

			if (response.status === 200 || response.status === 201) {
				// Add the new food to the list
				fetchFood();
				setNewFood({
					category: ' ',
					name: '',
					imageFile: null,
					modelFile: null,
					description: '',
					price: '',
				});
				setIsModalOpen(false);
			}
		} catch (err) {
			console.error('Error creating food item:', err);
			setError('Failed to create food item. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	const handleDelete = async (id) => {
		if (!window.confirm('Are you sure you want to delete this seminar?')) {
			return;
		}

		setError('');

		try {
			const response = await axiosInstance.delete(
				`restaurant/delete_food/${id}/`
			);

			if (response.status === 204 || response.status === 200) {
				alert('✅ Food deleted successfully');
				fetchFood(); // Refresh the seminar list
			} else {
				throw new Error('Failed to delete seminar');
			}
		} catch (err) {
			setError(
				err.response?.data?.message ||
					'Failed to delete seminar. Please try again.'
			);
		}
	};

	return (
		<Sidebar>
			<div className="min-h-screen bg-white p-4">
				{/* Header */}
				<div className="flex justify-between items-center mb-4">
					<button onClick={() => navigate(-1)} className="text-teal-600">
						<FaArrowLeft size={24} />
					</button>
					<button
						onClick={handleAddFood}
						className="bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600 transition">
						ADD FOOD
					</button>
				</div>

				{/* Food Grid */}
				<div className="grid grid-cols-2 md:grid-cols-5 gap-4">
					{foods.map((food, index) => (
						<div
							key={index}
							className="bg-white rounded-lg shadow-md cursor-pointer hover:shadow-lg transition relative">
							<img
								src={`https://bdcallingarbackend.duckdns.org${food.normal_picture}`}
								alt={food.item_name}
								className="w-full h-40 object-cover rounded-t-lg"
							/>
							<div className="p-4">
								<div className="flex justify-between items-center mb-2">
									<h4 className="text-lg font-bold text-gray-800">
										{food.item_name}
									</h4>
									<span className="text-green-500 font-bold text-lg">
										BDT {food.price}
									</span>
								</div>
								<p className="text-green-500 text-sm mb-2">
									Category: {food.category_name}
								</p>
								<p className="text-gray-600 text-sm">{food.description}</p>
								<button
									onClick={() => handleDelete(food.id)}
									className=" bg-slate-50 text-gray-700 text-xs font-bold rounded-full px-2 py-1 absolute top-2 right-2">
									<FaTrashAlt size={15} color="red" className="inline" />
								</button>
							</div>
						</div>
					))}
				</div>

				{/* Modal for Adding Food */}
				{isModalOpen && (
					<div className="fixed inset-0   flex items-center justify-center">
						<div
							className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg"
							style={{ opacity: 1 }}>
							<h2 className="text-2xl font-bold text-gray-800 mb-4">
								Add New Food Item
							</h2>
							{error && <p className="text-red-500 mb-4">{error}</p>}
							<form onSubmit={handleModalSubmit}>
								<div className="mb-4">
									<label className="block text-gray-700 mb-2">Category</label>
									<select
										value={newFood.category}
										onChange={(e) =>
											setNewFood({ ...newFood, category: e.target.value })
										}
										className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
										required>
										{categories.map((cat, index) => (
											<option key={index} value={cat.id}>
												{cat.category_name}
											</option>
										))}
									</select>
								</div>
								<div className="mb-4">
									<label className="block text-gray-700 mb-2">Name</label>
									<input
										type="text"
										value={newFood.name}
										onChange={(e) =>
											setNewFood({ ...newFood, name: e.target.value })
										}
										className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
										required
									/>
								</div>
								<div className="mb-4">
									<label className="block text-gray-700 mb-2">Image</label>
									<input
										type="file"
										accept="image/*"
										onChange={(e) =>
											setNewFood({ ...newFood, imageFile: e.target.files[0] })
										}
										className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
										required
									/>
								</div>
								<div className="mb-4">
									<label className="block text-gray-700 mb-2">3D Model</label>
									<input
										type="file"
										accept=".glb,.gltf"
										onChange={(e) =>
											setNewFood({ ...newFood, modelFile: e.target.files[0] })
										}
										className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
										required
									/>
								</div>
								<div className="mb-4">
									<label className="block text-gray-700 mb-2">
										Description
									</label>
									<textarea
										value={newFood.description}
										onChange={(e) =>
											setNewFood({ ...newFood, description: e.target.value })
										}
										className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
										rows="3"
										required></textarea>
								</div>
								<div className="mb-4">
									<label className="block text-gray-700 mb-2">Price </label>
									<input
										type="number"
										value={newFood.price}
										onChange={(e) =>
											setNewFood({ ...newFood, price: e.target.value })
										}
										className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
										step="0.01"
										min="0"
										required
									/>
								</div>
								<div className="flex justify-end space-x-2">
									<button
										type="button"
										onClick={() => setIsModalOpen(false)}
										className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition">
										Cancel
									</button>

									<button
										type="submit"
										disabled={isLoading}
										className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition">
										{isLoading ? 'Adding..' : 'Add'}
									</button>
								</div>
							</form>
						</div>
					</div>
				)}
			</div>
		</Sidebar>
	);
}
