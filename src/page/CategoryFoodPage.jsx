import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSearch } from 'react-icons/fa';
import axiosInstance from '../component/axiosInstance';

// Custom CSS for scrollbar hiding and enhanced styling
const styles = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
  }
  .food-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .food-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

// Skeleton Loader for Food Cards
const CardSkeleton = () => (
	<div className="bg-gray-100 rounded-xl p-2.5 animate-pulse">
		<div className="w-full h-28 bg-gray-200 rounded-lg mb-2"></div>
		<div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
		<div className="flex justify-between">
			<div className="h-3 bg-gray-200 rounded w-1/4"></div>
			<div className="h-3 bg-gray-200 rounded w-1/4"></div>
		</div>
	</div>
);

// Skeleton Loader Grid
const SkeletonLoader = () => (
	<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3">
		{Array(6)
			.fill(0)
			.map((_, index) => (
				<CardSkeleton key={index} />
			))}
	</div>
);

export default function CategoryFoodPage() {
	const { category } = useParams();
	const [foods, setFoods] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [searchQuery, setSearchQuery] = useState('');
	const navigate = useNavigate();

	useEffect(() => {
		const fetchFoods = async () => {
			setLoading(true);
			setError(null);
			let retryCount = 0;
			const maxRetries = 5;
			const retryDelay = 3000; // Fixed: Changed from 10ms to 3000ms

			while (retryCount < maxRetries) {
				try {
					const response = await axiosInstance.get('user_pov/get_all_food/6/');
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

						setLoading(false);
						break;
					} else {
						throw new Error('Failed to load foods.');
					}
				} catch (error) {
					console.error('❌ Error fetching food list:', error.message);
					retryCount++;
					if (retryCount === maxRetries) {
						setError('Failed to load foods. Please try again.');
						setLoading(false);
						break;
					}
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
		<div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-3">
			<style>{styles}</style>
			<div className="max-w-[748px] mx-auto">
				{/* Header */}
				<div className="flex justify-between items-center mb-4">
					<button
						onClick={() => navigate(-1)}
						className="text-blue-700 p-2 rounded-full hover:bg-blue-100 transition-colors"
					>
						<FaArrowLeft size={18} />
					</button>
					<h1 className="text-lg font-bold text-gray-800">
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
						className="w-full p-2.5 pl-9 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm"
						disabled={loading}
					/>
					<FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
				</div>

				{/* Error Message */}
				{error && (
					<p className="text-red-500 text-sm text-center mb-4">{error}</p>
				)}

				{/* Food Grid or Loading State */}
				{loading ? (
					<SkeletonLoader />
				) : filteredFoods.length > 0 ? (
					<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3">
						{filteredFoods.map((food) => (
							<div
								key={food.id}
								className="food-card bg-[#F8F8F8] rounded-xl shadow-sm p-2.5 cursor-pointer"
								onClick={() =>
									navigate('/ar-view', {
										state: {
											selectedModel: food.three_d_picture,
											foodDetails: food,
										},
									})
								}
							>
								<img
									src={food.normal_picture || 'https://via.placeholder.com/150'}
									alt={food.item_name}
									className="w-full h-28 object-cover rounded-lg mb-2"
								/>
								<h4 className="text-sm font-semibold text-gray-800 truncate">
									{food.item_name}
								</h4>
								<div className="flex justify-between items-center text-xs text-gray-600 mt-1">
									<span>{food.price || '৳29.00'} BDT</span>
									<span>⏰ {food.time || '4.8'}</span>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="flex flex-col items-center justify-center py-6">
						<FaSearch className="text-gray-400 text-4xl mb-2" />
						<p className="text-gray-600 text-sm text-center">
							No foods found in this category.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}