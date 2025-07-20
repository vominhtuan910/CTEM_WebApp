import TopNavigation from "./TopNavigation";

const AppHeader: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 bg-gray-700 text-white border-b border-white/20">
      <TopNavigation />
    </header>
  );
};

export default AppHeader;
