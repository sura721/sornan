// src/pages/AddFamily.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useData, Family, Individual } from "@/contexts/DataContext";
import { toast } from "@/hooks/use-toast";

// NEW: Import RadioGroup components for the choice
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// Import all the component forms
import { FamilyInformationForm } from "@/components/FamilyInformationForm";
import { PaymentDetailsForm } from "@/components/PaymentDetailsForm"; // This is used again
import { DeliveryInformationForm } from "@/components/DeliveryInformationForm";
import { FamilyMembersForm } from "@/components/FamilyMembersForm";

// Define types
type Payment = {
  total?: number;
  firstHalf: { paid: boolean; amount?: number; };
  secondHalf: { paid: boolean; amount?: number; };
};
type MemberData = Omit<
  Individual,
  "id" | "_id" | "deliveryDate" | "phoneNumbers" | "socials"
> & { payment?: Payment };


const AddFamily = () => {
  const navigate = useNavigate();
  const { addFamily } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for FamilyInformationForm (no change)
  const [familyName, setFamilyName] = useState("");
  const [primaryPhone, setPrimaryPhone] = useState("");
  const [secondaryPhone, setSecondaryPhone] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");
  const [tilefFile, setTilefFile] = useState<File | null>(null);
  const [colorCodes, setColorCodes] = useState("");

  // NEW: State to manage the payment choice. Defaults to 'family' (Pay Once).
  const [paymentMethod, setPaymentMethod] = useState<'family' | 'member'>('family');

  // RESTORED: State for the main, family-level payment form
  const [paymentTotal, setPaymentTotal] = useState("");
  const [firstHalfPaid, setFirstHalfPaid] = useState(false);
  const [firstHalfAmount, setFirstHalfAmount] = useState("");
  const [secondHalfPaid, setSecondHalfPaid] = useState(false);
  const [secondHalfAmount, setSecondHalfAmount] = useState("");

  // State for other forms (no change)
  const [deliveryDate, setDeliveryDate] = useState<Date>();
  const [numberOfMembers, setNumberOfMembers] = useState<number>(0);
  const [members, setMembers] = useState<MemberData[]>([]);

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

    // Append standard family data
    formData.append("familyName", familyName);
    formData.append("phoneNumbers", JSON.stringify({ primary: primaryPhone, secondary: secondaryPhone }));
    formData.append("socials", JSON.stringify({ telegram: telegramUsername }));
    formData.append("colors", JSON.stringify(colorCodes.split(",").map((c) => c.trim()).filter(Boolean)));
    formData.append("deliveryDate", deliveryDate.toISOString().split("T")[0]);

    // NEW: Conditionally append the main payment object
    // This will only be sent if the user chose "Pay Once"
    if (paymentMethod === 'family') {
      formData.append("payment", JSON.stringify({
        total: parseFloat(paymentTotal) || undefined,
        firstHalf: { paid: firstHalfPaid, amount: parseFloat(firstHalfAmount) || undefined },
        secondHalf: { paid: secondHalfPaid, amount: parseFloat(secondHalfAmount) || undefined },
      }));
    }
    
    // This is always sent. The 'members' array will either contain payment info or not,
    // which is determined by the FamilyMembersForm component.
    formData.append("memberIds", JSON.stringify(members));

    if (tilefFile) {
      formData.append("tilefImage", tilefFile);
    }


    console.log("Submitting family with data:",formData)
    try {
      await addFamily(formData);
      toast({ title: "Success", description: "Family group created successfully" });
      navigate("/orders");
    } catch (error) {
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
        <FamilyInformationForm
          familyName={familyName} setFamilyName={setFamilyName}
          primaryPhone={primaryPhone} setPrimaryPhone={setPrimaryPhone}
          secondaryPhone={secondaryPhone} setSecondaryPhone={setSecondaryPhone}
          telegramUsername={telegramUsername} setTelegramUsername={setTelegramUsername}
          tilefFile={tilefFile} setTilefFile={setTilefFile}
          colorCodes={colorCodes} setColorCodes={setColorCodes}
        />

        {/* NEW: Payment Method Choice */}
        <Card className="shadow-card border-0">
            <CardHeader>
                <CardTitle className="text-primary font-serif">Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={(value: 'family' | 'member') => setPaymentMethod(value)} className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="family" id="r-family" />
                        <Label htmlFor="r-family">Pay Once (for the whole family)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="member" id="r-member" />
                        <Label htmlFor="r-member">Pay Per Member (individual payments)</Label>
                    </div>
                </RadioGroup>
            </CardContent>
        </Card>

        {/* CONDITIONAL: Show the main payment form only if 'family' is selected */}
        {paymentMethod === 'family' && (
          <PaymentDetailsForm
            paymentTotal={paymentTotal} setPaymentTotal={setPaymentTotal}
            firstHalfPaid={firstHalfPaid} setFirstHalfPaid={setFirstHalfPaid}
            firstHalfAmount={firstHalfAmount} setFirstHalfAmount={setFirstHalfAmount}
            secondHalfPaid={secondHalfPaid} setSecondHalfPaid={setSecondHalfPaid}
            secondHalfAmount={secondHalfAmount} setSecondHalfAmount={setSecondHalfAmount}
          />
        )}

        <DeliveryInformationForm deliveryDate={deliveryDate} setDeliveryDate={setDeliveryDate} />

        {/* UPDATE: Pass the paymentMethod down to the members form */}
        <FamilyMembersForm
          numberOfMembers={numberOfMembers}
          setNumberOfMembers={setNumberOfMembers}
          members={members}
          setMembers={setMembers}
          paymentMethod={paymentMethod}
        />

        <div className="flex justify-end">
          <Button type="submit" className="bg-gradient-primary text-secondary-foreground shadow-elegant hover:shadow-xl transition-all px-8 py-3" disabled={isSubmitting || members.length !== numberOfMembers || numberOfMembers === 0}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Saving..." : "Save Family Group"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddFamily;