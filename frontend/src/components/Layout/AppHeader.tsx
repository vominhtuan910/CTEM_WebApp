import TopNavigation from './TopNavigation';

const AppHeader: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 border-b border-white/20">
      <TopNavigation />
    </header>
  );
};

export default AppHeader;
