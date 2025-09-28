import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Plus, Trash2, User } from 'lucide-react';

const Settings = () => {
  const { users, addUser, deleteUser, currentUser } = useData();
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUsername = newUsername.trim();

    if (!trimmedUsername || !newPassword) {
      toast({ description: "Username and password are required.", variant: "destructive" });
      return;
    }

    const success = await addUser(trimmedUsername, newPassword);
    
    if (success) {
      toast({ description: `User "${trimmedUsername}" created.` });
      setNewUsername('');
      setNewPassword('');
    } else {
      toast({ description: `Username "${trimmedUsername}" already exists.`, variant: "destructive" });
    }
  };

  const handleDeleteUser = (userId: string, username: string) => {
    if (window.confirm(`Are you sure you want to delete the user "${username}"?`)) {
      deleteUser(userId);
      toast({ description: `User "${username}" has been removed.` });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-primary mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage user accounts for this application.</p>
      </div>

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
            <div className="flex-grow w-full space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Create a strong password" />
            </div>
            <Button type="submit">
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </form>
        </CardContent>
      </Card>

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