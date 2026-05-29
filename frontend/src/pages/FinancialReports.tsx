import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IndianRupee, TrendingUp, TrendingDown, Download, BarChart3, PieChart, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FinancialReports = () => {
  const navigate = useNavigate();

  const summary = [
    { label: "Total Revenue", value: "₹1,25,00,000", change: "+12%", trend: "up", icon: TrendingUp },
    { label: "Total Expenses", value: "₹85,00,000", change: "+8%", trend: "up", icon: TrendingDown },
    { label: "Net Income", value: "₹40,00,000", change: "+18%", trend: "up", icon: IndianRupee },
    { label: "Outstanding Dues", value: "₹15,50,000", change: "-5%", trend: "down", icon: FileText },
  ];

  const revenueBreakdown = [
    { category: "Tuition Fees", amount: 95000000, percentage: 76 },
    { category: "Library Fees", amount: 8500000, percentage: 6.8 },
    { category: "Exam Fees", amount: 10000000, percentage: 8 },
    { category: "Hostel Fees", amount: 7500000, percentage: 6 },
    { category: "Other Fees", amount: 4000000, percentage: 3.2 },
  ];

  const expenseBreakdown = [
    { category: "Faculty Salaries", amount: 45000000, percentage: 52.9 },
    { category: "Staff Salaries", amount: 15000000, percentage: 17.6 },
    { category: "Infrastructure", amount: 12000000, percentage: 14.1 },
    { category: "Utilities", amount: 8000000, percentage: 9.4 },
    { category: "Other Expenses", amount: 5000000, percentage: 5.9 },
  ];

  const monthlyData = [
    { month: "January", revenue: 12500000, expense: 8500000 },
    { month: "February", revenue: 13000000, expense: 8800000 },
    { month: "March", revenue: 11800000, expense: 8200000 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 p-6">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Financial Reports
            </h1>
            <p className="text-muted-foreground mt-1">Comprehensive financial analytics and reports</p>
          </div>
          <div className="flex gap-3">
            <Select defaultValue="2024">
              <SelectTrigger className="w-32 backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
              </SelectContent>
            </Select>
            <Button className="gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {summary.map((item, index) => (
            <Card key={index} className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border-white/20 hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <item.icon className={`h-5 w-5 ${item.trend === "up" ? "text-green-600" : "text-red-600"}`} />
                  <span className={`text-sm font-medium ${item.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                    {item.change}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.value}</div>
                <p className="text-sm text-muted-foreground">{item.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border-white/20">
            <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
            <TabsTrigger value="expenses">Expense Analysis</TabsTrigger>
            <TabsTrigger value="monthly">Monthly Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-4">
            <Card className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  Revenue Breakdown
                </CardTitle>
                <CardDescription>Revenue distribution by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenueBreakdown.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.category}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">{item.percentage}%</span>
                          <span className="font-semibold flex items-center">
                            <IndianRupee className="h-3 w-3" />
                            {(item.amount / 10000000).toFixed(2)} Cr
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary rounded-full h-2 transition-all duration-300"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-4">
            <Card className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Expense Breakdown
                </CardTitle>
                <CardDescription>Expense distribution by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expenseBreakdown.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.category}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">{item.percentage}%</span>
                          <span className="font-semibold flex items-center">
                            <IndianRupee className="h-3 w-3" />
                            {(item.amount / 10000000).toFixed(2)} Cr
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-destructive rounded-full h-2 transition-all duration-300"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4">
            <Card className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Monthly Financial Trends
                </CardTitle>
                <CardDescription>Month-wise revenue and expense comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold">Month</th>
                        <th className="text-left py-3 px-4 font-semibold">Revenue</th>
                        <th className="text-left py-3 px-4 font-semibold">Expenses</th>
                        <th className="text-left py-3 px-4 font-semibold">Net Income</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyData.map((data, index) => (
                        <tr key={index} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4 font-medium">{data.month}</td>
                          <td className="py-3 px-4 text-green-600 font-semibold">
                            ₹{(data.revenue / 10000000).toFixed(2)} Cr
                          </td>
                          <td className="py-3 px-4 text-red-600 font-semibold">
                            ₹{(data.expense / 10000000).toFixed(2)} Cr
                          </td>
                          <td className="py-3 px-4 text-blue-600 font-semibold">
                            ₹{((data.revenue - data.expense) / 10000000).toFixed(2)} Cr
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card
            className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border-white/20 hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => navigate('/fee-management')}
          >
            <CardHeader>
              <CardTitle className="text-lg">Fee Management</CardTitle>
              <CardDescription>Manage fee structures and collections</CardDescription>
            </CardHeader>
          </Card>
          <Card
            className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border-white/20 hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => navigate('/generate-receipts')}
          >
            <CardHeader>
              <CardTitle className="text-lg">Generate Receipts</CardTitle>
              <CardDescription>Create payment receipts</CardDescription>
            </CardHeader>
          </Card>
          <Card
            className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border-white/20 hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => navigate('/payment-history')}
          >
            <CardHeader>
              <CardTitle className="text-lg">Payment History</CardTitle>
              <CardDescription>View all transaction records</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FinancialReports;
