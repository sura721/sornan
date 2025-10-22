import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";  

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Upload, X, Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useData, Family, Individual } from "@/contexts/DataContext";
import { toast } from "@/hooks/use-toast";
import { cn, getImageUrl } from "@/lib/utils";
const initialMemberFormState = {
  firstName: "",
  lastName: "",
  sex: "",
  age: "",
  shirtLength: "",
  sholder: "",
  wegeb: "",
  rist: "",
  sleeve:" ",
  dressLength: "",
  sliveLength: "",
  breast: "",
  overBreast: "",
  underBreast: "",
  femaleSliveType: "",
  femaleWegebType: "",
  deret: "",
  anget: "",
  maleClothType: "",
  maleSliveType: "",
  netela: "",
  paymentTotal: "",
  paymentFirstHalfPaid: false,
  paymentFirstHalfAmount: "",
  paymentSecondHalfPaid: false,
  paymentSecondHalfAmount: "",
};
type MemberData = Omit<
  Individual,
  "id" | "_id"  | "deliveryDate" | "phoneNumbers" | "socials"
>;

const EditFamily = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getFamily, updateFamily } = useData();

  const [familyData, setFamilyData] = useState<Family | null>(null);
  const [activeMemberForm, setActiveMemberForm] = useState<string | null>(null); // "new" or member's ID
  const [memberFormData, setMemberFormData] = useState(initialMemberFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
 const [newTilefFiles, setNewTilefFiles] = useState<(File | null)[]>(Array(4).fill(null));
  const [imagePreviews, setImagePreviews] = useState<(string | null)[]>(Array(4).fill(null));

  useEffect(() => {
    if (id) {
      const currentFamily = getFamily(id);
      if (currentFamily) {
        setFamilyData(currentFamily);
 if (currentFamily.tilefImageUrls) {
  const previews = Array(4).fill(null);
  currentFamily.tilefImageUrls.forEach((url, index) => {
    if (index < 4) {
      previews[index] = url;
    }
  });
  setImagePreviews(previews);
}
        if (!currentFamily.paymentMethod) {
        currentFamily.paymentMethod = 'family'; // Set a sensible default
      }
      } else {
        toast({
          title: "Error",
          description: "Family order not found.",
          variant: "destructive",
        });
        navigate("/orders");
      }
    }
  }, [id,navigate,getFamily]);
// THIS IS THE CORRECTED CODE
const handleFamilyChange = (
  field: string,
  value: string | number | boolean | string[]
) => {
  setFamilyData((prev) => {
    if (!prev) return null;

    // Create a deep copy to avoid direct state mutation
    const newData = JSON.parse(JSON.stringify(prev));
    const keys = field.split(".");
    let current = newData;

    // This loop now safely creates nested objects if they don't exist
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      // If the next key doesn't exist, create an empty object for it
      if (!current[key]) {
        current[key] = {};
      }
      // Move to the next level
      current = current[key];
    }

    // Now it's safe to set the final value
    current[keys[keys.length - 1]] = value;
    return newData;
  });
};

  const handleOpenMemberForm = (memberId: string | "new" = "new") => {
    setActiveMemberForm(memberId);
    if (memberId !== "new" && familyData) {
      const member = familyData.memberIds.find(
        (m) => (m as Individual)._id === memberId
      ) as Individual;
      if (member) {
    setMemberFormData({
          firstName: member.firstName || "",
          lastName: member.lastName || "",
          sex: member.sex || "",
          age: member.age?.toString() || "",
          shirtLength: member.clothDetails.shirtLength?.toString() || "",
          sholder: member.clothDetails.sholder?.toString() || "",
          wegeb: member.clothDetails.wegeb?.toString() || "",
          rist: member.clothDetails.rist?.toString() || "",
          dressLength: member.clothDetails.dressLength?.toString() || "",
          sliveLength: member.clothDetails.sliveLength?.toString() || "",
          breast: member.clothDetails.breast?.toString() || "",
          overBreast: member.clothDetails.overBreast?.toString() || "",
          underBreast: member.clothDetails.underBreast?.toString() || "",
          femaleSliveType: member.clothDetails.femaleSliveType || "",
          femaleWegebType: member.clothDetails.femaleWegebType || "",
          deret: member.clothDetails.deret?.toString() || "",
          anget: member.clothDetails.anget?.toString() || "",
          maleClothType: member.clothDetails.maleClothType || "",
          maleSliveType: member.clothDetails.maleSliveType || "",
          netela: member.clothDetails.netela || "",
          paymentTotal: member.payment?.total?.toString() || "",
          paymentFirstHalfPaid: member.payment?.firstHalf.paid || false,
          paymentFirstHalfAmount:
            member.payment?.firstHalf.amount?.toString() || "",
                    sleeve: member.clothDetails.sleeve?.toString() || "", 
          paymentSecondHalfPaid: member.payment?.secondHalf.paid || false,
          paymentSecondHalfAmount:
            member.payment?.secondHalf.amount?.toString() || "",
        });

        
      }
    } else {
      setMemberFormData(initialMemberFormState);
    }
  };

  const handleSaveMember = () => {
    if (!memberFormData.firstName || !memberFormData.lastName || !memberFormData.sex) { 
      toast({ title: "Error", description: "First Name, Last Name, and Sex are required.", variant: "destructive" }); 
      return; 
    }
    
    const parsedAge = parseInt(memberFormData.age);
    const memberDetails: MemberData = {
        firstName: memberFormData.firstName, 
        lastName: memberFormData.lastName, 
        sex: memberFormData.sex as 'Male' | 'Female', 
        // Only send age if it's a valid non-negative number
        age: Number.isFinite(parsedAge) && parsedAge >= 0 ? parsedAge : undefined,
        
        clothDetails: {
            colors: [], 
            // --- FIX START: Changed all measurement fields back to strings ---
            // We use `|| undefined` to ensure empty strings are not saved.
            shirtLength: memberFormData.shirtLength || undefined,
            sholder: memberFormData.sholder || undefined,
            wegeb: memberFormData.wegeb || undefined,
            rist: memberFormData.rist || undefined,
                sleeve: memberFormData.sleeve || undefined, 
            dressLength: memberFormData.dressLength || undefined,
            sliveLength: memberFormData.sliveLength || undefined,
            breast: memberFormData.breast || undefined,
            overBreast: memberFormData.overBreast || undefined,
            underBreast: memberFormData.underBreast || undefined,
            
            deret: memberFormData.deret || undefined,
            anget: memberFormData.anget || undefined,
            // --- FIX END ---
            
            // These dropdown/select fields are already strings, which is correct.
            femaleSliveType: memberFormData.femaleSliveType || undefined,
            femaleWegebType: memberFormData.femaleWegebType || undefined,
            maleClothType: memberFormData.maleClothType || undefined,
            maleSliveType: memberFormData.maleSliveType || undefined,
            // Omit netela when empty
            netela: (memberFormData.netela || undefined) as 'Yes' | 'No' | undefined,
        },
    };

    // The rest of your logic for updating state remains the same.
  
 if (familyData?.paymentMethod === "member") {
      memberDetails.payment = {
        total: parseFloat(memberFormData.paymentTotal) || undefined,
        firstHalf: {
          paid: memberFormData.paymentFirstHalfPaid,
          amount: parseFloat(memberFormData.paymentFirstHalfAmount) || undefined,
        },
        secondHalf: {
          paid: memberFormData.paymentSecondHalfPaid,
          amount:
            parseFloat(memberFormData.paymentSecondHalfAmount) || undefined,
        },
      };
    }

    if (activeMemberForm === "new") {
      const newMember = {
        ...memberDetails,
        _id: `mock_mem_${Date.now()}`,
      } as Individual;
      setFamilyData(
        (prev) =>
          prev ? { ...prev, memberIds: [...prev.memberIds, newMember] } : null
      );
    } else {
      setFamilyData((prev) => {
        if (!prev) return null;
        const updatedMembers = prev.memberIds.map((mem) =>
          (mem as Individual)._id === activeMemberForm
            ? { ...(mem as Individual), ...memberDetails }
            : mem
        );
        return { ...prev, memberIds: updatedMembers };
      });
    }
    setActiveMemberForm(null);
  };
  const handleDeleteMember = (memberIdToDelete: string) => {
    if (
      window.confirm(
        "Are you sure you want to remove this member from the family?"
      )
    ) {
      setFamilyData((currentFamilyData) => {
        // Ensure we have family data to work with
        if (!currentFamilyData) {
          return null;
        }

        // Create a new array of members that does NOT include the one with the matching ID
        const updatedMemberIds = currentFamilyData.memberIds.filter(
          (member) => {
            // Ensure we are always dealing with the full Individual object to get its _id
            const individualMember = member as Individual;
            return individualMember._id !== memberIdToDelete;
          }
        );

        // Return a new state object with the updated members list
        return {
          ...currentFamilyData,
          memberIds: updatedMemberIds,
        };
      });

      toast({
        title: "Member Removed",
        description:
          "The member has been removed from the list. Click 'Update Family Group' to save this change permanently.",
      });
    }
  };
  // In EditFamily.tsx

const handleFamilySubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!familyData) return;

  setIsSubmitting(true);
  const updatedFamilyData = new FormData();

  // 1. Append all the Family fields in the nested format
  updatedFamilyData.append('familyName', familyData.familyName);
  updatedFamilyData.append('deliveryDate', familyData.deliveryDate);
  updatedFamilyData.append('paymentMethod', familyData.paymentMethod);
  if (familyData.notes) {
    updatedFamilyData.append('notes', familyData.notes);
  }

  // Nested objects
  updatedFamilyData.append('phoneNumbers[primary]', familyData.phoneNumbers?.primary || '');
  updatedFamilyData.append('phoneNumbers[secondary]', familyData.phoneNumbers?.secondary || '');
  updatedFamilyData.append('socials[telegram]', familyData.socials?.telegram || '');
  
  // Arrays are sent as comma-separated strings
  updatedFamilyData.append('colors', (familyData.colors || []).join(','));

  // Nested payment object
  if (familyData.payment) {
    updatedFamilyData.append('payment[total]', familyData.payment.total?.toString() || '');
    updatedFamilyData.append('payment[firstHalf][paid]', String(familyData.payment.firstHalf.paid));
    updatedFamilyData.append('payment[firstHalf][amount]', familyData.payment.firstHalf.amount?.toString() || '');
    updatedFamilyData.append('payment[secondHalf][paid]', String(familyData.payment.secondHalf.paid));
    updatedFamilyData.append('payment[secondHalf][amount]', familyData.payment.secondHalf.amount?.toString() || '');
  }

  // CRITICAL: Append members as a JSON string.
  // This is the one place where a stringified array is necessary for complex objects.
  updatedFamilyData.append('memberIds', JSON.stringify(familyData.memberIds));

  // 2. Handle the images exactly like in updateIndividual
  const existingUrlsToKeep = imagePreviews.filter(url => url && !url.startsWith('blob:'));
  updatedFamilyData.append('existingImageUrls', JSON.stringify(existingUrlsToKeep));

  newTilefFiles.forEach(file => {
    if (file) {
      updatedFamilyData.append('tilefImages', file);
    }
  });

  // 3. Call the API
  try {
    // You'll need a new updateFamily function in your DataContext
    await updateFamily(familyData._id, updatedFamilyData);

    toast({
      title: "Success",
      description: "Family group updated successfully",
    });
    navigate("/orders");
  } catch (error) {
    toast({
      title: "Update Failed",
      description: "Could not save changes to the family.",
      variant: "destructive",
    });
  } finally {
    setIsSubmitting(false);
  }
};
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
  const file = e.target.files?.[0];
  if (file) {
    // Update the state for NEW files
    const updatedNewFiles = [...newTilefFiles];
    updatedNewFiles[index] = file;
    setNewTilefFiles(updatedNewFiles);

    // Update the UI preview state
    const updatedPreviews = [...imagePreviews];
    updatedPreviews[index] = URL.createObjectURL(file);
    setImagePreviews(updatedPreviews);
  }
};

