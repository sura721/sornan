// src/components/FamilyMembersForm.tsx
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MemberForm } from "./MemberForm";
import { toast } from "@/hooks/use-toast";
import { Individual } from "@/contexts/DataContext";

// Define the shape of an individual payment record
type Payment = {
  total?: number;
  firstHalf: {
    paid: boolean;
    amount?: number;
  };
  secondHalf: {
    paid: boolean;
    amount?: number;
  };
};

// This is the final shape of a member's data that will be saved.
type MemberData = Omit<
  Individual,
  "id" | "_id" | "deliveryDate" | "phoneNumbers" | "socials"
> & { payment?: Payment };

// This is the shape of the form's state while you are actively adding/editing a member.
export type MemberFormState = {
  firstName: string;
  lastName: string;
  sex: string;
  age: string;
  shirtLength: string;
  sholder: string;
  wegeb: string;
  rist: string;
  dressLength: string;
  sliveLength: string;
  breast: string;
  overBreast: string;
  underBreast: string;
  femaleSliveType: string;
  femaleWegebType: string;

  deret: string;
  anget: string;
  maleClothType: string;
  maleSliveType: string;
  netela: string;
  paymentTotal: string;
  firstHalfPaid: boolean;
  firstHalfAmount: string;
  secondHalfPaid: boolean;
  secondHalfAmount: string;
};

// The default state for the form when adding a new member.
const initialMemberFormState: MemberFormState = {
  firstName: "",
  lastName: "",
  sex: "",
  age: "",
  shirtLength: "",
  sholder: "",
  wegeb: "",
  rist: "",
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
  firstHalfPaid: false,
  firstHalfAmount: "",
  secondHalfPaid: false,
  secondHalfAmount: "",
};

interface FamilyMembersFormProps {
  numberOfMembers: number;
  setNumberOfMembers: (num: number) => void;
  members: MemberData[];
  setMembers: React.Dispatch<React.SetStateAction<MemberData[]>>;
  paymentMethod: 'family' | 'member';
}

export const FamilyMembersForm = ({
  numberOfMembers,
  setNumberOfMembers,
  members,
  setMembers,
  paymentMethod,
}: FamilyMembersFormProps) => {
  const [activeMemberForm, setActiveMemberForm] = useState<number | null>(null);
  const [memberFormData, setMemberFormData] = useState(initialMemberFormState);

 const handleSaveMember = () => {
    if (!memberFormData.firstName || !memberFormData.lastName || !memberFormData.sex) {
      toast({
        title: "Error",
        description: "First Name, Last Name, and Sex are required for each member.",
        variant: "destructive",
      });
      return;
    }

    const newMember: MemberData = {
      firstName: memberFormData.firstName,
      lastName: memberFormData.lastName,
      sex: memberFormData.sex as "Male" | "Female",
      // CORRECT: `age` is a Number in the schema, so parseInt is correct.
      age: memberFormData.age ? parseInt(memberFormData.age, 10) : undefined,
      clothDetails: {
        colors: [], // Assuming this is populated elsewhere or is intentionally empty
        
        // CORRECTED: These are all Strings in the schema. Do not parse them.
        // Use `|| undefined` to avoid sending empty strings.
        shirtLength: memberFormData.shirtLength || undefined,
        sholder: memberFormData.sholder || undefined,
        wegeb: memberFormData.wegeb || undefined,
        rist: memberFormData.rist || undefined,

        // Female Measurements (as Strings)
        dressLength: memberFormData.sex === "Female" ? (memberFormData.dressLength || undefined) : undefined,
        sliveLength: memberFormData.sex === "Female" ? (memberFormData.sliveLength || undefined) : undefined,
        breast: memberFormData.sex === "Female" ? (memberFormData.breast || undefined) : undefined,
        overBreast: memberFormData.sex === "Female" ? (memberFormData.overBreast || undefined) : undefined,
        underBreast: memberFormData.sex === "Female" ? (memberFormData.underBreast || undefined) : undefined,
        
        // Male Measurements (as Strings)
        deret: memberFormData.sex === "Male" ? (memberFormData.deret || undefined) : undefined,
        anget: memberFormData.sex === "Male" ? (memberFormData.anget || undefined) : undefined,

        // Dropdown Selections (already correct)
        femaleSliveType: memberFormData.sex === "Female" ? (memberFormData.femaleSliveType || undefined) : undefined,
        femaleWegebType: memberFormData.sex === "Female" ? (memberFormData.femaleWegebType || undefined) : undefined,
        maleClothType: memberFormData.sex === "Male" ? (memberFormData.maleClothType || undefined) : undefined,
        maleSliveType: memberFormData.sex === "Male" ? (memberFormData.maleSliveType || undefined) : undefined,
 netela: memberFormData.sex === "Male" ? ((memberFormData.netela as "Yes" | "No") || undefined) : undefined,      },
       ...(paymentMethod === 'member' && {
        payment: {
          total: memberFormData.paymentTotal ? parseFloat(memberFormData.paymentTotal) : undefined,
          firstHalf: {
            paid: memberFormData.firstHalfPaid,
            amount: memberFormData.firstHalfAmount ? parseFloat(memberFormData.firstHalfAmount) : undefined,
          },
          secondHalf: {
            paid: memberFormData.secondHalfPaid,
            amount: memberFormData.secondHalfAmount ? parseFloat(memberFormData.secondHalfAmount) : undefined,
          },
        },
      }),
    };

    setMembers((prev) => [...prev, newMember]);
    setMemberFormData(initialMemberFormState);
    setActiveMemberForm(null);
  }

  return (
    <Card className="shadow-card border-0">
      <CardHeader>
        <CardTitle className="text-primary font-serif">Family Members</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="numMembers">Number of Family Members</Label>
          <Input
            id="numMembers"
            type="number"
            min="0"
            placeholder="e.g., 3"
            value={numberOfMembers > 0 ? numberOfMembers : ""}
            onChange={(e) => {
              const num = parseInt(e.target.value) || 0;
              setNumberOfMembers(num);
              setMembers([]);
            }}
          />
        </div>

        {numberOfMembers > 0 && (
          <div className="space-y-4">
            {Array.from({ length: numberOfMembers }, (_, index) => {
              const memberNumber = index + 1;
              const memberData = members[index];

              if (activeMemberForm === memberNumber) {
                return (
                  <MemberForm
                    key={`form-${index}`}
                    memberFormData={memberFormData}
                    setMemberFormData={setMemberFormData}
                    onSave={handleSaveMember}
                    onCancel={() => setActiveMemberForm(null)}
                    memberNumber={memberNumber}
                    paymentMethod={paymentMethod}
                  />
                );
              }

              return (
                <Card
                  key={index}
                  className="p-4 flex items-center justify-center min-h-[100px] border-dashed"
                >
                  {memberData ? (
                    <div className="w-full text-center">
                      <p className="font-bold text-lg text-green-700">
                        {memberData.firstName} {memberData.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {memberData.sex}, Age: {memberData.age || "N/A"}
                      </p>
                      {memberData.payment?.total && (
                         <p className="text-sm text-muted-foreground">
                            Total: ETB {memberData.payment.total}
                         </p>
                      )}
                    </div>
                  ) : (
                    <Button
                      onClick={() => setActiveMemberForm(memberNumber)}
                      className="w-full bg-gradient-primary text-secondary-foreground"
                    >
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
  );
};