// src/components/DeliveryInformationForm.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Label } from "@radix-ui/react-label";
interface DeliveryInformationFormProps {
  deliveryDate: Date | undefined;
  setDeliveryDate: (date: Date | undefined) => void;
}

export const DeliveryInformationForm = ({
  deliveryDate,
  setDeliveryDate,
}: DeliveryInformationFormProps) => {
  return (
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
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
    </Card>
  );
};