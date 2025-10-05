import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, Plus, UserPlus, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import heroImage from "@/assets/keafa-hero.jpg";

const Dashboard = () => {
  // --- FIX START: Get currentUser to check permissions ---
  const { individuals, families, currentUser } = useData();
  const isMasterUser = currentUser?.username === 'admin';
  // --- FIX END ---

  const individualRevenue = individuals.reduce((sum, ind) => sum + (ind.payment?.total || 0), 0);
  // If a family pays per member, sum the members' totals; otherwise use the family's total
  const familyRevenue = families.reduce((sum, fam) => {
    if (fam.paymentMethod === 'member') {
      const members = (fam.memberIds as Array<{ payment?: { firstHalf?: { paid?: boolean; amount?: number }; secondHalf?: { paid?: boolean; amount?: number }; total?: number } }>) || [];
      const membersTotal = members.reduce((mSum, mem) => mSum + (mem?.payment?.total || 0), 0);
      return sum + membersTotal;
    }
    return sum + (fam.payment?.total || 0);
  }, 0);
  const totalRevenue = individualRevenue + familyRevenue;

  const individualPaid = individuals.reduce((sum, ind) => {
    let paid = 0;
    if (ind.payment?.firstHalf?.paid) paid += ind.payment.firstHalf.amount || 0;
    if (ind.payment?.secondHalf?.paid) paid += ind.payment.secondHalf.amount || 0;
    return sum + paid;
  }, 0);

  const familyPaid = families.reduce((sum, fam) => {
    // For per-member payment, sum paid amounts from each member
    if (fam.paymentMethod === 'member') {
      const members = (fam.memberIds as Array<{ payment?: { firstHalf?: { paid?: boolean; amount?: number }; secondHalf?: { paid?: boolean; amount?: number }; total?: number } }>) || [];
      const membersPaid = members.reduce((mSum, mem) => {
        let mp = 0;
        if (mem?.payment?.firstHalf?.paid) mp += mem.payment.firstHalf.amount || 0;
        if (mem?.payment?.secondHalf?.paid) mp += mem.payment.secondHalf.amount || 0;
        return mSum + mp;
      }, 0);
      return sum + membersPaid;
    }
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
      
      {/* Grid now has 5 columns on large screens to accommodate the new card */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Link to="/individuals"> 
          <Card className="shadow-card border-0 hover:shadow-lg transition-shadow">
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
          <Card className="shadow-card border-0 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Families</CardTitle>
              <UserCheck className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{families.length}</div>
            </CardContent>
          </Card>
        </Link>
        
        {isMasterUser && (
          <>
            <Card className="shadow-card border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">ETB {totalRevenue.toLocaleString()}</div>
              </CardContent>
            </Card>

            {/* --- HERE IS THE NEW CARD --- */}
            <Card className="shadow-card border-0 bg-green-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-800">Total Paid</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700">ETB {totalPaid.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card className="shadow-card border-0 bg-red-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-red-800">Pending Payment</CardTitle>
                <DollarSign className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-700">ETB {pendingAmount.toLocaleString()}</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;