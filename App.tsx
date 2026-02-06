
import React, { useState, useEffect } from 'react';
import { 
  Home, 
  PlusSquare, 
  User, 
  TrendingUp,
  ShieldAlert, 
  Moon, 
  Sun
} from 'lucide-react';
import { AppTab, Post, UserProfile } from './types';
import HomeTab from './components/HomeTab';
import UploadTab from './components/UploadTab';
import AccountTab from './components/AccountTab';
import AdminTab from './components/AdminTab';
import LoginScreen from './components/LoginScreen';

const STORAGE_KEY = 'our_media_posts_v4';
const ADMIN_ID_KEY = 'our_media_global_admin_id';
const USERS_KEY = 'our_media_users_v4';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.Home);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [globalAdminId, setGlobalAdminId] = useState<string | null>(null);

  // Initial Load
  useEffect(() => {
    const savedPosts = localStorage.getItem(STORAGE_KEY);
    const savedAdminId = localStorage.getItem(ADMIN_ID_KEY);
    const savedUsers = localStorage.getItem(USERS_KEY);
    
    if (savedAdminId) setGlobalAdminId(savedAdminId);
    if (savedUsers) setUsers(JSON.parse(savedUsers));
    
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    } else {
      setPosts([]);
    }
    
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }, [users]);

  // SYNC: Keep currentUser in sync with the global users list
  useEffect(() => {
    if (currentUser) {
      const freshUser = users.find(u => u.uid === currentUser.uid);
      if (freshUser && JSON.stringify(freshUser) !== JSON.stringify(currentUser)) {
        setCurrentUser(freshUser);
      }
    }
  }, [users, currentUser]);

  const handleLogin = () => {
    const existingUid = sessionStorage.getItem('current_user_uid');
    const mockUid = existingUid || 'user_' + Math.floor(Math.random() * 10000);
    sessionStorage.setItem('current_user_uid', mockUid);
    
    let currentAdminId = globalAdminId;
    if (!currentAdminId) {
      localStorage.setItem(ADMIN_ID_KEY, mockUid);
      setGlobalAdminId(mockUid);
      currentAdminId = mockUid;
    }

    const savedUsers = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    let user = savedUsers.find((u: UserProfile) => u.uid === mockUid);

    if (!user) {
      user = {
        uid: mockUid,
        name: mockUid === currentAdminId ? 'Super Admin' : 'Kid Creator ' + mockUid.slice(-4),
        photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${mockUid}`,
        bio: 'Welcome to my safe space!',
        earnings: 0,
        hezzStatus: 'none',
        isAdmin: mockUid === currentAdminId,
        isSuspended: false
      };
      const newUsers = [...savedUsers, user];
      setUsers(newUsers);
    }

    setCurrentUser(user);
  };

  const handleUpdateUser = (updatedUser: UserProfile) => {
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.uid === updatedUser.uid ? updatedUser : u));
  };

  const handleUpload = (newPost: Post) => {
    setPosts(prev => [newPost, ...prev]);
    setActiveTab(AppTab.Home);
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-amber-50">
        <div className="relative w-24 h-24 mb-4">
          <div className="absolute inset-0 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-4 border-4 border-orange-500 border-b-transparent rounded-full animate-spin-slow"></div>
        </div>
        <h1 className="text-2xl font-bold text-orange-600">Our Media</h1>
        <p className="text-slate-500 mt-2">Connecting Kids Safely...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const isSuperAdmin = currentUser.uid === globalAdminId;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'} pb-24 transition-colors`}>
      <header className={`sticky top-0 z-50 px-4 py-3 flex items-center justify-between shadow-sm ${isDarkMode ? 'bg-slate-900/90' : 'bg-white/90'} backdrop-blur-md`}>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">M</span>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">
            Our Media
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab(AppTab.Admin)}
            className={`p-2 rounded-full transition-all ${activeTab === AppTab.Admin ? 'bg-orange-100 text-orange-600' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            {isSuperAdmin ? <ShieldAlert size={22} /> : <TrendingUp size={22} />}
          </button>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full text-slate-500 hover:bg-slate-100">
            {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {activeTab === AppTab.Home && (
          <HomeTab posts={posts} setPosts={setPosts} isDarkMode={isDarkMode} currentUser={currentUser} />
        )}
        {activeTab === AppTab.Upload && (
          <UploadTab onUpload={handleUpload} isDarkMode={isDarkMode} currentUser={currentUser} />
        )}
        {activeTab === AppTab.Account && (
          <AccountTab 
            currentUser={currentUser} 
            setCurrentUser={handleUpdateUser} 
            isDarkMode={isDarkMode} 
            posts={posts} 
            setPosts={setPosts} 
          />
        )}
        {activeTab === AppTab.Admin && (
          <AdminTab 
            posts={posts} 
            setPosts={setPosts} 
            isDarkMode={isDarkMode} 
            isSuperAdmin={isSuperAdmin} 
            userId={currentUser.uid}
            users={users}
            setUsers={setUsers}
          />
        )}
      </main>

      <nav className={`fixed bottom-0 left-0 right-0 h-16 border-t px-6 flex items-center justify-between z-50 transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]'}`}>
        <button onClick={() => setActiveTab(AppTab.Home)} className={`flex flex-col items-center gap-1 transition-all ${activeTab === AppTab.Home ? 'text-orange-500 scale-110' : 'text-slate-400'}`}>
          <Home size={24} fill={activeTab === AppTab.Home ? 'currentColor' : 'none'} />
          <span className="text-[10px] font-bold">Home</span>
        </button>
        <button onClick={() => setActiveTab(AppTab.Upload)} className={`flex flex-col items-center gap-1 transition-all ${activeTab === AppTab.Upload ? 'text-orange-500 scale-110' : 'text-slate-400'}`}>
          <PlusSquare size={24} />
          <span className="text-[10px] font-bold">Upload</span>
        </button>
        <button onClick={() => setActiveTab(AppTab.Account)} className={`flex flex-col items-center gap-1 transition-all ${activeTab === AppTab.Account ? 'text-orange-500 scale-110' : 'text-slate-400'}`}>
          <User size={24} />
          <span className="text-[10px] font-bold">Account</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
