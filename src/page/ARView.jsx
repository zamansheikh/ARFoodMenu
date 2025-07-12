/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaClock, FaDollarSign, FaRuler, FaInfoCircle } from 'react-icons/fa';
import { MdFastfood } from 'react-icons/md';

export default function ARView() {
	const navigate = useNavigate();
	const { state } = useLocation();
	const { selectedModel, foodDetails } = state || {};
	const [isARSupported, setIsARSupported] = useState(true);
	const [isModelLoading, setIsModelLoading] = useState(true);

	// Fallback food details
	const defaultFoodDetails = {
		item_name: 'Unknown Food',
		description: 'No description available.',
		size: 'N/A',
		time: 'N/A',
		price: '৳0.00',
	};

	const food = foodDetails || defaultFoodDetails;

	// Check AR support and redirect if no model
	useEffect(() => {
		// Redirect if no model
		if (!selectedModel) {
			navigate('/');
			return;
		}

		// Check AR support
		const checkAR = () => {
			const modelViewer = document.createElement('model-viewer');
			const isSupported = typeof modelViewer.canActivateAR !== 'undefined' && modelViewer.canActivateAR;
			setIsARSupported(isSupported);
		};

		checkAR();
	}, [selectedModel, navigate]);

	// Handle model loading state
	const handleModelLoad = () => {
		setIsModelLoading(false);
	};

	// Handle model error
	const handleModelError = () => {
		setIsModelLoading(false);
		setIsARSupported(false);
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-4">
			<div className="max-w-[748px] mx-auto">
				{/* Header */}
				<div className="flex justify-between items-center mb-4">
					<button
						onClick={() => navigate(-1)}
						className="text-blue-500 hover:text-blue-800 transition-colors p-2"
						aria-label="Go back"
					>
						<FaArrowLeft size={20} />
					</button>
					<h1 className="text-lg sm:text-xl font-bold text-gray-800">AR View</h1>
					<div className="w-6" />
				</div>

				{/* Main Content */}
				<div className="w-full max-w-2xl mx-auto">
					{/* AR/3D Viewer */}
					<div className="relative mb-6">

						{selectedModel ? (
							<model-viewer
								src={selectedModel}
								alt={`3D model of ${food.item_name}`}
								shadow-intensity="1"
								camera-controls
								auto-rotate
								ar
								ar-modes="scene-viewer quick-look webxr"
								exposure="1.2"
							
								style={{ width: '100%', minHeight: '50vh', height: 'auto' }}
								className="w-full rounded-lg shadow-lg bg-white"
								onLoad={handleModelLoad}
								onError={handleModelError}
							/>
						) : (
							<p className="text-center text-red-500">Model not found.</p>
						)}
						{!isARSupported && !isModelLoading && (
							<p className="text-center text-yellow-600 mt-2 text-sm">
								AR is not supported on this device. You can still view the 3D model.
							</p>
						)}
					</div>

					{/* Food Details Card */}
					<div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-200">
						<h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-4 flex items-center">
							<MdFastfood className="text-blue-600 mr-2" size={24} />
							{food.item_name}
						</h2>

						{/* Description */}
						<div className="mb-4">
							<div className="flex items-start">
								<FaInfoCircle className="text-blue-600 mr-2 mt-1" size={18} />
								<div>
									<p className="text-xs sm:text-sm font-semibold text-gray-600">Description</p>
									<p className="text-gray-700 text-sm">{food.description}</p>
								</div>
							</div>
						</div>

						{/* Size */}
						<div className="mb-4">
							<div className="flex items-center">
								<FaRuler className="text-blue-600 mr-2" size={18} />
								<div>
									<p className="text-xs sm:text-sm font-semibold text-gray-600">Size</p>
									<p className="text-gray-700 text-sm">{food.size}</p>
								</div>
							</div>
						</div>

						{/* Time */}
						<div className="mb-4">
							<div className="flex items-center">
								<FaClock className="text-blue-600 mr-2" size={18} />
								<div>
									<p className="text-xs sm:text-sm font-semibold text-gray-600">Preparation Time</p>
									<p className="text-gray-700 text-sm">{food.time}</p>
								</div>
							</div>
						</div>

						{/* Price */}
						<div className="mb-4">
							<div className="flex items-center">
								<FaDollarSign className="text-blue-600 mr-2" size={18} />
								<div>
									<p className="text-xs sm:text-sm font-semibold text-gray-600">Price</p>
									<p className="text-gray-700 text-sm">{food.price} BDT</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}