import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, Plus, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import heroImage from "@/assets/keafa-hero.jpg";

const Dashboard = () => {
  // --- FIX START: Get currentUser to check permissions ---
  const { individuals, families, currentUser } = useData();
  const isMasterUser = currentUser?.username === 'admin';
  // --- FIX END ---

  const individualRevenue = individuals.reduce((sum, ind) => sum + (ind.payment?.total || 0), 0);
  const familyRevenue = families.reduce((sum, fam) => sum + (fam.payment?.total || 0), 0);
  const totalRevenue = individualRevenue + familyRevenue;

  const individualPaid = individuals.reduce((sum, ind) => {
    let paid = 0;
    if (ind.payment?.firstHalf?.paid) paid += ind.payment.firstHalf.amount || 0;
    if (ind.payment?.secondHalf?.paid) paid += ind.payment.secondHalf.amount || 0;
    return sum + paid;
  }, 0);

  const familyPaid = families.reduce((sum, fam) => {
    let paid = 0;
    if (fam.payment?.firstHalf?.paid) paid += fam.payment.firstHalf.amount || 0;
    if (fam.payment?.secondHalf?.paid) paid += fam.payment.secondHalf.amount || 0;
    return sum + paid;
  }, 0);

  const totalPaid = individualPaid + familyPaid;
  const pendingAmount = totalRevenue - totalPaid;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative h-64 rounded-xl overflow-hidden shadow-elegant">
        <img 
          src={heroImage} 
          alt="Keafa Design Studio" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-deep/80 to-transparent flex items-center">
          <div className="p-8 text-white">
            <h1 className="text-4xl font-serif font-bold mb-2">Welcome to Keafa Design</h1>
            <p className="text-xl opacity-90">Premium Ethiopian Traditional Cloth Management</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
        <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle className="text-primary font-serif">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button asChild className="h-16 bg-gradient-primary text-secondary-foreground shadow-elegant hover:shadow-xl transition-all">
            <Link to="/add-individual" className="flex items-center gap-3">
              <UserPlus className="w-6 h-6" />
              <div className="text-left">
                <div className="font-semibold">Add New Individual</div>
                <div className="text-sm opacity-90">Create individual order</div>
              </div>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-16 border-primary hover:bg-accent transition-all">
            <Link to="/add-family" className="flex items-center gap-3">
              <Plus className="w-6 h-6" />
              <div className="text-left">
                <div className="font-semibold">Create Family Group</div>
                <div className="text-sm text-muted-foreground">Create a new family order</div>
              </div>
            </Link>
          </Button>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 <Link to="/individuals"> 
       <Card className="shadow-card border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Individuals</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{individuals.length}</div>
          </CardContent>
        </Card>

 </Link>

        <Link to="/families">
        
        <Card className="shadow-card border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Families</CardTitle>
            <UserCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{families.length}</div>
          </CardContent>
        </Card>
        </Link>
        
        {/* --- FIX START: Conditional rendering for master user --- */}
        {isMasterUser && (
          <>
            <Card className="shadow-card border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <div className="w-4 h-4 bg-gradient-primary rounded-sm" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">ETB {totalRevenue.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card className="shadow-card border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Payment</CardTitle>
                <div className="w-4 h-4 bg-accent rounded-sm" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">ETB {pendingAmount.toLocaleString()}</div>
              </CardContent>
            </Card>
          </>
        )}
        {/* --- FIX END --- */}

      </div>

      {/* Quick Actions */}
    
    </div>
  );
};

export default Dashboard;