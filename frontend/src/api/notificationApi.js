const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const notificationApi = {
  getNotifications: async () => {
    const token = localStorage.getItem("appToken") || sessionStorage.getItem("appToken");
    if (!token) return [];
    
    const res = await fetch(`${API_URL}/notifications`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error("Failed to fetch notifications");
    const data = await res.json();
    return data.notifications;
  },

  markAsRead: async (id) => {
    const token = localStorage.getItem("appToken") || sessionStorage.getItem("appToken");
    const res = await fetch(`${API_URL}/notifications/${id}/read`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error("Failed to mark as read");
    return res.json();
  },

  markAllAsRead: async () => {
    const token = localStorage.getItem("appToken") || sessionStorage.getItem("appToken");
    const res = await fetch(`${API_URL}/notifications/read-all`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error("Failed to mark all as read");
    return res.json();
  }
};
