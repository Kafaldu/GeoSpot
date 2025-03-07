import { create } from "zustand";
import { getAuth } from "firebase/auth"; // Firebase authentication import

export const useUserStore = create((set) => ({
  users: [],
  setUsers: (users) => set({ users }),

  createUser: async (newUser) => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      return { success: false, message: "Please fill all fields" };
    }

    const res = await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newUser), // Don't need to include `uid`, the backend generates it
    });

    const data = await res.json();
    if (!data.success) {
      return { success: false, message: data.message };
    }
    set((state) => ({ users: [...state.users, data.data] })); // Add the new user to state
    return { success: true, message: "User created successfully" };
  },

  getUser: async (uid) => {
    try {
      const auth = getAuth(); // Get Firebase auth instance
      const user = auth.currentUser; // Get the current authenticated user

      // Check if user is logged in
      if (!user || user.uid !== uid) {
        return { success: false, message: "User not found" };
      }

      // Pull user info from Firebase
      const userData = {
        uid: user.uid,
        email: user.email, // Pull email from Firebase
        username: user.displayName || "No Username", // You can modify as needed
      };

      set((state) => ({
        users: [userData], // Set the user data in state
      }));

      return { success: true, message: "User retrieved successfully" };
    } catch (error) {
      console.error("Error fetching user:", error);
      return { success: false, message: error.message };
    }
  },

  deleteUser: async (uid) => {
    const res = await fetch(`/api/users/${uid}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!data.success) {
      return { success: false, message: data.message };
    }
    set((state) => ({
      users: state.users.filter((user) => user._id !== uid),
    }));
    return { success: true, message: data.message };
  },

  updateUser: async (uid, updatedUser) => {
    const res = await fetch(`/api/users/${uid}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedUser),
    });

    const data = await res.json();
    if (!data.success) {
      return { success: false, message: data.message };
    }
    set((state) => ({
      users: state.users.map((user) =>
        user._id === uid ? data.data : user
      ),
    }));
    return { success: true, message: data.message };
  },
}));
