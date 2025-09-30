import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Upload, ArrowUpRight,Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useData } from "@/contexts/DataContext";
import { Family, Individual } from "@/contexts/DataContext";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const initialMemberFormState = { firstName: "", lastName: "", sex: "", age: "", shirtLength: "", sholder: "", wegeb: "", rist: "", dressLength: "", sliveLength: "", breast: "", overBreast: "", underBreast: "", femaleSliveType: "", femaleWegebType: "", deret: "", anget: "", maleClothType: "", maleSliveType: "", netela: "" };

type MemberData = Omit<Individual, 'id' | '_id' | 'payment' | 'deliveryDate' | 'phoneNumbers' | 'socials'>;
type FamilyPayload = Omit<Family, 'id' | '_id' | 'memberIds'> & { memberIds: MemberData[] };


const AddFamily = () => {
  const navigate = useNavigate();
  const { addFamily } = useData();
 const [isSubmitting, setIsSubmitting] = useState(false);
  const [familyName, setFamilyName] = useState("");
  const [primaryPhone, setPrimaryPhone] = useState("");
  const [secondaryPhone, setSecondaryPhone] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");
  const [tilefFile, setTilefFile] = useState<File | null>(null);
  const [colorCodes, setColorCodes] = useState(""); // EDITED: State for color text input
  const [paymentTotal, setPaymentTotal] = useState("");
  const [firstHalfPaid, setFirstHalfPaid] = useState(false);
  const [firstHalfAmount, setFirstHalfAmount] = useState("");
  const [secondHalfPaid, setSecondHalfPaid] = useState(false);
  const [secondHalfAmount, setSecondHalfAmount] = useState("");
  const [deliveryDate, setDeliveryDate] = useState<Date>();
  const [numberOfMembers, setNumberOfMembers] = useState<number>(0);
  const [members, setMembers] = useState<MemberData[]>([]);
  const [activeMemberForm, setActiveMemberForm] = useState<number | null>(null);
  const [memberFormData, setMemberFormData] = useState(initialMemberFormState);

  const getCleanUsername = (urlOrUsername: string) => {
    const withoutDomain = urlOrUsername.replace(/^(https?:\/\/)?(www\.)?(t\.me\/)?/, '');
    return withoutDomain.startsWith('@') ? withoutDomain.substring(1) : withoutDomain;
  };

  const handleSaveMember = () => {
    if (!memberFormData.firstName || !memberFormData.lastName || !memberFormData.sex) {
      toast({ title: "Error", description: "First Name, Last Name, and Sex are required for each member.", variant: "destructive" });
      return;
    }
    const newMember: MemberData = {
      firstName: memberFormData.firstName,
      lastName: memberFormData.lastName,
      sex: memberFormData.sex as 'Male' | 'Female',
      age: parseInt(memberFormData.age) || undefined,
      clothDetails: {
        colors: [], // Colors are handled at the family level
        shirtLength: parseFloat(memberFormData.shirtLength) || undefined,
        sholder: parseFloat(memberFormData.sholder) || undefined,
        wegeb: parseFloat(memberFormData.wegeb) || undefined,
        rist: parseFloat(memberFormData.rist) || undefined,
        dressLength: memberFormData.sex === 'Female' ? parseFloat(memberFormData.dressLength) || undefined : undefined,
        sliveLength: memberFormData.sex === 'Female' ? parseFloat(memberFormData.sliveLength) || undefined : undefined,
        breast: memberFormData.sex === 'Female' ? parseFloat(memberFormData.breast) || undefined : undefined,
        overBreast: memberFormData.sex === 'Female' ? parseFloat(memberFormData.overBreast) || undefined : undefined,
        underBreast: memberFormData.sex === 'Female' ? parseFloat(memberFormData.underBreast) || undefined : undefined,
        femaleSliveType: memberFormData.sex === 'Female' ? memberFormData.femaleSliveType : undefined,
        femaleWegebType: memberFormData.sex === 'Female' ? memberFormData.femaleWegebType : undefined,
        deret: memberFormData.sex === 'Male' ? parseFloat(memberFormData.deret) || undefined : undefined,
        anget: memberFormData.sex === 'Male' ? parseFloat(memberFormData.anget) || undefined : undefined,
        maleClothType: memberFormData.sex === 'Male' ? memberFormData.maleClothType : undefined,
        maleSliveType: memberFormData.sex === 'Male' ? memberFormData.maleSliveType : undefined,
        netela: memberFormData.sex === 'Male' ? memberFormData.netela as 'Yes' | 'No' | undefined : undefined,
      },
    };
    setMembers(prev => [...prev, newMember]);
    setMemberFormData(initialMemberFormState);
    setActiveMemberForm(null);
  };
  
// In addfamily.tsx

// In AddFamily.tsx

const handleFamilySubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!familyName || !primaryPhone || !deliveryDate) {
    toast({ title: "Error", description: "Family Name, Primary Phone, and Delivery Date are required.", variant: "destructive" });
    return;
  }
  if (members.length !== numberOfMembers || numberOfMembers === 0) {
    toast({ title: "Error", description: `Please add details for all ${numberOfMembers} family members.`, variant: "destructive" });
    return;
  }

   setIsSubmitting(true);
  const formData = new FormData();

   formData.append('familyName', familyName);
  formData.append('phoneNumbers', JSON.stringify({ primary: primaryPhone, secondary: secondaryPhone }));
  formData.append('socials', JSON.stringify({ telegram: telegramUsername }));
  formData.append('colors', JSON.stringify(colorCodes.split(',').map(c => c.trim()).filter(Boolean)));
  formData.append('payment', JSON.stringify({
    total: parseFloat(paymentTotal) || undefined,
    firstHalf: { paid: firstHalfPaid, amount: parseFloat(firstHalfAmount) || undefined },
    secondHalf: { paid: secondHalfPaid, amount: parseFloat(secondHalfAmount) || undefined },
  }));
  formData.append('deliveryDate', deliveryDate.toISOString().split('T')[0]);
  formData.append('memberIds', JSON.stringify(members)); // This sends the members array

  // 2. Append the file if it exists. The key 'tilefImage' must match the key your backend route expects.
  if (tilefFile) {
    formData.append('tilefImage', tilefFile);
  }




