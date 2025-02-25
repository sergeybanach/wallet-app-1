import { useState, useEffect, useRef } from 'react';
import { auth } from './firebase';
import { signOut, User } from 'firebase/auth';

const DEFAULT_PROFILE_IMAGE = '/default-profile.jpg';

interface TopBarProps {
  user: User;
  onProfileClick?: () => void; // Add prop to handle profile navigation
}

function TopBar({ user, onProfileClick }: TopBarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const profileImgRef = useRef<HTMLImageElement>(null);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('Logged out successfully');
      setIsMenuOpen(false);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
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
                console.log('Profile clicked');
                if (onProfileClick) onProfileClick(); // Trigger navigation
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
  );
}

export default TopBar;