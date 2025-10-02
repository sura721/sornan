import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { CalendarIcon, Upload, ArrowUpRight, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useData } from "@/contexts/DataContext";
import { toast } from "@/hooks/use-toast";

const AddIndividual = () => {
  const navigate = useNavigate();
  const { addIndividual } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    primaryPhone: "",
    secondaryPhone: "",
    sex: "",
    age: "",
    telegramUsername: "",
    instagramUsername: "",
    total: "",
    firstHalfPaid: false,
    firstHalfAmount: "",
    secondHalfPaid: false,
    secondHalfAmount: "",
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
    colorCodes: "",
  });

  const [deliveryDate, setDeliveryDate] = useState<Date>();
  const [tilefFile, setTilefFile] = useState<File | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setTilefFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.primaryPhone ||
      !formData.sex ||
      !deliveryDate
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields marked with *",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    const newIndividualData = new FormData();
    // Personal Details
    newIndividualData.append("firstName", formData.firstName);
    newIndividualData.append("lastName", formData.lastName);
    newIndividualData.append("phoneNumbers[primary]", formData.primaryPhone);
    newIndividualData.append(
      "phoneNumbers[secondary]",
      formData.secondaryPhone
    );
    newIndividualData.append("socials[telegram]", formData.telegramUsername);
    newIndividualData.append("socials[instagram]", formData.instagramUsername);
    newIndividualData.append("sex", formData.sex);
    newIndividualData.append("age", formData.age);
    if (deliveryDate) {
      newIndividualData.append(
        "deliveryDate",
        deliveryDate.toISOString().split("T")[0]
      );
    }

    // Cloth Details
    newIndividualData.append(
      "clothDetails[colors]",
      formData.colorCodes
        .split(",")
        .map((code) => code.trim())
        .filter((code) => code !== "")
        .join(",")
    );
    if (tilefFile) {
      newIndividualData.append("tilefImage", tilefFile);
    }
    newIndividualData.append("clothDetails[shirtLength]", formData.shirtLength);
    newIndividualData.append("clothDetails[sholder]", formData.sholder);
    newIndividualData.append("clothDetails[wegeb]", formData.wegeb);
    newIndividualData.append("clothDetails[rist]", formData.rist);

    // Gender-specific Cloth Details
    if (formData.sex === "Female") {
      newIndividualData.append(
        "clothDetails[dressLength]",
        formData.dressLength
      );
      newIndividualData.append(
        "clothDetails[sliveLength]",
        formData.sliveLength
      );
      newIndividualData.append("clothDetails[breast]", formData.breast);
      newIndividualData.append("clothDetails[overBreast]", formData.overBreast);
      newIndividualData.append(
        "clothDetails[underBreast]",
        formData.underBreast
      );
      newIndividualData.append(
        "clothDetails[femaleSliveType]",
        formData.femaleSliveType
      );
      newIndividualData.append(
        "clothDetails[femaleWegebType]",
        formData.femaleWegebType
      );
    }
    if (formData.sex === "Male") {
      newIndividualData.append("clothDetails[deret]", formData.deret);
      newIndividualData.append("clothDetails[anget]", formData.anget);
      newIndividualData.append(
        "clothDetails[maleClothType]",
        formData.maleClothType
      );
      newIndividualData.append(
        "clothDetails[maleSliveType]",
        formData.maleSliveType
      );
      newIndividualData.append("clothDetails[netela]", formData.netela);
    }

    // Payment Details
    newIndividualData.append("payment[total]", formData.total);
    newIndividualData.append(
      "payment[firstHalf][paid]",
      String(formData.firstHalfPaid)
    );
    newIndividualData.append(
      "payment[firstHalf][amount]",
      formData.firstHalfAmount
    );
    newIndividualData.append(
      "payment[secondHalf][paid]",
      String(formData.secondHalfPaid)
    );
    newIndividualData.append(
      "payment[secondHalf][amount]",
      formData.secondHalfAmount
    );

    try {
      await addIndividual(newIndividualData);
      toast({
        title: "Success",
        description: "Individual order created successfully",
      });
      navigate("/orders");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create order.",
        variant: "destructive",
      });
      console.error("Error creating individual order:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCleanUsername = (urlOrUsername: string) => {
    const withoutDomain = urlOrUsername.replace(
      /^(https?:\/\/)?(www\.)?(t\.me\/|instagram\.com\/)?/,
      ""
    );
    return withoutDomain.startsWith("@")
      ? withoutDomain.substring(1)
      : withoutDomain;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-primary mb-2">
          Add Individual Order
        </h1>
        <p className="text-muted-foreground">
          Create a new individual cloth order
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="text-primary font-serif">
              Personal Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="primaryPhone">Primary Phone Number *</Label>
              <Input
                id="primaryPhone"
                type="tel"
                value={formData.primaryPhone}
                onChange={(e) =>
                  setFormData({ ...formData, primaryPhone: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondaryPhone">Secondary Phone Number</Label>
              <Input
                id="secondaryPhone"
                type="tel"
                value={formData.secondaryPhone}
                onChange={(e) =>
                  setFormData({ ...formData, secondaryPhone: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Sex *</Label>
              <Select
                value={formData.sex}
                onValueChange={(value) =>
                  setFormData({ ...formData, sex: value })
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
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) =>
                  setFormData({ ...formData, age: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telegram">Telegram Username</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="telegram"
                  placeholder="@Keafa_design"
                  value={formData.telegramUsername}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      telegramUsername: e.target.value,
                    })
                  }
                />
                {formData.telegramUsername && (
                  <a
                    href={`https://t.me/${getCleanUsername(
                      formData.telegramUsername
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      type="button"
                      size="icon"
                      className="bg-green-600 hover:bg-green-700 flex-shrink-0"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </Button>
                  </a>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram Username</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="instagram"
                  placeholder="@Keafa_design"
                  value={formData.instagramUsername}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      instagramUsername: e.target.value,
                    })
                  }
                />
                {formData.instagramUsername && (
                  <a
                    href={`https://www.instagram.com/${getCleanUsername(
                      formData.instagramUsername
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      type="button"
                      size="icon"
                      className="bg-green-600 hover:bg-green-700 flex-shrink-0"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="text-primary font-serif">
              Cloth & Design Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="shirtLength">Shirt length</Label>
                <Input
                  id="shirtLength"
                  type="number"
                  value={formData.shirtLength}
                  onChange={(e) =>
                    setFormData({ ...formData, shirtLength: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sholder">Sholder</Label>
                <Input
                  id="sholder"
                  type="number"
                  value={formData.sholder}
                  onChange={(e) =>
                    setFormData({ ...formData, sholder: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wegeb">Wegeb</Label>
                <Input
                  id="wegeb"
                  type="number"
                  value={formData.wegeb}
                  onChange={(e) =>
                    setFormData({ ...formData, wegeb: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rist">Rist</Label>
                <Input
                  id="rist"
                  type="number"
                  value={formData.rist}
                  onChange={(e) =>
                    setFormData({ ...formData, rist: e.target.value })
                  }
                />
              </div>
              {formData.sex === "Female" && (
                <>
                  {" "}
                  <div className="space-y-2">
                    <Label htmlFor="dressLength">Dress length</Label>
                    <Input
                      id="dressLength"
                      type="number"
                      value={formData.dressLength}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dressLength: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sliveLength">Slive length</Label>
                    <Input
                      id="sliveLength"
                      type="number"
                      value={formData.sliveLength}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sliveLength: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="breast">Brest</Label>
                    <Input
                      id="breast"
                      type="number"
                      value={formData.breast}
                      onChange={(e) =>
                        setFormData({ ...formData, breast: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="overBreast">Over brest</Label>
                    <Input
                      id="overBreast"
                      type="number"
                      value={formData.overBreast}
                      onChange={(e) =>
                        setFormData({ ...formData, overBreast: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="underBreast">Under brest</Label>
                    <Input
                      id="underBreast"
                      type="number"
                      value={formData.underBreast}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          underBreast: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Slive type</Label>
                    <Select
                      value={formData.femaleSliveType}
                      onValueChange={(value) =>
                        setFormData({ ...formData, femaleSliveType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Thin">A Thin</SelectItem>
                        <SelectItem value="Short">B Short</SelectItem>
                        <SelectItem value="Middle">C Middle</SelectItem>
                        <SelectItem value="Long">D Long</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Wegeb type</Label>
                    <Select
                      value={formData.femaleWegebType}
                      onValueChange={(value) =>
                        setFormData({ ...formData, femaleWegebType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Zrgf">A Zrgf</SelectItem>
                        <SelectItem value="Fitted">B Fitted</SelectItem>
                        <SelectItem value="Kbeto">C Kbeto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              {formData.sex === "Male" && (
                <>
                  {" "}
                  <div className="space-y-2">
                    <Label htmlFor="deret">Deret</Label>
                    <Input
                      id="deret"
                      type="number"
                      value={formData.deret}
                      onChange={(e) =>
                        setFormData({ ...formData, deret: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="anget">Anget</Label>
                    <Input
                      id="anget"
                      type="number"
                      value={formData.anget}
                      onChange={(e) =>
                        setFormData({ ...formData, anget: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type cloth</Label>
                    <Select
                      value={formData.maleClothType}
                      onValueChange={(value) =>
                        setFormData({ ...formData, maleClothType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Shirt">A Shirt</SelectItem>
                        <SelectItem value="Semiz">B Semiz</SelectItem>
                        <SelectItem value="T shirt and jacket">
                          C T shirt and jacket
                        </SelectItem>
                        <SelectItem value="Shirt only with key">
                          D Shirt only with key
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Type of slive</Label>
                    <Select
                      value={formData.maleSliveType}
                      onValueChange={(value) =>
                        setFormData({ ...formData, maleSliveType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Short">A Short</SelectItem>
                        <SelectItem value="Long">B Long</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Netela</Label>
                    <Select
                      value={formData.netela}
                      onValueChange={(value) =>
                        setFormData({ ...formData, netela: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">A Yes</SelectItem>
                        <SelectItem value="No">B No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
            <div className="border-t border-border pt-6 space-y-6">
              <div className="space-y-2">
                <Label>Upload 'Tilef' Image</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="tilef-upload"
                  />
                  <label htmlFor="tilef-upload" className="cursor-pointer">
                    {tilefFile ? (
                      <div className="space-y-2">
                        <img
                          src={URL.createObjectURL(tilefFile)}
                          alt="Tilef Preview"
                          className="w-24 h-24 object-cover rounded-lg mx-auto"
                        />
                        <p className="text-sm text-muted-foreground">
                          {tilefFile.name}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
                        <p className="text-muted-foreground">
                          Click to upload Tilef pattern
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="color-codes">Colors</Label>
                <Input
                  id="color-codes"
                  placeholder="Enter color codes, separated by commas (e.g. 15, 66, 76)"
                  value={formData.colorCodes}
                  onChange={(e) =>
                    setFormData({ ...formData, colorCodes: e.target.value })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="text-primary font-serif">
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="totalAmount">Total</Label>
              <Input
                id="totalAmount"
                type="number"
                placeholder="Total Amount"
                value={formData.total}
                onChange={(e) =>
                  setFormData({ ...formData, total: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-border pt-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="firstHalf"
                    checked={formData.firstHalfPaid}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, firstHalfPaid: !!checked })
                    }
                  />
                  <Label htmlFor="firstHalf">First Half Payment</Label>
                </div>
                <Input
                  type="number"
                  placeholder="Amount"
                  value={formData.firstHalfAmount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      firstHalfAmount: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="secondHalf"
                    checked={formData.secondHalfPaid}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, secondHalfPaid: !!checked })
                    }
                  />
                  <Label htmlFor="secondHalf">Second Half Payment</Label>
                </div>
                <Input
                  type="number"
                  placeholder="Amount"
                  value={formData.secondHalfAmount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      secondHalfAmount: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="text-primary font-serif">
              Delivery Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Delivery Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !deliveryDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deliveryDate ? (
                      format(deliveryDate, "PPP")
                    ) : (
                      <span>Pick delivery date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={deliveryDate}
                    onSelect={setDeliveryDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end">
          <Button
            type="submit"
            className="bg-gradient-primary text-secondary-foreground shadow-elegant hover:shadow-xl transition-all px-8 py-3"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Saving..." : "Save Individual Order"}
          </Button>
        </div>{" "}
      </form>
    </div>
  );
};

export default AddIndividual;
