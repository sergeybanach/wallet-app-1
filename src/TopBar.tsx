import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase';
import { signOut, User } from 'firebase/auth';
import { useNetwork } from './NetworkContext';

const DEFAULT_PROFILE_IMAGE = '/default-profile.jpg';

interface TopBarProps {
  user: User;
}

function TopBar({ user }: TopBarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const profileImgRef = useRef<HTMLImageElement>(null);
  const navigate = useNavigate();
  const { network, setNetwork } = useNetwork();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsMenuOpen(false);
      navigate('/auth');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleNetworkSwitch = () => {
    setNetwork(network === 'testnet' ? 'mainnet' : 'testnet');
    setIsMenuOpen(false); // Close menu after switching
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        profileImgRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !profileImgRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div className="bg-white shadow-md p-4 flex items-center justify-between relative">
      <div>
        <p className="text-lg font-semibold">{user.displayName || 'User'}</p>
        <p className="text-sm text-gray-600">{user.email}</p>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">
            {network === 'testnet' ? 'Testnet' : 'Mainnet'}
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={network === 'mainnet'}
              onChange={handleNetworkSwitch}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-indigo-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
          </label>
        </div>
        <div className="relative">
          <img
            ref={profileImgRef}
            src={user.photoURL || DEFAULT_PROFILE_IMAGE}
            alt="Profile"
            className="w-10 h-10 rounded-full cursor-pointer"
            onClick={toggleMenu}
          />
          <div
            ref={menuRef}
            className={`absolute top-full mt-2 right-0 bg-white shadow-lg rounded-md w-40 z-50 ${
              isMenuOpen ? 'block' : 'hidden'
            }`}
          >
            <ul className="py-2 text-sm">
              <li
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  navigate('/profile');
                  setIsMenuOpen(false);
                }}
              >
                Profile
              </li>
              <li
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-600"
                onClick={handleLogout}
              >
                Logout
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopBar;