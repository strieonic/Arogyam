import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBell, FaCheck, FaCheckDouble } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { getNotifications, markAsRead, markAllAsRead } from "../services/notificationService";
import { timeAgo } from "../utils/formatters";

const NotificationBell = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await getNotifications();
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await handleMarkAsRead(notif._id, { stopPropagation: () => {} });
    }
    if (notif.actionUrl) {
      // You can add logic to navigate, e.g. using react-router useNavigate
      window.location.href = notif.actionUrl;
    }
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
      >
        <FaBell className="text-xl text-[var(--text-secondary)]" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 max-h-[28rem] overflow-hidden bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl shadow-2xl z-50 flex flex-col"
          >
            <div className="p-4 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--bg-card)]">
              <h3 className="font-semibold text-lg">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-[var(--accent-primary)] hover:underline flex items-center gap-1"
                >
                  <FaCheckDouble /> Mark all read
                </button>
              )}
            </div>

            <div className="overflow-y-auto flex-1 p-2">
              {notifications.length === 0 ? (
                <div className="text-center p-6 text-[var(--text-tertiary)]">
                  <FaBell className="mx-auto text-3xl mb-3 opacity-20" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif._id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3 mb-1 rounded-lg cursor-pointer transition-colors ${
                      notif.isRead
                        ? "hover:bg-white/5 opacity-70"
                        : "bg-[var(--accent-primary)]/10 hover:bg-[var(--accent-primary)]/20"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4
                          className={`text-sm ${
                            notif.isRead ? "font-medium" : "font-bold text-[var(--accent-primary)]"
                          }`}
                        >
                          {notif.title}
                        </h4>
                        <p className="text-xs mt-1 text-[var(--text-secondary)] line-clamp-2">
                          {notif.message}
                        </p>
                        <span className="text-[10px] text-[var(--text-tertiary)] mt-2 block">
                          {timeAgo(notif.createdAt)}
                        </span>
                      </div>
                      {!notif.isRead && (
                        <button
                          onClick={(e) => handleMarkAsRead(notif._id, e)}
                          className="ml-2 text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] p-1"
                          title="Mark as read"
                        >
                          <FaCheck size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
