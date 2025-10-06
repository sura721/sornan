// src/components/FamilyInformationForm.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, ArrowUpRight } from "lucide-react";
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
  tilefFile: File | null;
  setTilefFile: (file: File | null) => void;
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
  tilefFile,
  setTilefFile,
  colorCodes,
   notes,
  setNotes,
  setColorCodes,
}: FamilyInformationFormProps) => {
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
          <Label>Upload 'ጥልፍ ' Image</Label>
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setTilefFile(file);
              }}
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
                    Click to upload ጥልፍ  pattern
                  </p>
                </div>
              )}
            </label>
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