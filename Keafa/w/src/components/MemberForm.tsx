// src/components/MemberForm.tsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MemberFormState } from "./FamilyMembersForm";

interface MemberFormProps {
  memberFormData: MemberFormState;
  setMemberFormData: React.Dispatch<React.SetStateAction<MemberFormState>>;
  onSave: () => void;
  onCancel: () => void;
  memberNumber: number;
  paymentMethod: "family" | "member";
}

export const MemberForm = ({
  memberFormData,
  setMemberFormData,
  onSave,
  onCancel,
  memberNumber,
  paymentMethod,
}: MemberFormProps) => {
  const handleInputChange = (
    field: keyof MemberFormState,
    value: string | boolean
  ) => {
    setMemberFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="p-6 bg-accent border-primary">
      <h3 className="text-xl font-serif text-primary mb-4">
        Adding Member {memberNumber}
      </h3>
      <div className="space-y-6">
        {/* --- PERSONAL DETAILS CARD --- */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Personal Details</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name *</Label>
              <Input
                value={memberFormData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Last Name *</Label>
              <Input
                value={memberFormData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Sex *</Label>
              <Select
                value={memberFormData.sex}
                onValueChange={(v) => handleInputChange("sex", v)}
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
                onChange={(e) => handleInputChange("age", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* --- COMPLETE CLOTH & DESIGN DETAILS CARD (Restored) --- */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cloth & Design Details</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Shirt length</Label>
                <Input
                  type="text"
                  value={memberFormData.shirtLength}
                  onChange={(e) =>
                    handleInputChange("shirtLength", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Shoulder</Label>
                <Input
                  type="text"
                  value={memberFormData.sholder}
                  onChange={(e) => handleInputChange("sholder", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Waist</Label>
                <Input
                  type="text"
                  value={memberFormData.wegeb}
                  onChange={(e) => handleInputChange("wegeb", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Wrist</Label>
                <Input
                  type="text"
                  value={memberFormData.rist}
                  onChange={(e) => handleInputChange("rist", e.target.value)}
                />
              </div>
                  <div className="space-y-2">
        <Label>Sleeve</Label>
        <Input
          type="text"
          value={memberFormData.sleeve}
          onChange={(e) =>
            handleInputChange("sleeve", e.target.value)
          }
        />
      </div>

              {/* FEMALE SPECIFIC FIELDS */}
              {memberFormData.sex === "Female" && (
                <>
                  <div className="space-y-2">
                    <Label>Dress length</Label>
                    <Input
                      type="text"
                      value={memberFormData.dressLength}
                      onChange={(e) =>
                        handleInputChange("dressLength", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sleeve length</Label>
                    <Input
                      type="text"
                      value={memberFormData.sliveLength}
                      onChange={(e) =>
                        handleInputChange("sliveLength", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Breast</Label>
                    <Input
                      type="text"
                      value={memberFormData.breast}
                      onChange={(e) =>
                        handleInputChange("breast", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Over Breast</Label>
                    <Input
                      type="text"
                      value={memberFormData.overBreast}
                      onChange={(e) =>
                        handleInputChange("overBreast", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Under Breast</Label>
                    <Input
                      type="text"
                      value={memberFormData.underBreast}
                      onChange={(e) =>
                        handleInputChange("underBreast", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sleeve type</Label>
                    <Select
                      value={memberFormData.femaleSliveType}
                      onValueChange={(v) =>
                        handleInputChange("femaleSliveType", v)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Thin"> Thin</SelectItem>
                        <SelectItem value="Short"> Short</SelectItem>
                        <SelectItem value="Middle"> Middle</SelectItem>
                        <SelectItem value="Long"> Long</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Waist type</Label>
                    <Select
                      value={memberFormData.femaleWegebType}
                      onValueChange={(v) =>
                        handleInputChange("femaleWegebType", v)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Zrgf"> Zrgf</SelectItem>
                        <SelectItem value="Fitted"> Fitted</SelectItem>
                        <SelectItem value="Kbeto"> Kbeto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* MALE SPECIFIC FIELDS */}
              {memberFormData.sex === "Male" && (
                <>
                  <div className="space-y-2">
                    <Label>Chest</Label>
                    <Input
                      type="text"
                      value={memberFormData.deret}
                      onChange={(e) =>
                        handleInputChange("deret", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Neck</Label>
                    <Input
                      type="text"
                      value={memberFormData.anget}
                      onChange={(e) =>
                        handleInputChange("anget", e.target.value)
                      }
                    />
                  </div>
                   <div className="space-y-2">
                    <Label>Pant Waist</Label>
                    <Input
                      type="text"
                      value={memberFormData.pantWaist || ""}
                      onChange={(e) =>
                        handleInputChange("pantWaist", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type cloth</Label>
                    <Select
                      value={memberFormData.maleClothType}
                      onValueChange={(v) =>
                        handleInputChange("maleClothType", v)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Shirt">Shirt</SelectItem>
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
                        handleInputChange("maleSliveType", v)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Short"> Short</SelectItem>
                        <SelectItem value="Long"> Long</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Netela</Label>
                    <Select
                      value={memberFormData.netela}
                      onValueChange={(v) => handleInputChange("netela", v)}
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

        {/* --- CONDITIONAL PAYMENT DETAILS CARD --- */}
        {paymentMethod === "member" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label htmlFor="totalAmount">Total</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  placeholder="Total Amount"
                  value={memberFormData.paymentTotal}
                  onChange={(e) =>
                    handleInputChange("paymentTotal", e.target.value)
                  }
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-border pt-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="firstHalf"
                      checked={memberFormData.firstHalfPaid}
                      onCheckedChange={(checked) =>
                        handleInputChange("firstHalfPaid", !!checked)
                      }
                    />
                    <Label htmlFor="firstHalf">First Half Payment</Label>
                  </div>
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={memberFormData.firstHalfAmount}
                    onChange={(e) =>
                      handleInputChange("firstHalfAmount", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="secondHalf"
                      checked={memberFormData.secondHalfPaid}
                      onCheckedChange={(checked) =>
                        handleInputChange("secondHalfPaid", !!checked)
                      }
                    />
                    <Label htmlFor="secondHalf">Second Half Payment</Label>
                  </div>
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={memberFormData.secondHalfAmount}
                    onChange={(e) =>
                      handleInputChange("secondHalfAmount", e.target.value)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* --- ACTION BUTTONS --- */}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={onSave}>
            Save Member {memberNumber}
          </Button>
        </div>
      </div>
    </Card>
  );
};
