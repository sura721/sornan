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
import { CalendarIcon, Upload, X, ArrowUpRight } from "lucide-react";
import { format } from "date-fns";
import { cn, getImageUrl } from "@/lib/utils";
import { useData, Individual } from "@/contexts/DataContext";
import { toast } from "@/hooks/use-toast";

const EditIndividual = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getIndividual, updateIndividual } = useData();

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", primaryPhone: "", secondaryPhone: "", sex: "", age: "", telegramUsername: "", instagramUsername: "",
    total: "", firstHalfPaid: false, firstHalfAmount: "", secondHalfPaid: false, secondHalfAmount: "",
    shirtLength: "", sholder: "", wegeb: "", rist: "", dressLength: "", sliveLength: "", breast: "", overBreast: "", underBreast: "",
    femaleSliveType: "", femaleWegebType: "", deret: "", anget: "", maleClothType: "", maleSliveType: "", netela: "",
    colorCodes: "",
  });

  const [deliveryDate, setDeliveryDate] = useState<Date>();
  const [tilefFile, setTilefFile] = useState<File | null>(null);
  const [existingTilefUrl, setExistingTilefUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (id) {
      const individualData = getIndividual(id);
      if (individualData) {
        setFormData({
          firstName: individualData.firstName || "",
          lastName: individualData.lastName || "",
          primaryPhone: individualData.phoneNumbers?.primary || "",
          secondaryPhone: individualData.phoneNumbers?.secondary || "",
          sex: individualData.sex || "",
          age: individualData.age?.toString() || "",
          telegramUsername: individualData.socials?.telegram || "",
          instagramUsername: individualData.socials?.instagram || "",
          total: individualData.payment?.total?.toString() || "",
          firstHalfPaid: individualData.payment?.firstHalf.paid || false,
          firstHalfAmount: individualData.payment?.firstHalf.amount?.toString() || "",
          secondHalfPaid: individualData.payment?.secondHalf.paid || false,
          secondHalfAmount: individualData.payment?.secondHalf.amount?.toString() || "",
          shirtLength: individualData.clothDetails.shirtLength?.toString() || "",
          sholder: individualData.clothDetails.sholder?.toString() || "",
          wegeb: individualData.clothDetails.wegeb?.toString() || "",
          rist: individualData.clothDetails.rist?.toString() || "",
          dressLength: individualData.clothDetails.dressLength?.toString() || "",
          sliveLength: individualData.clothDetails.sliveLength?.toString() || "",
          breast: individualData.clothDetails.breast?.toString() || "",
          overBreast: individualData.clothDetails.overBreast?.toString() || "",
          underBreast: individualData.clothDetails.underBreast?.toString() || "",
          femaleSliveType: individualData.clothDetails.femaleSliveType || "",
          femaleWegebType: individualData.clothDetails.femaleWegebType || "",
          deret: individualData.clothDetails.deret?.toString() || "",
          anget: individualData.clothDetails.anget?.toString() || "",
          maleClothType: individualData.clothDetails.maleClothType || "",
          maleSliveType: individualData.clothDetails.maleSliveType || "",
          netela: individualData.clothDetails.netela || "",
          colorCodes: (individualData.clothDetails.colors || []).join(', '),
        });
        setExistingTilefUrl(individualData.clothDetails.tilefImageUrl);
        if (individualData.deliveryDate) {
          setDeliveryDate(new Date(individualData.deliveryDate));
        }
      } else {
        toast({ title: "Error", description: "Order not found.", variant: "destructive" });
        navigate('/orders');
      }
    }
  }, [id, getIndividual, navigate]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTilefFile(file);
      setExistingTilefUrl(undefined); // Clear existing image if new one is selected
    }
  };

  const handleRemoveImage = () => {
    setTilefFile(null);
    setExistingTilefUrl(undefined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    // Note: The mock `updateIndividual` function expects a JSON object.
    // A real backend might require FormData for file uploads on PUT requests.
    const updatedIndividual: Individual = {
      _id: id, // This is the correct ID from the database
      id: id, // Keep this for frontend key consistency if needed, though _id is primary
      firstName: formData.firstName,
      lastName: formData.lastName,
      phoneNumbers: { primary: formData.primaryPhone, secondary: formData.secondaryPhone },
      socials: { telegram: formData.telegramUsername, instagram: formData.instagramUsername },
      sex: formData.sex as 'Male' | 'Female',
      age: parseInt(formData.age) || undefined,
      clothDetails: {
        colors: formData.colorCodes.split(',').map(c => c.trim()).filter(Boolean),
        tilefImageUrl: existingTilefUrl, // Keep existing URL for now
        shirtLength: parseFloat(formData.shirtLength) || undefined,
        sholder: parseFloat(formData.sholder) || undefined,
        wegeb: parseFloat(formData.wegeb) || undefined,
        rist: parseFloat(formData.rist) || undefined,
        dressLength: formData.sex === 'Female' ? parseFloat(formData.dressLength) || undefined : undefined,
        sliveLength: formData.sex === 'Female' ? parseFloat(formData.sliveLength) || undefined : undefined,
        breast: formData.sex === 'Female' ? parseFloat(formData.breast) || undefined : undefined,
        overBreast: formData.sex === 'Female' ? parseFloat(formData.overBreast) || undefined : undefined,
        underBreast: formData.sex === 'Female' ? parseFloat(formData.underBreast) || undefined : undefined,
        femaleSliveType: formData.sex === 'Female' ? formData.femaleSliveType : undefined,
        femaleWegebType: formData.sex === 'Female' ? formData.femaleWegebType : undefined,
        deret: formData.sex === 'Male' ? parseFloat(formData.deret) || undefined : undefined,
        anget: formData.sex === 'Male' ? parseFloat(formData.anget) || undefined : undefined,
        maleClothType: formData.sex === 'Male' ? formData.maleClothType : undefined,
        maleSliveType: formData.sex === 'Male' ? formData.maleSliveType : undefined,
        netela: formData.sex === 'Male' ? formData.netela as 'Yes' | 'No' | undefined : undefined,
      },
      payment: {
        total: parseFloat(formData.total) || undefined,
        firstHalf: { paid: formData.firstHalfPaid, amount: parseFloat(formData.firstHalfAmount) || undefined },
        secondHalf: { paid: formData.secondHalfPaid, amount: parseFloat(formData.secondHalfAmount) || undefined },
      },
      deliveryDate: deliveryDate ? deliveryDate.toISOString().split('T')[0] : "",
    };
    
    if (tilefFile) {
      console.log("MOCK: A new Tilef file was selected for upload:", tilefFile.name);
      // In a real app, you would handle the file upload here and get a new URL
      // For the mock, we will just log it.
    }
    
    updateIndividual(updatedIndividual);
    toast({ title: "Success", description: "Individual order updated successfully" });
    navigate("/orders");
  };
  
  const getCleanUsername = (urlOrUsername: string) => {
    const withoutDomain = urlOrUsername.replace(/^(https?:\/\/)?(www\.)?(t\.me\/|instagram\.com\/)?/, '');
    return withoutDomain.startsWith('@') ? withoutDomain.substring(1) : withoutDomain;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-primary mb-2">Edit Individual Order</h1>
        <p className="text-muted-foreground">Update the details for this order</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="shadow-card border-0"><CardHeader><CardTitle className="text-primary font-serif">Personal Details</CardTitle></CardHeader><CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="space-y-2"><Label htmlFor="firstName">First Name *</Label><Input id="firstName" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} required /></div><div className="space-y-2"><Label htmlFor="lastName">Last Name *</Label><Input id="lastName" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} required /></div><div className="space-y-2"><Label htmlFor="primaryPhone">Primary Phone Number *</Label><Input id="primaryPhone" type="tel" value={formData.primaryPhone} onChange={(e) => setFormData({...formData, primaryPhone: e.target.value})} required /></div><div className="space-y-2"><Label htmlFor="secondaryPhone">Secondary Phone Number</Label><Input id="secondaryPhone" type="tel" value={formData.secondaryPhone} onChange={(e) => setFormData({...formData, secondaryPhone: e.target.value})} /></div><div className="space-y-2"><Label>Sex *</Label><Select value={formData.sex} onValueChange={(value) => setFormData({...formData, sex: value})}><SelectTrigger><SelectValue placeholder="Select sex" /></SelectTrigger><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label htmlFor="age">Age</Label><Input id="age" type="number" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} /></div><div className="space-y-2"><Label htmlFor="telegram">Telegram Username</Label><div className="flex items-center gap-2"><Input id="telegram" placeholder="@Keafa_design" value={formData.telegramUsername} onChange={(e) => setFormData({...formData, telegramUsername: e.target.value})} />{formData.telegramUsername && (<a href={`https://t.me/${getCleanUsername(formData.telegramUsername)}`} target="_blank" rel="noopener noreferrer"><Button type="button" size="icon" className="bg-green-600 hover:bg-green-700 flex-shrink-0"><ArrowUpRight className="w-4 h-4" /></Button></a>)}</div></div><div className="space-y-2"><Label htmlFor="instagram">Instagram Username</Label><div className="flex items-center gap-2"><Input id="instagram" placeholder="@Keafa_design" value={formData.instagramUsername} onChange={(e) => setFormData({...formData, instagramUsername: e.target.value})} />{formData.instagramUsername && (<a href={`https://www.instagram.com/${getCleanUsername(formData.instagramUsername)}`} target="_blank" rel="noopener noreferrer"><Button type="button" size="icon" className="bg-green-600 hover:bg-green-700 flex-shrink-0"><ArrowUpRight className="w-4 h-4" /></Button></a>)}</div></div></CardContent></Card>
        <Card className="shadow-card border-0"><CardHeader><CardTitle className="text-primary font-serif">Cloth & Design Details</CardTitle></CardHeader><CardContent className="space-y-6"><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="space-y-2"><Label htmlFor="shirtLength">Shirt length</Label><Input id="shirtLength" type="number" value={formData.shirtLength} onChange={(e) => setFormData({...formData, shirtLength: e.target.value})} /></div><div className="space-y-2"><Label htmlFor="sholder">Sholder</Label><Input id="sholder" type="number" value={formData.sholder} onChange={(e) => setFormData({...formData, sholder: e.target.value})} /></div><div className="space-y-2"><Label htmlFor="wegeb">Wegeb</Label><Input id="wegeb" type="number" value={formData.wegeb} onChange={(e) => setFormData({...formData, wegeb: e.target.value})} /></div><div className="space-y-2"><Label htmlFor="rist">Rist</Label><Input id="rist" type="number" value={formData.rist} onChange={(e) => setFormData({...formData, rist: e.target.value})} /></div>{formData.sex === 'Female' && (<> <div className="space-y-2"><Label htmlFor="dressLength">Dress length</Label><Input id="dressLength" type="number" value={formData.dressLength} onChange={(e) => setFormData({...formData, dressLength: e.target.value})} /></div><div className="space-y-2"><Label htmlFor="sliveLength">Slive length</Label><Input id="sliveLength" type="number" value={formData.sliveLength} onChange={(e) => setFormData({...formData, sliveLength: e.target.value})} /></div><div className="space-y-2"><Label htmlFor="breast">Brest</Label><Input id="breast" type="number" value={formData.breast} onChange={(e) => setFormData({...formData, breast: e.target.value})} /></div><div className="space-y-2"><Label htmlFor="overBreast">Over brest</Label><Input id="overBreast" type="number" value={formData.overBreast} onChange={(e) => setFormData({...formData, overBreast: e.target.value})} /></div><div className="space-y-2"><Label htmlFor="underBreast">Under brest</Label><Input id="underBreast" type="number" value={formData.underBreast} onChange={(e) => setFormData({...formData, underBreast: e.target.value})} /></div><div className="space-y-2"><Label>Slive type</Label><Select value={formData.femaleSliveType} onValueChange={(value) => setFormData({...formData, femaleSliveType: value})}><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent><SelectItem value="Thin">A Thin</SelectItem><SelectItem value="Short">B Short</SelectItem><SelectItem value="Middle">C Middle</SelectItem><SelectItem value="Long">D Long</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>Wegeb type</Label><Select value={formData.femaleWegebType} onValueChange={(value) => setFormData({...formData, femaleWegebType: value})}><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent><SelectItem value="Zrgf">A Zrgf</SelectItem><SelectItem value="Fitted">B Fitted</SelectItem><SelectItem value="Kbeto">C Kbeto</SelectItem></SelectContent></Select></div></>)}{formData.sex === 'Male' && (<> <div className="space-y-2"><Label htmlFor="deret">Deret</Label><Input id="deret" type="number" value={formData.deret} onChange={(e) => setFormData({...formData, deret: e.target.value})} /></div><div className="space-y-2"><Label htmlFor="anget">Anget</Label><Input id="anget" type="number" value={formData.anget} onChange={(e) => setFormData({...formData, anget: e.target.value})} /></div><div className="space-y-2"><Label>Type cloth</Label><Select value={formData.maleClothType} onValueChange={(value) => setFormData({...formData, maleClothType: value})}><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent><SelectItem value="Shirt">A Shirt</SelectItem><SelectItem value="Semiz">B Semiz</SelectItem><SelectItem value="T shirt and jacket">C T shirt and jacket</SelectItem><SelectItem value="Shirt only with key">D Shirt only with key</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>Type of slive</Label><Select value={formData.maleSliveType} onValueChange={(value) => setFormData({...formData, maleSliveType: value})}><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent><SelectItem value="Short">A Short</SelectItem><SelectItem value="Long">B Long</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>Netela</Label><Select value={formData.netela} onValueChange={(value) => setFormData({...formData, netela: value})}><SelectTrigger><SelectValue placeholder="Select option" /></SelectTrigger><SelectContent><SelectItem value="Yes">A Yes</SelectItem><SelectItem value="No">B No</SelectItem></SelectContent></Select></div></>)}</div><div className="border-t border-border pt-6 space-y-6"><div className="space-y-2"><Label>Upload 'Tilef' Image</Label><div className="border-2 border-dashed border-border rounded-lg p-6 text-center relative"><input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="tilef-upload" /><label htmlFor="tilef-upload" className="cursor-pointer">{(existingTilefUrl || tilefFile) ? (<> {(existingTilefUrl && !tilefFile) && <img src={getImageUrl(existingTilefUrl)} alt="Existing Tilef" className="w-24 h-24 object-cover rounded-lg mx-auto" />} {tilefFile && <img src={URL.createObjectURL(tilefFile)} alt="Tilef Preview" className="w-24 h-24 object-cover rounded-lg mx-auto" />} <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 w-6 h-6" onClick={handleRemoveImage}><X className="w-4 h-4" /></Button></>) : (<div className="space-y-2"><Upload className="w-8 h-8 text-muted-foreground mx-auto" /><p className="text-muted-foreground">Click to upload new Tilef pattern</p></div>)}</label></div></div><div className="space-y-2"><Label htmlFor="color-codes">Colors</Label><Input id="color-codes" placeholder="Enter color codes, separated by commas (e.g. 15, 66, 76)" value={formData.colorCodes} onChange={(e) => setFormData({...formData, colorCodes: e.target.value})} /></div></div></CardContent></Card>
        <Card className="shadow-card border-0"><CardHeader><CardTitle className="text-primary font-serif">Payment Details</CardTitle></CardHeader><CardContent className="space-y-6"><div className="space-y-2"><Label htmlFor="totalAmount">Total</Label><Input id="totalAmount" type="number" placeholder="Total Amount" value={formData.total} onChange={(e) => setFormData({...formData, total: e.target.value})} /></div><div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-border pt-6"><div className="space-y-4"><div className="flex items-center space-x-2"><Checkbox id="firstHalf" checked={formData.firstHalfPaid} onCheckedChange={(checked) => setFormData({...formData, firstHalfPaid: !!checked})} /><Label htmlFor="firstHalf">First Half Payment</Label></div><Input type="number" placeholder="Amount" value={formData.firstHalfAmount} onChange={(e) => setFormData({...formData, firstHalfAmount: e.target.value})} /></div><div className="space-y-4"><div className="flex items-center space-x-2"><Checkbox id="secondHalf" checked={formData.secondHalfPaid} onCheckedChange={(checked) => setFormData({...formData, secondHalfPaid: !!checked})} /><Label htmlFor="secondHalf">Second Half Payment</Label></div><Input type="number" placeholder="Amount" value={formData.secondHalfAmount} onChange={(e) => setFormData({...formData, secondHalfAmount: e.target.value})} /></div></div></CardContent></Card>
        <Card className="shadow-card border-0"><CardHeader><CardTitle className="text-primary font-serif">Delivery Information</CardTitle></CardHeader><CardContent><div className="space-y-2"><Label>Delivery Date *</Label><Popover><PopoverTrigger asChild><Button variant="outline" className={cn("w-full justify-start text-left font-normal", !deliveryDate && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{deliveryDate ? format(deliveryDate, "PPP") : <span>Pick delivery date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={deliveryDate} onSelect={setDeliveryDate} initialFocus className="pointer-events-auto" /></PopoverContent></Popover></div></CardContent></Card>
        <div className="flex justify-end"><Button type="submit" className="bg-gradient-primary text-secondary-foreground shadow-elegant hover:shadow-xl transition-all px-8 py-3">Update Order</Button></div>
      </form>
    </div>
  );
};

export default EditIndividual;