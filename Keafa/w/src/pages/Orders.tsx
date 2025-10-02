import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Users, UserCheck, Eye, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Individual, Family } from '@/contexts/DataContext';
import { format, differenceInCalendarDays } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { getImageUrl } from '@/lib/utils';
import OrdersSkeleton from '@/components/ui/OrdersSkeleton';

// Reusable component for displaying details in modals
const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="py-2 px-3 flex justify-between items-center odd:bg-muted/50 rounded-md">
    <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
    <dd className="text-sm text-foreground text-right">{value || 'N/A'}</dd>
  </div>
);

const Orders = () => {
  const { individuals, families, deleteIndividual, deleteFamily,isLoading } = useData();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<{ type: 'individual' | 'family'; data: Individual | Family } | null>(null);
  const [selectedMember, setSelectedMember] = useState<Individual | null>(null);
  const [fullScreenImageUrl, setFullScreenImageUrl] = useState<string | null>(null);
  const today = toZonedTime(new Date(), 'UTC');
  const handleDeleteIndividual = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the order for ${name}?`)) {
      deleteIndividual(id);
      toast({ title: "Individual Deleted", description: `${name} has been successfully deleted.` });
    }
  };

  const handleDeleteFamily = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the ${name} family order?`)) {
      deleteFamily(id);
      toast({ title: "Family Deleted", description: `${name} has been successfully deleted.` });
    }
  };

  // const hasOrders = individuals.length > 0 || families.length > 0;
if (isLoading) {
    return <OrdersSkeleton />;
  }
const hasOrders = individuals.length > 0 || families.length > 0;
 

  if (!hasOrders) {
    return (
      <div className="flex items-center justify-center p-6 text-center h-[calc(100vh-10rem)]">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary mb-2">View Orders</h1>
          <p className="text-muted-foreground">No active orders found.</p>
        </div>
      </div>
    );
  }

  
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-serif font-bold text-primary mb-2">View Orders</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Individual Orders Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-primary flex items-center gap-2"><UserCheck className="w-6 h-6" /> Individual Orders</h2>
            <div className="space-y-4">
              {individuals.map((individual) => (
         
<Card key={individual._id} className="group hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedOrder({ type: 'individual', data: individual })}>
  <CardContent className="p-4 flex justify-between items-center">
    <div className="flex-1 min-w-0">
      <p className="text-lg font-semibold text-foreground truncate">{individual.firstName} {individual.lastName}</p>
      <p className="text-sm text-muted-foreground">{individual.phoneNumbers?.primary || 'No Phone'}</p>
      <div className="flex items-center gap-2">
        <p className="text-sm text-muted-foreground">
          Delivery: {individual.deliveryDate ? format(toZonedTime(new Date(individual.deliveryDate), 'UTC'), "PPP") : 'N/A'}
        </p>
        {/* --- COUNTDOWN LOGIC START --- */}
        {individual.deliveryDate && (() => {
          const delivery = toZonedTime(new Date(individual.deliveryDate), 'UTC');
          const daysLeft = differenceInCalendarDays(delivery, today);

          if (daysLeft < 0) {
            return <span className="text-xs font-medium text-gray-500">(Past Due)</span>;
          }
          if (daysLeft === 0) {
            return <span className="text-xs font-bold text-green-600">(Due Today)</span>;
          }
          if (daysLeft <= 3) {
return (
  <span className="text-xs font-medium text-red-600">
    (<span className="text-lg font-bold">{daysLeft}</span>{' '}
    {daysLeft === 1 ? 'day' : 'days'} left)
  </span>
);
          }
          if (daysLeft <= 7) {
            return   <span className="font-medium text-yellow-600">
    (<span className="text-xl font-bold">{daysLeft}</span> days left)
  </span>

          }
          return  <span className="font-medium text-yellow-600">
    (<span className="text-xl font-bold">{daysLeft}</span> days left)
  </span>
;
        })()}
        {/* --- COUNTDOWN LOGIC END --- */}
      </div>
    </div>
    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button variant="outline" size="icon" onClick={(e) => { e.stopPropagation(); navigate(`/edit-individual/${individual._id}`); }}><Edit className="w-4 h-4" /></Button>
      <Button variant="destructive" size="icon" onClick={(e) => { e.stopPropagation(); handleDeleteIndividual(individual._id, `${individual.firstName} ${individual.lastName}`); }}><Trash2 className="w-4 h-4" /></Button>
    </div>
  </CardContent>
</Card>


              ))}
              {individuals.length === 0 && <p className="text-muted-foreground text-center py-4">No individual orders.</p>}
            </div>
          </div>

          {/* Family Orders Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-primary flex items-center gap-2"><Users className="w-6 h-6" /> Family Orders</h2>
            <div className="space-y-4">
              {families.map((family) => (
              <Card key={family._id} className="group hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedOrder({ type: 'family', data: family })}>
  <CardContent className="p-4 flex justify-between items-center">
    <div className="flex-1 min-w-0">
      <p className="text-lg font-semibold text-foreground truncate">{family.familyName}</p>
      <p className="text-sm text-muted-foreground">{family.phoneNumbers?.primary || 'No Phone'}</p>
      <div className="flex items-center gap-2">
        <p className="text-sm text-muted-foreground">
          Delivery: {family.deliveryDate ? format(toZonedTime(new Date(family.deliveryDate), 'UTC'), "PPP") : 'N/A'}
        </p>
        {/* --- COUNTDOWN LOGIC START --- */}
        {family.deliveryDate && (() => {
          const delivery = toZonedTime(new Date(family.deliveryDate), 'UTC');
          const daysLeft = differenceInCalendarDays(delivery, today);

          if (daysLeft < 0) {
            return <span className="text-xs font-medium text-gray-500">(Past Due)</span>;
          }
          if (daysLeft === 0) {
            return <span className="text-xs font-bold text-green-600">(Due Today)</span>;
          }
          if (daysLeft <= 3) {
return (
  <span className="text-xs font-medium text-red-600">
    (<span className="text-lg font-bold">{daysLeft}</span>{' '}
    {daysLeft === 1 ? 'day' : 'days'} left)
  </span>
);
          }
          if (daysLeft <= 7) {
  return  <span className="font-medium text-yellow-600">
    (<span className="text-xl font-bold">{daysLeft}</span> days left)
  </span>          }
  return  <span className="font-medium text-yellow-600">
    (<span className="text-xl font-bold">{daysLeft}</span> days left)
  </span>        })()}
        {/* --- COUNTDOWN LOGIC END --- */}
      </div>
    </div>
    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button variant="outline" size="icon" onClick={(e) => { e.stopPropagation(); navigate(`/edit-family/${family._id}`); }}><Edit className="w-4 h-4" /></Button>
      <Button variant="destructive" size="icon" onClick={(e) => { e.stopPropagation(); handleDeleteFamily(family._id, family.familyName); }}><Trash2 className="w-4 h-4" /></Button>
    </div>
  </CardContent>
