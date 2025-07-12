import { useEffect, useState } from 'react';
import Slider from 'react-slick';
import banner from '../assets/banner.mp4';
import {
	FaSearch,
	FaHamburger,
	FaPizzaSlice,
	FaDrumstickBite,
	FaUtensils,
	FaGlassWhiskey,
} from 'react-icons/fa';
import { MdRiceBowl, MdFastfood } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../component/axiosInstance';
import SkeletonLoader from '../component/SkeletonLoader'; // Reusable card skeleton
import { GiChickenOven } from 'react-icons/gi';


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
  .category-button {
    transition: background-color 0.3s ease, color 0.3s ease;
  }
`;

// Mapping of categories to icons
const categoryIcons = {
	All: <MdFastfood size={28} />,
	Burgers: <FaHamburger size={28} />,
	Pizza: <FaPizzaSlice size={28} />,
	Chicken: <GiChickenOven size={28} />,
	Rice: <MdRiceBowl size={28} />,
	Combo: <FaUtensils size={28} />,
	Drinks: <FaGlassWhiskey size={28} />,
};

// Function to get dynamic slider settings
const getSliderSettings = (itemCount) => {
	const defaultSlidesToShow = 2;
	const slidesToShow = Math.min(itemCount, defaultSlidesToShow);
	const infinite = itemCount > defaultSlidesToShow;

	return {
		dots: false,
		infinite: infinite,
		speed: 500,
		slidesToShow: slidesToShow,
		slidesToScroll: 1,
		responsive: [
			{
				breakpoint: 1024,
				settings: {
					slidesToShow: 2,
					slidesToScroll: 1,
				},
			},
			{
				breakpoint: 640,
				settings: {
					slidesToShow: 2, // Always show 2 items in mobile view
					slidesToScroll: 1,
					arrows: false, // Hide arrows on mobile for cleaner look
				},
			},
		],
	};
};

// Circle Skeleton for Categories
const CircleSkeleton = () => (
	<div className="flex flex-col items-center flex-shrink-0">
		<div className="p-3 rounded-full bg-gray-200 animate-pulse w-10 h-10"></div>
		<div className="h-2 bg-gray-200 rounded-full w-12 mt-1 animate-pulse"></div>
	</div>
);

// Category Skeleton Loader
const CategorySkeletonLoader = () => (
	<div className="flex space-x-3 overflow-x-auto scrollbar-hide px-2">
		{Array(4)
			.fill(0)
			.map((_, index) => (
				<CircleSkeleton key={index} />
			))}
	</div>
);

export default function ARMenu() {
	const [selectedCategory, setSelectedCategory] = useState('All');
	const [allFoods, setAllFoods] = useState([]);
	const [categories, setCategories] = useState([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	// Fetch food data from the API
	useEffect(() => {
		const fetchFoods = async () => {
			setLoading(true);
			let retryCount = 0;
			const maxRetries = 5;
			const retryDelay = 3000;

			while (retryCount < maxRetries) {
				try {
					const response = await axiosInstance.get('user_pov/get_all_food/6/');
					if (response.status === 200) {
						const flattenedFoods = response.data.flatMap((category) =>
							category.foods.map((food) => ({
								...food,
								category: category.category_name,
							}))
						);

						const uniqueFoods = Array.from(
							new Map(flattenedFoods.map((food) => [food.id, food])).values()
						);
						setAllFoods(uniqueFoods);

						const uniqueCategories = response.data
							.filter((category) => category.foods.length > 0)
							.map((category) => category.category_name);
						setCategories(['All', ...new Set(uniqueCategories)]);

						setLoading(false);
						break;
					} else {
						throw new Error('Failed to load foods.');
					}
				} catch (error) {
					console.error('❌ Error fetching food list:', error.message);
					retryCount++;
					if (retryCount === maxRetries) {
						setLoading(true);
						break;
					}
					await new Promise((resolve) => setTimeout(resolve, retryDelay));
				}
			}
		};

		fetchFoods();
	}, []);

	// Group foods by category (limit to 4 per category)
	const groupedFoods = categories
		.filter((category) => category !== 'All')
		.map((category) => ({
			name: category,
			foods: allFoods
				.filter((food) => food.category.toLowerCase() === category.toLowerCase())
				.slice(0, 4),
		}))
		.filter((group) => group.foods.length > 0);

	// Filter foods based on selected category
	const filteredFoods =
		selectedCategory === 'All'
			? allFoods
			: allFoods.filter(
				(food) => food.category.toLowerCase() === selectedCategory.toLowerCase()
			);

	// Filter foods based on search query
	const searchResults = allFoods.filter((food) =>
		food.item_name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const handleFoodClick = (model_url, food) => {
		navigate('/ar-view', {
			state: { selectedModel: model_url, foodDetails: food },
		});
	};

	const handleCategoryClick = (category) => {
		setSelectedCategory(category);
	};

	const handleSearchChange = (e) => {
		setSearchQuery(e.target.value);
	};

	return (
		<div className="min-h-screen bg-white p-3">
			<style>{styles}</style>
			<div className="max-w-[748px] mx-auto">
				{/* Banner */}
				<div className="mb-4">
					<video
						src={banner}
						alt="Banner"
						className="w-full h-[180px] sm:h-[220px] md:h-[260px] object-cover rounded-xl shadow-sm"
						autoPlay
						loop
						muted
						playsInline
					/>
				</div>

				{/* Search Bar */}
				<div className="relative mb-4">
					<input
						type="text"
						placeholder="Search for food"
						value={searchQuery}
						onChange={handleSearchChange}
						className="w-full p-2.5 pl-9 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm"
						disabled={loading}
					/>
					<FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
				</div>

				{/* Loading Skeleton or Content */}
				{loading ? (
					<>
						<div className="mb-4">
							<h3 className="text-base font-bold text-gray-800 mb-2">Category</h3>
							<CategorySkeletonLoader />
						</div>
						<SkeletonLoader />
					</>
				) : (
					<>
						{/* Search Results Section */}
						{searchQuery && (
							<div className="mb-4">
								<h3 className="text-base font-bold text-gray-800 mb-2">Search Results</h3>
								{searchResults.length > 0 ? (
									<div className="grid grid-cols-2 gap-3">
										{searchResults.map((food) => (
											<div
												key={food.id}
												className="food-card bg-[#F8F8F8] rounded-xl shadow-sm p-2.5 cursor-pointer"
												onClick={() => handleFoodClick(food.three_d_picture, food)}
											>
												<img
													src={food.normal_picture || 'https://via.placeholder.com/150'}
													alt={food.item_name}
													className="w-full h-28 object-cover rounded-lg mb-2"
												/>
												<h4 className="text-sm text-black font-semibold mb-1 truncate">
													{food.item_name}
												</h4>
												<div className="flex justify-between items-center text-xs text-gray-600">
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
											No foods found matching your search.
										</p>
									</div>
								)}
							</div>
						)}

						{!searchQuery && (
							<>
								{/* Category Buttons */}
								<div className="mb-4">
									<h3 className="text-base font-bold text-gray-800 mb-2">Category</h3>
									<div className="flex space-x-3 overflow-x-auto scrollbar-hide px-2">
										{categories.map((category, index) => (
											<button
												key={index}
												className="category-button flex flex-col items-center flex-shrink-0 focus:outline-none"
												onClick={() => handleCategoryClick(category)}
											>
												<div
													className={`p-2.5 rounded-full ${selectedCategory === category
														? 'bg-blue-700 text-white'
														: 'bg-gray-100 text-gray-600'
														}`}
												>
													{categoryIcons[category] || <MdFastfood size={28} />}
												</div>
												<span className="text-xs mt-1">{category}</span>
											</button>
										))}
									</div>
								</div>

								{/* Selected Category Food */}
								<div className="mb-4">
									<div className="flex justify-between items-center mb-2">
										<h3 className="text-base font-bold text-gray-800">
											{selectedCategory} Food
										</h3>
										<Link
											to={`/category-food/${selectedCategory.toLowerCase()}`}
											className="text-blue-700 text-xs"
										>
											See all
										</Link>
									</div>
									{filteredFoods.length > 0 ? (
										filteredFoods.length === 1 ? (
											<div className="p-2 w-1/2">
												<div
													className="food-card bg-[#F8F8F8] rounded-xl shadow-sm p-2.5 cursor-pointer"
													onClick={() =>
														handleFoodClick(filteredFoods[0].three_d_picture, filteredFoods[0])
													}
												>
													<img
														src={
															filteredFoods[0].normal_picture ||
															'https://via.placeholder.com/150'
														}
														alt={filteredFoods[0].item_name}
														className="w-full h-28 object-cover rounded-lg mb-2"
													/>
													<h4 className="text-sm text-black font-semibold mb-1 truncate">
														{filteredFoods[0].item_name}
													</h4>
													<div className="flex justify-between items-center text-xs text-gray-600">
														<span>{filteredFoods[0].price || '৳29.00'} BDT</span>
														<span>⏰ {filteredFoods[0].time || '4.8'}</span>
													</div>
												</div>
											</div>
										) : (
											<Slider {...getSliderSettings(filteredFoods.length)}>
												{filteredFoods.map((food) => (
													<div key={food.id} className="p-2">
														<div
															className="food-card bg-[#F8F8F8] rounded-xl shadow-sm p-2.5 cursor-pointer"
															onClick={() => handleFoodClick(food.three_d_picture, food)}
														>
															<img
																src={food.normal_picture || 'https://via.placeholder.com/150'}
																alt={food.item_name}
																className="w-full h-28 object-cover rounded-lg mb-2"
															/>
															<h4 className="text-sm text-black font-semibold mb-1 truncate">
																{food.item_name}
															</h4>
															<div className="flex justify-between items-center text-xs text-gray-600">
																<span>{food.price || '৳29.00'} BDT</span>
																<span>⏰ {food.time || '4.8'}</span>
															</div>
														</div>
													</div>
												))}
											</Slider>
										)
									) : (
										<p className="text-gray-600 text-sm">No foods found in this category.</p>
									)}
								</div>

								{/* All Foods by Category */}
								{selectedCategory === 'All' && (
									<div>
										{groupedFoods.map((group) => (
											<div key={group.name} className="mb-4">
												<div className="flex justify-between items-center mb-2">
													<h3 className="text-base font-bold text-gray-800">
														{group.name} Food
													</h3>
													<Link
														to={`/category-food/${group.name.toLowerCase()}`}
														className="text-blue-700 text-xs"
													>
														See all
													</Link>
												</div>
												{group.foods.length > 0 ? (
													group.foods.length === 1 ? (
														<div className="p-2 w-1/2">
															<div
																className="food-card bg-[#F8F8F8] rounded-xl shadow-sm p-2.5 cursor-pointer"
																onClick={() =>
																	handleFoodClick(group.foods[0].three_d_picture, group.foods[0])
																}
															>
																<img
																	src={
																		group.foods[0].normal_picture ||
																		'https://via.placeholder.com/150'
																	}
																	alt={group.foods[0].item_name}
																	className="w-full h-28 object-cover rounded-lg mb-2"
																/>
																<h4 className="text-sm text-black font-semibold mb-1 truncate">
																	{group.foods[0].item_name}
																</h4>
																<div className="flex justify-between items-center text-xs text-gray-600">
																	<span>{group.foods[0].price || '৳29.00'} BDT</span>
																	<span>⏰ {group.foods[0].time || '4.8'}</span>
																</div>
															</div>
														</div>
													) : (
														<Slider {...getSliderSettings(group.foods.length)}>
															{group.foods.map((food) => (
																<div key={food.id} className="p-2">
																	<div
																		className="food-card bg-[#F8F8F8] rounded-xl shadow-sm p-2.5 cursor-pointer"
																		onClick={() => handleFoodClick(food.three_d_picture, food)}
																	>
																		<img
																			src={
																				food.normal_picture || 'https://via.placeholder.com/150'
																			}
																			alt={food.item_name}
																			className="w-full h-28 object-cover rounded-lg mb-2"
																		/>
																		<h4 className="text-sm text-black font-semibold mb-1 truncate">
																			{food.item_name}
																		</h4>
																		<div className="flex justify-between items-center text-xs text-gray-600">
																			<span>{food.price || '৳29.00'} BDT</span>
																			<span>⏰ {food.time || '4.8'}</span>
																		</div>
																	</div>
																</div>
															))}
														</Slider>
													)
												) : (
													<p className="text-gray-600 text-sm">
														No foods found in {group.name} category.
													</p>
												)}
											</div>
										))}
									</div>
								)}
							</>
						)}
					</>
				)}
			</div>
		</div>
	);
}