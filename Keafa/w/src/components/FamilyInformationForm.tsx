// src/components/FamilyInformationForm.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, ArrowUpRight, X } from "lucide-react";
import { Textarea } from "./ui/textarea";

interface FamilyInformationFormProps {
  familyName: string;
  setFamilyName: (value: string) => void;
  primaryPhone: string;
  setPrimaryPhone: (value: string) => void;
  secondaryPhone: string;
  setSecondaryPhone: (value: string) => void;
  telegramUsername: string;
  setTelegramUsername: (value: string) => void;
tilefFiles: (File | null)[];
  setTilefFiles: (files: (File | null)[]) => void;
  colorCodes: string;
  setColorCodes: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;

}

const getCleanUsername = (urlOrUsername: string) => {
  const withoutDomain = urlOrUsername.replace(
    /^(https?:\/\/)?(www\.)?(t\.me\/)?/,
    ""
  );
  return withoutDomain.startsWith("@")
    ? withoutDomain.substring(1)
    : withoutDomain;
};

export const FamilyInformationForm = ({
  familyName,
  setFamilyName,
  primaryPhone,
  setPrimaryPhone,
  secondaryPhone,
  setSecondaryPhone,
  telegramUsername,
  setTelegramUsername,
  tilefFiles,
  setTilefFiles,
  colorCodes,
   notes,
  setNotes,
  setColorCodes,
}: FamilyInformationFormProps) => {

   const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const newFiles = [...tilefFiles];
      newFiles[index] = file;
      setTilefFiles(newFiles);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newFiles = [...tilefFiles];
    newFiles[index] = null;
    setTilefFiles(newFiles);
  };
  return (
    <Card className="shadow-card border-0">
      <CardHeader>
        <CardTitle className="text-primary font-serif">
          Family Information
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="familyName">Family Name *</Label>
          <Input
            id="familyName"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            placeholder="e.g., The Abebe Family"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="primaryPhone">Primary Phone Number *</Label>
          <Input
            id="primaryPhone"
            type="tel"
            value={primaryPhone}
            onChange={(e) => setPrimaryPhone(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="secondaryPhone">Secondary Phone Number</Label>
          <Input
            id="secondaryPhone"
            type="tel"
            value={secondaryPhone}
            onChange={(e) => setSecondaryPhone(e.target.value)}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="telegram">Telegram Username</Label>
          <div className="flex items-center gap-2">
            <Input
              id="telegram"
              placeholder="@Keafa_design"
              value={telegramUsername}
              onChange={(e) => setTelegramUsername(e.target.value)}
            />
            {telegramUsername && (
              <a
                href={`https://t.me/${getCleanUsername(telegramUsername)}`}
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
       <div className="space-y-2 md:col-span-2">
  <Label>Upload 'ጥልፍ' Images (up to 4)</Label>
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {Array.from({ length: 4 }).map((_, index) => (
      <div
        key={index}
        className="border-2 border-dashed border-border rounded-lg p-4 text-center aspect-square flex items-center justify-center relative"
      >
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e, index)}
          className="hidden"
          id={`tilef-upload-${index}`}
        />
        <label
          htmlFor={`tilef-upload-${index}`}
          className="cursor-pointer w-full h-full flex flex-col justify-center items-center"
        >
          {tilefFiles[index] ? (
            <>
              <img
                src={URL.createObjectURL(tilefFiles[index] as File)}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={(e) => {
                  e.preventDefault(); // prevent triggering the file input
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
          <Label htmlFor="color-codes">Colors</Label>
          <Input
            id="color-codes"
            placeholder="Enter color codes, separated by commas (e.g. 15, 66, 76)"
            value={colorCodes}
            onChange={(e) => setColorCodes(e.target.value)}
          />
        </div>
         <div className="space-y-2 md:col-span-2">
          <Label htmlFor="family-notes">Notes</Label>
          <Textarea
            id="family-notes"
            placeholder="Add any general notes for the entire family order..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        
      </CardContent>
    </Card>
  );
};