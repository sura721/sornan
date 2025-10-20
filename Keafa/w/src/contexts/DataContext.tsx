import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { toast } from '@/hooks/use-toast';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import {
  loginUserApi,
  fetchUsersApi,
  addUserApi,
  deleteUserApi,
  fetchIndividualsApi,
  fetchFamiliesApi,
  addIndividualApi,
  addFamilyApi,
  deleteIndividualApi,
  deleteFamilyApi,
  updateIndividualApi,
  updateFamilyApi,
  getProfileApi,
  logoutUserApi,
  updateUserApi
} from './ApiService';

// --- Interfaces ---
export interface Individual {
  _id: string;
  isFamilyMember?: boolean;
  firstName: string;
  lastName: string;
  sex: 'Male' | 'Female';
  age?: number;
  phoneNumbers?: { primary: string; secondary?: string; };
  socials?: { telegram?: string; instagram?:string; };
  clothDetails: {
    colors: string[];
tilefImageUrls?: string[];
    shirtLength?: string;
    sholder?: string;
    wegeb?: string;
    rist?: string;
    dressLength?: string;
    sliveLength?: string;
    breast?: string;
    overBreast?: string;
    underBreast?: string;
    femaleSliveType?: string;
    femaleWegebType?: string;
    deret?: string;
    anget?: string;
    maleClothType?: string;
    maleSliveType?: string;
    netela?: 'Yes' | 'No';
    sleeve?:string
  };
  payment?: {
    total?: number;
    firstHalf: { paid: boolean; amount?: number };
    secondHalf: { paid: boolean; amount?: number };
  };
  deliveryDate?: string;
  notes?: string;
  
}

interface UpdateUserPayload {
  username?: string;
  currentPassword?: string;
  newPassword?: string;
}


export interface Family {
  _id: string;
  familyName: string;
  memberIds: (string | Individual)[];
  phoneNumbers: { primary: string; secondary?: string; };
  socials?: { telegram?: string; };
  tilefImageUrls?: string[];
  colors: string[];
  paymentMethod: 'family' | 'member'
  payment: {
    total?: number;
    firstHalf: { paid: boolean; amount?: number };
    secondHalf: { paid: boolean; amount?: number };
  };
  deliveryDate: string;
  notes?:string
}
export interface User {
  _id: string;
  username: string;
}
type FamilyPayload = Omit<Family, '_id' | 'memberIds'> & { memberIds: Omit<Individual, '_id'>[] };

// --- Context Definition ---
interface DataContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  users: User[];
    updateUser: (payload: UpdateUserPayload) => Promise<boolean>; 
  addUser: (username: string, password: string) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<void>;
  individuals: Individual[];
  families: Family[];
  addIndividual: (individualData: FormData) => Promise<Individual | undefined>;
   updateIndividual: (id: string, data: FormData) => Promise<void>;
  deleteIndividual: (id: string) => Promise<void>;
  addFamily: (familyData: FormData) => Promise<void>; 
  updateFamily: (id: string, data: FormData) => Promise<void>;
   deleteFamily: (id: string) => Promise<void>;
  getIndividual: (id: string) => Individual | undefined;
  getFamily: (id: string) => Family | undefined;
  notificationCount: number;
  dismissedNotificationIds: string[];
  dismissNotification: (id: string) => void;
  isLoading: boolean;
  
}
const DataContext = createContext<DataContextType | undefined>(undefined);
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) { throw new Error('useData must be used within a DataProvider'); }
  return context;
};





