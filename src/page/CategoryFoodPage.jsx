import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../component/axiosInstance';
import { FaArrowLeft, FaSearch } from 'react-icons/fa';
import SkeletonLoader from '../component/SkeletonLoader'; // Import the skeleton loader component

export default function CategoryFoodPage() {
	const { category } = useParams();
	const [foods, setFoods] = useState([]);
	const [loading, setLoading] = useState(true); // Add loading state
	const [searchQuery, setSearchQuery] = useState('');
	const navigate = useNavigate();

	useEffect(() => {
		const fetchFoods = async () => {
			setLoading(true); // Keep loading true until successful fetch
			let retryCount = 0;
			const maxRetries = 5; // Maximum number of retries
			const retryDelay = 3000; // Delay between retries in milliseconds (3 seconds)

			while (retryCount < maxRetries) {
				try {
					const response = await axiosInstance.get('user_pov/get_all_food/4/');
					if (response.status === 200) {
						const flattenedFoods = response.data.flatMap((cat) =>
							cat.foods.map((food) => ({
								...food,
								category: cat.category_name,
							}))
						);

						if (category.toLowerCase() === 'all') {
							setFoods(flattenedFoods);
						} else {
							const filteredFoods = flattenedFoods.filter(
								(food) => food.category.toLowerCase() === category.toLowerCase()
							);
							setFoods(filteredFoods);
						}

						setLoading(false); // Data fetched successfully, stop loading
						break; // Exit the retry loop
					} else {
						throw new Error('Failed to load foods.');
					}
				} catch (error) {
					console.error('❌ Error fetching food list:', error.message);
					retryCount++;
					if (retryCount === maxRetries) {
						// After max retries, keep loading state true (no error shown)
						setLoading(true);
						break;
					}
					// Wait before retrying
					await new Promise((resolve) => setTimeout(resolve, retryDelay));
				}
			}
		};

		fetchFoods();
	}, [category]);

	const handleSearchChange = (e) => {
		setSearchQuery(e.target.value);
	};

	// Filter foods based on search query
	const filteredFoods = foods.filter((food) =>
		food.item_name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<div className="min-h-screen bg-[#ffff] p-4">
			{/* Container with max-width for desktop */}
			<div className="max-w-[748px] mx-auto">
				<div className="flex justify-between items-center mb-4">
					<button onClick={() => navigate(-1)} className="text-teal-600">
						<FaArrowLeft size={20} />
					</button>
					<h1 className="text-xl font-bold text-gray-800">
						{category.toLowerCase() === 'all'
							? 'All Foods'
							: `${category.charAt(0).toUpperCase() + category.slice(1)} Foods`}
					</h1>
					<div className="w-6"></div>
				</div>

				{/* Search Bar */}
				<div className="relative mb-4">
					<input
						type="text"
						placeholder="Search within category"
						value={searchQuery}
						onChange={handleSearchChange}
						className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
						disabled={loading} // Disable search while loading
					/>
					<FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
				</div>

				{loading ? (
					<SkeletonLoader /> // Show skeleton loader while fetching
				) : filteredFoods.length > 0 ? (
					<div className="grid grid-cols-2 gap-4">
						{filteredFoods.map((food) => (
							<div
								key={food.id}
								className="bg-[#F5F5F5] rounded-[20px] shadow p-4 cursor-pointer"
								onClick={() =>
									navigate('/ar-view', {
										state: {
											selectedModel: food.three_d_picture,
											foodDetails: food,
										},
									})
								}>
								<img
									src={
										`${import.meta.env.VITE_REACT_BASE_API_URL}${
											food.normal_picture
										}` || 'https://via.placeholder.com/150'
									}
									alt={food.item_name}
									className="w-full h-[18vh] object-cover rounded-lg mb-2"
								/>
								<h4 className="text-md text-black font-semibold mb-1 truncate w-full">
									{food.item_name}
								</h4>
								<div className="flex justify-between items-center text-sm text-gray-600">
									<span>{food.price || '৳29.00'} BDT</span>
									<span>⏰ {food.time || '4.8'}</span>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="flex flex-col items-center justify-center py-8">
						<FaSearch className="text-gray-400 text-6xl mb-4" />
						<p className="text-gray-600 text-center">
							No foods found in this category.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