</Card>
              ))}
              {families.length === 0 && <p className="text-muted-foreground text-center py-4">No family orders.</p>}
            </div>
          </div>
        </div>

        {/* Modal 1: For Both Individual and Family Details */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Individual Details View */}
            {selectedOrder?.type === 'individual' && (() => {
              const order = selectedOrder.data as Individual;
              const { clothDetails, payment } = order;
              return (
                <><DialogHeader><DialogTitle>{order.firstName} {order.lastName} - Details</DialogTitle></DialogHeader><div className="space-y-6 py-4">
                  <Card><CardHeader><DialogTitle className="text-lg">Personal & Contact</DialogTitle></CardHeader><CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2"><DetailRow label="First Name" value={order.firstName} /><DetailRow label="Last Name" value={order.lastName} /><DetailRow label="Sex" value={order.sex} /><DetailRow label="Age" value={order.age} /><DetailRow label="Primary Phone" value={order.phoneNumbers?.primary} /><DetailRow label="Secondary Phone" value={order.phoneNumbers?.secondary} /><DetailRow label="Telegram" value={order.socials?.telegram} /><DetailRow label="Instagram" value={order.socials?.instagram} /></CardContent></Card>
                  <Card><CardHeader><DialogTitle className="text-lg">Measurements & Design</DialogTitle></CardHeader><CardContent><div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">{clothDetails.shirtLength && <DetailRow label="Shirt Length" value={clothDetails.shirtLength} />}{clothDetails.sholder && <DetailRow label="Sholder" value={clothDetails.sholder} />}{clothDetails.wegeb && <DetailRow label="Wegeb" value={clothDetails.wegeb} />}{clothDetails.rist && <DetailRow label="Rist" value={clothDetails.rist} />}{order.sex === 'Female' && (<>{clothDetails.dressLength && <DetailRow label="Dress Length" value={clothDetails.dressLength} />}{clothDetails.sliveLength && <DetailRow label="Slive Length" value={clothDetails.sliveLength} />}{clothDetails.breast && <DetailRow label="Breast" value={clothDetails.breast} />}{clothDetails.overBreast && <DetailRow label="Over Breast" value={clothDetails.overBreast} />}{clothDetails.underBreast && <DetailRow label="Under Breast" value={clothDetails.underBreast} />}{clothDetails.femaleSliveType && <DetailRow label="Slive Type" value={clothDetails.femaleSliveType} />}{clothDetails.femaleWegebType && <DetailRow label="Wegeb Type" value={clothDetails.femaleWegebType} />}</>)}{order.sex === 'Male' && (<>{clothDetails.deret && <DetailRow label="Deret" value={clothDetails.deret} />}{clothDetails.anget && <DetailRow label="Anget" value={clothDetails.anget} />}{clothDetails.maleClothType && <DetailRow label="Cloth Type" value={clothDetails.maleClothType} />}{clothDetails.maleSliveType && <DetailRow label="Slive Type" value={clothDetails.maleSliveType} />}{clothDetails.netela && <DetailRow label="Netela" value={clothDetails.netela} />}</>)}</div><div className="mt-4 pt-4 border-t">{clothDetails.tilefImageUrl && (<DetailRow label="Tilef Image" value={<img src={getImageUrl(clothDetails.tilefImageUrl)} alt="Tilef Pattern" className="h-20 w-20 object-cover rounded-md ml-auto cursor-pointer" onClick={() => setFullScreenImageUrl(getImageUrl(clothDetails.tilefImageUrl)!)} />} />)}{clothDetails.colors && clothDetails.colors.length > 0 && clothDetails.colors[0] !== '' && (<DetailRow label="Color Codes" value={<span className="font-mono bg-muted px-2 py-1 rounded">{clothDetails.colors.join(', ')}</span>} />)}</div></CardContent></Card>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><Card><CardHeader><DialogTitle className="text-lg">Delivery</DialogTitle></CardHeader><CardContent><DetailRow label="Delivery Date" value={order.deliveryDate ? format(new Date(order.deliveryDate), "PPP") : 'N/A'} /></CardContent></Card><Card><CardHeader><DialogTitle className="text-lg">Payment</DialogTitle></CardHeader><CardContent><DetailRow label="Total" value={payment?.total ? `ETB ${payment.total.toLocaleString()}` : 'N/A'} /><DetailRow label="First Half Status" value={payment?.firstHalf?.paid ? 'Paid' : 'Pending'} /><DetailRow label="First Half Amount" value={payment?.firstHalf?.amount ? `ETB ${payment.firstHalf.amount.toLocaleString()}` : 'N/A'} /><DetailRow label="Second Half Status" value={payment?.secondHalf?.paid ? 'Paid' : 'Pending'} /><DetailRow label="Second Half Amount" value={payment?.secondHalf?.amount ? `ETB ${payment.secondHalf.amount.toLocaleString()}` : 'N/A'} /></CardContent></Card></div>
                </div></>
              );
            })()}

            {/* Family Details View */}
            {selectedOrder?.type === 'family' && (() => {
              const order = selectedOrder.data as Family;
              return (
                <><DialogHeader><DialogTitle>{order.familyName} - Details</DialogTitle></DialogHeader><div className="space-y-6 py-4">
                  <Card><CardHeader><DialogTitle className="text-lg">Family Info & Contact</DialogTitle></CardHeader><CardContent><DetailRow label="Primary Phone" value={order.phoneNumbers.primary} /><DetailRow label="Telegram" value={order.socials?.telegram} /></CardContent></Card>
                  <Card><CardHeader><DialogTitle className="text-lg">Design & Delivery</DialogTitle></CardHeader><CardContent><DetailRow label="Tilef Image" value={order.tilefImageUrl ? <img src={getImageUrl(order.tilefImageUrl)} alt="Tilef" className="h-20 w-20 object-cover rounded-md ml-auto cursor-pointer" onClick={() => setFullScreenImageUrl(getImageUrl(order.tilefImageUrl!))} /> : 'No Image'} />{order.colors && order.colors.length > 0 && <DetailRow label="Color Codes" value={<span className="font-mono bg-muted px-2 py-1 rounded">{order.colors.join(', ')}</span>} />}<DetailRow label="Delivery Date" value={order.deliveryDate ? format(new Date(order.deliveryDate), "PPP") : 'N/A'} /></CardContent></Card>
                  
                  {/* --- FIX START: Corrected Payment Details for Family Modal --- */}
                  <Card>
                    <CardHeader><DialogTitle className="text-lg">Payment</DialogTitle></CardHeader>
                    <CardContent>
                      <DetailRow label="Total" value={order.payment?.total ? `ETB ${order.payment.total.toLocaleString()}` : 'N/A'} />
                      <DetailRow label="First Half Status" value={order.payment?.firstHalf.paid ? 'Paid' : 'Pending'} />
                      <DetailRow label="First Half Amount" value={order.payment?.firstHalf.amount ? `ETB ${order.payment.firstHalf.amount.toLocaleString()}` : 'N/A'} />
                      <DetailRow label="Second Half Status" value={order.payment?.secondHalf.paid ? 'Paid' : 'Pending'} />
                      <DetailRow label="Second Half Amount" value={order.payment?.secondHalf.amount ? `ETB ${order.payment.secondHalf.amount.toLocaleString()}` : 'N/A'} />
                    </CardContent>
                  </Card>
                  {/* --- FIX END --- */}

                  <Card><CardHeader><DialogTitle className="text-lg">Members ({order.memberIds.length})</DialogTitle></CardHeader><CardContent className="space-y-2">
                    {(order.memberIds as Individual[]).map((member) => (
                      <Card key={member._id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedMember(member)}>
                        <CardContent className="p-3 flex justify-between items-center"><div><p className="font-medium">{member.firstName} {member.lastName}</p><p className="text-sm text-muted-foreground">{member.sex}</p></div><Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button></CardContent>
                      </Card>
                    ))}
                  </CardContent></Card>
                </div></>
              );
            })()}
          </DialogContent>
        </Dialog>
        
        {/* Modal 2: Member Details */}
        <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedMember && (() => {
              const { clothDetails } = selectedMember;
              return (
                <><DialogHeader><DialogTitle>{selectedMember.firstName} {selectedMember.lastName} - Member Details</DialogTitle></DialogHeader><div className="space-y-4 py-4">
                  <Card><CardHeader><DialogTitle className="text-base">Personal Info</DialogTitle></CardHeader><CardContent><DetailRow label="Sex" value={selectedMember.sex} /><DetailRow label="Age" value={selectedMember.age} /></CardContent></Card>
                  <Card><CardHeader><DialogTitle className="text-base">Measurements</DialogTitle></CardHeader><CardContent><div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">{clothDetails.shirtLength && <DetailRow label="Shirt Length" value={clothDetails.shirtLength} />}{clothDetails.sholder && <DetailRow label="Sholder" value={clothDetails.sholder} />}{clothDetails.wegeb && <DetailRow label="Wegeb" value={clothDetails.wegeb} />}{clothDetails.rist && <DetailRow label="Rist" value={clothDetails.rist} />}{selectedMember.sex === 'Female' && (<>{clothDetails.dressLength && <DetailRow label="Dress Length" value={clothDetails.dressLength} />}{clothDetails.sliveLength && <DetailRow label="Slive Length" value={clothDetails.sliveLength} />}{clothDetails.breast && <DetailRow label="Breast" value={clothDetails.breast} />}{clothDetails.overBreast && <DetailRow label="Over Breast" value={clothDetails.overBreast} />}{clothDetails.underBreast && <DetailRow label="Under Breast" value={clothDetails.underBreast} />}{clothDetails.femaleSliveType && <DetailRow label="Slive Type" value={clothDetails.femaleSliveType} />}{clothDetails.femaleWegebType && <DetailRow label="Wegeb Type" value={clothDetails.femaleWegebType} />}</>)}{selectedMember.sex === 'Male' && (<>{clothDetails.deret && <DetailRow label="Deret" value={clothDetails.deret} />}{clothDetails.anget && <DetailRow label="Anget" value={clothDetails.anget} />}{clothDetails.maleClothType && <DetailRow label="Cloth Type" value={clothDetails.maleClothType} />}{clothDetails.maleSliveType && <DetailRow label="Slive Type" value={clothDetails.maleSliveType} />}{clothDetails.netela && <DetailRow label="Netela" value={clothDetails.netela} />}</>)}</div></CardContent></Card>
                </div></>
              );
            })()}
          </DialogContent>
        </Dialog>

        {/* Full Screen Image Viewer */}
        {fullScreenImageUrl && (<div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[999] cursor-pointer" onClick={() => setFullScreenImageUrl(null)}><Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white"><X className="w-6 h-6" /></Button><img src={fullScreenImageUrl} alt="Full screen preview" className="max-w-[90vw] max-h-[90vh] object-contain" /></div>)}
      </div>
    </div>
  );
};

export default Orders;