// --- Data Provider Component ---
export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [individuals, setIndividuals] = useState<Individual[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
    const [isLoading, setIsLoading] = useState(true);
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<string[]>(() => {
    const savedDismissed = localStorage.getItem('dismissedNotifications');
    return savedDismissed ? JSON.parse(savedDismissed) : [];
  });

 useEffect(() => {
    const checkUserSessionAndFetchData = async () => {
      try {
        // Step 1: Attempt to get the user's profile.
        // This API call automatically sends the httpOnly cookie.
        const userData = await getProfileApi(); 
        
        // Step 2: If the call succeeds, the user has a valid session.
        // We update the state to reflect that they are logged in.
        setCurrentUser(userData);
        setIsAuthenticated(true);

        // Step 3: Now that we are authenticated, fetch all the necessary application data.
        const [individualsData, familiesData, usersData] = await Promise.all([
          fetchIndividualsApi(),
          fetchFamiliesApi(),
          fetchUsersApi(),
        ]);
        setIndividuals(individualsData);
        setFamilies(familiesData);
        setUsers(usersData);

      } catch (error) {
        // Step 4: If getProfileApi fails (e.g., a 401 error), there is no valid session.
        // We ensure all authentication state is cleared.
        setCurrentUser(null);
        setIsAuthenticated(false);
      } finally {
        // Step 5: This is crucial. We signal that the initial loading and
        // authentication check is complete, allowing the app to render.
        setIsLoading(false);
      }
    };

    // Execute the function.
    checkUserSessionAndFetchData();
  }, []);
  const notificationCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const notificationDays = new Set([1, 4, 7, 15]);
    let count = 0;
    const allOrders = [...individuals, ...families];
    
    allOrders.forEach(order => {
        if (!order.deliveryDate) return;
        
        const deliveryDate = parseISO(order.deliveryDate);
        
        // Skip dates that are in the past
        if (deliveryDate < today) {
            return;
        }

        const daysLeft = differenceInCalendarDays(deliveryDate, today);
        
        if (notificationDays.has(daysLeft)) {
            const uniqueId = `${order._id}-${daysLeft}`;
            if (!dismissedNotificationIds.includes(uniqueId)) {
                count++;
            }
        }
    });
    return count;
  }, [individuals, families, dismissedNotificationIds]);
  // --- FIX END ---

  const dismissNotification = (notificationId: string) => {
    setDismissedNotificationIds(prev => {
      const newDismissed = [...prev, notificationId];
      localStorage.setItem('dismissedNotifications', JSON.stringify(newDismissed));
      return newDismissed;
    });
  };

 const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // The loginUserApi call now just returns user data.
      // The server handles setting the httpOnly cookie.
      const userData = await loginUserApi(username, password);
      
      // We no longer handle a token here. Just set the user state.
      setIsAuthenticated(true);
      setCurrentUser(userData);

      // After a successful login, we must fetch the app's data.
      const [individualsData, familiesData, usersData] = await Promise.all([
        fetchIndividualsApi(),
        fetchFamiliesApi(),
        fetchUsersApi(),
      ]);
      setIndividuals(individualsData);
      setFamilies(familiesData);
      setUsers(usersData);

      return true;
    } catch (error) {
      toast({ title: "Login Failed", description: "Invalid credentials.", variant: "destructive" });
      return false;
    }
  };

 const logout = async () => {
    try {
      // Call the backend endpoint to clear the httpOnly cookie.
      await logoutUserApi(); 
    } catch (error) {
      console.error("Logout API call failed", error);
      // We continue to clear state even if the API fails.
    } finally {
      // Clear all authentication and data state from the application.
      setIsAuthenticated(false);
      setCurrentUser(null);
      setUsers([]);
      setIndividuals([]);
      setFamilies([]);
      
      // This is UI state, so keeping it in localStorage is fine.
      localStorage.removeItem('dismissedNotifications'); 
      setDismissedNotificationIds([]);
    }
  };
  
  const addUser = async (username: string, password: string): Promise<boolean> => {
    try {
      const newUser = await addUserApi(username, password);
      setUsers(prevUsers => [...prevUsers, newUser]);
      return true;
    } catch (error) {
      console.error("Failed to add user:", error);
      return false;
    }
  };

  const deleteUser = async (userId: string): Promise<void> => {
    try {
      await deleteUserApi(userId);
      setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast({ title: "Error", description: "Could not delete user.", variant: "destructive" });
    }
  };

  const addIndividual = async (individualData: FormData) => {
    try {
      const savedIndividual = await addIndividualApi(individualData);
      setIndividuals(prev => [...prev, savedIndividual].sort((a, b) => new Date(a.deliveryDate || 0).getTime() - new Date(b.deliveryDate || 0).getTime()));
     console.log('Saved Individual indatacontext:', savedIndividual)
      return savedIndividual;
    } catch (error) {
      toast({ title: "API Error", description: "Could not save individual order.", variant: "destructive" });
    }
  };
  
  const addFamily = async (familyFormData: FormData): Promise<void> => {
    try {
      // The FormData is already built, so we just pass it directly to the API service.
      const savedFamily = await addFamilyApi(familyFormData);

      setFamilies(prev => 
        [...prev, savedFamily].sort((a, b) => 
          new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime()
        )
      );
    } catch (error) {
      toast({ title: "API Error", description: "Could not save family order.", variant: "destructive" });
    }
  };




  const updateIndividual = async (id: string, data: FormData) => {
    try {
        const updatedIndividual = await updateIndividualApi(id, data);
        setIndividuals(prev => prev.map(ind => (ind._id === updatedIndividual._id ? updatedIndividual : ind)));
    } catch (error) {
        toast({ title: "API Error", description: "Could not update individual.", variant: "destructive" });
    }
  };

  const deleteIndividual = async (id: string) => {
    try {
      await deleteIndividualApi(id);
      setIndividuals(prev => prev.filter(ind => ind._id !== id));
    } catch (error) {
      toast({ title: "API Error", description: "Could not delete individual.", variant: "destructive" });
    }
  };

  

  const updateUser = async (payload: UpdateUserPayload): Promise<boolean> => {
    try {
      // Note: This relies on an `updateUserApi` function in ApiService.ts
      const updatedUser = await updateUserApi(payload);

      // Update the current user in state and localStorage
      setCurrentUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Also update the user in the main `users` list
      setUsers(prevUsers => prevUsers.map(u => u._id === updatedUser._id ? updatedUser : u));
      
      return true;
    } catch (error: unknown) {
      let message = "Profile update failed.";
      if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as { response?: { data?: { message?: string } } };
        message = err.response?.data?.message || message;
      }
      toast({ title: "Update Failed", description: message, variant: "destructive" });
      return false;
    }
  };
  
