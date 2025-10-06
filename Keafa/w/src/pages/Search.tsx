import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { SearchIcon, Users, UserCheck, Eye, X } from "lucide-react";
import { searchOrdersApi, getIndividualByIdApi, getFamilyByIdApi } from "@/contexts/ApiService"; 
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Individual, Family } from '@/contexts/DataContext';
import { format } from 'date-fns';
import { getImageUrl } from '@/lib/utils';
// --- MODIFICATION START: Import Skeleton component ---
import { Skeleton } from "@/components/ui/skeleton";
// --- MODIFICATION END ---

const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="py-2 px-3 flex justify-between items-center odd:bg-muted/50 rounded-md">
    <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
    <dd className="text-sm text-foreground text-right">{value || 'N/A'}</dd>
  </div>
);

// --- MODIFICATION START: Define a skeleton component for loading state ---
const SearchResultSkeleton = () => (
  <div className="flex items-center space-x-4 p-3 bg-background rounded-lg border">
    <Skeleton className="h-8 w-8 rounded-full" />
    <div className="space-y-2 flex-grow">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
);
// --- MODIFICATION END ---

type SearchResult = {
  _id: string;
  type: 'individual' | 'family';
  firstName?: string;
  lastName?: string;
  familyName?: string;
  phoneNumbers?: { primary?: string };
};

