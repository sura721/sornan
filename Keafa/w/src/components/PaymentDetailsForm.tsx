import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect } from 'react';

interface PaymentDetailsFormProps {
  paymentTotal: string;
  setPaymentTotal: (value: string) => void;
  firstHalfPaid: boolean;
  setFirstHalfPaid: (value: boolean) => void;
  firstHalfAmount: string;
  setFirstHalfAmount: (value: string) => void;
  secondHalfPaid: boolean;
  setSecondHalfPaid: (value: boolean) => void;
  secondHalfAmount: string;
  setSecondHalfAmount: (value: string) => void;
}

export const PaymentDetailsForm = ({
  paymentTotal, setPaymentTotal,
  firstHalfPaid, setFirstHalfPaid,
  firstHalfAmount, setFirstHalfAmount,
  secondHalfPaid, setSecondHalfPaid,
  secondHalfAmount, setSecondHalfAmount,
}: PaymentDetailsFormProps) => {
  // When total or first half changes, auto-calc the second half
  useEffect(() => {
    // If both fields are empty, keep second half empty
    if (!paymentTotal && !firstHalfAmount) {
      setSecondHalfAmount('');
      return;
    }

    const totalNum = parseFloat(paymentTotal as unknown as string);
    const firstNum = parseFloat(firstHalfAmount as unknown as string);

    const t = isNaN(totalNum) ? 0 : totalNum;
    const f = isNaN(firstNum) ? 0 : firstNum;

    const second = t - f;

    // If result is negative, clamp to 0
    const secondVal = second <= 0 ? 0 : second;

    // Keep integer if inputs are integers, otherwise show up to 2 decimals
    const formatted = Number.isInteger(secondVal) ? String(secondVal) : String(Number(secondVal.toFixed(2)));
    setSecondHalfAmount(formatted);
  }, [paymentTotal, firstHalfAmount, setSecondHalfAmount]);
  return (
    <Card className="shadow-card border-0">
      <CardHeader>
        <CardTitle className="text-primary font-serif">Payment Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="totalAmount">Total</Label>
          <Input id="totalAmount" type="number" placeholder="Total Amount" value={paymentTotal} onChange={(e) => setPaymentTotal(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-border pt-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="firstHalf" checked={firstHalfPaid} onCheckedChange={(checked) => setFirstHalfPaid(!!checked)} />
              <Label htmlFor="firstHalf">First Half Payment</Label>
            </div>
            <Input type="number" placeholder="Amount" value={firstHalfAmount} onChange={(e) => setFirstHalfAmount(e.target.value)} />
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="secondHalf" checked={secondHalfPaid} onCheckedChange={(checked) => setSecondHalfPaid(!!checked)} />
              <Label htmlFor="secondHalf">Second Half Payment</Label>
            </div>
            <Input type="number" placeholder="Amount" value={secondHalfAmount} onChange={(e) => setSecondHalfAmount(e.target.value)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};