const updateFamily = async (id: string, data: FormData) => {
  try {
    // This function now correctly accepts the ID and the FormData object.
    // It simply passes them along to the API service.
    const updatedFamily = await updateFamilyApi(id, data);
    
    // Update the local state with the new data from the server.
    setFamilies(prev => prev.map(fam => (fam._id === updatedFamily._id ? updatedFamily : fam)));

  } catch (error) {
    toast({ title: "API Error", description: "Could not update family.", variant: "destructive" });
    throw error; // Re-throw the error so the component can catch it.
  }
};
  const deleteFamily = async (id: string) => {
    try {
      await deleteFamilyApi(id);
      setFamilies(prev => prev.filter(fam => fam._id !== id));
    } catch (error) {
      toast({ title: "API Error", description: "Could not delete family.", variant: "destructive" });
    }
  };


  
  
  const getIndividual = (id: string) => individuals.find(ind => ind._id === id);
  const getFamily = (id: string) => families.find(fam => fam._id === id);

  return (
    <DataContext.Provider value={{
      isAuthenticated, currentUser, login, logout, users,
      individuals, families, addIndividual, updateIndividual, deleteIndividual,
      addFamily, updateFamily, deleteFamily, getIndividual, getFamily,
      notificationCount,
      dismissedNotificationIds,
      dismissNotification,updateUser,
      addUser,isLoading,
         
      deleteUser,
    }}>
      {children}
    </DataContext.Provider>
  );
};