const Search = () => {
  const { toast } = useToast();
  const [nameQuery, setNameQuery] = useState("");
  const [phoneQuery, setPhoneQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState<{ type: 'individual' | 'family'; data: Individual | Family } | null>(null);
  const [selectedMember, setSelectedMember] = useState<Individual | null>(null);
  const [fullScreenImageUrl, setFullScreenImageUrl] = useState<string | null>(null);

  const handleSearch = async (query: string, type: 'name' | 'phone') => {
    if (!query.trim()) {
      toast({ description: "Please enter a search term." });
      return;
    }
    
    setIsLoading(true);
    setSearchResults([]);   

    try {
      // Simulate a slightly longer delay for skeleton visibility
      await new Promise(resolve => setTimeout(resolve, 500)); 
      const results = await searchOrdersApi(query.trim(), type);
      
      if (results.length > 0) {
        setSearchResults(results);
      } else {
        toast({
          title: "Not Found",
          description: "No orders matched your search query.",
        });
      }
    } catch (error) {
      toast({
        title: "Search Failed",
        description: "An error occurred while searching. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>, query: string, type: 'name' | 'phone') => {
    if (event.key === 'Enter') {
      handleSearch(query, type);
    }
  };
  
  const handleResultClick = async (result: SearchResult) => {
    try {
      let fullData;
      if (result.type === 'individual') {
        fullData = await getIndividualByIdApi(result._id);
      } else {
        fullData = await getFamilyByIdApi(result._id);
      }

      if (fullData) {
        setSelectedOrder({ type: result.type, data: fullData });
      } else {
        throw new Error("Order details could not be found.");
      }
    } catch (error) {
       toast({
        title: "Error",
        description: "Could not fetch order details. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary mb-2 text-center">Search Orders</h1>
          <p className="text-muted-foreground text-center">Find an order by first name or phone number.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Search by First Name</CardTitle></CardHeader>
            <CardContent className="flex items-center gap-4">
              <Input id="name-search" value={nameQuery} onChange={(e) => setNameQuery(e.target.value)} onKeyPress={(e) => handleKeyPress(e, nameQuery, 'name')} placeholder="e.g., Abebe" />
              <Button onClick={() => handleSearch(nameQuery, 'name')} disabled={isLoading}>
                <SearchIcon className="w-4 h-4 mr-2" /> {isLoading ? 'Searching...' : 'Search'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Search by Phone Number</CardTitle></CardHeader>
            <CardContent className="flex items-center gap-4">
              <Input id="phone-search" type="tel" value={phoneQuery} onChange={(e) => setPhoneQuery(e.target.value)} onKeyPress={(e) => handleKeyPress(e, phoneQuery, 'phone')} placeholder="e.g., 0911..." />
              <Button onClick={() => handleSearch(phoneQuery, 'phone')} disabled={isLoading}>
                <SearchIcon className="w-4 h-4 mr-2" /> {isLoading ? 'Searching...' : 'Search'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* --- MODIFICATION START: Show skeleton when loading --- */}
        {isLoading && (
          <Card>
            <CardHeader><CardTitle className="text-muted-foreground">Searching...</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <SearchResultSkeleton />
              <SearchResultSkeleton />
              <SearchResultSkeleton />
            </CardContent>
          </Card>
        )}
        {/* --- MODIFICATION END --- */}


        {/* --- MODIFICATION START: Show results only when NOT loading --- */}
        {!isLoading && searchResults.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Search Results ({searchResults.length})</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {searchResults.map((result) => (
                <button
                  key={result._id}
                  onClick={() => handleResultClick(result)}
                  className="w-full text-left p-3 bg-accent/50 rounded-lg hover:bg-accent transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {result.type === 'individual' ? <UserCheck className="w-5 h-5 text-primary" /> : <Users className="w-5 h-5 text-primary" />}
                    <div>
                      <p className="font-medium">{result.type === 'individual' ? `${result.firstName} ${result.lastName}` : result.familyName}</p>
                      <p className="text-sm text-muted-foreground">{result.phoneNumbers?.primary || 'No Phone'}</p>
                    </div>
                  </div>
                  {/* --- MODIFICATION START: Added type label to result card --- */}
                  <span className="text-xs font-semibold uppercase text-muted-foreground/80 tracking-wider capitalize bg-muted px-2 py-1 rounded-md">
                    {result.type}
                  </span>
                  {/* --- MODIFICATION END --- */}
                </button>
              ))}
            </CardContent>
          </Card>
        )}
        {/* --- MODIFICATION END --- */}

        {/* --- All Modals (No Changes Below This Line) --- */}
    <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      {/* Individual Details View */}
      {selectedOrder?.type === "individual" &&
        (() => {
          const order = selectedOrder.data as Individual;
          const { clothDetails, payment } = order;
          return (
            <>
              <DialogHeader>
                <DialogTitle>
                  {order.firstName} {order.lastName} - Details
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <Card>
                  <CardHeader>
                    <DialogTitle className="text-lg">
                      Personal & Contact
                    </DialogTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                    <DetailRow label="First Name" value={order.firstName} />
                    <DetailRow label="Last Name" value={order.lastName} />
                    <DetailRow label="Sex" value={order.sex} />
                    <DetailRow label="Age" value={order.age} />
                    <DetailRow
                      label="Primary Phone"
                      value={order.phoneNumbers?.primary}
                    />
                    <DetailRow
                      label="Secondary Phone"
                      value={order.phoneNumbers?.secondary}
                    />
                    <DetailRow
                      label="Telegram"
                      value={order.socials?.telegram}
                    />
                    <DetailRow
                      label="Instagram"
                      value={order.socials?.instagram}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <DialogTitle className="text-lg">
                      Measurements & Design
                    </DialogTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                      {clothDetails.shirtLength && (
                        <DetailRow
                          label="Shirt Length"
                          value={clothDetails.shirtLength}
                        />
                      )}
                      {clothDetails.sholder && (
                        <DetailRow
                          label="Shoulder"
                          value={clothDetails.sholder}
                        />
                      )}
                      {clothDetails.wegeb && (
                        <DetailRow label="Waist" value={clothDetails.wegeb} />
                      )}
                      {clothDetails.rist && (
                        <DetailRow label="Wrist" value={clothDetails.rist} />
                      )}
                      {order.sex === "Female" && (
                        <>
                          {clothDetails.dressLength && (
                            <DetailRow
                              label="Dress Length"
                              value={clothDetails.dressLength}
                            />
                          )}
                          {clothDetails.sliveLength && (
                            <DetailRow
                              label="Sleeve Length"
                              value={clothDetails.sliveLength}
                            />
                          )}
                          {clothDetails.breast && (
                            <DetailRow
                              label="Breast"
                              value={clothDetails.breast}
                            />
                          )}
                          {clothDetails.overBreast && (
                            <DetailRow
                              label="Over Breast"
                              value={clothDetails.overBreast}
                            />
                          )}
                          {clothDetails.underBreast && (
                            <DetailRow
                              label="Under Breast"
                              value={clothDetails.underBreast}
                            />
                          )}
                          {clothDetails.femaleSliveType && (
                            <DetailRow
                              label="Sleeve Type"
                              value={clothDetails.femaleSliveType}
                            />
                          )}
                          {clothDetails.femaleWegebType && (
                            <DetailRow
                              label="Waist Type"
                              value={clothDetails.femaleWegebType}
                            />
                          )}
                        </>
                      )}
                      {order.sex === "Male" && (
                        <>
                          {clothDetails.deret && (
                            <DetailRow
                              label="Chest"
                              value={clothDetails.deret}
                            />
                          )}
                          {clothDetails.anget && (
                            <DetailRow
                              label="Neck"
                              value={clothDetails.anget}
                            />
                          )}
                          {clothDetails.maleClothType && (
                            <DetailRow
                              label="Cloth Type"
                              value={clothDetails.maleClothType}
                            />
                          )}
                          {clothDetails.maleSliveType && (
                            <DetailRow
                              label="Sleeve Type"
                              value={clothDetails.maleSliveType}
                            />
                          )}
                          {clothDetails.netela && (
                            <DetailRow
                              label="Netela"
                              value={clothDetails.netela}
                            />
                          )}
                        </>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      {clothDetails.tilefImageUrl && (
                        <DetailRow
                          label="Tilef Image"
                          value={
                            <img
                              src={getImageUrl(clothDetails.tilefImageUrl)}
                              alt="Tilef Pattern"
                              className="h-20 w-20 object-cover rounded-md ml-auto cursor-pointer"
                              onClick={() =>
                                setFullScreenImageUrl(
                                  getImageUrl(clothDetails.tilefImageUrl)!
                                )
                              }
                            />
                          }
                        />
                      )}
                      {clothDetails.colors &&
                        clothDetails.colors.length > 0 &&
                        clothDetails.colors[0] !== "" && (
                          <DetailRow
                            label="Color Codes"
                            value={
                              <span className="font-mono bg-muted px-2 py-1 rounded">
                                {clothDetails.colors.join(", ")}
                              </span>
                            }
                          />
                        )}
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <DialogTitle className="text-lg">Delivery</DialogTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailRow
                        label="Delivery Date"
                        value={
                          order.deliveryDate
                            ? format(new Date(order.deliveryDate), "PPP")
                            : "N/A"
                        }
                      />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <DialogTitle className="text-lg">Payment</DialogTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailRow
                        label="Total"
                        value={
                          payment?.total
                            ? `ETB ${payment.total.toLocaleString()}`
                            : "N/A"
                        }
                      />
                      <DetailRow
                        label="First Half Status"
                        value={payment?.firstHalf?.paid ? "Paid" : "Pending"}
                      />
                      <DetailRow
                        label="First Half Amount"
                        value={
                          payment?.firstHalf?.amount
                            ? `ETB ${payment.firstHalf.amount.toLocaleString()}`
                            : "N/A"
                        }
                      />
                      <DetailRow
                        label="Second Half Status"
                        value={payment?.secondHalf?.paid ? "Paid" : "Pending"}
                      />
                      <DetailRow
                        label="Second Half Amount"
                        value={
                          payment?.secondHalf?.amount
                            ? `ETB ${payment.secondHalf.amount.toLocaleString()}`
                            : "N/A"
                        }
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          );
        })()}

      {/* Family Details View */}
      {selectedOrder?.type === "family" &&
        (() => {
          const order = selectedOrder.data as Family;
          return (
            <>
              <DialogHeader>
                <DialogTitle>{order.familyName} - Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <Card>
                  <CardHeader>
                    <DialogTitle className="text-lg">
                      Family Info & Contact
                    </DialogTitle>
                  </CardHeader>
                  <CardContent>
                    <DetailRow
                      label="Primary Phone"
                      value={order.phoneNumbers.primary}
                    />
                    <DetailRow
                      label="Telegram"
                      value={order.socials?.telegram}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <DialogTitle className="text-lg">
                      Design & Delivery
                    </DialogTitle>
                  </CardHeader>
                  <CardContent>
                    <DetailRow
                      label="Tilef Image"
                      value={
                        order.tilefImageUrl ? (
                          <img
                            src={getImageUrl(order.tilefImageUrl)}
                            alt="Tilef"
                            className="h-20 w-20 object-cover rounded-md ml-auto cursor-pointer"
                            onClick={() =>
                              setFullScreenImageUrl(
                                getImageUrl(order.tilefImageUrl!)
                              )
                            }
                          />
                        ) : (
                          "No Image"
                        )
                      }
                    />
                    {order.colors && order.colors.length > 0 && (
                      <DetailRow
                        label="Color Codes"
                        value={
                          <span className="font-mono bg-muted px-2 py-1 rounded">
                            {order.colors.join(", ")}
                          </span>
                        }
                      />
                    )}
                    <DetailRow
                      label="Delivery Date"
                      value={
                        order.deliveryDate
                          ? format(new Date(order.deliveryDate), "PPP")
                          : "N/A"
                      }
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <DialogTitle className="text-lg">Payment</DialogTitle>
                  </CardHeader>
                  <CardContent>
                    <DetailRow
                      label="Total"
                      value={
                        order.payment?.total
                          ? `ETB ${order.payment.total.toLocaleString()}`
                          : "N/A"
                      }
                    />
                    <DetailRow
                      label="First Half Status"
                      value={order.payment?.firstHalf.paid ? "Paid" : "Pending"}
                    />
                    <DetailRow
                      label="First Half Amount"
                      value={
                        order.payment?.firstHalf.amount
                          ? `ETB ${order.payment.firstHalf.amount.toLocaleString()}`
                          : "N/A"
                      }
                    />
                    <DetailRow
                      label="Second Half Status"
                      value={
                        order.payment?.secondHalf.paid ? "Paid" : "Pending"
                      }
                    />
                    <DetailRow
                      label="Second Half Amount"
                      value={
                        order.payment?.secondHalf.amount
                          ? `ETB ${order.payment.secondHalf.amount.toLocaleString()}`
                          : "N/A"
                      }
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <DialogTitle className="text-lg">
                      Members ({order.memberIds.length})
                    </DialogTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {(order.memberIds as Individual[]).map((member) => (
                      <Card
                        key={member._id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedMember(member)}
                      >
                        <CardContent className="p-3 flex justify-between items-center">
                          <div>
                            <p className="font-medium">
                              {member.firstName} {member.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {member.sex}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </>
          );
        })()}
    </DialogContent>
  </Dialog>

  {/* --- FIX START: Corrected Full Screen Image Viewer --- */}
  <Dialog open={!!fullScreenImageUrl} onOpenChange={() => setFullScreenImageUrl(null)}>
    <DialogContent 
      className="bg-transparent border-none shadow-none p-0 w-auto h-auto max-w-[95vw] max-h-[95vh] focus:outline-none"
      aria-describedby={undefined}
      aria-labelledby={undefined}
    >
      <img 
        src={fullScreenImageUrl} 
        alt="Full screen preview" 
        className="max-w-[90vw] max-h-[90vh] object-contain" 
      />
      <DialogClose asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2 text-white hover:bg-white/20 hover:text-white"
        >
          <X className="w-6 h-6" />
        </Button>
      </DialogClose>
    </DialogContent>
  </Dialog>
  {/* --- FIX END --- */}
        <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedMember && (() => {
              const { clothDetails } = selectedMember;
              return (
                <><DialogHeader><DialogTitle>{selectedMember.firstName} {selectedMember.lastName} - Member Details</DialogTitle></DialogHeader><div className="space-y-4 py-4">
                  <Card><CardHeader><DialogTitle className="text-base">Personal Info</DialogTitle></CardHeader><CardContent><DetailRow label="Sex" value={selectedMember.sex} /><DetailRow label="Age" value={selectedMember.age} /></CardContent></Card>
                  <Card><CardHeader><DialogTitle className="text-base">Measurements</DialogTitle></CardHeader><CardContent><div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">{clothDetails.shirtLength && <DetailRow label="Shirt Length" value={clothDetails.shirtLength} />}{clothDetails.sholder && <DetailRow label="Sholder" value={clothDetails.sholder} />}{clothDetails.wegeb && <DetailRow label="Waist" value={clothDetails.wegeb} />}{clothDetails.rist && <DetailRow label="Wrist" value={clothDetails.rist} />}{selectedMember.sex === 'Female' && (<>{clothDetails.dressLength && <DetailRow label="Dress Length" value={clothDetails.dressLength} />}{clothDetails.sliveLength && <DetailRow label="Sleeve Length" value={clothDetails.sliveLength} />}{clothDetails.breast && <DetailRow label="Breast" value={clothDetails.breast} />}{clothDetails.overBreast && <DetailRow label="Over Breast" value={clothDetails.overBreast} />}{clothDetails.underBreast && <DetailRow label="Under Breast" value={clothDetails.underBreast} />}{clothDetails.femaleSliveType && <DetailRow label="Sleeve Type" value={clothDetails.femaleSliveType} />}{clothDetails.femaleWegebType && <DetailRow label="Waist Type" value={clothDetails.femaleWegebType} />}</>)}{selectedMember.sex === 'Male' && (<>{clothDetails.deret && <DetailRow label="Deret" value={clothDetails.deret} />}{clothDetails.anget && <DetailRow label="Neck" value={clothDetails.anget} />}{clothDetails.maleClothType && <DetailRow label="Cloth Type" value={clothDetails.maleClothType} />}{clothDetails.maleSliveType && <DetailRow label="Sleeve Type" value={clothDetails.maleSliveType} />}{clothDetails.netela && <DetailRow label="Netela" value={clothDetails.netela} />}</>)}</div></CardContent></Card>
                </div></>
              );
            })()}
          </DialogContent>
        </Dialog>

        {fullScreenImageUrl && (<div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[999] cursor-pointer" onClick={() => setFullScreenImageUrl(null)}><Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white"><X className="w-6 h-6" /></Button><img src={fullScreenImageUrl} alt="Full screen preview" className="max-w-[90vw] max-h-[90vh] object-contain" /></div>)}
      </div>
    </div>
  );
};

export default Search;