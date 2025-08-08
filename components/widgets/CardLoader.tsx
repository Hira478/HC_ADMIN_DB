const CardLoader = () => {
  return (
    // Kontainer utama dengan style kartu yang konsisten
    <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col justify-center items-center">
      <div className="flex items-center space-x-3">
        {/* Spinner sederhana dari Tailwind CSS */}
        <div className="w-6 h-6 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        <span className="text-gray-500 font-medium">Loading Data...</span>
      </div>
    </div>
  );
};

export default CardLoader;
