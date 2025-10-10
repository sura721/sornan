// src/components/FamilyOrders.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Plus, Eye, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useData, Family, Individual } from "@/contexts/DataContext";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { getImageUrl } from "@/lib/utils";

// Helper component for the details modal
const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => {
  // This check prevents empty rows from rendering if value is null, undefined, or an empty string
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return (
    <div className="py-2 px-3 flex justify-between items-center odd:bg-muted/50 rounded-md">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground text-right">{value}</dd>
    </div>
  );
};

const FamilyOrders = () => {
  const { families, deleteFamily } = useData();
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [selectedMember, setSelectedMember] = useState<Individual | null>(null);
  const [fullScreenImageUrl, setFullScreenImageUrl] = useState<string | null>(
    null
  );

  if(selectedFamily){
           console.log('DATA BEING RENDERED:', selectedFamily)

  }

  const handleDelete = (id: string, familyName: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete the "${familyName}" family order?`
      )
    ) {
      deleteFamily(id);
      toast({
        title: "Success",
        description: "Family group deleted successfully",
      });
    }
  };

  return (
    <div className="space-y-8 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary mb-2">
            Family Orders
          </h1>
          <p className="text-muted-foreground">
            View all family groups and orders
          </p>
        </div>
      </div>

      {families.length === 0 ? (
        <Card className="shadow-card border-0 p-8 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto">
              <Plus className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-primary">
              No Family Groups Yet
            </h3>
            <p className="text-muted-foreground">
              Click 'Create Family Group' to get started.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {families.map((family) => (
            <Card
              key={family._id}
              className="shadow-card border-0 hover:shadow-elegant transition-shadow cursor-pointer"
            >
              <CardContent
                className="p-6 flex flex-col h-full"
    onClick={() => {
      console.log('DATA FROM "families" ARRAY ON CLICK:', family);
      setSelectedFamily(family);
    }}              >
                <div className="space-y-4 flex-grow">
                  <div className="w-full h-48 bg-accent rounded-lg flex items-center justify-center overflow-hidden">
                    {family.tilefImageUrl ? (
                      <img
                        src={getImageUrl(family.tilefImageUrl)}
                        alt="Tilef Design"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-bold text-primary">
                        {family.familyName[0]}
                      </span>
                    )}
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-xl text-primary mb-2">
                      {family.familyName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {family.memberIds.length} Member
                      {family.memberIds.length !== 1 ? "s" : ""}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Delivery:{" "}
                      {family.deliveryDate
                        ? format(
                            toZonedTime(new Date(family.deliveryDate), "UTC"),
                            "PPP"
                          )
                        : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="mt-auto pt-4 space-y-4">
                  {family.payment && (
                    <div className="bg-accent p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Total:</span>
                        <span className="font-bold text-primary">
                          ETB {(family.payment?.total || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <div className="text-center w-full">
                      <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                        <Eye className="w-4 h-4" />
                        Click to view details
                      </div>
                    </div>
                    <div
                      className="flex gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/edit-family/${family._id}`}>
                          <Edit className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() =>
                          handleDelete(family._id, family.familyName)
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal 1: Family Details */}
      <Dialog
        open={!!selectedFamily}
        onOpenChange={() => setSelectedFamily(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedFamily && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedFamily.familyName}</DialogTitle>
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
                      value={selectedFamily.phoneNumbers?.primary}
                    />
                    <DetailRow
                      label="Telegram"
                      value={selectedFamily.socials?.telegram}
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
                        selectedFamily.tilefImageUrl ? (
                          <img
                            src={getImageUrl(selectedFamily.tilefImageUrl)}
                            alt="Tilef"
                            className="h-20 w-20 object-cover rounded-md ml-auto cursor-pointer"
                            onClick={() =>
                              setFullScreenImageUrl(
                                getImageUrl(selectedFamily.tilefImageUrl!)
                              )
                            }
                          />
                        ) : (
                          "No Image"
                        )
                      }
                    />
                    {selectedFamily.colors &&
                      selectedFamily.colors.length > 0 &&
                      selectedFamily.colors[0] !== "" && (
                        <DetailRow
                          label="Color Codes"
                          value={
                            <span className="font-mono bg-muted px-2 py-1 rounded">
                              {selectedFamily.colors.join(", ")}
                            </span>
                          }
                        />
                      )}
                    <DetailRow
                      label="Delivery Date"
                      value={
                        selectedFamily.deliveryDate
                          ? format(new Date(selectedFamily.deliveryDate), "PPP")
                          : "N/A"
                      }
                    />
                  </CardContent>
                </Card>
                {selectedFamily.payment && (
                  <Card>
                    <CardHeader>
                      <DialogTitle className="text-lg">Payment</DialogTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailRow
                        label="Total"
                        value={
                          selectedFamily.payment?.total
                            ? `ETB ${selectedFamily.payment.total.toLocaleString()}`
                            : "N/A"
                        }
                      />
                      <DetailRow
                        label="First Half Status"
                        value={
                          selectedFamily.payment?.firstHalf.paid
                            ? "Paid"
                            : "Pending"
                        }
                      />
                      <DetailRow
                        label="First Half Amount"
                        value={
                          selectedFamily.payment?.firstHalf.amount
                            ? `ETB ${selectedFamily.payment.firstHalf.amount.toLocaleString()}`
                            : "N/A"
                        }
                      />
                      <DetailRow
                        label="Second Half Status"
                        value={
                          selectedFamily.payment?.secondHalf.paid
                            ? "Paid"
                            : "Pending"
                        }
                      />
                      <DetailRow
                        label="Second Half Amount"
                        value={
                          selectedFamily.payment?.secondHalf.amount
                            ? `ETB ${selectedFamily.payment.secondHalf.amount.toLocaleString()}`
                            : "N/A"
                        }
                      />
                    </CardContent>
                  </Card>
                  
                )}
 
                 {selectedFamily.notes && (
                  <Card>
                    <CardHeader>
                      <DialogTitle className="text-lg">Notes</DialogTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-foreground whitespace-pre-wrap">
                        {selectedFamily.notes}
                      </p>
                    </CardContent>
                  </Card>
                )}
                <Card>
                  <CardHeader>
                    <DialogTitle className="text-lg">
                      Members ({selectedFamily.memberIds.length})
                    </DialogTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {(selectedFamily.memberIds as Individual[]).map(
                      (member) => (
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
                      )
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal 2: Member Details */}
      <Dialog
        open={!!selectedMember}
        onOpenChange={() => setSelectedMember(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedMember &&
            (() => {
              const { clothDetails, payment } = selectedMember;
              return (
                <>
                  <DialogHeader>
                    <DialogTitle>
                      {selectedMember.firstName} {selectedMember.lastName} -
                      Member Details
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <Card>
                      <CardHeader>
                        <DialogTitle className="text-base">
                          Personal Info
                        </DialogTitle>
                      </CardHeader>
                      <CardContent>
                        <DetailRow label="Sex" value={selectedMember.sex} />
                        <DetailRow label="Age" value={selectedMember.age} />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <DialogTitle className="text-base">
                          Measurements
                        </DialogTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                          <DetailRow
                            label="Shirt Length"
                            value={clothDetails.shirtLength}
                          />
                          <DetailRow
                            label="Shoulder"
                            value={clothDetails.sholder}
                          />
                          <DetailRow label="Waist" value={clothDetails.wegeb} />
                          <DetailRow label="Wrist" value={clothDetails.rist} />
                         <DetailRow label="Sleeve" value={clothDetails.sleeve} /> {/* <-- HERE IT IS! */}

                          {selectedMember.sex === "Female" && (
                            <>
                              <DetailRow
                                label="Dress Length"
                                value={clothDetails.dressLength}
                              />
                              <DetailRow
                                label="Sleeve Length"
                                value={clothDetails.sliveLength}
                              />
                              <DetailRow
                                label="Breast"
                                value={clothDetails.breast}
                              />
                              <DetailRow
                                label="Over Breast"
                                value={clothDetails.overBreast}
                              />
                              <DetailRow
                                label="Under Breast"
                                value={clothDetails.underBreast}
                              />
                              <DetailRow
                                label="Sleeve Type"
                                value={clothDetails.femaleSliveType}
                              />
                              <DetailRow
                                label="Waist Type"
                                value={clothDetails.femaleWegebType}
                              />
                            </>
                          )}

                          {selectedMember.sex === "Male" && (
                            <>
                              <DetailRow
                                label="Chest"
                                value={clothDetails.deret}
                              />
                              <DetailRow
                                label="Neck"
                                value={clothDetails.anget}
                              />
                              <DetailRow
                                label="Cloth Type"
                                value={clothDetails.maleClothType}
                              />
                              <DetailRow
                                label="Sleeve Type"
                                value={clothDetails.maleSliveType}
                              />
                              <DetailRow
                                label="Netela"
                                value={clothDetails.netela}
                              />
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {payment && (
                      <Card>
                        <CardHeader>
                          <DialogTitle className="text-base">
                            Payment Details
                          </DialogTitle>
                        </CardHeader>
                        <CardContent>
                          <DetailRow
                            label="Total"
                            value={
                              payment.total
                                ? `ETB ${payment.total.toLocaleString()}`
                                : "N/A"
                            }
                          />
                          <DetailRow
                            label="First Half Status"
                            value={payment.firstHalf.paid ? "Paid" : "Pending"}
                          />
                          <DetailRow
                            label="First Half Amount"
                            value={
                              payment.firstHalf.amount
                                ? `ETB ${payment.firstHalf.amount.toLocaleString()}`
                                : "N/A"
                            }
                          />
                          <DetailRow
                            label="Second Half Status"
                            value={payment.secondHalf.paid ? "Paid" : "Pending"}
                          />
                          <DetailRow
                            label="Second Half Amount"
                            value={
                              payment.secondHalf.amount
                                ? `ETB ${payment.secondHalf.amount.toLocaleString()}`
                                : "N/A"
                            }
                          />
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </>
              );
            })()}
        </DialogContent>
      </Dialog>

      {/* Full Screen Image Viewer */}
      {fullScreenImageUrl && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[999] cursor-pointer"
          onClick={() => setFullScreenImageUrl(null)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20 hover:text-white"
          >
            <X className="w-6 h-6" />
          </Button>
          <img
            src={fullScreenImageUrl}
            alt="Full screen tilef pattern"
            className="max-w-[90vw] max-h-[90vh] object-contain"
          />
        </div>
      )}
    </div>
  );
};

export default FamilyOrders;