const handleRemoveImage = (index: number) => {
  // The URL of the image being removed (could be an existing URL or a temporary blob URL)
  const urlToRemove = imagePreviews[index];

  // Clear the preview for this slot
  const updatedPreviews = [...imagePreviews];
  updatedPreviews[index] = null;
  setImagePreviews(updatedPreviews);
  
  // Clear any NEW file that was in that slot
  const updatedNewFiles = [...newTilefFiles];
  updatedNewFiles[index] = null;
  setNewTilefFiles(updatedNewFiles);

  // CRITICAL: If the removed image was an EXISTING one, remove its URL from the main familyData state.
  // This tells the backend to delete the file from the server.
  if (urlToRemove && familyData?.tilefImageUrls?.includes(urlToRemove)) {
    handleFamilyChange(
      "tilefImageUrls",
      familyData.tilefImageUrls.filter(url => url !== urlToRemove)
    );
  }
};
  if (!familyData)
    return <div className="text-center p-10">Loading family details...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-primary mb-2">
          Edit Family Group
        </h1>
        <p className="text-muted-foreground">
          Update the details for this family order
        </p>
      </div>
      <form onSubmit={handleFamilySubmit} className="space-y-8">
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="text-primary font-serif">
              Family Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            <div className="space-y-2 md:col-span-2">
              <Label>Family Name *</Label>
              <Input
                value={familyData.familyName}
                onChange={(e) =>
                  handleFamilyChange("familyName", e.target.value)
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Primary Phone *</Label>
              <Input
                type="tel"
                value={familyData.phoneNumbers?.primary || ""}
                onChange={(e) =>
                  handleFamilyChange("phoneNumbers.primary", e.target.value)
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Secondary Phone</Label>
              <Input
                type="tel"
                value={familyData.phoneNumbers?.secondary || ""}
                onChange={(e) =>
                  handleFamilyChange("phoneNumbers.secondary", e.target.value)
                }
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Telegram</Label>
              <Input
                value={familyData.socials?.telegram || ""}
                onChange={(e) =>
                  handleFamilyChange("socials.telegram", e.target.value)
                }
              />
            </div>
          <div className="space-y-2 md:col-span-2">
  <Label>Upload 'ጥልፍ' Images (up to 4)</Label>
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {imagePreviews.map((previewUrl, index) => (
      <div
        key={index}
        className="border-2 border-dashed border-border rounded-lg p-4 text-center aspect-square flex items-center justify-center relative"
      >
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleImageSelect(e, index)}
          className="hidden"
          id={`tilef-upload-${index}`}
        />
        <label
          htmlFor={`tilef-upload-${index}`}
          className="cursor-pointer w-full h-full flex flex-col justify-center items-center"
        >
          {previewUrl ? (
            <>
              <img
                src={getImageUrl(previewUrl)} // getImageUrl handles blob URLs and server paths
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={(e) => {
                  e.preventDefault();
                  handleRemoveImage(index);
                }}
                className="absolute top-1 right-1 h-6 w-6"
              >
                <X size={16} />
              </Button>
            </>
          ) : (
            <div className="space-y-2">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground text-xs">
                Image {index + 1}
              </p>
            </div>
          )}
        </label>
      </div>
    ))}
  </div>
</div>
            <div className="space-y-2 md:col-span-2">
              <Label>Colors</Label>
              <Input
                placeholder="e.g., 15, 66, 76"
                value={(familyData.colors || []).join(", ")}
                onChange={(e) =>
                  handleFamilyChange(
                    "colors",
                    e.target.value.split(",").map((c) => c.trim())
                  )
                }
              />
            </div>
          </CardContent>
        </Card>
         <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="text-primary font-serif">
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Add any additional notes for this family order..."
              value={familyData.notes || ""}
              onChange={(e) => handleFamilyChange("notes", e.target.value)}
              rows={4}
            />
          </CardContent>
        </Card>
        <Card className="shadow-card border-0">
  <CardHeader>
    <CardTitle className="text-primary font-serif">
      Payment & Delivery
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-6 pt-6">
    

    {/* Only show this entire section if payment method is 'family' */}
    {familyData.paymentMethod === 'family' && (
      <div className="space-y-6 border-t pt-6">
        <div className="space-y-2">
            <Label>Total Amount</Label>
            <Input
              type="number"
              placeholder="Total Amount"
              value={familyData.payment?.total || ""}
              onChange={(e) =>
                handleFamilyChange("payment.total", parseFloat(e.target.value) || 0)
              }
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="firstHalf"
                  checked={familyData.payment?.firstHalf?.paid}
                  onCheckedChange={(c) => handleFamilyChange("payment.firstHalf.paid", !!c)}
                />
                <Label>First Half Payment</Label>
              </div>
              <Input
                type="number"
                placeholder="Amount"
                value={familyData.payment?.firstHalf?.amount || ""}
                onChange={(e) =>
                  handleFamilyChange("payment.firstHalf.amount", parseFloat(e.target.value) || 0)
                }
              />
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="secondHalf"
                  checked={familyData.payment?.secondHalf?.paid}
                  onCheckedChange={(c) => handleFamilyChange("payment.secondHalf.paid", !!c)}
                />
                <Label>Second Half Payment</Label>
              </div>
              <Input
                type="number"
                placeholder="Amount"
                value={familyData.payment?.secondHalf?.amount || ""}
                onChange={(e) =>
                  handleFamilyChange("payment.secondHalf.amount", parseFloat(e.target.value) || 0)
                }
              />
            </div>
          </div>
      </div>
    )}
    
    <div className="border-t pt-6">
      <Label>Delivery Date *</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button" // Important for preventing form submission
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !familyData.deliveryDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {familyData.deliveryDate ? (
              format(new Date(familyData.deliveryDate), "PPP")
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={
              familyData.deliveryDate
                ? new Date(familyData.deliveryDate)
                : undefined
            }
            onSelect={(date) =>
              date &&
              handleFamilyChange(
                "deliveryDate",
                date.toISOString().split("T")[0]
              )
            }
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  </CardContent>
</Card>
        {/* =================== START: REPLACE WITH THIS BLOCK =================== */}
<Card className="shadow-card border-0">
  <CardHeader>
    <CardTitle className="text-primary font-serif">
      Family Members
    </CardTitle>
  </CardHeader>
  <CardContent className="pt-6 space-y-4">
    {/* This is the list of existing members */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {(familyData.memberIds as Individual[]).map((member) => (
        <Card
          key={member._id}
          className="p-4 flex justify-between items-center"
        >
          <div>
            <p className="font-medium">
              {member.firstName} {member.lastName}
            </p>
            <p className="text-sm text-muted-foreground">
              {member.sex}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleOpenMemberForm(member._id)}
            >
              Edit
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleDeleteMember(member._id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>

    {/* This is the button to add a new member */}
    <Button
      type="button"
      className="w-full"
      onClick={() => handleOpenMemberForm("new")}
    >
      + Add New Member
    </Button>

    {/* This is the popup form for adding/editing a member */}
    {activeMemberForm && (
      <div className="p-6 bg-accent border-primary rounded-lg mt-4">
        <h3 className="text-xl font-serif text-primary mb-4">
          {activeMemberForm === "new"
            ? "Adding New Member"
            : `Editing Member`}
        </h3>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Personal Details
              </CardTitle>
            </CardHeader>
           <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>First Name *</Label>
                        <Input
                          value={memberFormData.firstName}
                          onChange={(e) =>
                            setMemberFormData({
                              ...memberFormData,
                              firstName: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Last Name *</Label>
                        <Input
                          value={memberFormData.lastName}
                          onChange={(e) =>
                            setMemberFormData({
                              ...memberFormData,
                              lastName: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Sex *</Label>
                        <Select
                          value={memberFormData.sex}
                          onValueChange={(v) =>
                            setMemberFormData({ ...memberFormData, sex: v })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select sex" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Age</Label>
                        <Input
                          type="number"
                          value={memberFormData.age}
                          onChange={(e) =>
                            setMemberFormData({
                              ...memberFormData,
                              age: e.target.value,
                            })
                          }
                        />
                      </div>
                    </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Cloth & Design Details
              </CardTitle>
            </CardHeader>
              <CardContent className="pt-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Shirt length</Label>
                          <Input
                            type="text"
                            value={memberFormData.shirtLength}
                            onChange={(e) =>
                              setMemberFormData({
                                ...memberFormData,
                                shirtLength: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Sholder</Label>
                          <Input
                            type="text"
                            value={memberFormData.sholder}
                            onChange={(e) =>
                              setMemberFormData({
                                ...memberFormData,
                                sholder: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Waist</Label>
                          <Input
                            type="text"
                            value={memberFormData.wegeb}
                            onChange={(e) =>
                              setMemberFormData({
                                ...memberFormData,
                                wegeb: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Wrist</Label>
                          <Input
                            type="text"
                            value={memberFormData.rist}
                            onChange={(e) =>
                              setMemberFormData({
                                ...memberFormData,
                                rist: e.target.value,
                              })
                            }
                          />
                        </div>
                         <div className="space-y-2">
            <Label>Sleeve</Label>
            <Input
              type="text"
              value={memberFormData.sleeve}
              onChange={(e) =>
                setMemberFormData({
                  ...memberFormData,
                  sleeve: e.target.value,
                })
              }
            />
          </div>
                        {memberFormData.sex === "Female" && (
                          <>
                            <div className="space-y-2">
                              <Label>Dress length</Label>
                              <Input
                                type="text"
                                value={memberFormData.dressLength}
                                onChange={(e) =>
                                  setMemberFormData({
                                    ...memberFormData,
                                    dressLength: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Sleeve length</Label>
                              <Input
                                type="text"
                                value={memberFormData.sliveLength}
                                onChange={(e) =>
                                  setMemberFormData({
                                    ...memberFormData,
                                    sliveLength: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Breast</Label>
                              <Input
                                type="text"
                                value={memberFormData.breast}
                                onChange={(e) =>
                                  setMemberFormData({
                                    ...memberFormData,
                                    breast: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Over Breast</Label>
                              <Input
                                type="text"
                                value={memberFormData.overBreast}
                                onChange={(e) =>
                                  setMemberFormData({
                                    ...memberFormData,
                                    overBreast: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Under Breast</Label>
                              <Input
                                type="text"
                                value={memberFormData.underBreast}
                                onChange={(e) =>
                                  setMemberFormData({
                                    ...memberFormData,
                                    underBreast: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Sleeve type</Label>
                              <Select
                                value={memberFormData.femaleSliveType}
                                onValueChange={(v) =>
                                  setMemberFormData({
                                    ...memberFormData,
                                    femaleSliveType: v,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Thin"> Thin</SelectItem>
                                  <SelectItem value="Short"> Short</SelectItem>
                                  <SelectItem value="Middle">
                                     Middle
                                  </SelectItem>
                                  <SelectItem value="Long"> Long</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Waist type</Label>
                              <Select
                                value={memberFormData.femaleWegebType}
                                onValueChange={(v) =>
                                  setMemberFormData({
                                    ...memberFormData,
                                    femaleWegebType: v,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Zrgf"> Zrgf</SelectItem>
                                  <SelectItem value="Fitted">
                                     Fitted
                                  </SelectItem>
                                  <SelectItem value="Kbeto"> Kbeto</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        )}
                        {memberFormData.sex === "Male" && (
                          <>
                            <div className="space-y-2">
                              <Label>Chest</Label>
                              <Input
                                type="text"
                                value={memberFormData.deret}
                                onChange={(e) =>
                                  setMemberFormData({
                                    ...memberFormData,
                                    deret: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Neck</Label>
                              <Input
                                type="text"
                                value={memberFormData.anget}
                                onChange={(e) =>
                                  setMemberFormData({
                                    ...memberFormData,
                                    anget: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Type cloth</Label>
                              <Select
                                value={memberFormData.maleClothType}
                                onValueChange={(v) =>
                                  setMemberFormData({
                                    ...memberFormData,
                                    maleClothType: v,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Shirt"> Shirt</SelectItem>
                                  <SelectItem value="Semiz">Shemiz</SelectItem>
                                  <SelectItem value="T shirt and jacket">
                                     T shirt and jacket
                                  </SelectItem>
                                  <SelectItem value="Shirt only with key">
                                    Shirt only with key
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Type of Sleeve </Label>
                              <Select
                                value={memberFormData.maleSliveType}
                                onValueChange={(v) =>
                                  setMemberFormData({
                                    ...memberFormData,
                                    maleSliveType: v,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Short"> Short</SelectItem>
                                  <SelectItem value="Long">Long</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Netela</Label>
                              <Select
                                value={memberFormData.netela}
                                onValueChange={(v) =>
                                  setMemberFormData({
                                    ...memberFormData,
                                    netela: v,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select option" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Yes"> Yes</SelectItem>
                                  <SelectItem value="No"> No</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
          </Card>

          {/* --- This is the conditional payment card for the member --- */}
          {familyData.paymentMethod === 'member' && (
            <Card>
               <CardHeader><CardTitle className="text-lg">Member Payment</CardTitle></CardHeader>
               <CardContent className="pt-4 space-y-4">
                <div className="space-y-2">
                  <Label>Total Amount for this Member</Label>
                  <Input
                    type="number"
                    value={memberFormData.paymentTotal}
                    onChange={(e) => setMemberFormData({...memberFormData, paymentTotal: e.target.value})}
                  />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 mb-2">
                          <Checkbox
                            id="memberFirstHalfPaid"
                            checked={memberFormData.paymentFirstHalfPaid}
                            onCheckedChange={(c) => setMemberFormData({...memberFormData, paymentFirstHalfPaid: !!c})}
                          />
                          <Label htmlFor="memberFirstHalfPaid">First Half Paid</Label>
                      </div>
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={memberFormData.paymentFirstHalfAmount}
                        onChange={(e) => setMemberFormData({...memberFormData, paymentFirstHalfAmount: e.target.value})}
                      />
                    </div>
                     <div className="space-y-2">
                      <div className="flex items-center space-x-2 mb-2">
                          <Checkbox
                            id="memberSecondHalfPaid"
                            checked={memberFormData.paymentSecondHalfPaid}
                            onCheckedChange={(c) => setMemberFormData({...memberFormData, paymentSecondHalfPaid: !!c})}
                          />
                          <Label htmlFor="memberSecondHalfPaid">Second Half Paid</Label>
                      </div>
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={memberFormData.paymentSecondHalfAmount}
                        onChange={(e) => setMemberFormData({...memberFormData, paymentSecondHalfAmount: e.target.value})}
                      />
                    </div>
                 </div>
               </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveMemberForm(null)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveMember}>
              Save Member
            </Button>
          </div>
        </div>
      </div>
    )}
  </CardContent>
</Card>
 
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting} // <-- Disables the button when submitting
            className="bg-gradient-primary text-secondary-foreground shadow-elegant hover:shadow-xl transition-all px-8 py-3"
          >
            {isSubmitting && ( // <-- Only show spinner when submitting
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isSubmitting ? "Updating..." : "Update Family Group"}{" "}
            {/* <-- Change text */}
          </Button>
        </div>{" "}
      </form>
    </div>
  );
};

export default EditFamily;
