import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../../component/admin/Sidebar';
import axiosInstance from '../../component/axiosInstance';
import { FaPencilAlt, FaTrashAlt } from 'react-icons/fa';
// Sample category data (initially static, will be updated with API data)

export default function Categories() {
	const navigate = useNavigate();
	const [categories, setCategories] = useState([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [newCategory, setNewCategory] = useState({ name: '', image: '' });
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);

	// Fetch categories from API (placeholder for now)
	useEffect(() => {
		fetchSeminarData();
	}, []);

	const fetchSeminarData = async () => {
		setLoading(true);
		try {
			const response = await axiosInstance.get('restaurant/get_categories/');

			if (response.status === 200) {
				console.log('✅ Seminar List Fetched:', response.data);
				setCategories(response.data);
			} else {
				console.error('❌ Error fetching seminar list:', response.data.error);
			}
		} catch (error) {
			console.error('❌ Error fetching seminar list:', error.message);
			setError('Failed to load seminars. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	const handleCategoryClick = (categoryName) => {
		navigate(`/category/${categoryName.toLowerCase().replace(/\s+/g, '-')}`);
	};

	const handleAddCategory = () => {
		setIsModalOpen(true);
	};

	const handleModalSubmit = async (e) => {
		e.preventDefault();
		setError(null);

		try {
			// Send POST request to create a new category
			const response = await axiosInstance.post('restaurant/create_category/', {
				category_name: newCategory.name,
			});

			if (response.status === 200 || response.status === 201) {
				alert('Category created successfully');
				// Add the new category to the list
				setCategories([
					...categories,
					{
						name: newCategory.name,
						itemCount: 0,
						image: newCategory.image || 'https://via.placeholder.com/150',
					},
				]);
				setNewCategory({ name: '', image: '' });
				setIsModalOpen(false);
			}
		} catch (err) {
			console.error('Error creating category:', err);
			setError('Failed to create category. Please try again.');
		}
	};

	const handleDelete = async (id) => {
		if (!window.confirm('Are you sure you want to delete this seminar?')) {
			return;
		}

		setLoading(true);
		setError('');

		try {
			const response = await axiosInstance.delete(
				`restaurant/delete_category/${id}/`
			);

			if (response.status === 204 || response.status === 200) {
				console.log('✅ Seminar deleted successfully');
				fetchSeminarData(); // Refresh the seminar list
			} else {
				throw new Error('Failed to delete seminar');
			}
		} catch (err) {
			setError(
				err.response?.data?.message ||
					'Failed to delete seminar. Please try again.'
			);
		} finally {
			setLoading(false);
		}
	};
	// restaurant/delete_category/3/
	return (
		<Sidebar title={'Categories'}>
			<div className="min-h-screen bg-white p-4">
				{/* Header with Add Category Button */}
				<div className="flex justify-end mb-4">
					<button
						onClick={handleAddCategory}
						className="bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600 transition">
						ADD CATEGORY
					</button>
				</div>

				{/* Category Grid */}
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-12 gap-4">
					{categories.map((category, index) => (
						<div
							key={index}
							className="bg-white px-2 py-2 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition"
							onClick={() => handleCategoryClick(category.name)}>
							<img
								src={
									'https://e7.pngegg.com/pngimages/80/950/png-clipart-computer-icons-foodie-blog-categories-miscellaneous-food.png'
								}
								alt={category.category_name}
								className="w-full h-16 object-cover rounded-t-lg"
							/>
							<div className=" flex justify-between items-center">
								<h4 className="text-md font-semibold text-gray-800">
									{category.category_name}
								</h4>
								<button
									onClick={() => handleDelete(category.id)}
									className=" text-gray-700 text-xs font-bold rounded-full px-2 py-1">
									<FaTrashAlt size={15} color="red" className="inline" />
								</button>
							</div>
						</div>
					))}
				</div>

				{/* Modal for Adding Category */}
				{isModalOpen && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
						<div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
							<h2 className="text-xl font-bold mb-4">Add New Category</h2>
							{error && <p className="text-red-500 mb-4">{error}</p>}
							<form onSubmit={handleModalSubmit}>
								<div className="mb-4">
									<label className="block text-gray-700 mb-2">
										Category Name
									</label>
									<input
										type="text"
										value={newCategory.name}
										onChange={(e) =>
											setNewCategory({ ...newCategory, name: e.target.value })
										}
										className="w-full p-2 border rounded-lg"
										required
									/>
								</div>

								<div className="flex justify-end space-x-2">
									<button
										type="button"
										onClick={() => setIsModalOpen(false)}
										className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg">
										Cancel
									</button>
									<button
										type="submit"
										className="bg-green-500 text-white px-4 py-2 rounded-lg">
										Add
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
