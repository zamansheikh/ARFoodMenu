import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	FaArrowLeft,
	FaDrumstickBite,
	FaFish,
	FaUtensils,
	FaPizzaSlice,
} from 'react-icons/fa';
import { MdRiceBowl } from 'react-icons/md';
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

export default function AllFood() {
	const navigate = useNavigate();
	const [allFoods, setAllFoods] = useState([]);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(true);

	// Fetch food data with retry logic
	useEffect(() => {
		const fetchFoods = async () => {
			setLoading(true);
			let retryCount = 0;
			const maxRetries = 5;
			const retryDelay = 3000;

			while (retryCount < maxRetries) {
				try {
					const response = await axiosInstance.get('user_pov/get_all_food/4/');
					if (response.status === 200) {
						console.log('✅ Food List Fetched:', response.data);

						const flattenedFoods = response.data.flatMap((category) =>
							category.foods.map((food) => ({
								...food,
								category: category.category_name,
							}))
						);
						setAllFoods(flattenedFoods);
						setError(null);
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
	}, []);

	const handleFoodClick = (model_url, food) => {
		navigate('/ar-view', {
			state: { selectedModel: model_url, foodDetails: food },
		});
	};

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
					<h1 className="text-lg font-bold text-gray-800">All Food</h1>
					<div className="w-6"></div> {/* Spacer for alignment */}
				</div>

				{/* Error Message */}
				{error && (
					<p className="text-red-500 text-sm text-center mb-4">{error}</p>
				)}

				{/* Food Grid or Loading State */}
				{loading ? (
					<SkeletonLoader />
				) : (
					<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3">
						{allFoods.length > 0 ? (
							allFoods.map((food, index) => (
								<div
									key={index}
									className="food-card bg-[#F8F8F8] rounded-xl shadow-sm p-2.5 cursor-pointer relative"
									onClick={() => handleFoodClick(food.three_d_picture, food)}
								>
									{/* Discount Badge */}
									{food.discount && (
										<div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-semibold rounded-full px-2 py-1">
											{food.discount}
										</div>
									)}
									

								</div>
							))
						) : (
							<p className="text-gray-600 text-sm col-span-2 text-center">
								No foods available.
							</p>
						)}
					</div>
				)}
			</div>
		</div>
	);
}