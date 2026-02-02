import React from 'react';
import { MessageSquarePlus, Search, MoreVertical, X } from 'lucide-react';

interface Chat {
  id: string;
  title: string;
  timestamp: Date;
}

interface SidebarProps {
  chats: Chat[];
  activeChat: string | null;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  chats,
  activeChat,
  onNewChat,
  onSelectChat,
  onDeleteChat,
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [menuOpenId, setMenuOpenId] = React.useState<string | null>(null);

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group chats by date
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groupedChats = {
    today: filteredChats.filter(chat =>
      chat.timestamp.toDateString() === today.toDateString()
    ),
    yesterday: filteredChats.filter(chat =>
      chat.timestamp.toDateString() === yesterday.toDateString()
    ),
    older: filteredChats.filter(chat =>
      chat.timestamp < yesterday &&
      chat.timestamp.toDateString() !== yesterday.toDateString()
    ),
  };

  return (
    <div className="w-64 bg-white border-r border-sidebar-border flex flex-col h-full">
      {/* Header with filter icon */}
      <div className="p-4 flex items-center justify-end border-b border-sidebar-border">
        <button className="p-2 text-text-secondary hover:text-text-primary hover:bg-sidebar-hover rounded-lg transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="14" y2="12" />
            <line x1="4" y1="18" x2="10" y2="18" />
          </svg>
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 px-4 py-2.5 text-primary font-medium hover:bg-primary-50 rounded-lg transition-colors"
        >
          <MessageSquarePlus className="w-5 h-5" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Recent Chats Section */}
      <div className="px-4 py-2">
        <h3 className="text-sm font-semibold text-text-primary mb-2">Recent Chats</h3>

        {/* Search Input */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-background-secondary border border-sidebar-border rounded-lg text-sm text-text-primary placeholder-text-muted input-focus"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-2">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-text-muted">
            <X className="w-8 h-8 mb-2 text-text-muted opacity-50" />
            <span className="text-sm">No Chat History</span>
          </div>
        ) : (
          <>
            {/* Today */}
            {groupedChats.today.length > 0 && (
              <div className="mb-2">
                <span className="px-3 text-xs font-medium text-text-muted uppercase tracking-wider">Today</span>
                <div className="mt-1">
                  {groupedChats.today.map(chat => (
                    <ChatItem
                      key={chat.id}
                      chat={chat}
                      isActive={activeChat === chat.id}
                      menuOpen={menuOpenId === chat.id}
                      onSelect={() => onSelectChat(chat.id)}
                      onMenuToggle={() => setMenuOpenId(menuOpenId === chat.id ? null : chat.id)}
                      onDelete={() => {
                        onDeleteChat(chat.id);
                        setMenuOpenId(null);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Yesterday */}
            {groupedChats.yesterday.length > 0 && (
              <div className="mb-2">
                <span className="px-3 text-xs font-medium text-text-muted uppercase tracking-wider">Yesterday</span>
                <div className="mt-1">
                  {groupedChats.yesterday.map(chat => (
                    <ChatItem
                      key={chat.id}
                      chat={chat}
                      isActive={activeChat === chat.id}
                      menuOpen={menuOpenId === chat.id}
                      onSelect={() => onSelectChat(chat.id)}
                      onMenuToggle={() => setMenuOpenId(menuOpenId === chat.id ? null : chat.id)}
                      onDelete={() => {
                        onDeleteChat(chat.id);
                        setMenuOpenId(null);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Older */}
            {groupedChats.older.length > 0 && (
              <div className="mb-2">
                <span className="px-3 text-xs font-medium text-text-muted uppercase tracking-wider">Previous</span>
                <div className="mt-1">
                  {groupedChats.older.map(chat => (
                    <ChatItem
                      key={chat.id}
                      chat={chat}
                      isActive={activeChat === chat.id}
                      menuOpen={menuOpenId === chat.id}
                      onSelect={() => onSelectChat(chat.id)}
                      onMenuToggle={() => setMenuOpenId(menuOpenId === chat.id ? null : chat.id)}
                      onDelete={() => {
                        onDeleteChat(chat.id);
                        setMenuOpenId(null);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

interface ChatItemProps {
  chat: Chat;
  isActive: boolean;
  menuOpen: boolean;
  onSelect: () => void;
  onMenuToggle: () => void;
  onDelete: () => void;
}

const ChatItem: React.FC<ChatItemProps> = ({
  chat,
  isActive,
  menuOpen,
  onSelect,
  onMenuToggle,
  onDelete,
}) => {
  return (
    <div
      className={`group relative flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
        isActive
          ? 'bg-primary-50 border-l-3 border-primary'
          : 'hover:bg-sidebar-hover'
      }`}
      onClick={onSelect}
    >
      <span className={`text-sm truncate flex-1 ${isActive ? 'text-primary font-medium' : 'text-text-primary'}`}>
        {chat.title}
      </span>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onMenuToggle();
        }}
        className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-text-primary rounded transition-all"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {/* Dropdown Menu */}
      {menuOpen && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-sidebar-border rounded-lg shadow-medium py-1 z-10 min-w-[120px]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="w-full px-3 py-2 text-left text-sm text-severity-critical hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
