import Notification from "../models/Notification.js";

/* ======================================================
   GET NOTIFICATIONS
====================================================== */
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    // Fetch last 50 notifications, unread first, then sorted by date
    const notifications = await Notification.find({ recipientId: userId })
      .sort({ isRead: 1, createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      recipientId: userId,
      isRead: false,
    });

    res.status(200).json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

/* ======================================================
   MARK AS READ
====================================================== */
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipientId: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Marked as read", notification });
  } catch (error) {
    res.status(500).json({ message: "Failed to mark as read" });
  }
};

/* ======================================================
   MARK ALL AS READ
====================================================== */
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { recipientId: userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Failed to mark all as read" });
  }
};
