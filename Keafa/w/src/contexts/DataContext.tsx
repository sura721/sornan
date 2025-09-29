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
  updateFamilyApi
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
    tilefImageUrl?: string;
    shirtLength?: number;
    sholder?: number;
    wegeb?: number;
    rist?: number;
    dressLength?: number;
    sliveLength?: number;
    breast?: number;
    overBreast?: number;
    underBreast?: number;
    femaleSliveType?: string;
    femaleWegebType?: string;
    deret?: number;
    anget?: number;
    maleClothType?: string;
    maleSliveType?: string;
    netela?: 'Yes' | 'No';
  };
  payment?: {
    total?: number;
    firstHalf: { paid: boolean; amount?: number };
    secondHalf: { paid: boolean; amount?: number };
  };
  deliveryDate?: string;
}
export interface Family {
  _id: string;
  familyName: string;
  memberIds: (string | Individual)[];
  phoneNumbers: { primary: string; secondary?: string; };
  socials?: { telegram?: string; };
  tilefImageUrl?: string;
  colors: string[];
  payment: {
    total?: number;
    firstHalf: { paid: boolean; amount?: number };
    secondHalf: { paid: boolean; amount?: number };
  };
  deliveryDate: string;
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
  addUser: (username: string, password: string) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<void>;
  individuals: Individual[];
  families: Family[];
  addIndividual: (individualData: FormData) => Promise<Individual | undefined>;
  updateIndividual: (individual: Individual) => Promise<void>;
  deleteIndividual: (id: string) => Promise<void>;
  addFamily: (familyData: FormData) => Promise<void>; 
  updateFamily: (family: Family, tilefFile: File | null) => Promise<void>;  deleteFamily: (id: string) => Promise<void>;
  getIndividual: (id: string) => Individual | undefined;
  getFamily: (id: string) => Family | undefined;
  notificationCount: number;
  dismissedNotificationIds: string[];
  dismissNotification: (id: string) => void;
}
const DataContext = createContext<DataContextType | undefined>(undefined);
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) { throw new Error('useData must be used within a DataProvider'); }
  return context;
};

// --- Data Provider Component ---
export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // ====================================================================
  // --- THE FIX IS HERE ---
  // We initialize the state by SYNCHRONOUSLY reading from localStorage.
  // This happens instantly before the first render, preventing the redirect.
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!localStorage.getItem('authToken'));
  
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  // ====================================================================

  const [users, setUsers] = useState<User[]>([]);
  const [individuals, setIndividuals] = useState<Individual[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<string[]>(() => {
    const savedDismissed = localStorage.getItem('dismissedNotifications');
    return savedDismissed ? JSON.parse(savedDismissed) : [];
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      // This logic is now correct. It only runs if we are authenticated.
      if (isAuthenticated) {
        try {
          const [individualsData, familiesData, usersData] = await Promise.all([
            fetchIndividualsApi(),
            fetchFamiliesApi(),
            fetchUsersApi(),
          ]);
          setIndividuals(individualsData);
          setFamilies(familiesData);
          setUsers(usersData);
        } catch (error) {
          toast({ title: "Data Error", description: "Could not load initial data.", variant: "destructive" });
        }
      }
    };
    fetchInitialData();
  }, [isAuthenticated]);
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
      const data = await loginUserApi(username, password);
      const { token, ...userData } = data;
      if (token) {
        localStorage.setItem("authToken", token);
        localStorage.setItem("user", JSON.stringify(userData));
      }
      setIsAuthenticated(true);
      setCurrentUser(userData);
      return true;
    } catch (error) {
      toast({ title: "Login Failed", description: "Invalid credentials.", variant: "destructive" });
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('dismissedNotifications');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setUsers([]);
    setIndividuals([]);
    setFamilies([]);
    setDismissedNotificationIds([]);
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
  const updateIndividual = async (individual: Individual) => {
    try {
        const updatedIndividual = await updateIndividualApi(individual);
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
  
 // The NEW and CORRECT function to paste
const updateFamily = async (family: Family, tilefFile: File | null) => {
  try {
    const formData = new FormData();

    // This part packages all your text data into the form
    formData.append('familyName', family.familyName);
    formData.append('phoneNumbers', JSON.stringify(family.phoneNumbers));
    formData.append('socials', JSON.stringify(family.socials || {}));
    formData.append('colors', JSON.stringify(family.colors || []));
    formData.append('payment', JSON.stringify(family.payment));
    formData.append('deliveryDate', family.deliveryDate);
    formData.append('memberIds', JSON.stringify(family.memberIds));

    // This preserves the old image if you don't upload a new one
    if (family.tilefImageUrl) {
      formData.append('tilefImageUrl', family.tilefImageUrl);
    }
    
    // This is the image logic: if a new file exists, add it
    if (tilefFile) {
formData.append('tilefImage', tilefFile);    }

    // This now calls the API with the ID and the FormData object
    const updatedFamily = await updateFamilyApi(family._id, formData);
    setFamilies(prev => prev.map(fam => (fam._id === updatedFamily._id ? updatedFamily : fam)));

  } catch (error) {
    toast({ title: "API Error", description: "Could not update family.", variant: "destructive" });
    throw error;
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
      dismissNotification,
      addUser,
      deleteUser,
    }}>
      {children}
    </DataContext.Provider>
  );
};