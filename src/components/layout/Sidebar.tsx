import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Users, 
  BarChart2, 
  Settings, 
  HelpCircle,
  LogOut,
  AlertTriangle,
  Bot
} from 'lucide-react';
import { Layout as LayoutIcon } from 'lucide-react';

const Sidebar: React.FC = () => {
  return (
    <aside className="bg-corporate-blue text-white w-16 md:w-52 flex flex-col h-full transition-all duration-300 ease-in-out">
      <div className="p-3 md:p-4 flex items-center justify-center md:justify-start">
        <div className="bg-white p-1 rounded flex items-center justify-center">
          <LayoutIcon className="h-7 w-7 text-corporate-secondary" />
        </div>
        <h1 className="hidden md:block ml-2 font-bold text-lg">Resolia Claims</h1>
      </div>
      
      <nav className="mt-8 flex-1">
        <NavItem to="/" icon={<Home size={20} />} text="Dashboard" />
        <NavItem to="/claims" icon={<FileText size={20} />} text="All Claims" />
        <NavItem to="/alerts" icon={<AlertTriangle size={20} />} text="Alerts" />
        <NavItem to="/clients" icon={<Users size={20} />} text="Clients" />
        <NavItem to="/reports" icon={<BarChart2 size={20} />} text="Reports" />
        <NavItem to="/chat" icon={<Bot size={20} />} text="Smart Chat" />
        <NavItem to="/settings" icon={<Settings size={20} />} text="Settings" />
        <NavItem to="/help" icon={<HelpCircle size={20} />} text="Help" />
      </nav>
      
      <div className="p-4 border-t border-blue-800">
        <button className="flex items-center justify-center md:justify-start w-full p-2 text-gray-300 hover:text-white rounded transition-colors">
          <LogOut size={20} />
          <span className="hidden md:block ml-3">Logout</span>
        </button>
      </div>
    </aside>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  text: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, text }) => {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => 
        `flex items-center justify-center md:justify-start p-2 mx-2 mb-1 rounded ${
          isActive 
            ? 'bg-blue-700 text-white' 
            : 'text-gray-300 hover:text-white hover:bg-blue-800'
        } transition-colors duration-200`
      }
    >
      <span className="flex items-center justify-center">
        {icon}
      </span>
      <span className="hidden md:block ml-3">{text}</span>
    </NavLink>
  );
};

export default Sidebar;