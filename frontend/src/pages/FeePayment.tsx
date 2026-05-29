import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { CreditCard, Calendar, IndianRupee, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useState } from "react";

const FeePayment = () => {
  const [selectedFee, setSelectedFee] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  const pendingFees = [
    { id: "1", type: "Tuition Fee", amount: 25000, dueDate: "2024-03-15", semester: "Spring 2024", status: "pending" },
    { id: "2", type: "Lab Fee", amount: 5000, dueDate: "2024-03-20", semester: "Spring 2024", status: "pending" },
    { id: "3", type: "Library Fee", amount: 2000, dueDate: "2024-03-25", semester: "Spring 2024", status: "pending" },
  ];

  const recentPayments = [
    { id: "1", type: "Hostel Fee", amount: 15000, paidDate: "2024-02-10", status: "paid", transactionId: "TXN001234" },
    { id: "2", type: "Exam Fee", amount: 3000, paidDate: "2024-02-05", status: "paid", transactionId: "TXN001235" },
  ];

  return (
    <div className="min-h-screen p-6 space-y-6">
      <BreadcrumbNav />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <CreditCard className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Fee Payment</h1>
            <p className="text-muted-foreground">Manage your fee payments and view payment history</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Payment Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glassmorphism">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IndianRupee className="h-5 w-5" />
                  Make Payment
                </CardTitle>
                <CardDescription>Select and pay your pending fees</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="fee-type">Select Fee Type</Label>
                  <Select value={selectedFee} onValueChange={setSelectedFee}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose fee to pay" />
                    </SelectTrigger>
                    <SelectContent>
                      {pendingFees.map((fee) => (
                        <SelectItem key={fee.id} value={fee.id}>
                          {fee.type} - ₹{fee.amount.toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="payment-method">Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upi">UPI Payment</SelectItem>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                      <SelectItem value="netbanking">Net Banking</SelectItem>
                      <SelectItem value="wallet">Digital Wallet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {paymentMethod === "card" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-3"
                  >
                    <div>
                      <Label htmlFor="card-number">Card Number</Label>
                      <Input placeholder="1234 5678 9012 3456" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input placeholder="MM/YY" />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input placeholder="123" />
                      </div>
                    </div>
                  </motion.div>
                )}

                <Button className="w-full" disabled={!selectedFee || !paymentMethod}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay Now
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Fee Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <Card className="glassmorphism">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  Pending Fees
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingFees.map((fee) => (
                    <motion.div
                      key={fee.id}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center justify-between p-3 bg-card/50 rounded-lg border"
                    >
                      <div>
                        <p className="font-medium">{fee.type}</p>
                        <p className="text-sm text-muted-foreground">{fee.semester}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₹{fee.amount.toLocaleString()}</p>
                        <p className="text-sm text-orange-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Due: {fee.dueDate}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>Total Pending:</span>
                    <span className="text-orange-500">₹{pendingFees.reduce((sum, fee) => sum + fee.amount, 0).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphism">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Recent Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentPayments.map((payment) => (
                    <motion.div
                      key={payment.id}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center justify-between p-3 bg-green-50/50 rounded-lg border border-green-200/50"
                    >
                      <div>
                        <p className="font-medium">{payment.type}</p>
                        <p className="text-sm text-muted-foreground">TXN: {payment.transactionId}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">₹{payment.amount.toLocaleString()}</p>
                        <Badge variant="outline" className="text-green-600 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Paid
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default FeePayment;