try {
    await addFamily(formData);
    toast({ title: "Success", description: "Family group created successfully" });
    navigate("/orders");
  } catch (error) {
    // This part is important in case the submission fails
    toast({ title: "Error", description: "Failed to create family group.", variant: "destructive" });
  } finally {
    setIsSubmitting(false);  
  }

};
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-primary mb-2">Create Family Group</h1>
        <p className="text-muted-foreground">Create and add new members to a family group</p>
      </div>

      <form onSubmit={handleFamilySubmit} className="space-y-8">
        <Card className="shadow-card border-0">
          <CardHeader><CardTitle className="text-primary font-serif">Family Information</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2"><Label htmlFor="familyName">Family Name *</Label><Input id="familyName" value={familyName} onChange={(e) => setFamilyName(e.target.value)} placeholder="e.g., The Abebe Family" required /></div>
            <div className="space-y-2"><Label htmlFor="primaryPhone">Primary Phone Number *</Label><Input id="primaryPhone" type="tel" value={primaryPhone} onChange={(e) => setPrimaryPhone(e.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="secondaryPhone">Secondary Phone Number</Label><Input id="secondaryPhone" type="tel" value={secondaryPhone} onChange={(e) => setSecondaryPhone(e.target.value)} /></div>
            <div className="space-y-2 md:col-span-2"><Label htmlFor="telegram">Telegram Username</Label><div className="flex items-center gap-2"><Input id="telegram" placeholder="@Keafa_design" value={telegramUsername} onChange={(e) => setTelegramUsername(e.target.value)} />{telegramUsername && (<a href={`https://t.me/${getCleanUsername(telegramUsername)}`} target="_blank" rel="noopener noreferrer"><Button type="button" size="icon" className="bg-green-600 hover:bg-green-700 flex-shrink-0"><ArrowUpRight className="w-4 h-4" /></Button></a>)}</div></div>
            
            {/* EDITED: Color buttons are replaced with text input and moved */}
            <div className="space-y-2 md:col-span-2"><Label>Upload 'Tilef' Image</Label><div className="border-2 border-dashed border-border rounded-lg p-6 text-center"><input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) setTilefFile(file); }} className="hidden" id="tilef-upload" /><label htmlFor="tilef-upload" className="cursor-pointer">{tilefFile ? (<div className="space-y-2"><img src={URL.createObjectURL(tilefFile)} alt="Tilef Preview" className="w-24 h-24 object-cover rounded-lg mx-auto" /><p className="text-sm text-muted-foreground">{tilefFile.name}</p></div>) : (<div className="space-y-2"><Upload className="w-8 h-8 text-muted-foreground mx-auto" /><p className="text-muted-foreground">Click to upload Tilef pattern</p></div>)}</label></div></div>
            <div className="space-y-2 md:col-span-2"><Label htmlFor="color-codes">Colors</Label><Input id="color-codes" placeholder="Enter color codes, separated by commas (e.g. 15, 66, 76)" value={colorCodes} onChange={(e) => setColorCodes(e.target.value)} /></div>

          </CardContent>
        </Card>
        
        <Card className="shadow-card border-0"><CardHeader><CardTitle className="text-primary font-serif">Payment Details</CardTitle></CardHeader><CardContent className="space-y-6"><div className="space-y-2"><Label htmlFor="totalAmount">Total</Label><Input id="totalAmount" type="number" placeholder="Total Amount" value={paymentTotal} onChange={(e) => setPaymentTotal(e.target.value)} /></div><div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-border pt-6"><div className="space-y-4"><div className="flex items-center space-x-2"><Checkbox id="firstHalf" checked={firstHalfPaid} onCheckedChange={(c) => setFirstHalfPaid(!!c)} /><Label htmlFor="firstHalf">First Half Payment</Label></div><Input type="number" placeholder="Amount" value={firstHalfAmount} onChange={(e) => setFirstHalfAmount(e.target.value)} /></div><div className="space-y-4"><div className="flex items-center space-x-2"><Checkbox id="secondHalf" checked={secondHalfPaid} onCheckedChange={(c) => setSecondHalfPaid(!!c)} /><Label htmlFor="secondHalf">Second Half Payment</Label></div><Input type="number" placeholder="Amount" value={secondHalfAmount} onChange={(e) => setSecondHalfAmount(e.target.value)} /></div></div></CardContent></Card>
        <Card className="shadow-card border-0"><CardHeader><CardTitle className="text-primary font-serif">Delivery Information</CardTitle></CardHeader><CardContent><div className="space-y-2"><Label>Delivery Date *</Label><Popover><PopoverTrigger asChild><Button variant="outline" className={cn("w-full justify-start text-left font-normal", !deliveryDate && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{deliveryDate ? format(deliveryDate, "PPP") : <span>Pick delivery date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={deliveryDate} onSelect={setDeliveryDate} initialFocus /></PopoverContent></Popover></div></CardContent></Card>

        <Card className="shadow-card border-0">
          <CardHeader><CardTitle className="text-primary font-serif">Family Members</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            {/* EDITED: Select is now an Input */}
            <div className="space-y-2"><Label htmlFor="numMembers">Number of Family Members</Label><Input id="numMembers" type="number" min="0" placeholder="e.g., 3" value={numberOfMembers > 0 ? numberOfMembers : ""} onChange={(e) => { const num = parseInt(e.target.value) || 0; setNumberOfMembers(num); setMembers([]); }} /></div>
            
            {numberOfMembers > 0 && (
              <div className="space-y-4">
                {Array.from({ length: numberOfMembers }, (_, index) => {
                  const memberNumber = index + 1;
                  const memberData = members[index];
                  
                  if (activeMemberForm === memberNumber) {
                    return (
                      <Card key={`form-${index}`} className="p-6 bg-accent border-primary">
                        <h3 className="text-xl font-serif text-primary mb-4">Adding Member {memberNumber}</h3>
                        <div className="space-y-6">
                          <Card><CardHeader><CardTitle className="text-lg">Personal Details</CardTitle></CardHeader><CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-2"><Label>First Name *</Label><Input value={memberFormData.firstName} onChange={(e) => setMemberFormData({...memberFormData, firstName: e.target.value})} /></div><div className="space-y-2"><Label>Last Name *</Label><Input value={memberFormData.lastName} onChange={(e) => setMemberFormData({...memberFormData, lastName: e.target.value})} /></div><div className="space-y-2"><Label>Sex *</Label><Select value={memberFormData.sex} onValueChange={(v) => setMemberFormData({...memberFormData, sex: v})}><SelectTrigger><SelectValue placeholder="Select sex" /></SelectTrigger><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>Age</Label><Input type="number" value={memberFormData.age} onChange={(e) => setMemberFormData({...memberFormData, age: e.target.value})} /></div></CardContent></Card>
                          <Card><CardHeader><CardTitle className="text-lg">Cloth & Design Details</CardTitle></CardHeader><CardContent className="pt-4 space-y-4"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-2"><Label>Shirt length</Label><Input type="number" value={memberFormData.shirtLength} onChange={(e) => setMemberFormData({...memberFormData, shirtLength: e.target.value})} /></div><div className="space-y-2"><Label>Sholder</Label><Input type="number" value={memberFormData.sholder} onChange={(e) => setMemberFormData({...memberFormData, sholder: e.target.value})} /></div><div className="space-y-2"><Label>Wegeb</Label><Input type="number" value={memberFormData.wegeb} onChange={(e) => setMemberFormData({...memberFormData, wegeb: e.target.value})} /></div><div className="space-y-2"><Label>Rist</Label><Input type="number" value={memberFormData.rist} onChange={(e) => setMemberFormData({...memberFormData, rist: e.target.value})} /></div>{memberFormData.sex === 'Female' && (<><div className="space-y-2"><Label>Dress length</Label><Input type="number" value={memberFormData.dressLength} onChange={(e) => setMemberFormData({...memberFormData, dressLength: e.target.value})} /></div><div className="space-y-2"><Label>Slive length</Label><Input type="number" value={memberFormData.sliveLength} onChange={(e) => setMemberFormData({...memberFormData, sliveLength: e.target.value})} /></div><div className="space-y-2"><Label>Brest</Label><Input type="number" value={memberFormData.breast} onChange={(e) => setMemberFormData({...memberFormData, breast: e.target.value})} /></div><div className="space-y-2"><Label>Over brest</Label><Input type="number" value={memberFormData.overBreast} onChange={(e) => setMemberFormData({...memberFormData, overBreast: e.target.value})} /></div><div className="space-y-2"><Label>Under brest</Label><Input type="number" value={memberFormData.underBreast} onChange={(e) => setMemberFormData({...memberFormData, underBreast: e.target.value})} /></div><div className="space-y-2"><Label>Slive type</Label><Select value={memberFormData.femaleSliveType} onValueChange={(v) => setMemberFormData({...memberFormData, femaleSliveType: v})}><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent><SelectItem value="Thin">A Thin</SelectItem><SelectItem value="Short">B Short</SelectItem><SelectItem value="Middle">C Middle</SelectItem><SelectItem value="Long">D Long</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>Wegeb type</Label><Select value={memberFormData.femaleWegebType} onValueChange={(v) => setMemberFormData({...memberFormData, femaleWegebType: v})}><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent><SelectItem value="Zrgf">A Zrgf</SelectItem><SelectItem value="Fitted">B Fitted</SelectItem><SelectItem value="Kbeto">C Kbeto</SelectItem></SelectContent></Select></div></>)}{memberFormData.sex === 'Male' && (<><div className="space-y-2"><Label>Deret</Label><Input type="number" value={memberFormData.deret} onChange={(e) => setMemberFormData({...memberFormData, deret: e.target.value})} /></div><div className="space-y-2"><Label>Anget</Label><Input type="number" value={memberFormData.anget} onChange={(e) => setMemberFormData({...memberFormData, anget: e.target.value})} /></div><div className="space-y-2"><Label>Type cloth</Label><Select value={memberFormData.maleClothType} onValueChange={(v) => setMemberFormData({...memberFormData, maleClothType: v})}><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent><SelectItem value="Shirt">A Shirt</SelectItem><SelectItem value="Semiz">B Semiz</SelectItem><SelectItem value="T shirt and jacket">C T shirt and jacket</SelectItem><SelectItem value="Shirt only with key">D Shirt only with key</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>Type of slive</Label><Select value={memberFormData.maleSliveType} onValueChange={(v) => setMemberFormData({...memberFormData, maleSliveType: v})}><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent><SelectItem value="Short">A Short</SelectItem><SelectItem value="Long">B Long</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>Netela</Label><Select value={memberFormData.netela} onValueChange={(v) => setMemberFormData({...memberFormData, netela: v})}><SelectTrigger><SelectValue placeholder="Select option" /></SelectTrigger><SelectContent><SelectItem value="Yes">A Yes</SelectItem><SelectItem value="No">B No</SelectItem></SelectContent></Select></div></>)}</div></CardContent></Card>
                          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setActiveMemberForm(null)}>Cancel</Button><Button type="button" onClick={handleSaveMember}>Save Member {memberNumber}</Button></div>
                        </div>
                      </Card>
                    );
                  }
                  return (
                    <Card key={index} className="p-4 flex items-center justify-center min-h-[100px] border-dashed">
                      {memberData ? (
                        <div className="w-full text-center">
                          <p className="font-bold text-lg text-green-700">{memberData.firstName} {memberData.lastName}</p>
                          <p className="text-sm text-muted-foreground">{memberData.sex}, Age: {memberData.age || 'N/A'}</p>
                        </div>
                      ) : (
                        <Button onClick={() => setActiveMemberForm(memberNumber)} className="w-full bg-gradient-primary text-secondary-foreground" >
                          + Add Details for Member {memberNumber}
                        </Button>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
        <Button 
  type="submit" 
  className="bg-gradient-primary text-secondary-foreground shadow-elegant hover:shadow-xl transition-all px-8 py-3" 
  disabled={isSubmitting || members.length !== numberOfMembers || numberOfMembers === 0}
>
  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isSubmitting ? 'Saving...' : 'Save Family Group'}
</Button>
        </div>
      </form>
    </div>
  );
};

export default AddFamily;