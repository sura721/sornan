import { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Plus, Trash2, User, Save, Loader2, Eye, EyeOff } from 'lucide-react';

const Settings = () => {
  // --- Existing State ---
  const { users, addUser, deleteUser, currentUser, updateUser } = useData();
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [editNewPassword, setEditNewPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // --- NEW: State for the "Add User" form features ---
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [showAddPassword, setShowAddPassword] = useState(false);
  
  useEffect(() => {
    if (currentUser) {
      setEditUsername(currentUser.username);
    }
  }, [currentUser]);

  // --- MODIFIED: handleAddUser function (now with loading state) ---
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUsername = newUsername.trim();

    if (!trimmedUsername || !newPassword) {
      toast({ description: "Username and password are required.", variant: "destructive" });
      return;
    }

    setIsAddingUser(true); // Start loading
    const success = await addUser(trimmedUsername, newPassword);
    setIsAddingUser(false); // Stop loading

    if (success) {
      toast({ description: `User "${trimmedUsername}" created.` });
      setNewUsername('');
      setNewPassword('');
    } else {
      toast({ description: `Username "${trimmedUsername}" already exists.`, variant: "destructive" });
    }
  };

  // --- handleDeleteUser function (Unchanged) ---
  const handleDeleteUser = (userId: string, username: string) => {
    if (window.confirm(`Are you sure you want to delete the user "${username}"?`)) {
      deleteUser(userId);
      toast({ description: `User "${username}" has been removed.` });
    }
  };

  // --- handleUpdateProfile function (Unchanged) ---
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editNewPassword && !currentPassword) {
      toast({
        title: "Current Password Required",
        description: "You must provide your current password to set a new one.",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);
    const success = await updateUser({
      username: editUsername,
      currentPassword: currentPassword,
      newPassword: editNewPassword
    });
    setIsUpdating(false);

    if (success) {
      toast({ description: "Your profile has been updated successfully." });
      setCurrentPassword('');
      setEditNewPassword('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-primary mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and user accounts for this application.</p>
      </div>
      
      {/* My Profile Card - UNCHANGED */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle className="text-primary font-serif">My Profile</CardTitle>
          <CardDescription>Edit your username or change your password here.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            
            <div className="grid md:grid-cols-2 gap-4 border-t pt-4">
               <div className="space-y-2 relative">
                <Label htmlFor="current-password">Current Password</Label>
                <Input 
                  id="current-password" 
                  type={showCurrentPassword ? 'text' : 'password'} 
                  value={currentPassword} 
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Required to change password" 
                  className="pr-10"
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="absolute bottom-1 right-1 h-7 w-7"
                  onClick={() => setShowCurrentPassword(prev => !prev)}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>

              <div className="space-y-2 relative">
                <Label htmlFor="edit-new-password">New Password</Label>
                <Input 
                  id="edit-new-password" 
                  type={showNewPassword ? 'text' : 'password'} 
                  value={editNewPassword} 
                  onChange={(e) => setEditNewPassword(e.target.value)}
                  placeholder="Leave blank to keep same" 
                  className="pr-10"
                />
                 <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="absolute bottom-1 right-1 h-7 w-7"
                  onClick={() => setShowNewPassword(prev => !prev)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className='flex justify-end'>
              <Button type="submit" disabled={isUpdating} className="w-36">
                {isUpdating ? (
                  <> <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving... </>
                ) : (
                  <> <Save className="w-4 h-4 mr-2" /> Save Changes </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Add New User Card - UPDATED WITH NEW FEATURES */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle className="text-primary font-serif">Add New User</CardTitle>
          <CardDescription>Create a new login for another employee.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddUser} className="flex flex-col md:flex-row items-end gap-4">
            <div className="flex-grow w-full space-y-2">
              <Label htmlFor="new-username">New Username</Label>
              <Input id="new-username" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="e.g., employee1" />
            </div>
            {/* New Password Input with Toggle */}
            <div className="flex-grow w-full space-y-2 relative">
              <Label htmlFor="new-password">New Password</Label>
              <Input 
                id="new-password" 
                type={showAddPassword ? 'text' : 'password'} 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                placeholder="Create a strong password"
                className="pr-10" 
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute bottom-1 right-1 h-7 w-7"
                onClick={() => setShowAddPassword(prev => !prev)}
              >
                {showAddPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {/* Button with Loading State */}
            <Button type="submit" disabled={isAddingUser} className="w-36">
              {isAddingUser ? (
                <> <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Adding... </>
              ) : (
                <> <Plus className="w-4 h-4 mr-2" /> Add User </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Manage Users Card - UNCHANGED */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle className="text-primary font-serif">Manage Users</CardTitle>
          <CardDescription>View and remove existing user accounts.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {users.map((user) => (
            <div key={user._id} className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-primary" />
                <span className="font-medium">{user.username}</span>
                {user.username === 'admin' && (
                  <span className="text-xs font-semibold text-white bg-primary px-2 py-0.5 rounded-full">Master</span>
                )}
              </div>
              {user.username !== 'admin' && currentUser?.username === 'admin' && (
                <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(user._id, user.username)}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;