import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Upload, X, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useData, Family, Individual } from "@/contexts/DataContext";
import { toast } from "@/hooks/use-toast";
import { cn, getImageUrl } from "@/lib/utils";

const initialMemberFormState = { firstName: "", lastName: "", sex: "", age: "", shirtLength: "", sholder: "", wegeb: "", rist: "", dressLength: "", sliveLength: "", breast: "", overBreast: "", underBreast: "", femaleSliveType: "", femaleWegebType: "", deret: "", anget: "", maleClothType: "", maleSliveType: "", netela: "" };
type MemberData = Omit<Individual, 'id' | '_id' | 'payment' | 'deliveryDate' | 'phoneNumbers' | 'socials'>;

const EditFamily = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getFamily, updateFamily } = useData();

  const [familyData, setFamilyData] = useState<Family | null>(null);
  const [activeMemberForm, setActiveMemberForm] = useState<string | null>(null); // "new" or member's ID
  const [memberFormData, setMemberFormData] = useState(initialMemberFormState);
  
  const [tilefFile, setTilefFile] = useState<File | null>(null);
  const [existingTilefUrl, setExistingTilefUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (id) {
      const currentFamily = getFamily(id);
      if (currentFamily) {
        setFamilyData(currentFamily);
        setExistingTilefUrl(currentFamily.tilefImageUrl);
      } else {
        toast({ title: "Error", description: "Family order not found.", variant: "destructive" });
        navigate("/orders");
      }
    }
  }, [id, getFamily, navigate]);
  
  const handleFamilyChange = (field: string, value: any) => {
    setFamilyData(prev => {
      if (!prev) return null;
      const newData = JSON.parse(JSON.stringify(prev)); 
      const keys = field.split('.');
      let current = newData;
      for (let i = 0; i < keys.length - 1; i++) { current = current[keys[i]]; }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleOpenMemberForm = (memberId: string | "new" = "new") => {
    setActiveMemberForm(memberId);
    if (memberId !== 'new' && familyData) {
      const member = familyData.memberIds.find(m => (m as Individual)._id === memberId) as Individual;
      if (member) {
        setMemberFormData({
          firstName: member.firstName || "", lastName: member.lastName || "", sex: member.sex || "", age: member.age?.toString() || "",
          shirtLength: member.clothDetails.shirtLength?.toString() || "", sholder: member.clothDetails.sholder?.toString() || "", wegeb: member.clothDetails.wegeb?.toString() || "", rist: member.clothDetails.rist?.toString() || "",
          dressLength: member.clothDetails.dressLength?.toString() || "", sliveLength: member.clothDetails.sliveLength?.toString() || "", breast: member.clothDetails.breast?.toString() || "", overBreast: member.clothDetails.overBreast?.toString() || "", underBreast: member.clothDetails.underBreast?.toString() || "",
          femaleSliveType: member.clothDetails.femaleSliveType || "", femaleWegebType: member.clothDetails.femaleWegebType || "",
          deret: member.clothDetails.deret?.toString() || "", anget: member.clothDetails.anget?.toString() || "",
          maleClothType: member.clothDetails.maleClothType || "", maleSliveType: member.clothDetails.maleSliveType || "", netela: member.clothDetails.netela || "",
        });
      }
    } else {
      setMemberFormData(initialMemberFormState);
    }
  };

  const handleSaveMember = () => {
    if (!memberFormData.firstName || !memberFormData.lastName || !memberFormData.sex) { toast({ title: "Error", description: "First Name, Last Name, and Sex are required.", variant: "destructive" }); return; }
    const memberDetails: MemberData = {
        firstName: memberFormData.firstName, lastName: memberFormData.lastName, sex: memberFormData.sex as 'Male' | 'Female', age: parseInt(memberFormData.age) || undefined,
        clothDetails: {
            colors: [], shirtLength: parseFloat(memberFormData.shirtLength) || undefined, sholder: parseFloat(memberFormData.sholder) || undefined, wegeb: parseFloat(memberFormData.wegeb) || undefined, rist: parseFloat(memberFormData.rist) || undefined,
            dressLength: parseFloat(memberFormData.dressLength) || undefined, sliveLength: parseFloat(memberFormData.sliveLength) || undefined, breast: parseFloat(memberFormData.breast) || undefined, overBreast: parseFloat(memberFormData.overBreast) || undefined, underBreast: parseFloat(memberFormData.underBreast) || undefined, femaleSliveType: memberFormData.femaleSliveType, femaleWegebType: memberFormData.femaleWegebType,
            deret: parseFloat(memberFormData.deret) || undefined, anget: parseFloat(memberFormData.anget) || undefined, maleClothType: memberFormData.maleClothType, maleSliveType: memberFormData.maleSliveType, netela: memberFormData.netela as 'Yes' | 'No' | undefined,
        },
    };
    if (activeMemberForm === 'new') {
        const newMember: Individual = { ...memberDetails, id: `mock_mem_${Date.now()}`, _id: `mock_mem_${Date.now()}` };
        setFamilyData(prev => prev ? { ...prev, memberIds: [...prev.memberIds, newMember] } : null);
    } else {
        setFamilyData(prev => {
            if (!prev) return null;
            const updatedMembers = prev.memberIds.map(mem => (mem as Individual)._id === activeMemberForm ? { ...(mem as Individual), ...memberDetails } : mem);
            return { ...prev, memberIds: updatedMembers };
        });
    }
    setActiveMemberForm(null);
  };
  
  const handleDeleteMember = (memberId: string) => {
    if (window.confirm("Are you sure you want to remove this member?")) {
        setFamilyData(prev => {
            if (!prev) return null;
            const updatedMembers = prev.memberIds.filter(mem => (mem as Individual)._id !== memberId);
            return { ...prev, memberIds: updatedMembers };
        });
        toast({ title: "Member Removed" });
    }
  };

  const handleFamilySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyData) return;
    const finalFamilyData = { ...familyData, tilefImageUrl: existingTilefUrl };
    updateFamily(finalFamilyData);
    toast({ title: "Success", description: "Family group updated successfully" });
    navigate("/orders");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setTilefFile(file); setExistingTilefUrl(URL.createObjectURL(file)); }
  };
  const handleRemoveImage = () => { setTilefFile(null); setExistingTilefUrl(undefined); };
  
  if (!familyData) return <div className="text-center p-10">Loading family details...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      <div><h1 className="text-3xl font-serif font-bold text-primary mb-2">Edit Family Group</h1><p className="text-muted-foreground">Update the details for this family order</p></div>
      <form onSubmit={handleFamilySubmit} className="space-y-8">
        <Card className="shadow-card border-0"><CardHeader><CardTitle className="text-primary font-serif">Family Information</CardTitle></CardHeader><CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            <div className="space-y-2 md:col-span-2"><Label>Family Name *</Label><Input value={familyData.familyName} onChange={(e) => handleFamilyChange('familyName', e.target.value)} required /></div>
            <div className="space-y-2"><Label>Primary Phone *</Label><Input type="tel" value={familyData.phoneNumbers?.primary || ''} onChange={(e) => handleFamilyChange('phoneNumbers.primary', e.target.value)} required /></div>
            <div className="space-y-2"><Label>Secondary Phone</Label><Input type="tel" value={familyData.phoneNumbers?.secondary || ''} onChange={(e) => handleFamilyChange('phoneNumbers.secondary', e.target.value)} /></div>
            <div className="space-y-2 md:col-span-2"><Label>Telegram</Label><Input value={familyData.socials?.telegram || ''} onChange={(e) => handleFamilyChange('socials.telegram', e.target.value)} /></div>
            <div className="space-y-2 md:col-span-2"><Label>Upload 'Tilef' Image</Label><div className="border-2 border-dashed border-border rounded-lg p-6 text-center relative"><input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="tilef-upload" /><label htmlFor="tilef-upload" className="cursor-pointer">{(existingTilefUrl || tilefFile) ? (<>{(existingTilefUrl) && <img src={getImageUrl(existingTilefUrl)} alt="Tilef Preview" className="w-24 h-24 object-cover rounded-lg mx-auto" />}<Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 w-6 h-6 z-10" onClick={(e) => { e.stopPropagation(); handleRemoveImage(); }}><X className="w-4 h-4" /></Button></>) : (<div className="space-y-2"><Upload className="w-8 h-8 text-muted-foreground mx-auto" /><p className="text-muted-foreground">Click to upload new Tilef pattern</p></div>)}</label></div></div>
            <div className="space-y-2 md:col-span-2"><Label>Colors</Label><Input placeholder="e.g., 15, 66, 76" value={(familyData.colors || []).join(', ')} onChange={(e) => handleFamilyChange('colors', e.target.value.split(',').map(c => c.trim()))} /></div>
        </CardContent></Card>
        
        <Card className="shadow-card border-0"><CardHeader><CardTitle className="text-primary font-serif">Payment & Delivery</CardTitle></CardHeader><CardContent className="space-y-6 pt-6">
            <div className="space-y-2"><Label>Total Amount</Label><Input type="number" placeholder="Total Amount" value={familyData.payment?.total || ''} onChange={(e) => handleFamilyChange('payment.total', parseFloat(e.target.value) || 0)} /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
                <div className="space-y-4"><div className="flex items-center space-x-2"><Checkbox id="firstHalf" checked={familyData.payment?.firstHalf?.paid} onCheckedChange={(c) => handleFamilyChange('payment.firstHalf.paid', !!c)} /><Label>First Half Payment</Label></div><Input type="number" placeholder="Amount" value={familyData.payment?.firstHalf?.amount || ''} onChange={(e) => handleFamilyChange('payment.firstHalf.amount', parseFloat(e.target.value) || 0)} /></div>
                <div className="space-y-4"><div className="flex items-center space-x-2"><Checkbox id="secondHalf" checked={familyData.payment?.secondHalf?.paid} onCheckedChange={(c) => handleFamilyChange('payment.secondHalf.paid', !!c)} /><Label>Second Half Payment</Label></div><Input type="number" placeholder="Amount" value={familyData.payment?.secondHalf?.amount || ''} onChange={(e) => handleFamilyChange('payment.secondHalf.amount', parseFloat(e.target.value) || 0)} /></div>
            </div>
            <div className="border-t pt-6"><Label>Delivery Date *</Label><Popover><PopoverTrigger asChild><Button variant="outline" className={cn("w-full justify-start text-left font-normal", !familyData.deliveryDate && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{familyData.deliveryDate ? format(new Date(familyData.deliveryDate), "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={familyData.deliveryDate ? new Date(familyData.deliveryDate) : undefined} onSelect={(date) => date && handleFamilyChange('deliveryDate', date.toISOString().split('T')[0])} initialFocus /></PopoverContent></Popover></div>
        </CardContent></Card>
        
        <Card className="shadow-card border-0">
            <CardHeader><CardTitle className="text-primary font-serif">Family Members</CardTitle></CardHeader>
            <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(familyData.memberIds as Individual[]).map((member) => (
                    <Card key={member._id} className="p-4 flex justify-between items-center">
                    <div><p className="font-medium">{member.firstName} {member.lastName}</p><p className="text-sm text-muted-foreground">{member.sex}</p></div>
                    <div className="flex gap-2"><Button type="button" variant="outline" size="sm" onClick={() => handleOpenMemberForm(member.id)}>Edit</Button><Button type="button" variant="destructive" size="sm" onClick={() => handleDeleteMember(member.id)}><Trash2 className="w-4 h-4" /></Button></div>
                    </Card>
                ))}
                </div>
                <Button type="button" className="w-full" onClick={() => handleOpenMemberForm("new")}>+ Add New Member</Button>
                
                {/* --- FIX START: This is the complete member editing form --- */}
                {activeMemberForm && <div className="p-6 bg-accent border-primary rounded-lg mt-4">
                    <h3 className="text-xl font-serif text-primary mb-4">{activeMemberForm === 'new' ? 'Adding New Member' : `Editing Member`}</h3>
                    <div className="space-y-6">
                        <Card><CardHeader><CardTitle className="text-lg">Personal Details</CardTitle></CardHeader><CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-2"><Label>First Name *</Label><Input value={memberFormData.firstName} onChange={(e) => setMemberFormData({...memberFormData, firstName: e.target.value})} /></div><div className="space-y-2"><Label>Last Name *</Label><Input value={memberFormData.lastName} onChange={(e) => setMemberFormData({...memberFormData, lastName: e.target.value})} /></div><div className="space-y-2"><Label>Sex *</Label><Select value={memberFormData.sex} onValueChange={(v) => setMemberFormData({...memberFormData, sex: v})}><SelectTrigger><SelectValue placeholder="Select sex" /></SelectTrigger><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>Age</Label><Input type="number" value={memberFormData.age} onChange={(e) => setMemberFormData({...memberFormData, age: e.target.value})} /></div></CardContent></Card>
                        <Card><CardHeader><CardTitle className="text-lg">Cloth & Design Details</CardTitle></CardHeader><CardContent className="pt-4 space-y-4"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-2"><Label>Shirt length</Label><Input type="number" value={memberFormData.shirtLength} onChange={(e) => setMemberFormData({...memberFormData, shirtLength: e.target.value})} /></div><div className="space-y-2"><Label>Sholder</Label><Input type="number" value={memberFormData.sholder} onChange={(e) => setMemberFormData({...memberFormData, sholder: e.target.value})} /></div><div className="space-y-2"><Label>Wegeb</Label><Input type="number" value={memberFormData.wegeb} onChange={(e) => setMemberFormData({...memberFormData, wegeb: e.target.value})} /></div><div className="space-y-2"><Label>Rist</Label><Input type="number" value={memberFormData.rist} onChange={(e) => setMemberFormData({...memberFormData, rist: e.target.value})} /></div>{memberFormData.sex === 'Female' && (<><div className="space-y-2"><Label>Dress length</Label><Input type="number" value={memberFormData.dressLength} onChange={(e) => setMemberFormData({...memberFormData, dressLength: e.target.value})} /></div><div className="space-y-2"><Label>Slive length</Label><Input type="number" value={memberFormData.sliveLength} onChange={(e) => setMemberFormData({...memberFormData, sliveLength: e.target.value})} /></div><div className="space-y-2"><Label>Brest</Label><Input type="number" value={memberFormData.breast} onChange={(e) => setMemberFormData({...memberFormData, breast: e.target.value})} /></div><div className="space-y-2"><Label>Over brest</Label><Input type="number" value={memberFormData.overBreast} onChange={(e) => setMemberFormData({...memberFormData, overBreast: e.target.value})} /></div><div className="space-y-2"><Label>Under brest</Label><Input type="number" value={memberFormData.underBreast} onChange={(e) => setMemberFormData({...memberFormData, underBreast: e.target.value})} /></div><div className="space-y-2"><Label>Slive type</Label><Select value={memberFormData.femaleSliveType} onValueChange={(v) => setMemberFormData({...memberFormData, femaleSliveType: v})}><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent><SelectItem value="Thin">A Thin</SelectItem><SelectItem value="Short">B Short</SelectItem><SelectItem value="Middle">C Middle</SelectItem><SelectItem value="Long">D Long</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>Wegeb type</Label><Select value={memberFormData.femaleWegebType} onValueChange={(v) => setMemberFormData({...memberFormData, femaleWegebType: v})}><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent><SelectItem value="Zrgf">A Zrgf</SelectItem><SelectItem value="Fitted">B Fitted</SelectItem><SelectItem value="Kbeto">C Kbeto</SelectItem></SelectContent></Select></div></>)}{memberFormData.sex === 'Male' && (<><div className="space-y-2"><Label>Deret</Label><Input type="number" value={memberFormData.deret} onChange={(e) => setMemberFormData({...memberFormData, deret: e.target.value})} /></div><div className="space-y-2"><Label>Anget</Label><Input type="number" value={memberFormData.anget} onChange={(e) => setMemberFormData({...memberFormData, anget: e.target.value})} /></div><div className="space-y-2"><Label>Type cloth</Label><Select value={memberFormData.maleClothType} onValueChange={(v) => setMemberFormData({...memberFormData, maleClothType: v})}><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent><SelectItem value="Shirt">A Shirt</SelectItem><SelectItem value="Semiz">B Semiz</SelectItem><SelectItem value="T shirt and jacket">C T shirt and jacket</SelectItem><SelectItem value="Shirt only with key">D Shirt only with key</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>Type of slive</Label><Select value={memberFormData.maleSliveType} onValueChange={(v) => setMemberFormData({...memberFormData, maleSliveType: v})}><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent><SelectItem value="Short">A Short</SelectItem><SelectItem value="Long">B Long</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>Netela</Label><Select value={memberFormData.netela} onValueChange={(v) => setMemberFormData({...memberFormData, netela: v})}><SelectTrigger><SelectValue placeholder="Select option" /></SelectTrigger><SelectContent><SelectItem value="Yes">A Yes</SelectItem><SelectItem value="No">B No</SelectItem></SelectContent></Select></div></>)}</div></CardContent></Card>
                        <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setActiveMemberForm(null)}>Cancel</Button><Button type="button" onClick={handleSaveMember}>Save Member</Button></div>
                    </div>
                </div>}
                {/* --- FIX END --- */}
            </CardContent>
        </Card>

        <div className="flex justify-end"><Button type="submit" className="bg-gradient-primary text-secondary-foreground shadow-elegant hover:shadow-xl transition-all px-8 py-3">Update Family Group</Button></div>
      </form>
    </div>
  );
};

export default EditFamily;