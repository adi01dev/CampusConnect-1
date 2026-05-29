import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  Download, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  IndianRupee,
  Receipt,
  FileText,
  Wallet
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const FeeManagement = () => {
  const { toast } = useToast();
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  if (!user) return null;

  const feeStructure = {
    semester: [
      { component: 'Tuition Fee', amount: 35000, description: 'Main academic fee' },
      { component: 'Laboratory Fee', amount: 5000, description: 'Lab equipment and materials' },
      { component: 'Library Fee', amount: 2000, description: 'Library access and books' },
      { component: 'Development Fee', amount: 3000, description: 'Infrastructure development' },
      { component: 'Examination Fee', amount: 1500, description: 'Semester examinations' },
      { component: 'Sports Fee', amount: 1000, description: 'Sports facilities and events' },
      { component: 'Medical Fee', amount: 500, description: 'Health services' },
    ],
    hostel: [
      { component: 'Room Rent', amount: 15000, description: 'Accommodation charges' },
      { component: 'Mess Fee', amount: 12000, description: 'Food and dining' },
      { component: 'Electricity', amount: 2000, description: 'Power consumption' },
      { component: 'Water Charges', amount: 500, description: 'Water supply' },
    ]
  };

  const paymentHistory = [
    {
      id: 'PAY001',
      date: '2024-01-15',
      amount: 48000,
      type: 'Semester Fee',
      status: 'paid',
      method: 'UPI',
      transactionId: 'TXN123456789',
      semester: '6th Semester'
    },
    {
      id: 'PAY002',
      date: '2023-08-20',
      amount: 48000,
      type: 'Semester Fee',
      status: 'paid',
      method: 'Net Banking',
      transactionId: 'TXN987654321',
      semester: '5th Semester'
    },
    {
      id: 'PAY003',
      date: '2024-01-10',
      amount: 29500,
      type: 'Hostel Fee',
      status: 'paid',
      method: 'Debit Card',
      transactionId: 'TXN555666777',
      semester: '6th Semester'
    },
    {
      id: 'PAY004',
      date: '2024-02-01',
      amount: 1500,
      type: 'Examination Fee',
      status: 'pending',
      method: '-',
      transactionId: '-',
      semester: 'Mid-term Exam'
    }
  ];

  const totalSemesterFee = feeStructure.semester.reduce((sum, fee) => sum + fee.amount, 0);
  const totalHostelFee = feeStructure.hostel.reduce((sum, fee) => sum + fee.amount, 0);
  const pendingAmount = paymentHistory.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);

  const makePayment = (paymentId: string) => {
    toast({
      title: "Payment Processing",
      description: "Redirecting to payment gateway...",
    });
    // Simulate payment processing
    setTimeout(() => {
      toast({
        title: "Payment Successful",
        description: "Your fee payment has been processed successfully.",
      });
    }, 2000);
  };

  const downloadReceipt = (paymentId: string) => {
    toast({
      title: "Downloading Receipt",
      description: "Payment receipt is being generated...",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="secondary" className="bg-success/10 text-success border-success/20">Paid</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">Pending</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Fee Management</h1>
        <p className="text-muted-foreground">Manage your fee payments and view payment history</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-success/10">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold">₹1,25,500</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-warning/10">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Amount</p>
                <p className="text-2xl font-bold">₹{pendingAmount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <IndianRupee className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Next Due Date</p>
                <p className="text-2xl font-bold">Feb 15</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payments" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="payments">Payment History</TabsTrigger>
          <TabsTrigger value="structure">Fee Structure</TabsTrigger>
          <TabsTrigger value="pending">Pending Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>All your fee payment transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentHistory.map((payment) => (
                  <div 
                    key={payment.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-muted">
                        <Receipt className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-medium">{payment.type}</h4>
                        <p className="text-sm text-muted-foreground">{payment.semester}</p>
                        <p className="text-sm text-muted-foreground">{payment.date}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold">₹{payment.amount.toLocaleString()}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(payment.status)}
                        {payment.status === 'paid' && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => downloadReceipt(payment.id)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      {payment.method && payment.method !== '-' && (
                        <p className="text-xs text-muted-foreground">via {payment.method}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="structure" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Semester Fee Structure
                </CardTitle>
                <CardDescription>Academic fees for current semester</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {feeStructure.semester.map((fee, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div>
                      <h4 className="font-medium">{fee.component}</h4>
                      <p className="text-sm text-muted-foreground">{fee.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{fee.amount.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-3 flex items-center justify-between font-semibold">
                  <span>Total Semester Fee:</span>
                  <span>₹{totalSemesterFee.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  Hostel Fee Structure
                </CardTitle>
                <CardDescription>Hostel and accommodation fees</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {feeStructure.hostel.map((fee, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div>
                      <h4 className="font-medium">{fee.component}</h4>
                      <p className="text-sm text-muted-foreground">{fee.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{fee.amount.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-3 flex items-center justify-between font-semibold">
                  <span>Total Hostel Fee:</span>
                  <span>₹{totalHostelFee.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-warning" />
                Pending Payments
              </CardTitle>
              <CardDescription>Outstanding fee payments that need to be completed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentHistory.filter(p => p.status === 'pending').map((payment) => (
                  <div 
                    key={payment.id}
                    className="flex items-center justify-between p-4 rounded-lg border-warning/20 border bg-warning/5"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-warning/20">
                        <AlertCircle className="w-5 h-5 text-warning" />
                      </div>
                      <div>
                        <h4 className="font-medium">{payment.type}</h4>
                        <p className="text-sm text-muted-foreground">{payment.semester}</p>
                        <p className="text-sm text-warning font-medium">Due: February 15, 2024</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-lg">₹{payment.amount.toLocaleString()}</p>
                        <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
                          Pending
                        </Badge>
                      </div>
                      <Button onClick={() => makePayment(payment.id)}>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pay Now
                      </Button>
                    </div>
                  </div>
                ))}
                
                {paymentHistory.filter(p => p.status === 'pending').length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-success" />
                    <p className="text-lg font-medium">All payments are up to date!</p>
                    <p>You have no pending fee payments.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Options</CardTitle>
              <CardDescription>Multiple convenient ways to pay your fees</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border text-center">
                  <CreditCard className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <h4 className="font-medium">Cards</h4>
                  <p className="text-sm text-muted-foreground">Debit/Credit Cards</p>
                </div>
                <div className="p-4 rounded-lg border text-center">
                  <Wallet className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <h4 className="font-medium">UPI</h4>
                  <p className="text-sm text-muted-foreground">PhonePe, GPay, Paytm</p>
                </div>
                <div className="p-4 rounded-lg border text-center">
                  <IndianRupee className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <h4 className="font-medium">Net Banking</h4>
                  <p className="text-sm text-muted-foreground">All major banks</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FeeManagement;