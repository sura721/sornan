import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Plus, Eye, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useData, Individual } from "@/contexts/DataContext";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import {  toZonedTime } from "date-fns-tz";
import { getImageUrl } from "@/lib/utils";

// Helper component for the details modal
const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="py-2 px-3 flex justify-between items-center odd:bg-muted/50 rounded-md">
    <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
    <dd className="text-sm text-foreground text-right">{value || 'N/A'}</dd>
  </div>
);

const IndividualOrders = () => {
  const { individuals, deleteIndividual } = useData();
  const [selectedIndividualId, setSelectedIndividualId] = useState<string | null>(null);
  const [fullScreenImageUrl, setFullScreenImageUrl] = useState<string | null>(null);

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the order for ${name}?`)) {
      deleteIndividual(id);
      toast({
        title: "Success",
        description: "Individual order deleted successfully",
      });
    }
  };

  return (
    <div className="space-y-8 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary mb-2">Individual Orders</h1>
          <p className="text-muted-foreground">View all individual cloth orders</p>
        </div>
      </div>

      {individuals.length === 0 ? (
        <Card className="shadow-card border-0 p-8 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto">
              <Plus className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-primary">No Individual Orders Yet</h3>
            <p className="text-muted-foreground">Click 'Add New Individual' to create an order.</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {individuals.map((individual) => (
            <Card key={individual._id} className="shadow-card border-0 hover:shadow-elegant transition-shadow cursor-pointer">
              <CardContent className="p-6 flex flex-col h-full" onClick={() => setSelectedIndividualId(individual._id)}>
                <div className="space-y-4 flex-grow">
                  <div className="w-full h-48 bg-accent rounded-lg flex items-center justify-center overflow-hidden">
                    {individual.clothDetails?.tilefImageUrl ? (
                      <img src={getImageUrl(individual.clothDetails.tilefImageUrl)} alt="Tilef Design" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-bold text-primary">{individual.firstName?.[0] || ''}{individual.lastName?.[0] || ''}</span>
                    )}
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-lg text-primary">{individual.firstName} {individual.lastName}</h3>
                    <p className="text-sm text-muted-foreground">{individual.phoneNumbers?.primary}</p>
                    <p className="text-sm text-muted-foreground">Delivery: {individual.deliveryDate ? format( toZonedTime(new Date(individual.deliveryDate), 'UTC'), "PPP") : 'N/A'}</p>
                  </div>
                </div>
                <div className="mt-auto pt-4 space-y-4">
                  <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                    <span className="font-medium text-primary text-sm">ETB {(individual.payment?.total || 0).toLocaleString()}</span>
                    <div className="flex gap-2">
                      <Button asChild size="sm" variant="outline"><Link to={`/edit-individual/${individual._id}`}><Edit className="w-4 h-4" /></Link></Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(individual._id, `${individual.firstName} ${individual.lastName}`)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                  <div className="flex justify-center gap-2 text-xs">
                    <span className={`px-2 py-1 rounded-full ${individual.payment?.firstHalf?.paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>1st: {individual.payment?.firstHalf?.paid ? 'Paid' : 'Pending'}</span>
                    <span className={`px-2 py-1 rounded-full ${individual.payment?.secondHalf?.paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>2nd: {individual.payment?.secondHalf?.paid ? 'Paid' : 'Pending'}</span>
                  </div>
                  <div className="text-center pt-2"><div className="flex items-center justify-center gap-1 text-sm text-muted-foreground"><Eye className="w-4 h-4" />Click to view details</div></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Individual Details Modal */}
      <Dialog open={!!selectedIndividualId} onOpenChange={() => setSelectedIndividualId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedIndividualId && (() => {
            const order = individuals.find(ind => ind._id === selectedIndividualId);
            if (!order) return null;
            const { clothDetails, payment } = order;
            return (
              <>
                <DialogHeader><DialogTitle>{order.firstName} {order.lastName} - Order Details</DialogTitle></DialogHeader>
                <div className="space-y-6 py-4">
                  <Card><CardHeader><DialogTitle className="text-lg">Personal & Contact</DialogTitle></CardHeader><CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                    <DetailRow label="First Name" value={order.firstName} />
                    <DetailRow label="Last Name" value={order.lastName} />
                    <DetailRow label="Sex" value={order.sex} />
                    <DetailRow label="Age" value={order.age} />
                    <DetailRow label="Primary Phone" value={order.phoneNumbers?.primary} />
                    <DetailRow label="Secondary Phone" value={order.phoneNumbers?.secondary} />
                    <DetailRow label="Telegram" value={order.socials?.telegram} />
                    <DetailRow label="Instagram" value={order.socials?.instagram} />
                  </CardContent></Card>

                  <Card><CardHeader><DialogTitle className="text-lg">Measurements & Design</DialogTitle></CardHeader><CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                      {clothDetails.shirtLength && <DetailRow label="Shirt Length" value={clothDetails.shirtLength} />}
                      {clothDetails.sholder && <DetailRow label="Sholder" value={clothDetails.sholder} />}
                      {clothDetails.wegeb && <DetailRow label="Wegeb" value={clothDetails.wegeb} />}
                      {clothDetails.rist && <DetailRow label="Rist" value={clothDetails.rist} />}
                      {order.sex === 'Female' && (<>
                        {clothDetails.dressLength && <DetailRow label="Dress Length" value={clothDetails.dressLength} />}
                        {clothDetails.sliveLength && <DetailRow label="Slive Length" value={clothDetails.sliveLength} />}
                        {clothDetails.breast && <DetailRow label="Breast" value={clothDetails.breast} />}
                        {clothDetails.overBreast && <DetailRow label="Over Breast" value={clothDetails.overBreast} />}
                        {clothDetails.underBreast && <DetailRow label="Under Breast" value={clothDetails.underBreast} />}
                        {clothDetails.femaleSliveType && <DetailRow label="Slive Type" value={clothDetails.femaleSliveType} />}
                        {clothDetails.femaleWegebType && <DetailRow label="Wegeb Type" value={clothDetails.femaleWegebType} />}
                      </>)}
                      {order.sex === 'Male' && (<>
                        {clothDetails.deret && <DetailRow label="Deret" value={clothDetails.deret} />}
                        {clothDetails.anget && <DetailRow label="Anget" value={clothDetails.anget} />}
                        {clothDetails.maleClothType && <DetailRow label="Cloth Type" value={clothDetails.maleClothType} />}
                        {clothDetails.maleSliveType && <DetailRow label="Slive Type" value={clothDetails.maleSliveType} />}
                        {clothDetails.netela && <DetailRow label="Netela" value={clothDetails.netela} />}
                      </>)}
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      {clothDetails.tilefImageUrl && (<DetailRow label="Tilef Image" value={<img src={getImageUrl(clothDetails.tilefImageUrl)} alt="Tilef Pattern" className="h-20 w-20 object-cover rounded-md ml-auto cursor-pointer transition-transform hover:scale-105" onClick={() => setFullScreenImageUrl(getImageUrl(clothDetails.tilefImageUrl)!)} />} />)}
                      {clothDetails.colors && clothDetails.colors.length > 0 && clothDetails.colors[0] !== '' && (<DetailRow label="Color Codes" value={<span className="font-mono bg-muted px-2 py-1 rounded">{clothDetails.colors.join(', ')}</span>} />)}
                    </div>
                  </CardContent></Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card><CardHeader><DialogTitle className="text-lg">Delivery Information</DialogTitle></CardHeader><CardContent><DetailRow label="Delivery Date" value={order.deliveryDate ? format(new Date(order.deliveryDate), "PPP") : 'N/A'} /></CardContent></Card>
                    <Card><CardHeader><DialogTitle className="text-lg">Payment Details</DialogTitle></CardHeader><CardContent>
                      <DetailRow label="Total" value={payment?.total ? `ETB ${payment.total.toLocaleString()}` : 'N/A'} />
                      <DetailRow label="First Half Status" value={payment?.firstHalf?.paid ? 'Paid' : 'Pending'} />
                      <DetailRow label="First Half Amount" value={payment?.firstHalf?.amount ? `ETB ${payment.firstHalf.amount.toLocaleString()}` : 'N/A'} />
                      <DetailRow label="Second Half Status" value={payment?.secondHalf?.paid ? 'Paid' : 'Pending'} />
                      <DetailRow label="Second Half Amount" value={payment?.secondHalf?.amount ? `ETB ${payment.secondHalf.amount.toLocaleString()}` : 'N/A'} />
                    </CardContent></Card>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
      
      {/* Full Screen Image Viewer */}
      {fullScreenImageUrl && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[999] cursor-pointer" onClick={() => setFullScreenImageUrl(null)}>
          <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white hover:bg-white/20 hover:text-white"><X className="w-6 h-6" /></Button>
          <img src={fullScreenImageUrl} alt="Full screen tilef pattern" className="max-w-[90vw] max-h-[90vh] object-contain" />
        </div>
      )}
    </div>
  );
};

export default IndividualOrders;